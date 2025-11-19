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
import {uniqueByValue} from '../../../utils/utils';
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

  const [listConfig, setListConfig] = useState({
    zone: {page: 1, search: ''},
    state: {page: 1, search: ''},
    city: {page: 1, search: ''},
    employee: {page: 1, search: ''},
    designation: {page: 1, search: ''},
    distributorGroup: {page: 1, search: ''},
  });

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
  const [designationListData, setDesignationListData] = useState<
    {label: string; value: string}[]
  >([]);
  const [distributorGroupListData, setDistributorGroupListData] = useState<
    {label: string; value: string}[]
  >([]);

  const [loadingMoreState, setLoadingMoreState] = useState(false);
  const [loadingMoreEmployee, setLoadingMoreEmployee] = useState(false);
  const [loadingMoreZone, setLoadingMoreZone] = useState(false);
  const [loadingMoreCity, setLoadingMoreCity] = useState(false);

  const [loadingMoreDesignation, setLoadingMoreDesignation] = useState(false);
  const [loadingMoreDistributorGroup, setLoadingMoreDistributorGroup] =
    useState(false);

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
    page: String(listConfig.city.page),
    search: listConfig.city.search,
  });
  const {data: stateData, isFetching: stateFetching} = useGetStateQuery({
    zone: values.zone,
    page_size: '20',
    page: String(listConfig.state.page),
    search: listConfig.state.search,
  });

  const {data: employeeData, isFetching: employeeFetching} =
    useGetEmployeeQuery({
      name: listConfig.employee.search,
      page_size: '20',
      page: String(listConfig.employee.page),
    });

  const {data: zoneData, isFetching: zoneFetching} = useGetZoneQuery({
    page_size: '20',
    page: String(listConfig.zone.page),
    search: listConfig.zone.search as string,
  });

  const {data: designationData, isFetching: designationFetching} =
    useGetDesignationQuery({
      page_size: '20',
      page: String(listConfig.designation.page),
      search: listConfig.designation.search,
    });

  const {data: distributorGroupData, isFetching: distributorGroupFetching} =
    useGetDistributorGroupQuery({
      page_size: '20',
      page: String(listConfig.distributorGroup.page),
      search: listConfig.distributorGroup.search,
    });

  useEffect(() => {
    if (stateData?.message?.data) {
      const newData = transformToDropdownList(stateData.message.data);
      setStateListData(prev => {
        let merged = [];
        if (listConfig.state.search !== '' && listConfig.state.page === 1) {
          merged = newData;
        } else {
          merged = [...prev, ...newData];
        }
        return uniqueByValue(merged);
      });
    }
  }, [stateData]);

  useEffect(() => {
    if (employeeData?.message?.data) {
      const newData = transformEmployeeList(employeeData.message.data);
      setEmployeeListData(prev => {
        let merged = [];
        if (
          listConfig.employee.search !== '' &&
          listConfig.employee.page === 1
        ) {
          merged = newData;
        } else {
          merged = [...prev, ...newData];
        }
        return uniqueByValue(merged);
      });
    }
  }, [employeeData]);

  useEffect(() => {
    if (zoneData?.message?.data) {
      const newData = transformToDropdownList(zoneData.message.data);

      setZoneListData(prev => {
        let merged = [];
        if (listConfig.zone.search !== '' && listConfig.zone.page === 1) {
          merged = newData;
        } else {
          merged = [...prev, ...newData];
        }
        return uniqueByValue(merged);
      });
    }
  }, [zoneData]);

  useEffect(() => {
    if (cityData?.message?.data) {
      const newData = transformToDropdownList(cityData?.message?.data);

      setCityListData(prev => {
        let merged = [];
        if (listConfig.city.search !== '' && listConfig.city.page === 1) {
          merged = newData;
        } else {
          merged = [...prev, ...newData];
        }
        return uniqueByValue(merged);
      });
    }
  }, [cityData]);

  useEffect(() => {
    if (designationData?.message?.data) {
      const newData = transformToDropdownList(designationData.message.data);
      setDesignationListData(prev => {
        let merged = [];
        if (
          listConfig.designation.search !== '' &&
          listConfig.designation.page === 1
        ) {
          merged = newData;
        } else {
          merged = [...prev, ...newData];
        }
        return uniqueByValue(merged);
      });
    }
  }, [designationData]);

  useEffect(() => {
    if (distributorGroupData?.message?.data) {
      const newData = transformToDropdownList(
        distributorGroupData.message.data,
      );
      setDistributorGroupListData(prev => {
        let merged = [];
        if (
          listConfig.distributorGroup.search !== '' &&
          listConfig.distributorGroup.page === 1
        ) {
          merged = newData;
        } else {
          merged = [...prev, ...newData];
        }
        return uniqueByValue(merged);
      });
    }
  }, [distributorGroupData]);

  // 🔄 Clear dependent lists when parent field changes
  useEffect(() => {
    if (values.zone !== '') {
      setStateListData([]);
      setListConfig(prev => ({
        ...prev,
        state: {page: 1, search: ''}, // reset state pagination & search
        city: {page: 1, search: ''}, // also reset city (because state depends on zone)
      }));
    }
  }, [values.zone]);

  useEffect(() => {
    if (values.state !== '') {
      setCityListData([]);
      setListConfig(prev => ({
        ...prev,
        city: {page: 1, search: ''}, // reset city pagination & search
      }));
    }
  }, [values.state]);

  const handleLoadMoreCity = () => {
    if (!cityFetching) {
      setLoadingMoreCity(true);
      setListConfig(prev => ({
        ...prev,
        city: {page: prev.city.page + 1, search: prev.city.search},
      }));
      setLoadingMoreCity(false);
    }
  };

  const handleLoadMoreStates = () => {
    if (!stateFetching) {
      const currentPage = stateData?.message?.pagination?.page ?? 1;
      const totalPages = stateData?.message?.pagination?.total_pages ?? 1;

      if (currentPage >= totalPages) return; // 🚫 No more pages

      setLoadingMoreState(true);
      setListConfig(prev => ({
        ...prev,
        state: {page: prev.state.page + 1, search: prev.state.search},
      }));
      setLoadingMoreState(false);
    }
  };

  const handleLoadMoreEmployees = () => {
    if (!employeeFetching) {
      const currentPage = employeeData?.message?.pagination?.page ?? 1;
      const totalPages = employeeData?.message?.pagination?.total_pages ?? 1;

      if (currentPage >= totalPages) return; // 🚫 No more pages

      setLoadingMoreEmployee(true);
      setListConfig(prev => ({
        ...prev,
        state: {page: prev.employee.page + 1, search: prev.employee.search},
      }));
      setLoadingMoreEmployee(false);
    }
  };

  const handleLoadMoreZones = () => {
    if (!zoneFetching) {
      const currentPage = zoneData?.message?.pagination?.page ?? 1;
      const totalPages = zoneData?.message?.pagination?.total_pages ?? 1;

      if (currentPage >= totalPages) return; // 🚫 No more pages

      setLoadingMoreZone(true);
      setListConfig(prev => ({
        ...prev,
        zone: {page: prev.zone.page + 1, search: prev.zone.search},
      }));
      setLoadingMoreZone(false);
    }
  };

  const handleLoadMoreDesignation = () => {
    if (!designationFetching) {
      const currentPage = designationData?.message?.pagination?.page ?? 1;
      const totalPages = designationData?.message?.pagination?.total_pages ?? 1;

      if (currentPage >= totalPages) return; // 🚫 No more pages

      setLoadingMoreDesignation(true);
      setListConfig(prev => ({
        ...prev,
        designation: {
          page: prev.designation.page + 1,
          search: prev.designation.search,
        },
      }));
      setLoadingMoreDesignation(false);
    }
  };

  const handleLoadMoreDistributorGroup = () => {
    if (!distributorGroupFetching) {
      const currentPage = distributorGroupData?.message?.pagination?.page ?? 1;
      const totalPages =
        distributorGroupData?.message?.pagination?.total_pages ?? 1;

      if (currentPage >= totalPages) return; // 🚫 No more pages

      setLoadingMoreDistributorGroup(true);
      setListConfig(prev => ({
        ...prev,
        distributorGroup: {
          page: prev.distributorGroup.page + 1,
          search: prev.distributorGroup.search,
        },
      }));
      setLoadingMoreDistributorGroup(false);
    }
  };

  const handleSearchChange = (
    type:
      | 'zone'
      | 'state'
      | 'city'
      | 'employee'
      | 'designation'
      | 'distributorGroup',
    text: string,
  ) => {
    // Reset pagination & trigger new search query
    setListConfig(prev => ({
      ...prev,
      [type]: {page: 1, search: text},
    }));
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
        distributorGroupList={distributorGroupListData}
        employeeList={employeeListData}
        zoneList={zoneListData}
        stateList={stateListData}
        cityList={cityListData}
        designationList={designationListData}
        // pagination props
        onLoadMoreState={handleLoadMoreStates}
        loadingMoreState={loadingMoreState}
        onLoadMoreEmployee={handleLoadMoreEmployees}
        loadingMoreEmployee={loadingMoreEmployee}
        onLoadMoreZone={handleLoadMoreZones}
        loadingMoreZone={loadingMoreZone}
        onLoadMoreCity={handleLoadMoreCity}
        loadingMoreCity={loadingMoreCity}
        // search props 👇
        zoneSearchText={listConfig.zone.search}
        setZoneSearchText={(text: string) => handleSearchChange('zone', text)}
        stateSearchText={listConfig.state.search}
        setStateSearchText={(text: string) => handleSearchChange('state', text)}
        citySearchText={listConfig.city.search}
        setCitySearchText={(text: string) => handleSearchChange('city', text)}
        employeeSearchText={listConfig.employee.search}
        setEmployeeSearchText={(text: string) =>
          handleSearchChange('employee', text)
        }
        // pagination
        onLoadMoreDesignation={handleLoadMoreDesignation}
        loadingMoreDesignation={loadingMoreDesignation}
        onLoadMoreDistributorGroup={handleLoadMoreDistributorGroup}
        loadingMoreDistributorGroup={loadingMoreDistributorGroup}
        // search
        designationSearchText={listConfig.designation.search}
        setDesignationSearchText={(text: string) =>
          handleSearchChange('designation', text)
        }
        distributorGroupSearchText={listConfig.distributorGroup.search}
        setDistributorGroupSearchText={(text: string) =>
          handleSearchChange('distributorGroup', text)
        }
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
