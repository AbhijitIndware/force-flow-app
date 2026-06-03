import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ArrowRight, Clock } from 'lucide-react-native';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { flexCol, flexRow, itemsCenter } from '../../../utils/styles';

interface HeaderSectionProps {
  employee: any;
  selectedStoreValue: any;
  isActivityCheckedIn: boolean;
  activityStatusData: any;
  isActivityCheckingOut: boolean;
  handleActivityCheckOut: () => void;
  locationTrackerData: any;
  isStartingPjp: boolean;
  handleStartPjp: () => void;
  handleCheckOut: () => void;
  isLoading: boolean; // Checkout loading state
  isDisabled: boolean;
  errorMessage: string;
  navigation: any;
}

const DateBox = () => {
  const today = moment(); // current date
  const day = today.format('DD'); // e.g. "21"
  const month = today.format('MMM').toUpperCase(); // e.g. "APR"

  return (
    <View style={styles.dateBox}>
      <Text style={styles.dateText}>{day}</Text>
      <Text style={styles.monthTextWhite}>{month}</Text>
    </View>
  );
};

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  employee,
  selectedStoreValue,
  isActivityCheckedIn,
  activityStatusData,
  isActivityCheckingOut,
  handleActivityCheckOut,
  locationTrackerData,
  isStartingPjp,
  handleStartPjp,
  handleCheckOut,
  isLoading,
  isDisabled,
  errorMessage,
  navigation,
}) => {
  return (
    <View style={styles.headerSec}>
      <View style={{ position: 'relative', marginBottom: 0 }}>
        <View style={styles.welcomBox}>
          {/* ── Greeting + Date Row ── */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}>
            <Text style={styles.welcomeText}>
              Hello <Text style={styles.name}>{employee?.full_name}</Text>
            </Text>
            <DateBox />
          </View>

          {/* ── Store info row ── */}
          {selectedStoreValue && (
            <View style={styles.linkContent}>
              <Text style={styles.paraText}>
                Store — {selectedStoreValue?.store_name}
              </Text>
              {selectedStoreValue?.times?.check_in_time && (
                <Text style={styles.paraText}>
                  Last check-in at{' '}
                  {moment(
                    selectedStoreValue?.times.check_in_time,
                    'HH:mm:ss.SSSSS',
                  ).format('hh:mm A')}
                </Text>
              )}
            </View>
          )}

          {/* ── ACTIVITY STATUS BLOCK ── */}
          {isActivityCheckedIn && (
            <View style={{ marginTop: 10, gap: 8 }}>
              {/* Compact activity info card */}
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.22)',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.35)',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                }}>
                {/* Top row: location + time */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      flex: 1,
                    }}>
                    <Ionicons
                      name="location-sharp"
                      size={13}
                      color="#fff"
                    />
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 13,
                        fontFamily: Fonts.semiBold,
                        flex: 1,
                      }}
                      numberOfLines={1}>
                      {activityStatusData?.message?.activity_location}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      marginLeft: 8,
                    }}>
                    <Clock size={11} color="rgba(255,255,255,0.75)" />
                    <Text
                      style={{
                        color: 'rgba(255,255,255,0.75)',
                        fontSize: 11,
                        fontFamily: Fonts.regular,
                      }}>
                      {moment(
                        activityStatusData?.message?.check_in_time,
                        'HH:mm:ss',
                      ).format('hh:mm A')}
                    </Text>
                  </View>
                </View>

                {/* Chips row */}
                <View
                  style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  {activityStatusData?.message?.activity_type && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        paddingHorizontal: 9,
                        paddingVertical: 4,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.3)',
                      }}>
                      <Ionicons
                        name="briefcase-outline"
                        size={11}
                        color="#fff"
                      />
                      <Text
                        style={{
                          fontSize: 11,
                          fontFamily: Fonts.medium,
                          color: '#fff',
                        }}>
                        {activityStatusData?.message?.activity_type}
                      </Text>
                    </View>
                  )}
                  {activityStatusData?.message?.remarks && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        paddingHorizontal: 9,
                        paddingVertical: 4,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.3)',
                      }}>
                      <Ionicons
                        name="chatbox-ellipses-outline"
                        size={11}
                        color="#fff"
                      />
                      <Text
                        style={{
                          fontSize: 11,
                          fontFamily: Fonts.medium,
                          color: '#fff',
                        }}
                        numberOfLines={1}>
                        {activityStatusData?.message?.remarks}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Activity Check-Out button */}
              <TouchableOpacity
                style={[styles.checkinButton, { marginTop: 0 }]}
                onPress={handleActivityCheckOut}
                disabled={isActivityCheckingOut}>
                <Text style={styles.checkinButtonText}>
                  {isActivityCheckingOut
                    ? 'Checking Out...'
                    : 'Activity Check-Out'}
                </Text>
                {isActivityCheckingOut ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Ionicons
                    name="log-out-outline"
                    size={20}
                    color={Colors.white}
                  />
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* ── PJP SECTION ── */}
          {locationTrackerData?.message?.data?.pjp_records?.length ===
            0 ? (
            <>
              <Text
                style={{
                  fontSize: 14,
                  color: '#ffeaea',
                  marginBottom: 4,
                  textAlign: 'center',
                  marginTop: 8,
                }}>
                You don't have a Daily PJP for this date.
                {'\n'}Please add one to continue check-in.
              </Text>
              <TouchableOpacity
                style={[styles.checkinButton]}
                onPress={() => navigation.navigate('AddPjpScreen')}>
                <Text style={styles.checkinButtonText}>
                  Add Daily PJP
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {locationTrackerData?.message?.data?.enabled === false && (
                <TouchableOpacity
                  style={[
                    styles.checkinButton,
                    (isStartingPjp ||
                      locationTrackerData?.message?.data?.pjp_records
                        ?.length === 0 ||
                      isActivityCheckedIn) &&
                    styles.checkinButtonDisabled,
                  ]}
                  disabled={
                    isStartingPjp ||
                    locationTrackerData?.message?.data?.pjp_records
                      ?.length === 0 ||
                    isActivityCheckedIn
                  }
                  onPress={handleStartPjp}>
                  <Text style={styles.checkinButtonText}>
                    {isStartingPjp ? 'Starting PJP...' : 'Start PJP'}
                  </Text>
                  {isStartingPjp ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Ionicons
                      name="chevron-forward-circle-sharp"
                      size={24}
                      color={Colors.white}
                    />
                  )}
                </TouchableOpacity>
              )}

              {selectedStoreValue?.actions?.can_check_out ||
                selectedStoreValue?.actions?.can_mark_activity ? (
                <TouchableOpacity
                  style={styles.checkinButton}
                  onPress={handleCheckOut}
                  disabled={
                    !selectedStoreValue?.actions?.can_check_out ||
                    isLoading
                  }>
                  <Text style={styles.checkinButtonText}>Check Out</Text>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <Ionicons
                      name="chevron-forward-circle-sharp"
                      size={24}
                      color={Colors.white}
                    />
                  )}
                </TouchableOpacity>
              ) : (
                <>
                  {/* ── Check In — ghost style when locked by activity ── */}
                  <TouchableOpacity
                    style={[
                      styles.checkinButton,
                      isDisabled &&
                      !isActivityCheckedIn &&
                      styles.checkinButtonDisabled,
                      isActivityCheckedIn && {
                        backgroundColor: 'rgba(255,255,255,0.12)',
                        borderWidth: 1.5,
                        borderColor: 'rgba(255,255,255,0.4)',
                      },
                    ]}
                    disabled={isDisabled || isActivityCheckedIn}
                    onPress={() => {
                      if (errorMessage !== '') {
                        Toast.show({
                          type: 'error',
                          text1: `❌ ${errorMessage}`,
                          position: 'top',
                        });
                      } else {
                        navigation.navigate('CheckInForm');
                      }
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        flex: 1,
                        justifyContent: 'center',
                      }}>
                      {isActivityCheckedIn && (
                        <Ionicons
                          name="lock-closed"
                          size={14}
                          color="rgba(255,255,255,0.55)"
                        />
                      )}
                      <Text
                        style={[
                          styles.checkinButtonText,
                          isActivityCheckedIn && {
                            color: 'rgba(255,255,255,0.55)',
                          },
                          isDisabled &&
                          !isActivityCheckedIn &&
                          styles.checkinButtonTextDisabled,
                        ]}>
                        Check In
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward-circle-sharp"
                      size={24}
                      color={
                        isActivityCheckedIn
                          ? 'rgba(255,255,255,0.35)'
                          : isDisabled
                            ? Colors.gray
                            : Colors.white
                      }
                    />
                  </TouchableOpacity>

                  {/* Hint text */}
                  {isActivityCheckedIn && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        marginTop: -2,
                      }}>
                      <Ionicons
                        name="information-circle-outline"
                        size={12}
                        color="#fff"
                      />
                      <Text
                        style={{
                          fontSize: 11,
                          color: '#ffff',
                          fontFamily: Fonts.regular,
                        }}>
                        PJP Check-In is disabled while Activity is active
                      </Text>
                    </View>
                  )}
                </>
              )}
            </>
          )}
        </View>

        {/* ── Beat plan link ── */}
        <View style={styles.planLink}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() => navigation.navigate('AttendanceScreen')}>
            <Text
              style={{
                fontFamily: Fonts.regular,
                fontSize: Size.sm,
                color: Colors.darkButton,
              }}>
              See todays beat plan
            </Text>
            <ArrowRight
              strokeWidth={2}
              color={Colors.darkButton}
              size={20}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerSec: {
    backgroundColor: Colors.white,
    minHeight: 200,
    width: '100%',
    paddingHorizontal: 20,
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
    // iOS Shadow
    shadowColor: '#979797',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 6,

    // Android Shadow
    elevation: 2,
    marginBottom: 10,
  },
  welcomeText: {
    fontFamily: Fonts.light,
    color: Colors.white,
    fontSize: Size.sm,
  },
  name: { fontFamily: Fonts.medium, fontSize: Size.sm, color: Colors.white },
  welcomBox: {
    padding: 15,
    backgroundColor: Colors.orange,
    borderRadius: 15,
    paddingVertical: 20,
    marginTop: 10,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    position: 'relative',
  },
  linkContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    color: Colors.white,
    gap: 1,
    alignItems: 'flex-start',
    width: '80%',
  },
  paraText: { fontFamily: Fonts.light, color: Colors.white, fontSize: Size.sm },
  checkinButton: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 18,
    position: 'relative',
    gap: 5,
    marginTop: 15,
  },
  checkinButtonText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.white,
    lineHeight: 22,
  },
  checkinButtonDisabled: {
    backgroundColor: Colors.black,
    opacity: 0.8,
  },
  checkinButtonTextDisabled: {
    color: Colors.gray,
  },
  planLink: {
    backgroundColor: Colors.white,
    padding: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  dateBox: {
    width: 50,
    height: 50,
    borderColor: Colors.white,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: Colors.transparent,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 5,
  },
  dateText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.white,
    padding: 0,
    margin: 0,
    lineHeight: 18,
  },
  monthTextWhite: {
    fontFamily: Fonts.regular,
    color: Colors.white,
    fontSize: Size.xs,
  },
});
