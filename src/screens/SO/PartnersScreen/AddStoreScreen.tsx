/* eslint-disable react-native/no-inline-styles */
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  View,
} from 'react-native';
import {useEffect, useRef, useState} from 'react';
import {useFormik} from 'formik';
import Toast from 'react-native-toast-message';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import PageHeader from '../../../components/ui/PageHeader';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import {storeSchema} from '../../../types/schema';
import {SoAppStackParamList} from '../../../types/Navigation';
import {
  useGetBeatQuery,
  useGetCityQuery,
  useGetDistributorQuery,
  useGetLocationByLatLongQuery,
  useGetStateQuery,
  useGetStoreCategoryQuery,
  useGetStoreTypeQuery,
  useGetZoneQuery,
} from '../../../features/dropdown/dropdown-api';
import {
  useAddStoreMutation,
  useCreateNewCityMutation,
} from '../../../features/base/base-api';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {useAppSelector} from '../../../store/hook';
import {Animated} from 'react-native';
import AddStoreForm from '../../../components/SO/Partner/Store/AddStoreForm';

import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {uniqueByValue} from '../../../utils/utils';
import {ICity} from '../../../types/baseType';

const {width} = Dimensions.get('window');
const initial = {
  store_name: '',
  store_type: '',
  store_category: '',
  zone: '',
  state: '',
  city: '',
  map_location: '',
  // start_time: '',
  // end_time: '',
  pan_no: '',
  gst_no: '',
  pin_code: '',
  distributor: '',
  address: '',
  weekly_off: '',
  beat: '',
  created_by_employee: '',
  created_by_employee_name: '',
  created_by_employee_designation: '',
};

const weekOffList = [
  {label: 'Monday', value: 'Monday'},
  {label: 'Tuesday', value: 'Tuesday'},
  {label: 'Wednesday', value: 'Wednesday'},
  {label: 'Thursday', value: 'Thursday'},
  {label: 'Friday', value: 'Friday'},
  {label: 'Saturday', value: 'Saturday'},
  {label: 'Sunday', value: 'Sunday'},
];

