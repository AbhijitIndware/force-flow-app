import {
  StyleSheet,
  SafeAreaView,
  Animated,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
} from 'react-native';
import React, {useRef, useState, useEffect} from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import { flexCol } from '../../../utils/styles';
import PageHeader from '../../../components/ui/PageHeader';
import { Colors } from '../../../utils/colors';
import AddExpenseItem from '../../../components/SO/Expense/add-expense-item-v2';
import Toast from 'react-native-toast-message';
import { useFormik } from 'formik';
import { expenseItemSchema } from '../../../types/schema';
import {
  useCreateExpenseDraftMutation,
  useAddExpenseRowMutation,
  useSubmitExpenseClaimMutation,
} from '../../../features/tada/tadaApiv2';
import { useAppSelector } from '../../../store/hook';
import { fileToBase64 } from '../../../utils/fileUtils';
import { useGetDailyPjpListQuery } from '../../../features/base/base-api';
import ReusableDropdown from '../../../components/ui-lib/resusable-dropdown';
import moment from 'moment';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'AddExpenseItemScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const initialValues = {
  date: '',
  claim_type: '',
  description: '',
  amount: '',
  attachment: null,
  ta_mode: '',
  ta_rail_class: '',
  is_local: 0,
  telecom_bill_month: '',
  mobile_number: '',
  pjp_store_id: '',
};

const AddExpenseItemScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const [createExpenseDraft] = useCreateExpenseDraftMutation();
  const [addExpenseRow] = useAddExpenseRowMutation();
  const [submitExpenseClaim] = useSubmitExpenseClaimMutation();

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
  } = useFormik({
    initialValues,
    validationSchema: expenseItemSchema,
    onSubmit: async (formValues: any) => {
      try {
        setLoading(true);

        // 1. Create Draft
        const pjpId =
          formValues.pjp_store_id;

        if (!pjpId) {
          Toast.show({
            type: 'error',
            text1: 'Please select a PJP',
          });
          setLoading(false);
          return;
        }

        const draftRes = await createExpenseDraft({
          pjp_store_id: pjpId,
        }).unwrap();

        const claim_id = draftRes?.message?.data?.claim_id as string;

        // 2. Add Row
        let imageData = undefined;

        if (formValues.attachment) {
          const base64 = await fileToBase64(
            formValues.attachment.uri,
            formValues.attachment.type,
          );
          imageData = {
            mime: formValues.attachment.type,
            data: base64,
          };
        }

        await addExpenseRow({
          claim_id,
          expense_type: formValues.claim_type as any,
          amount: Number(formValues.amount),
          date: formValues.date,
          description: formValues.description,
          image: imageData,
          ta_mode: formValues.ta_mode as any,
          ta_rail_class: formValues.ta_rail_class as any,
          is_local: formValues.is_local as any,
          telecom_bill_month: formValues.telecom_bill_month,
          mobile_number: formValues.mobile_number,
        }).unwrap();

        // 3. Submit Claim
        await submitExpenseClaim({ claim_id }).unwrap();

        Toast.show({
          type: 'success',
          text1: 'Expense claim submitted successfully',
          position: 'top',
        });

        resetForm();
        setLoading(false);
        navigation.goBack();
      } catch (error: any) {
        console.error('Expense Submission Error:', error);
        Toast.show({
          type: 'error',
          text1: error?.data?.message?.message || 'Failed to submit expense',
          position: 'top',
        });
        setLoading(false);
      }
    },
  });

  return (
    <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.lightBg }]}>
      <PageHeader
        title="Expense Item"
        navigation={() => navigation.navigate('AddExpenseScreen')}
      />

      <AddExpenseItem
        {...{
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          setFieldValue,
        }}
        scrollY={scrollY}
      />

      <PjpSelectionDropdown
        value={values.pjp_store_id}
        onSelect={(val: any) => setFieldValue('pjp_store_id', val)}
        error={touched.pjp_store_id && errors.pjp_store_id}
      />
      <TouchableOpacity
        style={[styles.submitBtn, loading && { opacity: 0.7 }]}
        onPress={() => handleSubmit()}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={styles.submitText}>+ Add Expenses</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const PjpSelectionDropdown = ({ value, onSelect, error }: any) => {
  const { data } = useGetDailyPjpListQuery({
    page: 1,
    page_size: 20,
    status: 'All',
    date: moment().format('YYYY-MM-DD'),
  });

  const pjpOptions = (data?.message?.data?.pjp_daily_stores || [])?.map((item: any) => ({
    label: `${item.store_name} (${item.name})`,
    value: item.name,
  }));

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
      <ReusableDropdown
        label="Select PJP Store"
        field="value"
        value={value}
        data={pjpOptions}
        onChange={onSelect}
        error={error}
      />
    </View>
  );
};

export default AddExpenseItemScreen;

const styles = StyleSheet.create({
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 6,
    marginHorizontal: 16,
  },
  submitText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
