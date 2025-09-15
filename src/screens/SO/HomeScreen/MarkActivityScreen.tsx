import {
  ActivityIndicator,
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import MarkActivityForm from '../../../components/SO/Home/mark-activity-form';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import {Colors} from '../../../utils/colors';
import {
  useGetActivityForPjpQuery,
  useGetEmployeeQuery,
} from '../../../features/dropdown/dropdown-api';
import {
  useLocationVerificationMutation,
  useMarkActivityMutation,
} from '../../../features/base/base-api';
import {useFormik} from 'formik';
import Toast from 'react-native-toast-message';
import PageHeader from '../../../components/ui/PageHeader';
import {flexCol} from '../../../utils/styles';
import {dailyPjpSchema, markActivitySchema} from '../../../types/schema';
import {useAppSelector} from '../../../store/hook';
import {getCurrentLocation, windowWidth} from '../../../utils/utils';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'MarkActivityScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};
let initial = {
  store: '',
  activity_type: [{activity_type: ''}],
};

const MarkActivityScreen = ({navigation}: Props) => {
  const [loading, setLoading] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const {data: activityForPjp} = useGetActivityForPjpQuery();
  const [markActivity] = useMarkActivityMutation();
  const selectedStore = useAppSelector(
    state => state?.persistedReducer?.pjpSlice?.selectedStore,
  );

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
    validationSchema: markActivitySchema,
    onSubmit: async (formValues, actions) => {
      try {
        setLoading(true);
        const res = await markActivity(formValues).unwrap();

        if (res?.message?.success === true) {
          Toast.show({
            type: 'success',
            text1: `✅ ${res.message.message}`,
            position: 'top',
          });
          actions.resetForm();
          navigation.navigate('Home');
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

  const activityList = transformToDropdownList(activityForPjp?.message?.data);

  useEffect(() => {
    if (selectedStore) {
      setFieldValue('store', selectedStore);
    }
  }, [selectedStore]);

  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader
        title="Mark Activity"
        navigation={() => navigation.goBack()}
      />
      <MarkActivityForm
        {...{values, errors, touched, handleChange, handleBlur, setFieldValue}}
        scrollY={scrollY}
        activityList={activityList}
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

export default MarkActivityScreen;

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
    left: 20,
    gap: 5,
    zIndex: 1,
    width: windowWidth * 0.9,
  },
  submitText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
