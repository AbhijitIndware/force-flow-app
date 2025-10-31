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
import {distributorSchema} from '../../../types/schema';
import {
  useGetCityQuery,
  useGetDesignationQuery,
  useGetDistributorGroupQuery,
  useGetEmployeeQuery,
  useGetStateQuery,
  useGetZoneQuery,
} from '../../../features/dropdown/dropdown-api';
import {REmployee} from '../../../types/dropdownType';
import {useAddDistributorMutation} from '../../../features/base/base-api';
import Toast from 'react-native-toast-message';
import AddDistributorForm from '../../../components/SO/Partner/Distributor/AddDistributorForm';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
const {width} = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'AttendanceScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

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

const AddDistributorScreen = ({navigation}: Props) => {
  const [loading, setLoading] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const [statePage, setStatePage] = useState(1);
  const [employeePage, setEmployeePage] = useState(1);
  const [zonePage, setZonePage] = useState(1);
  const [cityPage, setCityPage] = useState(1);

  const [stateListData, setStateListData] = useState<
    {label: string; value: string}[]
  >([]);
  const [employeeListData, setEmployeeListData] = useState<
    {label: string; value: string}[]
  >([]);
  const [zoneListData, setZoneListData] = useState<
    {label: string; value: string}[]
  >([]);
  const [cityListData, setCityListData] = useState<
    {label: string; value: string}[]
  >([]);

  const [loadingMoreState, setLoadingMoreState] = useState(false);
  const [loadingMoreEmployee, setLoadingMoreEmployee] = useState(false);
  const [loadingMoreZone, setLoadingMoreZone] = useState(false);
  const [loadingMoreCity, setLoadingMoreCity] = useState(false);

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

  const {data: cityData, isFetching: cityFetching} = useGetCityQuery({
    state: values.state,
    page_size: '20',
    page: String(cityPage),
  });
  const {data: stateData, isFetching: stateFetching} = useGetStateQuery({
    zone: values.zone,
    page_size: '20',
    page: String(statePage),
  });

  const {data: employeeData, isFetching: employeeFetching} =
    useGetEmployeeQuery({
      name: '',
      page_size: '20',
      page: String(employeePage),
    });

  const {data: zoneData, isFetching: zoneFetching} = useGetZoneQuery({
    page_size: '20',
    page: String(zonePage),
  });

  const {data: designationData} = useGetDesignationQuery();
  const {data: distributorGroupData, error} = useGetDistributorGroupQuery();

  const distributorGroupList = transformToDropdownList(
    distributorGroupData?.message?.data,
  );
  // const employeeList = transformEmployeeList(employeeData?.message?.data);
  // const zoneList = useMemo(
  //   () => transformToDropdownList(zoneData?.message?.data),
  //   [zoneData],
  // );
  // const stateList = useMemo(() => {
  //   return transformToDropdownList(
  //     stateData?.message?.data?.filter(state => state.zone === values.zone),
  //   );
  // }, [stateData, values.zone]);

  const designationList = transformToDropdownList(
    designationData?.message?.data,
  );

  useEffect(() => {
    if (stateData?.message?.data) {
      const newData = transformToDropdownList(
        stateData.message.data.filter(state => state.zone === values.zone),
      );
      setStateListData(prev => [...prev, ...newData]);
    }
  }, [stateData, values.zone]);

  useEffect(() => {
    if (employeeData?.message?.data) {
      const newData = transformEmployeeList(employeeData.message.data);
      setEmployeeListData(prev => [...prev, ...newData]);
    }
  }, [employeeData]);

  useEffect(() => {
    if (zoneData?.message?.data) {
      const newData = transformToDropdownList(zoneData.message.data);
      setZoneListData(prev => [...prev, ...newData]);
    }
  }, [zoneData]);

  useEffect(() => {
    if (cityData?.message?.data) {
      const newData = transformToDropdownList(cityData?.message?.data);
      setCityListData(prev => [...prev, ...newData]);
    }
  }, [cityData]);

  const handleLoadMoreCity = () => {
    if (!cityFetching) {
      setLoadingMoreCity(true);
      setCityPage(prev => prev + 1);
      setLoadingMoreCity(false);
    }
  };

  const handleLoadMoreStates = () => {
    if (!stateFetching) {
      setLoadingMoreState(true);
      setStatePage(prev => prev + 1);
      setLoadingMoreState(false);
    }
  };

  const handleLoadMoreEmployees = () => {
    if (!employeeFetching) {
      setLoadingMoreEmployee(true);
      setEmployeePage(prev => prev + 1);
      setLoadingMoreEmployee(false);
    }
  };

  const handleLoadMoreZones = () => {
    if (!zoneFetching) {
      setLoadingMoreZone(true);
      setZonePage(prev => prev + 1);
      setLoadingMoreZone(false);
    }
  };

  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader
        title="Add Distributor"
        navigation={() => navigation.goBack()}
      />
      <AddDistributorForm
        {...{values, errors, touched, handleChange, handleBlur, setFieldValue}}
        scrollY={scrollY}
        distributorGroupList={distributorGroupList}
        employeeList={employeeListData}
        zoneList={zoneListData}
        stateList={stateListData}
        cityList={cityListData}
        designationList={designationList}
        // pagination props
        onLoadMoreState={handleLoadMoreStates}
        loadingMoreState={loadingMoreState}
        onLoadMoreEmployee={handleLoadMoreEmployees}
        loadingMoreEmployee={loadingMoreEmployee}
        onLoadMoreZone={handleLoadMoreZones}
        loadingMoreZone={loadingMoreZone}
        onLoadMoreCity={handleLoadMoreCity}
        loadingMoreCity={loadingMoreCity}
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

export default AddDistributorScreen;

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
