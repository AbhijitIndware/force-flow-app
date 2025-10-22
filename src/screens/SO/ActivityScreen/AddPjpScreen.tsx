/* eslint-disable react-native/no-inline-styles */
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  View,
} from 'react-native';
import {useEffect, useMemo, useRef, useState} from 'react';
import {useFormik} from 'formik';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import PageHeader from '../../../components/ui/PageHeader';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import {dailyPjpSchema} from '../../../types/schema';
import {
  useGetDailyStoreQuery,
  useGetEmployeeQuery,
  useGetStoreQuery,
} from '../../../features/dropdown/dropdown-api';
import {REmployee, StoreType} from '../../../types/dropdownType';
import {
  useAddDailyPjpMutation,
  useGetDailyPjpByIdQuery,
  useGetStoreListQuery,
  useUpdateDailyPjpMutation,
} from '../../../features/base/base-api';
import Toast from 'react-native-toast-message';
import AddPjpForm from '../../../components/SO/Activity/Pjp/AddPjpForm';
import {useAppSelector} from '../../../store/hook';
import {
  IAddPjpPayload,
  PjpDailyStore,
  PjpDailyStoreDetail,
  Store,
} from '../../../types/baseType';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
const {width} = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'AddPjpScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const initial = {
  date: '',
  employee: '',
  stores: [{store: ''}],
};

// helper: transform API data (PjpDailyStore) -> Formik's IAddPjpPayload["data"]
const mapPjpDetailToForm = (detail: PjpDailyStoreDetail): any => {
  return {
    date: detail.pjp_date,
    employee: detail.pjp_emp,
    stores: detail.stores.map(s => ({
      store: s.store, // or s.store if API expects that
    })),
  };
};

const AddPjpScreen = ({navigation, route}: Props) => {
  const {id} = route?.params ?? {};
  const [initialValues, setInitialValues] = useState<any>(initial);
  const [loading, setLoading] = useState(false);
  const {data: storeData, error} = useGetStoreListQuery();
  const scrollY = useRef(new Animated.Value(0)).current;
  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );
  const [page, setPage] = useState<number>(1);
  const [employeeListData, setEmployeeListData] = useState<
    {label: string; value: string}[]
  >([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const {data: employeeData, isFetching} = useGetEmployeeQuery({
    name: employee?.id,
    page_size: '20',
    page: String(page),
  });

  const {data: pjpDetails} = useGetDailyPjpByIdQuery(id, {
    skip: id === null || id === undefined,
  });

  const [addDailyPjp] = useAddDailyPjpMutation();
  const [updateDailyPjp] = useUpdateDailyPjpMutation();

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
    initialValues: initialValues,
    validationSchema: dailyPjpSchema,
    enableReinitialize: true, // 👈 important
    onSubmit: async (formValues, actions) => {
      try {
        setLoading(true);

        // if record exists → update, else → add
        const payload = {data: formValues};
        let res;

        if (id) {
          res = await updateDailyPjp({
            data: {
              ...formValues,
              document_name: id,
            },
          }).unwrap();
        } else {
          res = await addDailyPjp(payload).unwrap();
        }

        if (res?.message?.status === 'success') {
          Toast.show({
            type: 'success',
            text1: `✅ ${res.message.message}`,
            position: 'top',
          });
          resetForm();
          navigation.navigate('ActivityScreen');
        } else {
          Toast.show({
            type: 'error',
            text1: `❌ ${res.message.message || 'Something went wrong'}`,
            position: 'top',
          });
        }
      } catch (error: any) {
        console.error('PJP API Error:', error);
        Toast.show({
          type: 'error',
          text1:
            `❌ ${error?.data?.message?.message}` || 'Internal Server Error',
          text2: 'Please try again later.',
          position: 'top',
        });
      } finally {
        setLoading(false);
      }
    },
  });

  const transformToDropdownList = (arr: Store[] = []) =>
    arr.map(item => ({label: item.store_name, value: item.name}));

  const transformEmployeeList = (arr: REmployee['message']['data'] = []) =>
    arr.map(item => ({
      label: `${item.employee_name}`,
      value: item.name,
    }));

  // const employeeList = transformEmployeeList(employeeData?.message?.data);
  const storeList = transformToDropdownList(storeData?.message?.data?.stores);

  useEffect(() => {
    if (employee?.id) {
      setFieldValue('employee', employee?.id);
    }
  }, [employee]);

  useEffect(() => {
    if (pjpDetails?.message && id) {
      let _initial_value = mapPjpDetailToForm(pjpDetails.message);
      setInitialValues(_initial_value);
    }
  }, [pjpDetails, id]);

  useEffect(() => {
    if (employeeData?.message?.data) {
      const newData = transformEmployeeList(employeeData?.message?.data);
      setEmployeeListData(prev => [...prev, ...newData]); // append
    }
  }, [employeeData]);

  const handleLoadMoreStores = () => {
    if (!isFetching) {
      setLoadingMore(true);
      setPage(prev => prev + 1);
      setLoadingMore(false);
    }
  };

  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader title="Add Pjp" navigation={() => navigation.goBack()} />
      <AddPjpForm
        {...{values, errors, touched, handleChange, handleBlur, setFieldValue}}
        scrollY={scrollY}
        employeeList={employeeListData}
        storeList={storeList}
        onLoadMoreStores={handleLoadMoreStores} // 👈 added
        loadingMoreStores={loadingMore}
      />
      <View
        style={{
          paddingHorizontal: 20,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.bgColor,
          width: '100%',
          height: 80,
        }}>
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
      </View>
    </SafeAreaView>
  );
};

export default AddPjpScreen;

const styles = StyleSheet.create({
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 18,
    position: 'absolute',
    bottom: 15,
    gap: 5,
    zIndex: 1,
    width: width * 0.9,
  },
  submitText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.white,
    lineHeight: 22,
  },
});
