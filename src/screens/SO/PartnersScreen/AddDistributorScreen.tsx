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
import {useMemo, useRef, useState} from 'react';
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
  const {data: cityData} = useGetCityQuery();
  const {data: stateData} = useGetStateQuery();
  const {data: zoneData} = useGetZoneQuery();
  const {data: employeeData} = useGetEmployeeQuery({name: ''});
  const {data: designationData} = useGetDesignationQuery();
  const {data: distributorGroupData, error} = useGetDistributorGroupQuery();
  const scrollY = useRef(new Animated.Value(0)).current;

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

  const distributorGroupList = transformToDropdownList(
    distributorGroupData?.message?.data,
  );
  const employeeList = transformEmployeeList(employeeData?.message?.data);
  const zoneList = useMemo(
    () => transformToDropdownList(zoneData?.message?.data),
    [zoneData],
  );
  const stateList = useMemo(() => {
    return transformToDropdownList(
      stateData?.message?.data?.filter(state => state.zone === values.zone),
    );
  }, [stateData, values.zone]);
  const cityList = useMemo(() => {
    return transformToDropdownList(
      cityData?.message?.data?.filter(city => city.state === values.state),
    );
  }, [cityData, values.state]);
  const designationList = transformToDropdownList(
    designationData?.message?.data,
  );

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
        employeeList={employeeList}
        zoneList={zoneList}
        stateList={stateList}
        cityList={cityList}
        designationList={designationList}
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
