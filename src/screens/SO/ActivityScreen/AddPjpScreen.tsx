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
import {useGetEmployeeQuery} from '../../../features/dropdown/dropdown-api';
import {
  useAddDailyPjpMutation,
  useGetDailyPjpByIdQuery,
  useGetStoreListQuery,
  useUpdateDailyPjpMutation,
} from '../../../features/base/base-api';
import Toast from 'react-native-toast-message';
import AddPjpForm from '../../../components/SO/Activity/Pjp/AddPjpForm';
import {useAppSelector} from '../../../store/hook';
import {PjpDailyStoreDetail} from '../../../types/baseType';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {uniqueByValue} from '../../../utils/utils';
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
  date: new Date().toISOString().split('T')[0],
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

// 👨‍💼 Unique by Employee ID (or name)
export const uniqueByEmployeeName = <T extends {name: string}>(arr: T[]) => {
  const seen = new Set<string>();
  return arr.filter(emp => {
    if (seen.has(emp.name)) return false;
    seen.add(emp.name);
    return true;
  });
};

// 🏬 Unique by Store Name (or code)
export const uniqueByStoreName = <T extends {name: string}>(arr: T[]) => {
  const seen = new Set<string>();
  return arr.filter(store => {
    if (seen.has(store.name)) return false;
    seen.add(store.name);
    return true;
  });
};

const AddPjpScreen = ({navigation, route}: Props) => {
  const {id} = route?.params ?? {};
  const [initialValues, setInitialValues] = useState<any>(initial);
  const [loading, setLoading] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );

  /** ─── Employee State ─────────────────────────────── */
  const [empPage, setEmpPage] = useState(1);
  const [employeeListData, setEmployeeListData] = useState<
    {label: string; value: string}[]
  >([]);
  const [employeeOgData, setEmployeeOgData] = useState<any[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [loadingEmpMore, setLoadingEmpMore] = useState(false);

  /** ─── Store State ─────────────────────────────────── */
  const [storePage, setStorePage] = useState(1);
  const [storeListData, setStoreListData] = useState<
    {label: string; value: string}[]
  >([]);
  const [storeOgData, setStoreOgData] = useState<any[]>([]);
  const [storeSearch, setStoreSearch] = useState('');
  const [loadingStoreMore, setLoadingStoreMore] = useState(false);

  /** ─── Queries ─────────────────────────────────────── */
  const {data: employeeData, isFetching: fetchingEmp} = useGetEmployeeQuery({
    page: String(empPage),
    page_size: '20',
    name: employeeSearch,
  });
  const {data: storeData, isFetching: fetchingStore} = useGetStoreListQuery({
    page: String(storePage),
    page_size: '20',
    search: storeSearch,
    include_subordinates: '1',
    include_direct_subordinates: '1',
  });

  const {data: pjpDetails} = useGetDailyPjpByIdQuery(id, {
    skip: id === null || id === undefined,
  });

  const [addDailyPjp] = useAddDailyPjpMutation();
  const [updateDailyPjp] = useUpdateDailyPjpMutation();

  /** ─── Transform helpers ───────────────────────────── */
  const transformToDropdownList = (arr: any[] = []) =>
    arr.map(item => ({label: item.store_name, value: item.name}));

  const transformEmployeeList = (arr: any[] = []) =>
    arr.map(item => ({
      label: `${item.employee_name}`,
      value: item.name,
    }));

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
        // console.error('PJP API Error:', error);
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

  useEffect(() => {
    if (employee?.id) {
      setFieldValue('employee', employee?.id);
    }
  }, [employee]);

  useEffect(() => {
    if (pjpDetails?.message && id) {
      const _initial_value = mapPjpDetailToForm(pjpDetails.message);
      // console.log('_initial_value', _initial_value);
      setInitialValues({
        ..._initial_value,
        date: _initial_value.date,
      });
    }
  }, [pjpDetails, id]);

  /** ─── Employee Data Merge ─────────────────────────── */
  useEffect(() => {
    if (employeeData?.message?.data) {
      setLoadingEmpMore(false);
      const newData = transformEmployeeList(employeeData.message.data);
      if (employeeSearch.trim() !== '' || empPage === 1) {
        setEmployeeListData(uniqueByValue(newData));
        setEmployeeOgData(uniqueByEmployeeName(employeeData.message.data));
      } else {
        setEmployeeListData(prev => uniqueByValue([...prev, ...newData]));
        setEmployeeOgData(prev =>
          uniqueByEmployeeName([...prev, ...employeeData.message.data]),
        );
      }
    }
  }, [employeeData]);

  /** ─── Store Data Merge ────────────────────────────── */
  useEffect(() => {
    if (storeData?.message?.data?.stores) {
      setLoadingStoreMore(false);
      const newData = transformToDropdownList(storeData.message.data.stores);
      if (storeSearch.trim() !== '' || storePage === 1) {
        setStoreListData(uniqueByValue(newData));
        setStoreOgData(uniqueByStoreName(storeData.message.data.stores));
      } else {
        setStoreListData(prev => uniqueByValue([...prev, ...newData]));
        setStoreOgData(prev =>
          uniqueByStoreName([...prev, ...storeData.message.data.stores]),
        );
      }
    }
  }, [storeData]);

  /** ─── Reset pages when search changes ─────────────── */
  useEffect(() => {
    setEmpPage(1);
  }, [employeeSearch]);

  useEffect(() => {
    setStorePage(1);
  }, [storeSearch]);

  /** ─── Pagination Handlers ─────────────────────────── */
  const handleLoadMoreEmployees = () => {
    if (fetchingEmp) return;

    const current = employeeData?.message?.pagination?.page ?? 1;
    const total = employeeData?.message?.pagination?.total_pages ?? 1;

    if (current >= total) return;
    setLoadingEmpMore(true);
    setEmpPage(prev => prev + 1);
  };

  const handleLoadMoreStores = () => {
    if (fetchingStore || loadingStoreMore) return;

    const current = storeData?.message?.pagination?.page ?? 1;
    const total = storeData?.message?.pagination?.total_pages ?? 1;

    if (current >= total) return; // 🚫 Stop loading

    setLoadingStoreMore(true);
    setStorePage(prev => prev + 1);
  };

  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader title="Add Pjp" navigation={() => navigation.goBack()} />
      <AddPjpForm
        {...{values, errors, touched, handleChange, handleBlur, setFieldValue}}
        scrollY={scrollY}
        /** 👇 Employee-related props */
        employeeList={employeeListData}
        employeeOgData={employeeOgData}
        employeeSearch={employeeSearch}
        setEmployeeSearch={setEmployeeSearch}
        onLoadMoreEmployees={handleLoadMoreEmployees}
        loadingMoreEmployees={loadingEmpMore}
        /** 👇 Store-related props */
        storeList={storeListData}
        storeOgData={storeOgData}
        storeSearch={storeSearch}
        setStoreSearch={setStoreSearch}
        onLoadMoreStores={handleLoadMoreStores}
        loadingMoreStores={loadingStoreMore}
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
