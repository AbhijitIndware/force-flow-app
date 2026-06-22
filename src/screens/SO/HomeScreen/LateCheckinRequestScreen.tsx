/* eslint-disable react-native/no-inline-styles */
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { flexCol } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import React from 'react';
import { SoAppStackParamList } from '../../../types/Navigation';
import PageHeader from '../../../components/ui/PageHeader';
import { Size } from '../../../utils/fontSize';
import { Fonts } from '../../../constants';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Clock2 } from 'lucide-react-native';
import { useFormik } from 'formik';
import Toast from 'react-native-toast-message';
import { useRequestLateCheckinMutation } from '../../../features/base/base-api';
import { useGetAvailableStoreQuery } from '../../../features/base/promoter-base-api';
import moment from 'moment';
import { ActivityIndicator } from 'react-native';
import { LateCheckinRequestSchema } from '../../../types/schema';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'LateCheckinRequestScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const LateCheckinRequestScreen = ({ navigation }: Props) => {
  const { data, isFetching: isDataLoading } = useGetAvailableStoreQuery();
  const [requestLateCheckin, { isLoading }] = useRequestLateCheckinMutation();

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormik({
    initialValues: { reason: '' },
    validationSchema: LateCheckinRequestSchema,
    onSubmit: async (formValues, actions) => {
      try {
        const res = await requestLateCheckin({
          reason: formValues.reason.trim() || undefined,
        }).unwrap();

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
          text1: `❌ ${error?.data?.message?.message || 'Internal Server Error'
            }`,
          text2: 'Please try again later.',
          position: 'top',
        });
      }
    },
  });

  const charCount = values.reason.length;

  return (
    <SafeAreaView
      style={[
        flexCol,
        {
          flex: 1,
          backgroundColor: Colors.lightBg,
        },
      ]}>
      <PageHeader
        title="Late Check-in Request"
        navigation={() => navigation.goBack()}
      />
      {isDataLoading ? (
        <LoadingScreen />
      ) : (
        <ScrollView
          contentContainerStyle={styles.container}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}>
          {/* ── Info Banner ── */}
          <View style={styles.banner}>
            <View style={styles.bannerIconWrap}>
              <Ionicons name="time-outline" size={22} color={Colors.orange} />
            </View>
            <View style={styles.bannerTextWrap}>
              <Text style={styles.bannerTitle}>Request Late Check-In</Text>
              <Text style={styles.bannerSubtitle}>
                Submit a request to your manager for approval
              </Text>
            </View>
          </View>

          {/* ── Employee Info ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <Ionicons name="person-outline" size={15} color={Colors.darkButton} />{' '}
              Employee Details
            </Text>
            <View style={styles.cardDivider} />
            <View style={styles.infoRow}>
              <View style={styles.infoLabelWrap}>
                <Ionicons
                  name="id-card-outline"
                  size={16}
                  color={Colors.textTertiary}
                />
                <Text style={styles.infoLabel}>Employee ID</Text>
              </View>
              <Text style={styles.infoValue}>
                {data?.message?.data?.employee || 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelWrap}>
                <Ionicons
                  name="person-outline"
                  size={16}
                  color={Colors.textTertiary}
                />
                <Text style={styles.infoLabel}>Name</Text>
              </View>
              <Text style={styles.infoValue}>
                {data?.message?.data?.employee_name || 'N/A'}
              </Text>
            </View>
          </View>

          {/* ── Shift Details ── */}
          {/* <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <Ionicons name="calendar-outline" size={15} color={Colors.darkButton} />{' '}
              Shift Details
            </Text>
            <View style={styles.cardDivider} />
            {shift?.start_time && (
              <View style={styles.shiftTimeRow}>
                <View style={styles.shiftTimeBox}>
                  <Clock2 size={16} color={Colors.orange} strokeWidth={2} />
                  <Text style={styles.shiftTimeLabel}>Start</Text>
                  <Text style={styles.shiftTimeValue}>
                    {formattedStartTime}
                  </Text>
                </View>
                <View style={styles.shiftTimeBox}>
                  <Clock2 size={16} color={Colors.orange} strokeWidth={2} />
                  <Text style={styles.shiftTimeLabel}>End</Text>
                  <Text style={styles.shiftTimeValue}>{formattedEndTime}</Text>
                </View>
              </View>
            )}
            <View style={styles.shiftMetaRow}>
              <View style={styles.shiftMetaItem}>
                <Text style={styles.shiftMetaLabel}>Shift Type</Text>
                <Text style={styles.shiftMetaValue}>
                  {shift?.shift_type || 'N/A'}
                </Text>
              </View>
              <View style={styles.shiftMetaItem}>
                <Text style={styles.shiftMetaLabel}>Duration</Text>
                <Text style={styles.shiftMetaValue}>
                  {formattedStartDate} → {formattedEndDate}
                </Text>
              </View>
            </View>
          </View> */}

          {/* ── Reason ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <Ionicons name="chatbox-ellipses-outline" size={15} color={Colors.darkButton} />{' '}
              Reason for Late Check-in
            </Text>
            <View style={styles.cardDivider} />
            <TextInput
              style={[
                styles.reasonInput,
                errors.reason && touched.reason && styles.reasonInputError,
              ]}
              placeholder="Tell your manager why you're late..."
              placeholderTextColor={Colors.placeholder}
              multiline
              textAlignVertical="top"
              value={values.reason}
              onChangeText={handleChange('reason')}
              onBlur={handleBlur('reason')}
            />
            {errors.reason && touched.reason && (
              <Text style={styles.errorText}>{errors.reason as string}</Text>
            )}
            <Text style={styles.charCount}>{charCount} / 500</Text>
          </View>

          {/* ── Submit ── */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            disabled={isLoading}
            onPress={() => handleSubmit()}
            activeOpacity={0.85}>
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Ionicons name="send" size={18} color={Colors.white} />
            )}
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Sending Request...' : 'Send Request'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default LateCheckinRequestScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  /* ── Banner ── */
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  bannerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.lightOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },
  bannerSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  /* ── Cards ── */
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
    // marginBottom: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.lightBg,
    marginVertical: 12,
  },
  /* ── Employee Info ── */
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.textTertiary,
  },
  infoValue: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  /* ── Shift Details ── */
  shiftTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  shiftTimeBox: {
    flex: 1,
    backgroundColor: Colors.lightBg,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  shiftTimeLabel: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  shiftTimeValue: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  shiftMetaRow: {
    gap: 10,
  },
  shiftMetaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  shiftMetaLabel: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.textTertiary,
  },
  shiftMetaValue: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  /* ── Reason ── */
  reasonInput: {
    backgroundColor: Colors.lightBg,
    borderRadius: 12,
    padding: 14,
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: Colors.darkButton,
    minHeight: 100,
    borderWidth: 1.5,
    borderColor: Colors.transparent,
  },
  reasonInputError: {
    borderColor: Colors.denger,
  },
  errorText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: Colors.denger,
    marginTop: 6,
    marginLeft: 4,
  },
  charCount: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: 6,
  },
  /* ── Submit ── */
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.orange,
    borderRadius: 16,
    paddingVertical: 18,
    gap: 8,
    marginTop: 24,
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.white,
    lineHeight: 20,
  },
});
