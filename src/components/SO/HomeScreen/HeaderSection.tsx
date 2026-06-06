import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ArrowRight, Clock} from 'lucide-react-native';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {flexCol, flexRow, itemsCenter} from '../../../utils/styles';
import {PjpAllowedAction, PjpWorkflowState} from '../../../types/baseType';

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
  isLoading: boolean;
  isDisabled: boolean;
  errorMessage: string;
  navigation: any;
  // ── new workflow props ──
  pjpState: PjpWorkflowState | undefined;
  pjpActions: PjpAllowedAction[];
}

const DateBox = () => {
  const today = moment();
  const day = today.format('DD');
  const month = today.format('MMM').toUpperCase();
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
  isStartingPjp,
  handleStartPjp,
  handleCheckOut,
  isLoading,
  isDisabled,
  errorMessage,
  navigation,
  pjpState,
  pjpActions,
}) => {
  const can = (action: PjpAllowedAction) => pjpActions.includes(action);

  return (
    <View style={styles.headerSec}>
      <View style={{position: 'relative', marginBottom: 0}}>
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

          {/* ── Store info row (only while inside a store) ── */}
          {pjpState === 'STORE_CHECKED_IN' && selectedStoreValue && (
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

          {/* ═══════════════════════════════════════════════════════════════
              WORKFLOW-DRIVEN BUTTONS — same design, driven by pjpState
          ═══════════════════════════════════════════════════════════════ */}

          {/* ── WEEKLY_OFF ── nothing to show ── */}
          {pjpState === 'WEEKLY_OFF' && (
            <Text
              style={{
                fontSize: 14,
                color: '#ffeaea',
                textAlign: 'center',
                marginTop: 8,
              }}>
              Today is your Weekly Off. Enjoy your day! 🎉
            </Text>
          )}

          {/* ── NO_PJP ── Create PJP + Activity Check-in ── */}
          {pjpState === 'NO_PJP' && (
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
              {can('CREATE_PJP') && (
                <TouchableOpacity
                  style={styles.checkinButton}
                  onPress={() => navigation.navigate('AddPjpScreen')}>
                  <Text style={styles.checkinButtonText}>Add Daily PJP</Text>
                  <Ionicons
                    name="chevron-forward-circle-sharp"
                    size={24}
                    color={Colors.white}
                  />
                </TouchableOpacity>
              )}
              {can('START_ACTIVITY_CHECKIN') && (
                <TouchableOpacity
                  style={[styles.checkinButton, {marginTop: 8}]}
                  onPress={() => navigation.navigate('ActivityCheckInScreen')}>
                  <Text style={styles.checkinButtonText}>
                    Activity Check-In
                  </Text>
                  <Ionicons
                    name="chevron-forward-circle-sharp"
                    size={24}
                    color={Colors.white}
                  />
                </TouchableOpacity>
              )}
            </>
          )}

          {/* ── NO_STORES ── PJP exists but no stores added ── */}
          {pjpState === 'NO_STORES' && (
            <>
              <Text
                style={{
                  fontSize: 14,
                  color: '#ffeaea',
                  textAlign: 'center',
                  marginTop: 8,
                  marginBottom: 4,
                }}>
                Your PJP has no stores yet. Please add stores to continue.
              </Text>
              {can('ADD_STORES') && (
                <TouchableOpacity
                  style={styles.checkinButton}
                  onPress={() => navigation.navigate('AddPjpScreen')}>
                  <Text style={styles.checkinButtonText}>Add Stores</Text>
                  <Ionicons
                    name="chevron-forward-circle-sharp"
                    size={24}
                    color={Colors.white}
                  />
                </TouchableOpacity>
              )}
            </>
          )}

          {/* ── READY_TO_START ── PJP ready, not started yet ── */}
          {pjpState === 'READY_TO_START' && (
            <>
              {can('START_PJP') && (
                <TouchableOpacity
                  style={[
                    styles.checkinButton,
                    isStartingPjp && styles.checkinButtonDisabled,
                  ]}
                  disabled={isStartingPjp}
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
              {can('START_ACTIVITY_CHECKIN') && (
                <TouchableOpacity
                  style={[styles.checkinButton, {marginTop: 8}]}
                  onPress={() => navigation.navigate('ActivityCheckInScreen')}>
                  <Text style={styles.checkinButtonText}>
                    Activity Check-In
                  </Text>
                  <Ionicons
                    name="chevron-forward-circle-sharp"
                    size={24}
                    color={Colors.white}
                  />
                </TouchableOpacity>
              )}
            </>
          )}

          {/* ── PJP_RUNNING_IDLE ── travelling, can check into a store ── */}
          {pjpState === 'PJP_RUNNING_IDLE' && (
            <>
              {can('START_STORE_CHECKIN') && (
                <TouchableOpacity
                  style={[
                    styles.checkinButton,
                    isDisabled && styles.checkinButtonDisabled,
                  ]}
                  disabled={isDisabled}
                  onPress={() => {
                    if (errorMessage) {
                      Toast.show({
                        type: 'error',
                        text1: `❌ ${errorMessage}`,
                        position: 'top',
                      });
                    } else {
                      navigation.navigate('CheckInForm');
                    }
                  }}>
                  <Text
                    style={[
                      styles.checkinButtonText,
                      isDisabled && styles.checkinButtonTextDisabled,
                    ]}>
                    Check In
                  </Text>
                  <Ionicons
                    name="chevron-forward-circle-sharp"
                    size={24}
                    color={isDisabled ? Colors.gray : Colors.white}
                  />
                </TouchableOpacity>
              )}
              {can('START_ACTIVITY_CHECKIN') && (
                <TouchableOpacity
                  style={[styles.checkinButton, {marginTop: 8}]}
                  onPress={() => navigation.navigate('ActivityCheckInScreen')}>
                  <Text style={styles.checkinButtonText}>
                    Activity Check-In
                  </Text>
                  <Ionicons
                    name="chevron-forward-circle-sharp"
                    size={24}
                    color={Colors.white}
                  />
                </TouchableOpacity>
              )}
            </>
          )}

          {/* ── STORE_CHECKED_IN ── inside a store, show check-out ── */}
          {pjpState === 'STORE_CHECKED_IN' && (
            <>
              {can('END_STORE_CHECKOUT') && (
                <TouchableOpacity
                  style={styles.checkinButton}
                  onPress={handleCheckOut}
                  disabled={isLoading}>
                  <Text style={styles.checkinButtonText}>
                    {isLoading ? 'Checking Out...' : 'Check Out'}
                  </Text>
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
              )}
            </>
          )}

          {/* ── ACTIVITY_CHECKED_IN ── in a non-store activity ── */}
          {pjpState === 'ACTIVITY_CHECKED_IN' && (
            <View style={{marginTop: 10, gap: 8}}>
              {/* Compact activity info card — design unchanged */}
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.22)',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.35)',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                }}>
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
                    <Ionicons name="location-sharp" size={13} color="#fff" />
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
                <View style={{flexDirection: 'row', gap: 8, marginTop: 8}}>
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
              {can('END_ACTIVITY_CHECKOUT') && (
                <TouchableOpacity
                  style={[styles.checkinButton, {marginTop: 0}]}
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
              )}
            </View>
          )}

          {/* ── COMPLETED ── day done ── */}
          {pjpState === 'COMPLETED' && (
            <Text
              style={{
                fontSize: 14,
                color: '#ffeaea',
                textAlign: 'center',
                marginTop: 8,
              }}>
              Your PJP for today is completed. Great work! ✅
            </Text>
          )}
        </View>

        {/* ── Beat plan link — unchanged ── */}
        <View style={styles.planLink}>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center'}}
            onPress={() => navigation.navigate('AttendanceScreen')}>
            <Text
              style={{
                fontFamily: Fonts.regular,
                fontSize: Size.sm,
                color: Colors.darkButton,
              }}>
              View Attendance Records
            </Text>
            <ArrowRight strokeWidth={2} color={Colors.darkButton} size={20} />
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
    shadowColor: '#979797',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 10,
  },
  welcomeText: {
    width: '70%',
    fontFamily: Fonts.light,
    color: Colors.white,
    fontSize: Size.sm,
  },
  name: {fontFamily: Fonts.medium, fontSize: Size.sm, color: Colors.white},
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
  paraText: {fontFamily: Fonts.light, color: Colors.white, fontSize: Size.sm},
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
