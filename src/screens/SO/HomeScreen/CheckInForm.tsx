import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {Colors} from '../../../utils/colors';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import {useFormik} from 'formik';
import {
  setSelectedStore,
  useAddCheckInMutation,
  useLocationVerificationMutation,
} from '../../../features/base/base-api';
import {useLazyGetDailyStoreQuery} from '../../../features/dropdown/dropdown-api';
import {checkInSchema} from '../../../types/schema';
import Toast from 'react-native-toast-message';
import {flexCol} from '../../../utils/styles';
import PageHeader from '../../../components/ui/PageHeader';
import AddCheckInForm from '../../../components/SO/Home/check-in-form';
import {useAppDispatch, useAppSelector} from '../../../store/hook';
import {
  getCurrentLocation,
  requestLocationPermission,
  windowWidth,
} from '../../../utils/utils';
import ReusableDropdown from '../../../components/ui-lib/resusable-dropdown';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'CheckInForm'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

// Initial values
const initial = {
  store: '',
  image: {
    mime: '',
    data: '',
  },
  current_location: '',
  bypass_store_category: 'True',
};

const CheckInForm = ({navigation}: Props) => {
  const [loading, setLoading] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const dispatch = useAppDispatch();

  const pjpInitializedData = useAppSelector(
    state => state?.persistedReducer?.pjpSlice?.pjpInitializedData,
  );
  const user = useAppSelector(
    state => state?.persistedReducer?.authSlice?.user,
  );
  const selectedStore = useAppSelector(
    state => state?.persistedReducer?.pjpSlice?.selectedStore,
  );

  const [verifyLocation, {isLoading: verifying}] =
    useLocationVerificationMutation();
  const [addCheckIn] = useAddCheckInMutation();
  const [triggerStoreFetch, {data: storeData, isFetching, error}] =
    useLazyGetDailyStoreQuery();

  const onSelect = (field: string, val: string) => {
    dispatch(setSelectedStore(val));
    setFieldValue(field, val);
  };

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
    validationSchema: checkInSchema,
    onSubmit: async (formValues, actions) => {
      try {
        setLoading(true);

        let value = {
          store: formValues.store,
          image: formValues.image,
          current_location: values.current_location,
          bypass_store_category: formValues.bypass_store_category,
        };

        const res = await addCheckIn(value).unwrap();
        if (res?.message?.success === true) {
          Toast.show({
            type: 'success',
            text1: `✅ ${res.message.message}`,
            position: 'top',
          });
          actions.resetForm();
          handleVerifyLocation({showToast: false});
          navigation.navigate('Home');
        } else {
          Toast.show({
            type: 'error',
            text1: `❌ ${res.message.message || 'Something went wrong'}`,
            position: 'top',
          });
        }
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: `❌ ${
            error?.data?.message?.message || 'Internal Server Error'
          }`,
          text2: 'Please try again later.',
          position: 'top',
        });
      } finally {
        setLoading(false);
      }
    },
  });

  const storeDailyList = (storeData?.message?.stores ?? []).map(i => ({
    label: i.store_name,
    value: i.store,
  }));

  const handleVerifyLocation = async ({showToast}: {showToast: boolean}) => {
    try {
      if (!selectedStore) {
        if (showToast) {
          Toast.show({
            type: 'error',
            text1: '❌ Please select a store before verifying location',
          });
        }
        return;
      }

      const res = await verifyLocation({
        store: selectedStore as string,
        current_location: values?.current_location,
        validate_location: false,
      }).unwrap();

      if (res?.message?.data?.location_validation?.valid) {
        if (showToast) {
          Toast.show({
            type: 'success',
            text1: '✅ Location verified',
          });
        }
        setLocationVerified(true);
      } else {
        if (showToast) {
          Toast.show({
            type: 'error',
            text1: '❌ Location verification failed',
          });
        }
      }
    } catch (err: any) {
      if (showToast) {
        Toast.show({
          type: 'error',
          text1: '❌ Verification error',
          text2: err?.data?.message?.message ?? 'Please try again later.',
        });
      }
    }
  };

  const handleCallLocationPermission = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      throw new Error('Location permission not granted');
    } else {
      handleSetValue();
    }
  };

  const handleSetValue = async () => {
    const location = await getCurrentLocation();
    setFieldValue('current_location', location);
  };

  useEffect(() => {
    handleCallLocationPermission();
    if (user?.email && pjpInitializedData?.message?.data?.date) {
      triggerStoreFetch({
        user: user.email,
        date: pjpInitializedData?.message?.data?.date,
      });
    }
  }, [user?.email, pjpInitializedData?.message?.data?.date]);

  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader title="Check In" navigation={() => navigation.goBack()} />

      <View style={{padding: 20}}>
        <ReusableDropdown
          label="Store"
          field="value"
          value={values.store}
          data={storeDailyList}
          error={touched.store && errors.store}
          onChange={(val: string) => onSelect('store', val)}
        />
      </View>

      {!locationVerified ? (
        <TouchableOpacity
          style={[styles.submitBtn, verifying && {opacity: 0.7}]}
          onPress={() => {
            handleVerifyLocation({showToast: true});
          }}
          disabled={verifying}>
          {verifying ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.submitText}>Verify Location</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View>
          <AddCheckInForm
            values={values}
            errors={errors}
            touched={touched}
            handleChange={handleChange}
            handleBlur={handleBlur}
            setFieldValue={setFieldValue}
            scrollY={scrollY}
            storeList={storeDailyList}
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
                <Text style={styles.submitText}>CheckIn</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CheckInForm;

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
