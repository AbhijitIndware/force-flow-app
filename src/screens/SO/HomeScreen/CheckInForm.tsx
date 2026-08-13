import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors } from '../../../utils/colors';
import { SoAppStackParamList } from '../../../types/Navigation';
import { flexCol } from '../../../utils/styles';
import {
  getCurrentLocation,
  getStoreLabel,
  requestLocationPermission,
  windowHeight,
  windowWidth,
} from '../../../utils/utils';
import { useFormik } from 'formik';
import { checkInSchema } from '../../../types/schema';
import { useAppDispatch, useAppSelector } from '../../../store/hook';
import {
  setSelectedStore,
  useAddCheckInMutation,
  useLocationVerificationMutation,
} from '../../../features/base/base-api';

import PageHeader from '../../../components/ui/PageHeader';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import ReusableDropdown from '../../../components/ui-lib/resusable-dropdown';
import AddCheckInForm from '../../../components/SO/Home/check-in-form';
import { imageBaseUrl } from '../../../features/apiBaseUrl';

// ─── Types ────────────────────────────────────────────────────────────────────

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'CheckInForm'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_VALUES = {
  store: '',
  image: { mime: '', data: '' },
  current_location: '',
  bypass_store_category: 'True',
  store_image: { mime: '', data: '' },
};

// ─── Component ────────────────────────────────────────────────────────────────

