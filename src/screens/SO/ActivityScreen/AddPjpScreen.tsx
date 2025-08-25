import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import {useMemo, useRef, useState} from 'react';
import {useFormik} from 'formik';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import PageHeader from '../../../components/ui/PageHeader';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import {dailyPjpSchema} from '../../../types/schema';
import {
  useGetEmployeeQuery,
  useGetStoreQuery,
} from '../../../features/dropdown/dropdown-api';
import {REmployee, StoreType} from '../../../types/dropdownType';
import {useAddDailyPjpMutation} from '../../../features/base/base-api';
import Toast from 'react-native-toast-message';
import AddPjpForm from '../../../components/SO/Activity/Pjp/AddPjpForm';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'AddPjpScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

let initial = {
  date: '',
  employee: '',
  stores: [{store: ''}],
};

const AddPjpScreen = ({navigation}: Props) => {
  const [loading, setLoading] = useState(false);
  const {data: employeeData} = useGetEmployeeQuery();
  const {data: storeData} = useGetStoreQuery();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [addDailyPjp] = useAddDailyPjpMutation();

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = useFormik({
    initialValues: initial,
    validationSchema: dailyPjpSchema,
    onSubmit: async (formValues, actions) => {
      try {
        setLoading(true);
        const payload = {data: formValues};
        const res = await addDailyPjp(payload).unwrap();

        if (res?.message?.status === 'success') {
          Toast.show({
            type: 'success',
            text1: `✅ ${res.message.message}`,
            position: 'top',
          });
          actions.resetForm();
          navigation.navigate('ActivityScreen');
        } else {
          Toast.show({
            type: 'error',
            text1: `❌ ${res.message.message || 'Something went wrong'}`,
            position: 'top',
          });
        }

        setLoading(false);
      } catch (error: any) {
        console.error('Distributor API Error:', error);
        Toast.show({
          type: 'error',
          text1:
            `❌ ${error?.data?.message?.message}` || 'Internal Server Error',
          text2: 'Please try again later.',
          position: 'top',
        });
        setLoading(false);
      }
    },
  });

  const transformToDropdownList = (arr: StoreType[] = []) =>
    arr.map(item => ({label: item.name, value: item.store_name}));

  const transformEmployeeList = (arr: REmployee['message']['data'] = []) =>
    arr.map(item => ({
      label: `${item.employee_name}`,
      value: item.name,
    }));

  const employeeList = transformEmployeeList(employeeData?.message?.data);
  const storeList = transformToDropdownList(storeData?.message?.data);

  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader title="Add Pjp" navigation={() => navigation.goBack()} />
      <AddPjpForm
        {...{values, errors, touched, handleChange, handleBlur, setFieldValue}}
        scrollY={scrollY}
        employeeList={employeeList}
        storeList={storeList}
      />
      <TouchableOpacity
        style={[styles.submitBtn, loading && {opacity: 0.7}]}
        onPress={() => handleSubmit()}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={styles.submitText}>Submit</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AddPjpScreen;

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
