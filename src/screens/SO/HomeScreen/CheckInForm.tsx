import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  View,
  Modal,
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
import LoadingScreen from '../../../components/ui/LoadingScreen';
import moment from 'moment';

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
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);

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

        const location = await ensureCurrentLocation();
        if (!location) {
          setLoading(false);
          return;
        }

        const payload = {
          store: formValues.store,
          image: formValues.image,
          current_location: location,
          bypass_store_category: formValues.bypass_store_category,
        };
        console.log('🚀 ~ CheckInForm ~ payload:', payload);

        // 🛑 DO NOT call API yet
        setPendingPayload(payload);
        setConfirmModalVisible(true);
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: '❌ Unable to prepare check-in',
        });
      } finally {
        setLoading(false);
      }
    },
  });

  const handleConfirmCheckIn = async () => {
    if (!pendingPayload) return;

    try {
      setLoading(true);

      const res = await addCheckIn(pendingPayload).unwrap();

      if (res?.message?.success === true) {
        Toast.show({
          type: 'success',
          text1: `✅ ${res.message.message}`,
          position: 'top',
        });

        setConfirmModalVisible(false);
        setPendingPayload(null);
        setLocationVerified(false);
        navigation.navigate('Home');
      } else {
        Toast.show({
          type: 'error',
          text1: `❌ ${res.message.message || 'Something went wrong'}`,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: `❌ ${error?.data?.message?.message || 'Internal Server Error'}`,
      });
    } finally {
      setLoading(false);
      setConfirmModalVisible(false);
    }
  };

  const storeDailyList = (storeData?.message?.stores ?? []).map(i => ({
    label: i.store_name,
    value: i.store,
  }));

  const ensureCurrentLocation = async (): Promise<string | null> => {
    if (values?.current_location) {
      setFieldValue('current_location', values.current_location);
      return values.current_location;
    }

    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      const location = await getCurrentLocation();
      setFieldValue('current_location', location);
      return location;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '❌ Unable to fetch location',
        text2: 'Please enable location and try again',
      });
      return null;
    }
  };

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

      // 🔥 Ensure location exists
      const location = await ensureCurrentLocation();
      setFieldValue('current_location', location);
      if (!location) return;

      const res = await verifyLocation({
        store: selectedStore as string,
        current_location: location,
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
    let hasPermission = await requestLocationPermission();

    // 🔁 Ask again if rejected
    if (!hasPermission) {
      Toast.show({
        type: 'info',
        text1: '📍 Location permission is required',
        text2: 'Please allow location access to continue',
      });

      hasPermission = await requestLocationPermission();
    }

    if (!hasPermission) {
      throw new Error('Location permission not granted');
    }

    await handleSetValue();
  };

  const handleSetValue = async () => {
    const location = await getCurrentLocation();
    setFieldValue('current_location', location);
  };

  const pjpDate = pjpInitializedData?.message?.data?.date;

  const formattedDate = pjpDate
    ? moment(pjpDate).format('dddd, DD MMM YYYY')
    : 'Today';

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
      {isFetching ? (
        <LoadingScreen />
      ) : (
        <>
          {!isFetching && storeDailyList.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 24,
                backgroundColor: Colors.lightBg,
              }}>
              {/* Title */}
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: 6,
                  textAlign: 'center',
                }}>
                No PJP Available
              </Text>

              {/* Date */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#6B7280',
                  marginBottom: 14,
                  textAlign: 'center',
                }}>
                {formattedDate}
              </Text>

              {/* Description */}
              <Text
                style={{
                  fontSize: 14,
                  color: '#4B5563',
                  marginBottom: 26,
                  textAlign: 'center',
                  lineHeight: 20,
                }}>
                You don’t have a Daily PJP for this date.
                {'\n'}Please add one to continue check-in.
              </Text>

              {/* CTA */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={{
                  backgroundColor: Colors.darkButton,
                  paddingVertical: 15,
                  paddingHorizontal: 36,
                  borderRadius: 16,
                  elevation: 3,
                }}
                onPress={() => navigation.navigate('AddPjpScreen')}>
                <Text
                  style={{
                    color: Colors.white,
                    fontWeight: '700',
                    fontSize: 15,
                    letterSpacing: 0.3,
                  }}>
                  Add PJP
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
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

              <Modal
                visible={confirmModalVisible}
                transparent
                animationType="fade">
                <View style={modalStyles.overlay}>
                  <View style={modalStyles.container}>
                    {/* Header */}
                    <Text style={modalStyles.title}>Confirm Check-In</Text>
                    <Text style={modalStyles.subtitle}>
                      Please review the details before proceeding
                    </Text>

                    {/* Divider */}
                    <View style={modalStyles.divider} />

                    {/* Store */}
                    <View style={modalStyles.row}>
                      <Text style={modalStyles.label}>Store</Text>
                      <Text style={modalStyles.value}>
                        {pendingPayload?.store}
                      </Text>
                    </View>

                    {/* Location */}
                    <View style={modalStyles.row}>
                      <Text style={modalStyles.label}>Location</Text>
                      <Text style={modalStyles.locationText}>
                        {pendingPayload?.current_location}
                      </Text>
                    </View>

                    {/* Divider */}
                    <View style={modalStyles.divider} />

                    {/* Actions */}
                    <View style={modalStyles.actions}>
                      <TouchableOpacity
                        style={modalStyles.cancelBtn}
                        onPress={() => {
                          setConfirmModalVisible(false);
                          setPendingPayload(null);
                          setLocationVerified(false);
                        }}>
                        <Text style={modalStyles.cancelText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={modalStyles.confirmBtn}
                        onPress={handleConfirmCheckIn}
                        disabled={loading}>
                        {loading ? (
                          <ActivityIndicator color={Colors.white} />
                        ) : (
                          <Text style={modalStyles.confirmText}>Confirm</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

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
            </>
          )}
        </>
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
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },
  row: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  locationText: {
    fontSize: 14,
    color: '#374151',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: '#374151',
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.darkButton,
    alignItems: 'center',
  },
  confirmText: {
    color: Colors.white,
    fontWeight: '700',
  },
});
