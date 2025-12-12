import {
  StyleSheet,
  SafeAreaView,
  Animated,
  TouchableOpacity,
  Text,
} from 'react-native';
import React, {useRef, useState} from 'react';
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
import {useCreateExpenseClaimMutation} from '../../../features/tada/tadaApi';
import {ExpenseClaimPayload} from '../../../types/baseType';
import {useAppSelector} from '../../../store/hook';

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
  const scrollY = useRef(new Animated.Value(0)).current;

  const [createExpenseClaim, {error}] = useCreateExpenseClaimMutation();
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
  } = useFormik({
    initialValues,
    validationSchema: expenseItemSchema,
    onSubmit: async (formValues, actions) => {
      try {
        setLoading(true);

        const payload: ExpenseClaimPayload = {
          employee: employee.id,
          // company: 'Softsens',
          posting_date: formValues.date,
          custom_travel_start_date: formValues.date,
          custom_travel_end_date: formValues.date,
          expenses: [
            {
              expense_type: formValues.claim_type,
              expense_date: formValues.date,
              custom_claim_description: formValues.description,
              amount: Number(formValues.amount), // convert safely
            },
          ],
        };

        const res = await createExpenseClaim(payload).unwrap();
        console.log('🚀 ~ AddExpenseItemScreen ~ res:', res);

        Toast.show({
          type: 'success',
          text1: 'Expense item saved successfully',
          position: 'top',
        });

        actions.resetForm();
        setLoading(false);
        setTimeout(() => {
          navigation.goBack();
        }, 500);
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