const AddStoreScreen = ({
  navigation,
}: {
  navigation: NativeStackNavigationProp<SoAppStackParamList, 'AddStoreScreen'>;
}) => {
  const [loading, setLoading] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [activeField, setActiveField] = useState<
    'start_time' | 'end_time' | null
  >(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const user = useAppSelector(
    state => state?.persistedReducer?.authSlice?.user,
  );
  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );

  const [listConfig, setListConfig] = useState({
    zone: {page: 1, search: ''},
    state: {page: 1, search: ''},
    city: {page: 1, search: ''},
    distributor: {page: 1, search: ''},
    type: {page: 1, search: ''},
    category: {page: 1, search: ''},
    beat: {page: 1, search: ''},
  });
  const [useCityDropdown, setUseCityDropdown] = useState(true);
  const [isNewCity, setIsNewCity] = useState(false);

  const [zoneListData, setZoneListData] = useState<
    {label: string; value: string}[]
  >([]);
  const [stateListData, setStateListData] = useState<
    {label: string; value: string}[]
  >([]);
  const [cityListData, setCityListData] = useState<
    {label: string; value: string}[]
  >([]);
  const [distributorListData, setDistributorListData] = useState<
    {label: string; value: string}[]
  >([]);
  const [storeTypeListData, setStoreTypeListData] = useState<
    {label: string; value: string}[]
  >([]);
  const [storeCategoryListData, setStoreCategoryListData] = useState<
    {label: string; value: string}[]
  >([]);
  const [beatListData, setBeatListData] = useState<
    {label: string; value: string}[]
  >([]);

  const [loadingMoreState, setLoadingMoreState] = useState(false);
  const [loadingMoreCity, setLoadingMoreCity] = useState(false);
  const [loadingMoreZone, setLoadingMoreZone] = useState(false);

  // 🆕 Add these missing states
  const [loadingMoreType, setLoadingMoreType] = useState(false);
  const [loadingMoreCategory, setLoadingMoreCategory] = useState(false);
  const [loadingMoreDistributor, setLoadingMoreDistributor] = useState(false);
  const [loadingMoreBeat, setLoadingMoreBeat] = useState(false);

  const [createNewCity] = useCreateNewCityMutation();

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
    validationSchema: storeSchema,
    onSubmit: async (formValues, actions) => {
      try {
        setLoading(true);
        // 🔥 STEP 1: Create city if it's a new one
        if (isNewCity) {
          const cityPayload: ICity = {
            data: {
              city_name: formValues.city,
              state: formValues.state, // ✅ from form values
            },
          };

          const cityRes = await createNewCity(cityPayload).unwrap();
          console.log('🚀 ~ AddStoreScreen ~ cityRes:', cityRes);

          // if (cityRes?.message?.status !== 'success') {
          //   throw new Error('Failed to create city');
          // }
        }

        let value = {
          ...formValues,
          created_by_employee: employee?.id as string, // Replace with actual user ID
          created_by_employee_name: user?.full_name, // Replace with actual user name
          created_by_employee_designation: employee?.designation as string, // Replace with actual designation
        };

        const payload = {data: value};
        const res = await addStore(payload).unwrap();

        if (res?.message?.status === 'success') {
          Toast.show({
            type: 'success',
            text1: `✅ ${res.message.message}`,
            position: 'top',
          });
          actions.resetForm();
          navigation.goBack();
        } else {
          Toast.show({
            type: 'error',
            text1: `❌ ${res.message.message || 'Something went wrong'}`,
            position: 'top',
          });
        }
        // setLoading(false);
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1:
            `❌ ${error?.data?.message?.message}` || 'Internal Server Error',
          text2: 'Please try again later.',
          position: 'top',
        });
        // setLoading(false);
      } finally {
        setIsNewCity(false);
        setLoading(false);
      }
    },
  });

  const [addStore] = useAddStoreMutation();
  const {data: zoneData, isFetching: zoneFetching} = useGetZoneQuery(
    {
      page_size: '20',
      page: String(listConfig.zone.page),
      search: listConfig.zone.search as string,
    },
    {refetchOnFocus: true},
  );

  const {data: stateData, isFetching: stateFetching} = useGetStateQuery(
    {
      zone: values.zone,
      page_size: '20',
      page: String(listConfig.state.page),
      search: listConfig.state.search,
    },
    {refetchOnFocus: true},
  );

  const {data: cityData, isFetching: cityFetching} = useGetCityQuery(
    {
      state: values.state,
      page_size: '20',
      page: String(listConfig.city.page),
      search: listConfig.city.search,
    },
    {refetchOnFocus: true},
  );

  const {data: distributorData, isFetching: distributorFetching} =
    useGetDistributorQuery(
      {
        page_size: '20',
        page: String(listConfig.distributor.page),
        search: listConfig.distributor.search,
      },
      {refetchOnFocus: true},
    );

  const {data: typeData, isFetching: typeFetching} = useGetStoreTypeQuery(
    {
      page_size: '20',
      page: String(listConfig.type.page),
      search: listConfig.type.search,
    },
    {refetchOnFocus: true},
  );

  const {data: categoryData, isFetching: categoryFetching} =
    useGetStoreCategoryQuery(
      {
        page_size: '20',
        page: String(listConfig.category.page),
        search: listConfig.category.search,
        filters: JSON.stringify({store_type: values.store_type}),
      },
      {refetchOnFocus: true},
    );

  const {data: beatData, isFetching: beatFetching} = useGetBeatQuery(
    {
      page_size: '20',
      page: String(listConfig.beat.page),
      search: listConfig.beat.search,
    },
    {refetchOnFocus: true},
  );

  // Assuming values.map_location is a string like "22.5643,88.3693"
  const [latitude, longitude] = values?.map_location?.split(',');

  const {data: locationData} = useGetLocationByLatLongQuery(
    {
      latitude,
      longitude,
    },
    {skip: !values.map_location || values.map_location === ''},
  );

  const transformList = (arr: {name: string}[] = []) => {
    const unique = Array.from(new Map(arr.map(i => [i.name, i])).values());
    return unique.map(i => ({label: i.name, value: i.name}));
  };

  const disTransformList = (
    arr: {name: string; distributor_name: string}[] = [],
  ) => {
    const unique = Array.from(new Map(arr.map(i => [i.name, i])).values());
    return unique.map(i => ({label: i.distributor_name, value: i.name}));
  };

  // const distributorList = disTransformList(distributorData?.message?.data);
  // const storeTypeList = transformList(typeData?.message?.data);
  // const storeCategoryList = transformList(categoryData?.message?.data);
  // const beatList = transformList(beatData?.message?.data);

  useEffect(() => {
    if (values.store_type === '') return;
    setFieldValue('store_category', '');
    setStoreCategoryListData([]);
  }, [values.store_type]);

  useEffect(() => {
    if (locationData?.message?.raw) {
      setFieldValue('address', locationData?.message?.raw?.display_name || '');
      setFieldValue(
        'pin_code',
        locationData?.message?.raw?.address?.postcode || '',
      );

      // setFieldValue('county', locationData?.message?.county || '');
      setFieldValue('zone', locationData?.message?.zone || '');
      setFieldValue('state', locationData?.message?.state || '');

      setListConfig(prev => ({
        ...prev,
        state: {page: 1, search: locationData?.message?.state}, // reset state pagination & search
        zone: {page: 1, search: locationData?.message?.zone}, // also reset city (because state depends on zone)
      }));

      const cities = locationData?.message?.cities ?? [];
      const singleCity = locationData?.message?.city ?? null;

      // 🏙 CITY HANDLING
      if (cities.length > 1) {
        // Multiple cities → dropdown
        const cityOptions = cities.map(city => ({
          label: city,
          value: city,
        }));

        setCityListData(cityOptions);
        setUseCityDropdown(true);
        setIsNewCity(false);
        setFieldValue('city', '');
      } else if (cities.length === 1 || singleCity) {
        // Single city → text input
        const cityName = cities[0] || singleCity || '';

        setUseCityDropdown(false);
        setIsNewCity(false);
        setCityListData([]);
        setFieldValue('city', cityName);
      } else {
        // ❗ No city found at all
        setUseCityDropdown(false);
        setIsNewCity(true);
        setCityListData([]);
        setFieldValue('city', '');
      }
    }
  }, [locationData]);

  useEffect(() => {
    if (stateData?.message?.data) {
      const newData = transformList(stateData.message.data);

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

  // useEffect(() => {
  //   if (cityData?.message?.data) {
  //     const newData = transformList(cityData.message.data);
  //     setCityListData(prev => {
  //       let merged = [];
  //       if (listConfig.city.search !== '' && listConfig.city.page === 1) {
  //         merged = newData;
  //       } else {
  //         merged = [...prev, ...newData];
  //       }
  //       return uniqueByValue(merged);
  //     });
  //   }
  // }, [cityData]);

  useEffect(() => {
    if (zoneData?.message?.data) {
      const newData = transformList(zoneData.message.data);
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

  useEffect(() => {
    if (distributorData?.message?.data) {
      const newData = disTransformList(distributorData.message.data);
      setDistributorListData(prev => {
        let merged = [];
        if (
          listConfig.distributor.search !== '' &&
          listConfig.distributor.page === 1
        ) {
          merged = newData;
        } else {
          merged = [...prev, ...newData];
        }
        return uniqueByValue(merged);
      });
    }
  }, [distributorData]);

  useEffect(() => {
    if (typeData?.message?.data) {
      const newData = transformList(typeData.message.data);
      setStoreTypeListData(prev => {
        let merged = [];
        if (listConfig.type.search !== '' && listConfig.type.page === 1) {
          merged = newData;
        } else {
          merged = [...prev, ...newData];
        }
        return uniqueByValue(merged);
      });
    }
  }, [typeData]);

  useEffect(() => {
    if (categoryData?.message?.data) {
      const newData = transformList(categoryData.message.data);

      setStoreCategoryListData(prev => {
        let merged = [];
        if (
          listConfig.category.search !== '' &&
          listConfig.category.page === 1
        ) {
          merged = newData;
        } else {
          merged = [...prev, ...newData];
        }
        return uniqueByValue(merged);
      });
    }
  }, [categoryData]);

  useEffect(() => {
    if (beatData?.message?.data) {
      const newData = transformList(beatData.message.data);
      setBeatListData(prev => {
        let merged = [];
        if (listConfig.beat.search !== '' && listConfig.beat.page === 1) {
          merged = newData;
        } else {
          merged = [...prev, ...newData];
        }
        return uniqueByValue(merged);
      });
    }
  }, [beatData]);

  const handleLoadMoreZones = () => {
    if (!zoneFetching) {
      const currentPage = zoneData?.message?.pagination?.page ?? 1;
      const totalPages = zoneData?.message?.pagination?.total_pages ?? 1;

      if (currentPage >= totalPages) return;

      setLoadingMoreZone(true);
      setListConfig(prev => ({
        ...prev,
        zone: {page: prev.zone.page + 1, search: prev.zone.search},
      }));
      setLoadingMoreZone(false);
    }
  };

  const handleLoadMoreStates = () => {
    if (!stateFetching) {
      const currentPage = stateData?.message?.pagination?.page ?? 1;
      const totalPages = stateData?.message?.pagination?.total_pages ?? 1;

      if (currentPage >= totalPages) return;

      setLoadingMoreState(true);
      setListConfig(prev => ({
        ...prev,
        state: {page: prev.state.page + 1, search: prev.state.search},
      }));
      setLoadingMoreState(false);
    }
  };

  const handleLoadMoreCity = () => {
    if (!cityFetching) {
      const currentPage = cityData?.message?.pagination?.page ?? 1;
      const totalPages = cityData?.message?.pagination?.total_pages ?? 1;

      if (currentPage >= totalPages) return;

      setLoadingMoreCity(true);
      setListConfig(prev => ({
        ...prev,
        city: {page: prev.city.page + 1, search: prev.city.search},
      }));
      setLoadingMoreCity(false);
    }
  };

  const handleLoadMoreDistributor = () => {
    if (!distributorFetching) {
      const currentPage = distributorData?.message?.pagination?.page ?? 1;
      const totalPages = distributorData?.message?.pagination?.total_pages ?? 1;

      if (currentPage >= totalPages) return;
      setLoadingMoreDistributor(true);
      setListConfig(prev => ({
        ...prev,
        distributor: {
          ...prev.distributor,
          page: prev.distributor.page + 1,
        },
      }));
      setLoadingMoreDistributor(false);
    }
  };

  const handleLoadMoreType = () => {
    if (!typeFetching) {
      const currentPage = typeData?.message?.pagination?.page ?? 1;
      const totalPages = typeData?.message?.pagination?.total_pages ?? 1;

      if (currentPage >= totalPages) return;
      setLoadingMoreType(true);
      setListConfig(prev => ({
        ...prev,
        type: {...prev.type, page: prev.type.page + 1},
      }));
      setLoadingMoreType(false);
    }
  };

  const handleLoadMoreCategory = () => {
    if (!categoryFetching) {
      const currentPage = categoryData?.message?.pagination?.page ?? 1;
      const totalPages = categoryData?.message?.pagination?.total_pages ?? 1;

      if (currentPage >= totalPages) return;
      setLoadingMoreCategory(true);
      setListConfig(prev => ({
        ...prev,
        category: {...prev.category, page: prev.category.page + 1},
      }));
      setLoadingMoreCategory(false);
    }
  };

  const handleLoadMoreBeat = () => {
    if (!beatFetching) {
      const currentPage = beatData?.message?.pagination?.page ?? 1;
      const totalPages = beatData?.message?.pagination?.total_pages ?? 1;

      if (currentPage >= totalPages) return;
      setLoadingMoreBeat(true);
      setListConfig(prev => ({
        ...prev,
        beat: {...prev.beat, page: prev.beat.page + 1},
      }));
      setLoadingMoreBeat(false);
    }
  };

  const handleSearchChange = (
    // type: 'zone' | 'state' | 'city',
    type: keyof typeof listConfig,
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
      <PageHeader title="Add Store" navigation={() => navigation.goBack()} />
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={(date: Date) => {
          if (activeField) {
            const formatted = moment(date).format('HH:mm:ss');
            setFieldValue(activeField, formatted);
          }
          setTimePickerVisible(false);
        }}
        onCancel={() => setTimePickerVisible(false)}
      />
      <AddStoreForm
        values={values}
        errors={errors}
        touched={touched}
        handleChange={handleChange}
        handleBlur={handleBlur}
        setFieldValue={setFieldValue}
        scrollY={scrollY}
        storeTypeList={storeTypeListData}
        storeCategoryList={storeCategoryListData}
        zoneList={zoneListData}
        stateList={stateListData}
        cityList={cityListData}
        distributorList={distributorListData}
        beatList={beatListData}
        weekOffList={weekOffList}
        onTimeSelect={field => {
          setActiveField(field);
          setTimePickerVisible(true);
        }}
        isNewCity={isNewCity}
        useCityDropdown={useCityDropdown}
        // pagination props
        onLoadMoreState={handleLoadMoreStates}
        loadingMoreState={loadingMoreState}
        onLoadMoreCity={handleLoadMoreCity}
        loadingMoreCity={loadingMoreCity}
        onLoadMoreZone={handleLoadMoreZones}
        loadingMoreZone={loadingMoreZone}
        // 🆕 add these
        onLoadMoreType={handleLoadMoreType}
        loadingMoreType={loadingMoreType}
        onLoadMoreCategory={handleLoadMoreCategory}
        loadingMoreCategory={loadingMoreCategory}
        onLoadMoreDistributor={handleLoadMoreDistributor}
        loadingMoreDistributor={loadingMoreDistributor}
        onLoadMoreBeat={handleLoadMoreBeat}
        loadingMoreBeat={loadingMoreBeat}
        // search props 👇
        zoneSearchText={listConfig.zone.search}
        setZoneSearchText={(text: string) => handleSearchChange('zone', text)}
        stateSearchText={listConfig.state.search}
        setStateSearchText={(text: string) => handleSearchChange('state', text)}
        citySearchText={listConfig.city.search}
        setCitySearchText={(text: string) => handleSearchChange('city', text)}
        // search props
        distributorSearchText={listConfig.distributor.search}
        setDistributorSearchText={(text: string) =>
          handleSearchChange('distributor', text)
        }
        typeSearchText={listConfig.type.search}
        setTypeSearchText={(text: string) => handleSearchChange('type', text)}
        categorySearchText={listConfig.category.search}
        setCategorySearchText={(text: string) =>
          handleSearchChange('category', text)
        }
        beatSearchText={listConfig.beat.search}
        setBeatSearchText={(text: string) => handleSearchChange('beat', text)}
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

export default AddStoreScreen;

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