const CheckInForm = ({ navigation }: Props) => {
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);

  const scrollY = useRef(new Animated.Value(0)).current;
  const dispatch = useAppDispatch();

  // ── Selectors ───────────────────────────────────────────────────────────────
  const pjpInitializedData = useAppSelector(
    s => s.persistedReducer.pjpSlice.pjpInitializedData,
  );
  const selectedStore = useAppSelector(
    s => s.persistedReducer.pjpSlice.selectedStore,
  );
  const pjpWorkflowData = useAppSelector(
    s => s.persistedReducer.pjpSlice.pjpWorkflowData,
  );

  // ── Derived data ────────────────────────────────────────────────────────────
  const storeDailyList = (pjpWorkflowData?.pjp_data?.stores ?? [])
    .filter(s => s.status !== 'Completed')
    .map(s => ({
      label: getStoreLabel(s),
      value: s.store,
      disabled: s.status === 'Visited',
      imageUrl: s.store_image
        ? `${imageBaseUrl}${s.store_image}`
        : undefined,
    }));

  const storesWithoutImage = new Set(
    (pjpWorkflowData?.pjp_data?.stores ?? [])
      .filter(s => !s.store_image && s.status !== 'Completed')
      .map(s => s.store),
  );

  const pjpDate = pjpInitializedData?.message?.data?.date;
  const formattedDate = pjpDate
    ? moment(pjpDate).format('dddd, DD MMM YYYY')
    : 'Today';

  // ── Mutations ───────────────────────────────────────────────────────────────
  const [verifyLocation] =
    useLocationVerificationMutation();
  const [addCheckIn] = useAddCheckInMutation();

  // ── Formik ──────────────────────────────────────────────────────────────────
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = useFormik({
    initialValues: INITIAL_VALUES,
    validationSchema: checkInSchema,
    onSubmit: async formValues => {
      if (
        storesWithoutImage.has(formValues.store) &&
        !formValues.store_image?.data
      ) {
        Toast.show({
          type: 'error',
          text1: '❌ Please capture a store image before check-in',
        });
        return;
      }

      try {
        setLoading(true);

        setPendingPayload({
          store: formValues.store,
          image: formValues.image,
          current_location: formValues.current_location,
          bypass_store_category: formValues.bypass_store_category,
          ...(storesWithoutImage.has(formValues.store) && formValues.store_image?.data
            ? { store_image: formValues.store_image }
            : {}),
        });

        setConfirmModalVisible(true);
      } catch {
        Toast.show({ type: 'error', text1: '❌ Unable to prepare check-in' });
      } finally {
        setLoading(false);
      }
    },
  });

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const handleVerifyLocation = async () => {
    if (!selectedStore) {
      Toast.show({
        type: 'error',
        text1: '❌ Please select a store before verifying location',
      });
      return;
    }
    setLocationLoading(true)
    try {
      const location = await getCurrentLocation();
      setFieldValue('current_location', location);
      if (!location) return;

      const res = await verifyLocation({
        store: selectedStore,
        current_location: location,
        validate_location: true,
      }).unwrap();

      const valid = res?.message?.data?.location_validation?.valid;
      if (valid) {
        Toast.show({ type: 'success', text1: '✅ Location verified' });
        setLocationVerified(true);
      } else {
        Toast.show({
          type: 'error',
          text1: '❌ Location verification failed',
          text2:
            res?.message?.data?.location_validation?.message ??
            'Please try again later.',
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: '❌ Verification error',
        text2: err?.data?.message?.message ?? 'Please try again later.',
      });
    } finally {
      setLocationLoading(false)
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!pendingPayload) return;

    try {
      setLoading(true);
      const res = await addCheckIn(pendingPayload).unwrap();

      if (res?.message?.success) {
        Toast.show({
          type: 'success',
          text1: `✅ ${res.message.message}`,
          position: 'top',
        });
        setConfirmModalVisible(false);
        setPendingPayload(null);
        setLocationVerified(false);
        navigation.replace('AddSaleScreen');
      } else {
        Toast.show({
          type: 'error',
          text1: `❌ ${res.message.message || 'Something went wrong'}`,
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: `❌ ${err?.data?.message?.message || 'Internal Server Error'}`,
      });
    } finally {
      setLoading(false);
      setConfirmModalVisible(false);
    }
  };

  const dismissConfirmModal = () => {
    setConfirmModalVisible(false);
    setPendingPayload(null);
    setLocationVerified(false);
  };

  useEffect(() => {
    if (selectedStore) setFieldValue('store', selectedStore);
  }, [selectedStore]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[flexCol, styles.screen]}>
      <PageHeader title="Check In" navigation={() => navigation.goBack()} />

      <ScrollView>
        {!pjpWorkflowData ? (
          <LoadingScreen />
        ) : storeDailyList.length === 0 ? (
          <NoPjpState
            formattedDate={formattedDate}
            onAddPjp={() => navigation.navigate('AddPjpScreen')}
          />
        ) : (
          <>
            {/* Store selector */}
            <View style={styles.selectorPad}>
              <ReusableDropdown
                label="Store"
                field="value"
                value={values.store}
                data={storeDailyList}
                error={touched.store && errors.store}
                disabled={locationVerified}
                onChange={(val: string) => {
                  dispatch(setSelectedStore(val));
                  setFieldValue('store', val);
                }}
              />
            </View>

            <View style={{ flex: 1, minHeight: windowHeight * 0.8 }}>

              {/* Confirm check-in modal */}
              <ConfirmCheckInModal
                visible={confirmModalVisible}
                loading={loading}
                payload={pendingPayload}
                onCancel={dismissConfirmModal}
                onConfirm={handleConfirmCheckIn}
              />

              {/* Verify location OR check-in form + submit */}
              {!locationVerified ? (
                <TouchableOpacity
                  style={[styles.submitBtn, locationLoading && styles.disabledBtn]}
                  onPress={handleVerifyLocation}
                  disabled={locationLoading}>
                  {locationLoading ? (
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
                    needsStoreImage={storesWithoutImage.has(values.store)}
                  />
                  <View style={styles.submitBar}>
                    <TouchableOpacity
                      style={[styles.submitBtn, loading && styles.disabledBtn]}
                      onPress={() => handleSubmit()}
                      disabled={loading}>
                      {loading ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                      ) : (
                        <Text style={styles.submitText}>Check In</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CheckInForm;

// ─── Sub-components ───────────────────────────────────────────────────────────

const NoPjpState = ({
  formattedDate,
  onAddPjp,
}: {
  formattedDate: string;
  onAddPjp: () => void;
}) => (
  <View style={emptyStyles.container}>
    <Text style={emptyStyles.title}>No PJP Available</Text>
    <Text style={emptyStyles.date}>{formattedDate}</Text>
    <Text style={emptyStyles.description}>
      You don't have a Daily PJP for this date.{'\n'}Please add one to continue
      check-in.
    </Text>
    <TouchableOpacity
      activeOpacity={0.85}
      style={emptyStyles.cta}
      onPress={onAddPjp}>
      <Text style={emptyStyles.ctaText}>Add PJP</Text>
    </TouchableOpacity>
  </View>
);

const ConfirmCheckInModal = ({
  visible,
  loading,
  payload,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  loading: boolean;
  payload: any;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={modalStyles.overlay}>
      <View style={modalStyles.container}>
        <Text style={modalStyles.title}>Confirm Check-In</Text>
        <Text style={modalStyles.subtitle}>
          Please review the details before proceeding
        </Text>

        <View style={modalStyles.divider} />

        <View style={modalStyles.row}>
          <Text style={modalStyles.label}>Store</Text>
          <Text style={modalStyles.value}>{payload?.store}</Text>
        </View>
        <View style={modalStyles.row}>
          <Text style={modalStyles.label}>Location</Text>
          <Text style={modalStyles.locationText}>
            {payload?.current_location}
          </Text>
        </View>

        <View style={modalStyles.divider} />

        <View style={modalStyles.actions}>
          <TouchableOpacity style={modalStyles.cancelBtn} onPress={onCancel}>
            <Text style={modalStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={modalStyles.confirmBtn}
            onPress={onConfirm}
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
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.lightBg,
  },
  selectorPad: {
    padding: 20,
    paddingBottom: 0,
  },
  submitBar: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bgColor,
    width: '100%',
    height: 80,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
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
  disabledBtn: {
    opacity: 0.7,
  },
  submitText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: Colors.lightBg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 14,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 26,
    textAlign: 'center',
    lineHeight: 20,
  },
  cta: {
    backgroundColor: Colors.darkButton,
    paddingVertical: 15,
    paddingHorizontal: 36,
    borderRadius: 16,
    elevation: 3,
  },
  ctaText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
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
    shadowOffset: { width: 0, height: 6 },
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
    backgroundColor: '#16A34A',
    alignItems: 'center',
  },
  confirmText: {
    color: Colors.white,
    fontWeight: '700',
  },
});
