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
import {useEffect, useRef, useState} from 'react';
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
  useLazyGetDailyPjpListQuery,
  useUpdateDailyPjpMutation,
} from '../../../features/base/base-api';
import Toast from 'react-native-toast-message';
import AddPjpForm from '../../../components/SO/Activity/Pjp/AddPjpForm';
import {useAppSelector} from '../../../store/hook';
import {PjpDailyStore} from '../../../types/baseType';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {uniqueByValue} from '../../../utils/utils';
import MinStoresWarningModal from '../../../components/SO/Activity/Pjp/MinStoresWarningModal';
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
const mapPjpDetailToForm = (detail: PjpDailyStore): any => {
  return {
    date: detail.date,
    employee: detail.employee,
    stores: detail.stores.map(s => ({
      store: s.store_id, // or s.store if API expects that
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
  const [duplicatePjpId, setDuplicatePjpId] = useState<string | null>(null);
  const [showDuplicatePjp, setShowDuplicatePjp] = useState(false);

  const [triggerGetDailyPjpList] = useLazyGetDailyPjpListQuery();

  const [showMinStoreModal, setShowMinStoreModal] = useState(false);

  /** ─── Employee State ─────────────────────────────── */
  const [empPage, setEmpPage] = useState(1);
  const [employeeListData, setEmployeeListData] = useState<
    {label: string; value: string}[]
  >([]);
  const [employeeOgData, setEmployeeOgData] = useState<any[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [loadingEmpMore, setLoadingEmpMore] = useState(false);

  /** ─── Queries ─────────────────────────────────────── */
  const {data: employeeData, isFetching: fetchingEmp} = useGetEmployeeQuery({
    page: String(empPage),
    page_size: '20',
    name: employeeSearch,
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
        if (
          error?.data?.message?.message ===
          'PJP Daily Stores with the same Employee and Date already exists.'
        ) {
          setShowDuplicatePjp(true);

          // 👇 Call lazy API with date
          const response = await triggerGetDailyPjpList({
            page: 1,
            page_size: 10,
            status: '',
            date: values.date, // ✅ pass selected date
          }).unwrap();

          // 🔥 Find the existing PJP
          const existingPjp = response?.message?.data?.pjp_daily_stores[0]; // assuming list API returns array

          if (existingPjp?.pjp_daily_store_id) {
            setDuplicatePjpId(existingPjp.pjp_daily_store_id);
          }

          Toast.show({
            type: 'error',
            text1: '⚠️ PJP already exists for this employee & date',
            text2: 'You can modify the existing PJP',
            position: 'top',
          });

          return;
        }
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
      const _initial_value = mapPjpDetailToForm(pjpDetails?.message?.data);
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

  /** ─── Reset pages when search changes ─────────────── */
  useEffect(() => {
    setEmpPage(1);
  }, [employeeSearch]);

  /** ─── Pagination Handlers ─────────────────────────── */
  const handleLoadMoreEmployees = () => {
    if (fetchingEmp) return;

    const current = employeeData?.message?.pagination?.page ?? 1;
    const total = employeeData?.message?.pagination?.total_pages ?? 1;

    if (current >= total) return;
    setLoadingEmpMore(true);
    setEmpPage(prev => prev + 1);
  };

  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader
        title={id ? 'Edit PJP' : 'Add Pjp'}
        navigation={() => navigation.goBack()}
      />
      {showDuplicatePjp && (
        <View
          style={{
            padding: 16,
            marginHorizontal: 20,
            marginVertical: 10,
            borderRadius: 8,
            backgroundColor: '#FFF3CD',
            borderWidth: 1,
            borderColor: '#FFE69C',
          }}>
          <Text style={{color: '#856404', marginBottom: 10}}>
            A PJP already exists for the selected employee and date.
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: Colors.primary,
              paddingVertical: 12,
              borderRadius: 6,
              alignItems: 'center',
            }}
            onPress={() => {
              setShowDuplicatePjp(false);

              navigation.navigate('AddPjpScreen', {
                id: duplicatePjpId as string, // 👈 open in edit mode
              });
            }}>
            <Text style={{color: Colors.white, fontWeight: '600'}}>
              Modify Existing PJP
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
        // storeList={storeListData}
        // storeOgData={storeOgData}
        // storeSearch={storeSearch}
        // setStoreSearch={setStoreSearch}
        // onLoadMoreStores={handleLoadMoreStores}
        // loadingMoreStores={loadingStoreMore}
      />
      <MinStoresWarningModal
        visible={showMinStoreModal}
        onCancel={() => {
          setShowMinStoreModal(false);
        }}
        onContinue={() => {
          setShowMinStoreModal(false);
          handleSubmit();
        }}
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
          onPress={() => {
            if (values.stores.length < 15) setShowMinStoreModal(true);
            else handleSubmit();
          }}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.submitText}>{id ? 'Modify' : 'Submit'}</Text>
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
