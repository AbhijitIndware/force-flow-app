/* eslint-disable react-native/no-inline-styles */
import {
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { flexCol } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import React, { useEffect, useMemo, useState } from 'react';
import { PromoterAppStackParamList } from '../../../types/Navigation';
import PageHeader from '../../../components/ui/PageHeader';
import { Size } from '../../../utils/fontSize';
import { Fonts } from '../../../constants';

import { CalendarCheck } from 'lucide-react-native';
import { useAppSelector } from '../../../store/hook';
import {
  useGetAvailableStoreQuery,
  usePromoterCheckinMutation,
} from '../../../features/base/promoter-base-api';
import { useFormik } from 'formik';
import Toast from 'react-native-toast-message';
import { ICheckInRequest } from '../../../types/baseType';
import { PromoterCheckinSchema } from '../../../types/schema';
import moment from 'moment';
import AddCheckInForm from '../../../components/Promoter/Checkin/CheckinForm';
import { Animated } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { getUserFacingError, getSafeServerMessage } from '../../../utils/errorMessage';
import { imageBaseUrl } from '../../../features/apiBaseUrl';
import { useIsTeamLeader } from '../../../utils/roles';
import { getCurrentLocation } from '../../../utils/utils';
import { AvailableStore } from '../../../types/baseType';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  PromoterAppStackParamList,
  'CheckingScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

// Initial values
const initial: ICheckInRequest = {
  store: '',
  image: {
    mime: '',
    data: '',
  },
  latitude: null,
  longitude: null,
  current_location: '',
  address: '',
};

const formatDistance = (metres?: number | null) =>
  metres == null
    ? ''
    : metres < 1000
      ? ` · ${Math.round(metres)} m`
      : ` · ${(metres / 1000).toFixed(1)} km`;

const toStoreOption = (row: AvailableStore) => ({
  label: `${row.store_name}${formatDistance(row.distance_m)}`,
  value: row.store_id,
  imageUrl: `${imageBaseUrl}${row.store_image}`,
});

const CheckingScreen = ({ navigation }: Props) => {
  // A Team Leader picks any store of their zone: their shift stores, then
  // the nearest ones to the phone, or a store found by search.
  const isTL = useIsTeamLeader();
  const [here, setHere] = useState<string | undefined>();
  const [locating, setLocating] = useState(isTL);
  const [storeSearch, setStoreSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pickedStore, setPickedStore] = useState<AvailableStore | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(storeSearch.trim()), 400);
    return () => clearTimeout(timer);
  }, [storeSearch]);

  const { data, isFetching } = useGetAvailableStoreQuery(
    isTL
      ? debouncedSearch
        ? { search: debouncedSearch }
        : { current_location: here }
      : undefined,
    { skip: locating },
  );
  // Only the first load blocks the screen; a search refetch keeps the form.
  const isDataLoading = locating || (isFetching && !data);
  const [promoterCheckin, { isLoading }] = usePromoterCheckinMutation();

  const formattedStartTime = data?.message?.data?.shift_assignment?.start_time
    ? moment(
      data?.message?.data?.shift_assignment?.start_time,
      'HH:mm:ss',
    ).format('hh:mm A')
    : 'N/A';

  const formattedEndTime = data?.message?.data?.shift_assignment?.end_time
    ? moment(
      data?.message?.data?.shift_assignment?.end_time,
      'HH:mm:ss',
    ).format('hh:mm A')
    : 'N/A';

  const formattedStartDate = data?.message?.data?.shift_assignment?.start_date
    ? moment(data?.message?.data?.shift_assignment?.start_date).format(
      'DD MMM YYYY',
    )
    : 'N/A';

  const formattedEndDate = data?.message?.data?.shift_assignment?.end_date
    ? moment(data?.message?.data?.shift_assignment?.end_date).format(
      'DD MMM YYYY',
    )
    : 'N/A';

  const availableStores = useMemo(
    () => data?.message?.data?.available_stores ?? [],
    [data],
  );
  // Keep the chosen store in the list after the search text changes.
  const storeList = useMemo(() => {
    const rows =
      pickedStore &&
      !availableStores.some(s => s.store_id === pickedStore.store_id)
        ? [pickedStore, ...availableStores]
        : availableStores;
    return rows.map(toStoreOption);
  }, [availableStores, pickedStore]);

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
    validationSchema: PromoterCheckinSchema,
    onSubmit: async (formValues, actions) => {
      try {
        const payload: ICheckInRequest = {
          store: formValues.store,
          image: formValues.image,
          latitude: formValues.latitude,
          longitude: formValues.longitude,
          current_location: `${formValues.latitude},${formValues.longitude}`,
          address: formValues.address,
        };
        const res = await promoterCheckin(payload).unwrap();

        if (res?.message?.success === true) {
          Toast.show({
            type: 'success',
            text1: getSafeServerMessage(res.message.message) ?? 'Success',
            position: 'top',
          });
          actions.resetForm();
          navigation.navigate('Home');
        } else {
          Toast.show({
            type: 'error',
            text1: getSafeServerMessage(res.message.message) ?? 'Something went wrong',
            position: 'top',
          });
        }
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: getUserFacingError(error, 'Internal Server Error'),
          text2: 'Please try again later.',
          position: 'top',
        });
      }
    },
  });

  useEffect(() => {
    if (!isTL) return;
    getCurrentLocation()
      .then(location => {
        setHere(location);
        const [lat, lng] = location.split(',').map(Number);
        setFieldValue('latitude', lat);
        setFieldValue('longitude', lng);
      })
      // Without a location the server still lists the shift stores, and
      // search works.
      .catch(() => {})
      .finally(() => setLocating(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTL]);

  const onSelectStore = (field: string, value: any) => {
    if (field === 'store') {
      setPickedStore(
        availableStores.find(s => s.store_id === value) ?? pickedStore,
      );
    }
    setFieldValue(field, value);
  };

  return (
    <SafeAreaView
      style={[
        flexCol,
        {
          flex: 1,
          backgroundColor: Colors.lightBg,
        },
      ]}>
      <PageHeader title="Check-in" navigation={() => navigation.goBack()} />
      {isDataLoading ? (
        <LoadingScreen />
      ) : (
        <ScrollView
          contentContainerStyle={styles.container}
          nestedScrollEnabled={true}>
          <AddCheckInForm
            values={values}
            errors={errors}
            touched={touched}
            handleChange={handleChange}
            handleBlur={handleBlur}
            setFieldValue={onSelectStore}
            scrollY={new Animated.Value(0)}
            storeList={storeList}
            storeSearch={isTL ? storeSearch : undefined}
            setStoreSearch={isTL ? setStoreSearch : undefined}
            shift={{
              startTime: formattedStartTime,
              endTime: formattedEndTime,
              startDate: formattedStartDate,
              endDate: formattedEndDate,
              shiftType: data?.message?.data?.shift_assignment?.shift_type,
            }}
          />

          <TouchableOpacity
            style={styles.checkinButton}
            disabled={isLoading}
            onPress={() => handleSubmit()}>
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <CalendarCheck strokeWidth={1.4} color={Colors.white} />
            )}
            <Text style={styles.checkinButtonText}>
              {isLoading ? 'Checking in…' : 'Check-in'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default CheckingScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.transparent,
    position: 'relative',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  checkinButton: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 18,
    gap: 5,
    zIndex: 1,
    width: width * 0.9,
    marginTop: 20,
  },
  checkinButtonText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.white,
    lineHeight: 22,
  },
});
