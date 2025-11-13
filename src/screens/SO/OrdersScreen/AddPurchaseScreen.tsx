import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useEffect, useMemo, useRef, useState} from 'react';
import {useFormik} from 'formik';
import Toast from 'react-native-toast-message';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import PageHeader from '../../../components/ui/PageHeader';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import {distributorSchema} from '../../../types/schema';
import {SoAppStackParamList} from '../../../types/Navigation';
import {
  useGetCityQuery,
  useGetDesignationQuery,
  useGetDistributorGroupQuery,
  useGetEmployeeQuery,
  useGetStateQuery,
  useGetZoneQuery,
} from '../../../features/dropdown/dropdown-api';
import {useAddDistributorMutation} from '../../../features/base/base-api';
import {Animated} from 'react-native';
import AddPurchaseForm from '../../../components/SO/Order/Purchase/AddPurchaseForm';
import {REmployee} from '../../../types/dropdownType';

let initial = {
  distributor_name: '',
  distributor_sap_code: '',
  distributor_group: '',
  distributor_code: '',
  mobile: '',
  email: '',
  employee: '',
  zone: '',
  state: '',
  city: '',
  reports_to: '',
  designation: '',
};
const AddPurchaseScreen = ({
  navigation,
}: {
  navigation: NativeStackNavigationProp<
    SoAppStackParamList,
    'AddPurchaseScreen'
  >;
}) => {
  const [loading, setLoading] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [page, setPage] = useState<number>(1);
  const [stateListData, setStateListData] = useState<
    {label: string; value: string}[]
  >([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const [addDistributor] = useAddDistributorMutation();

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
    validationSchema: distributorSchema,
    onSubmit: async (formValues, actions) => {
      try {
        setLoading(true);
        const payload = {data: formValues};
        const res = await addDistributor(payload).unwrap();

        if (res?.message?.status === 'success') {
          Toast.show({
            type: 'success',
            text1: `✅ ${res.message.message}`,
            position: 'top',
          });
          actions.resetForm();
          navigation.navigate('PartnersScreen');
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

  const transformToDropdownList = (arr: {name: string}[] = []) =>
    arr.map(item => ({label: item.name, value: item.name}));

  const transformEmployeeList = (arr: REmployee['message']['data'] = []) =>
    arr.map(item => ({
      label: `${item.employee_name} (${item.designation})`,
      value: item.name,
    }));

  const {data: cityData} = useGetCityQuery({});
  const {data: stateData, isFetching} = useGetStateQuery({
    zone: values.zone,
    page_size: '20',
    page: String(page),
  });
  const {data: zoneData} = useGetZoneQuery({});
  const {data: employeeData} = useGetEmployeeQuery({name: ''});
  const {data: designationData} = useGetDesignationQuery({});
  const {data: distributorGroupData, error} = useGetDistributorGroupQuery({});

  const distributorGroupList = transformToDropdownList(
    distributorGroupData?.message?.data,
  );
  const employeeList = transformEmployeeList(employeeData?.message?.data);
  const zoneList = useMemo(
    () => transformToDropdownList(zoneData?.message?.data),
    [zoneData],
  );
  // const stateList = useMemo(() => {
  //   return transformToDropdownList(
  //     stateData?.message?.data?.filter(state => state.zone === values.zone),
  //   );
  // }, [stateData, values.zone]);
  const cityList = useMemo(() => {
    return transformToDropdownList(
      cityData?.message?.data?.filter(city => city.state === values.state),
    );
  }, [cityData, values.state]);
  const designationList = transformToDropdownList(
    designationData?.message?.data,
  );

  useEffect(() => {
    if (employeeData?.message?.data) {
      const newData = transformToDropdownList(
        stateData?.message?.data?.filter(state => state.zone === values.zone),
      );
      setStateListData(prev => [...prev, ...newData]); // append
    }
  }, [stateData, values.zone]);

  const handleLoadMoreStores = () => {
    if (!isFetching) {
      setLoadingMore(true);
      setPage(prev => prev + 1);
      setLoadingMore(false);
    }
  };

  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader
        title="Add Purchase"
        navigation={() => navigation.navigate('OrdersScreen')}
      />

      <AddPurchaseForm
        {...{values, errors, touched, handleChange, handleBlur, setFieldValue}}
        scrollY={scrollY}
        distributorGroupList={distributorGroupList}
        employeeList={employeeList}
        zoneList={zoneList}
        stateList={stateListData}
        cityList={cityList}
        designationList={designationList}
        onLoadMoreStores={handleLoadMoreStores} // 👈 added
        loadingMoreStores={loadingMore}
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

export default AddPurchaseScreen;

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
