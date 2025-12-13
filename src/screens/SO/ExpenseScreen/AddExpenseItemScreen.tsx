import {
  StyleSheet,
  SafeAreaView,
  Animated,
  TouchableOpacity,
  Text,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import {flexCol} from '../../../utils/styles';
import PageHeader from '../../../components/ui/PageHeader';
import {Colors} from '../../../utils/colors';
import AddExpenseItem from '../../../components/SO/Expense/add-expense-item';
import Toast from 'react-native-toast-message';
import {useFormik} from 'formik';
import {expenseItemSchema} from '../../../types/schema';
import {ActivityIndicator} from 'react-native';
import {
  useCreateExpenseClaimMutation,
  useUploadAttachmentForClaimMutation,
} from '../../../features/tada/tadaApi';
import {ExpenseClaimPayload} from '../../../types/baseType';
import {useAppSelector} from '../../../store/hook';
import RNFS from 'react-native-fs';

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
};

const AddExpenseItemScreen = ({navigation}: Props) => {
  const [loading, setLoading] = useState(false);
  const [claimId, setClaimId] = useState<string | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const [createExpenseClaim, {isSuccess}] = useCreateExpenseClaimMutation();
  const [uploadAttachmentForClaim, {isSuccess: attachmentSucess}] =
    useUploadAttachmentForClaimMutation();
  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );

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

        // ---------------------
        // 1️⃣ CREATE CLAIM
        // ---------------------
        const payload: ExpenseClaimPayload = {
          employee: employee.id,
          posting_date: formValues.date,
          custom_travel_start_date: formValues.date,
          custom_travel_end_date: formValues.date,
          expenses: [
            {
              expense_type: formValues.claim_type,
              expense_date: formValues.date,
              custom_claim_description: formValues.description,
              amount: Number(formValues.amount),
            },
          ],
        };

        const res = await createExpenseClaim(payload).unwrap();
        const createdId = res?.data?.name;
        setClaimId(createdId);

        // If no attachment, skip upload
        if (!formValues.attachment) {
          Toast.show({
            type: 'success',
            text1: 'Expense saved successfully',
            position: 'top',
          });

          resetForm();
          setLoading(false);
          return navigation.goBack();
        }

        // Continue to upload in useEffect
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: error?.data?.message?.message || 'Internal Server Error',
          position: 'top',
        });
        setLoading(false);
      }
    },
  });

  // ---------------------
  // 2️⃣ WHEN CLAIM CREATED → UPLOAD FILE
  // ---------------------
  useEffect(() => {
    if (isSuccess && claimId && values.attachment) {
      uploadAttachment();
    }
  }, [isSuccess]);

  const uploadAttachment = async () => {
    try {
      const file = values.attachment;

      const formData = new FormData();

      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type || 'application/octet-stream',
      } as any);
      formData.append('filename', file.name);
      formData.append('is_private', '1');
      formData.append('doctype', 'Expense Claim');
      formData.append('docname', claimId as string);

      const res = await uploadAttachmentForClaim(formData).unwrap();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err?.error || 'Internal Server Error',
        position: 'top',
      });
      setLoading(false);
      throw err;
    }
  };

  // ---------------------
  // 3️⃣ WHEN ATTACHMENT SUCCESS → TOAST + NAVIGATE
  // ---------------------
  useEffect(() => {
    if (attachmentSucess) {
      Toast.show({
        type: 'success',
        text1: 'Expense & attachment uploaded successfully',
        position: 'top',
      });

      resetForm();
      setLoading(false);

      setTimeout(() => navigation.goBack(), 500);
    }
  }, [attachmentSucess]);

  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
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
      <TouchableOpacity
        style={[styles.submitBtn, loading && {opacity: 0.7}]}
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
