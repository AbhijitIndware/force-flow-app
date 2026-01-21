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
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import React, {useCallback, useState} from 'react';
import {PromoterAppStackParamList} from '../../../types/Navigation';
import PageHeader from '../../../components/ui/PageHeader';
import {Size} from '../../../utils/fontSize';
import {Fonts} from '../../../constants';

import {CalendarCheck, Clock2, Upload} from 'lucide-react-native';
import {useAppSelector} from '../../../store/hook';
import {
  useGetAvailableStoreQuery,
  usePromoterCheckinMutation,
} from '../../../features/base/promoter-base-api';
import {useFormik} from 'formik';
import Toast from 'react-native-toast-message';
import {ICheckInRequest} from '../../../types/baseType';
import {PromoterCheckinSchema} from '../../../types/schema';
import moment from 'moment';
import AddCheckInForm from '../../../components/Promoter/Checkin/CheckinForm';
import {Animated} from 'react-native';

const {width} = Dimensions.get('window');

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
  address: '',
};

const CheckingScreen = ({navigation}: Props) => {
  const {data, isFetching: isDataLoading} = useGetAvailableStoreQuery();
  const [promoterCheckin, {isLoading}] = usePromoterCheckinMutation();

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
          address: formValues.address,
        };
        // console.log('🚀 ~ CheckingScreen ~ payload:', payload);

        const res = await promoterCheckin(payload).unwrap();
        console.log('🚀 ~ CheckingScreen ~ res:', res);

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
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: `❌ ${
            error?.data?.message?.message || 'Internal Server Error'
          }`,
          text2: 'Please try again later.',
          position: 'top',
        });
      }
    },
  });

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
          <View style={styles.EmpInfoSection}>
            <View style={styles.EmpInfoView}>
              <Text style={styles.lableText}>Employee Id</Text>
              <View style={styles.ViewInputBox}>
                <Text style={styles.InputText}>
                  {data?.message?.data?.employee}
                </Text>
              </View>
            </View>
            <View style={styles.EmpInfoView}>
              <Text style={styles.lableText}>Employee name</Text>
              <View style={styles.ViewInputBox}>
                <Text style={styles.InputText}>
                  {data?.message?.data?.employee_name}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.ShiftSection}>
            <Text style={styles.HeadingText}>Shift Details</Text>

            <View
              style={[
                styles.ShiftDetailsBox,
                {marginTop: 10, paddingVertical: 20},
              ]}>
              {/* Time Section */}
              <View style={styles.TimeBoxSection}>
                {data?.message?.data?.shift_assignment?.start_time && (
                  <View style={styles.timeSection}>
                    <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
                    <Text style={styles.time}>
                      Start Time: {formattedStartTime}
                    </Text>
                  </View>
                )}

                {data?.message?.data?.shift_assignment?.end_time && (
                  <View style={styles.timeSection}>
                    <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
                    <Text style={styles.time}>
                      End Time: {formattedEndTime}
                    </Text>
                  </View>
                )}
              </View>

              {/* Shift Type */}
              <Text style={styles.labelText}>Shift Type</Text>
              <Text style={styles.valueText}>
                {data?.message?.data?.shift_assignment?.shift_type || 'N/A'}
              </Text>

              {/* Shift Date Range */}
              <Text style={styles.labelText}>Shift Duration</Text>
              <Text style={styles.valueText}>
                {formattedStartDate} → {formattedEndDate}
              </Text>
            </View>
          </View>

          <AddCheckInForm
            values={values}
            errors={errors}
            touched={touched}
            handleChange={handleChange}
            handleBlur={handleBlur}
            setFieldValue={setFieldValue}
            scrollY={new Animated.Value(0)}
            storeList={
              (data?.message?.data?.available_stores || [])?.map(
                (row: any) => ({
                  label: row.store_name,
                  value: row.store_id,
                }),
              ) || []
            }
          />

          <TouchableOpacity
            style={styles.checkinButton}
            disabled={isLoading}
            onPress={() => handleSubmit()}>
            <CalendarCheck strokeWidth={1.4} color={Colors.white} />
            <Text style={styles.checkinButtonText}>Check-in</Text>
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
  //atteddanceCard section css
  timeSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  time: {
    color: Colors.darkButton,
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    lineHeight: 18,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
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

  EmpInfoSection: {
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
  },
  EmpInfoView: {display: 'flex', flexDirection: 'column', gap: 6},
  lableText: {
    fontFamily: Fonts.medium,
    color: Colors.darkButton,
    fontSize: Size.sm,
  },
  ViewInputBox: {
    backgroundColor: Colors.lightBg,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: 45,
    paddingHorizontal: 15,
  },
  InputText: {fontFamily: Fonts.medium, color: '#B4BBC9', fontSize: Size.sm},

  ShiftSection: {marginTop: 20},
  HeadingText: {
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
    fontSize: Size.md,
  },
  ShiftDetailsBox: {
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  TimeBoxSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  UploadSection: {
    backgroundColor: Colors.lightBg,
    borderRadius: 10,
    marginTop: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#B9BFCB',
    padding: 5,
  },
  UploadSectionInner: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 15,
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    padding: 15,
  },
  UploadIcon: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    backgroundColor: '#C8DAFF',
    borderRadius: 100,
  },

  CheckinOutSection: {
    backgroundColor: Colors.white,
    marginTop: 20,
    borderRadius: 15,
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  intime: {
    width: '50%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRightWidth: 1,
    borderRightColor: '#F0F2F6',
    position: 'relative',
  },
  graphicsSection: {
    position: 'relative',
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  labelText: {
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: '#B9BFCB',
    paddingTop: 10,
    lineHeight: 16,
  },
  valueText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.darkButton,
    paddingTop: 5,
    lineHeight: 16,
  },
});
