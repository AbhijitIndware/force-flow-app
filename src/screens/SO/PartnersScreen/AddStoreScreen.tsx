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
import {useMemo, useRef, useState} from 'react';
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
  useGetStateQuery,
  useGetStoreCategoryQuery,
  useGetStoreTypeQuery,
  useGetZoneQuery,
} from '../../../features/dropdown/dropdown-api';
import {useAddStoreMutation} from '../../../features/base/base-api';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {useAppSelector} from '../../../store/hook';
import {Animated} from 'react-native';
import AddStoreForm from '../../../components/SO/Partner/Store/AddStoreForm';

import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
const {width} = Dimensions.get('window');
const initial = {
  store_name: '',
  store_type: '',
  store_category: '',
  zone: '',
  state: '',
  city: '',
  map_location: '',
  start_time: '',
  end_time: '',
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

  const [addStore] = useAddStoreMutation();
  const {data: cityData} = useGetCityQuery();
  const {data: stateData} = useGetStateQuery();
  const {data: zoneData} = useGetZoneQuery();
  const {data: distributorData} = useGetDistributorQuery();
  const {data: typeData} = useGetStoreTypeQuery();
  const {data: categoryData} = useGetStoreCategoryQuery();
  const {data: beatData} = useGetBeatQuery();

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
        let value = {
          ...formValues,
          created_by_employee: employee.id, // Replace with actual user ID
          created_by_employee_name: user?.full_name, // Replace with actual user name
          created_by_employee_designation: employee.designation, // Replace with actual designation
        };

        const payload = {data: value};
        console.log('🚀 ~ onSubmit: ~ payload:', payload);
        const res = await addStore(payload).unwrap();
        console.log('Store API Response:', res);

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
        console.error('Store API Error:', error);
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
  const transformList = (arr: {name: string}[] = []) =>
    arr.map(i => ({label: i.name, value: i.name}));
  const disTransformList = (
    arr: {name: string; distributor_name: string}[] = [],
  ) => arr.map(i => ({label: i.distributor_name, value: i.name}));

  const zoneList = useMemo(
    () => transformList(zoneData?.message?.data),
    [zoneData],
  );
  const stateList = useMemo(() => {
    return transformList(
      stateData?.message?.data?.filter(state => state.zone === values.zone),
    );
  }, [stateData, values.zone]);
  const cityList = useMemo(() => {
    return transformList(
      cityData?.message?.data?.filter(city => city.state === values.state),
    );
  }, [cityData, values.state]);
  const distributorList = disTransformList(distributorData?.message?.data);
  const storeTypeList = transformList(typeData?.message?.data);
  const storeCategoryList = transformList(categoryData?.message?.data);
  const beatList = transformList(beatData?.message?.data);

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
        storeTypeList={storeTypeList}
        storeCategoryList={storeCategoryList}
        zoneList={zoneList}
        stateList={stateList}
        cityList={cityList}
        distributorList={distributorList}
        beatList={beatList}
        weekOffList={weekOffList}
        onTimeSelect={field => {
          setActiveField(field);
          setTimePickerVisible(true);
        }}
      />
      <View
        style={{
          paddingHorizontal: 20,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor:Colors.bgColor,
          width:'100%',
          height:80,
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
