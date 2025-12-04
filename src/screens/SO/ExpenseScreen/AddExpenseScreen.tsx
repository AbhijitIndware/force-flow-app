import {StyleSheet, SafeAreaView} from 'react-native';
import React, {useRef, useState} from 'react';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import PageHeader from '../../../components/ui/PageHeader';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import AddExpenseComponent from '../../../components/SO/Expense/add-expense';
import {TouchableOpacity} from 'react-native';
import {ActivityIndicator} from 'react-native';
import {Text} from 'react-native';
import {useFormik} from 'formik';
import {Animated} from 'react-native';
import Toast from 'react-native-toast-message';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'AddExpenseScreen'
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
  sanc_amount: '',
  attachment: null,
};

const AddExpenseScreen = ({navigation}: Props) => {
  const [loading, setLoading] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

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
    // validationSchema: expenseItemSchema,
    onSubmit: async (formValues, actions) => {
      try {
        setLoading(true);

        const payload = {data: formValues};
        console.log('Submitting payload:', payload);

        // const res = await addDistributor(payload).unwrap();

        Toast.show({
          type: 'success',
          text1: 'Expense item saved successfully',
          position: 'top',
        });

        actions.resetForm();
        setLoading(false);
      } catch (error: any) {
        console.error('Expense Item API Error:', error);

        Toast.show({
          type: 'error',
          text1: `❌ ${
            error?.data?.message?.message || 'Internal Server Error'
          }`,
          text2: 'Please try again later.',
          position: 'top',
        });

        setLoading(false);
      }
    },
  });

  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader
        title="Expense Claim"
        navigation={() => navigation.navigate('ExpenseScreen')}
      />
      <AddExpenseComponent navigation={navigation} />
      <TouchableOpacity
        style={[styles.submitBtn, loading && {opacity: 0.7}]}
        onPress={() => handleSubmit()}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={styles.submitText}>Save</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AddExpenseScreen;

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
