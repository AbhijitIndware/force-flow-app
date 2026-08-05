import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ArrowRight, Clock, X, CalendarDays, LogIn, LogOut, Store, CheckCircle, FileText } from 'lucide-react-native';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { flexCol, flexRow, itemsCenter } from '../../../utils/styles';
import { LateCheckInInfo, PjpAllowedAction, PjpWorkflowState, LiveWorkingHours } from '../../../types/baseType';
import { Modal, Switch } from 'react-native';

interface HeaderSectionProps {
  employee: any;
  selectedStoreValue: any;
  isActivityCheckedIn: boolean;
  activityStatusData: any;
  isActivityCheckingOut: boolean;
  handleActivityCheckOut: () => void;
  locationTrackerData: any;
  isStartingPjp: boolean;
  handleStartPjp: (isOvernight?: boolean) => void;
  handleCheckOut: () => void;
  isLoading: boolean;
  isDisabled: boolean;
  errorMessage: string;
  navigation: any;
  // ── new workflow props ──
  pjpState: PjpWorkflowState | undefined;
  pjpActions: PjpAllowedAction[];
  lateCheckInInfo: LateCheckInInfo | undefined;
  isFetchingNextAction?: boolean;
  liveWorkingHours?: LiveWorkingHours;
  isOvernightOutstationJourney?: boolean;
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
  lateCheckInInfo,
  isFetchingNextAction,
  liveWorkingHours,
  isOvernightOutstationJourney
}) => {
  const can = (action: PjpAllowedAction) => pjpActions.includes(action);
  const [showWorkingHoursModal, setShowWorkingHoursModal] = React.useState(false);
  const [isOvernight, setIsOvernight] = React.useState(false);

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

          {/* ── Store info row (only while inside a store) ── */}
          {isOvernightOutstationJourney && pjpState !== 'READY_TO_START' && pjpState !== 'NO_PJP' && pjpState !== 'NO_STORES' && pjpState !== 'WEEKLY_OFF' && (
            <View style={{ marginBottom: 12 }}>
              <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="moon" size={14} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 12, fontFamily: Fonts.semiBold }}>
                  Outstation / Overnight Trip
                </Text>
              </View>
            </View>
          )}

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

          {/* ── Loading state for next action ── */}
          {isFetchingNextAction && (
            <View style={{ alignItems: 'center', marginTop: 16, gap: 8 }}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={{ fontSize: 13, color: '#ffeaea', fontFamily: Fonts.medium }}>
                Please wait...
              </Text>
            </View>
          )}

          {!isFetchingNextAction && (
            <>
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
                      style={[styles.checkinButton, { marginTop: 8 }]}
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
                    <View style={{ marginTop: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 12, marginBottom: 8 }}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                          <Text style={{ color: '#fff', fontSize: 13, fontFamily: Fonts.medium }}>
                            Outstation / Overnight Journey
                          </Text>
                          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontFamily: Fonts.regular, marginTop: 2 }}>
                            Enable if this trip is Outstation / Overnight Journey
                          </Text>
                        </View>
                        <Switch
                          value={isOvernight}
                          onValueChange={setIsOvernight}
                          trackColor={{ false: 'rgba(255,255,255,0.3)', true: Colors.darkButton }}
                          thumbColor="#fff"
                        />
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.checkinButton,
                          isStartingPjp && styles.checkinButtonDisabled,
                          { marginTop: 0 }
                        ]}
                        disabled={isStartingPjp}
                        onPress={() => handleStartPjp(isOvernight)}>
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
                    </View>
                  )}
                  {can('START_ACTIVITY_CHECKIN') && (
                    <TouchableOpacity
                      style={[styles.checkinButton, { marginTop: 8 }]}
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
                        Store Check-In
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
                      style={[styles.checkinButton, { marginTop: 8 }]}
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


              {/* ── REQUEST_LATE_CHECKIN ── waiting for manager approval ── */}
              {pjpState === 'PJP_RUNNING_IDLE' && lateCheckInInfo?.message && (
                <Text style={styles.checkinMessageText}>
                  {lateCheckInInfo?.message || 'Late check-in request sent. Waiting for manager approval.'}
                </Text>
              )}

              {/* ── LATE_CHECKIN ── Employee is past check-in window ── */}
              {pjpState === 'PJP_RUNNING_IDLE' && pjpActions?.includes('REQUEST_LATE_CHECKIN') && (
                <>
                  <TouchableOpacity
                    style={styles.checkinButton}
                    onPress={() => navigation.navigate('LateCheckinRequestScreen')}>
                    <Text style={styles.checkinButtonText}>Request Late Check-In</Text>
                    <Ionicons
                      name="chevron-forward-circle-sharp"
                      size={24}
                      color={Colors.white}
                    />
                  </TouchableOpacity>

                  {/* {lateCheckInInfo?.message && (
                <Text style={styles.checkinMessageText}>{lateCheckInInfo.message}</Text>
              )} */}
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
                        {isLoading ? 'Store Checking Out...' : 'Store Check Out'}
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
                <View style={{ marginTop: 10, gap: 8 }}>
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
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
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
                      style={[styles.checkinButton, { marginTop: 0 }]}
                      onPress={handleActivityCheckOut}
                      disabled={isActivityCheckingOut}>
                      <Text style={styles.checkinButtonText}>
                        {isActivityCheckingOut
                          ? 'Activity Checking Out...'
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
            </>
          )}
        </View>

        {/* ── Beat plan link — unchanged ── */}
        <View style={styles.planLink}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() => navigation.navigate('AttendanceScreen')}>
            <Text
              style={{
                fontFamily: Fonts.semiBold,
                fontSize: Size.xs,
                color: Colors.darkButton,
              }}>
              View Attendance Records
            </Text>
            <ArrowRight strokeWidth={2} color={Colors.darkButton} size={20} />
          </TouchableOpacity>
        </View>

        {/* ── Working Hours Button (Moved) ── */}
        {liveWorkingHours && (() => {
          const status = liveWorkingHours.pjp_status;
          const isRunning = status === 'Running';
          const isCompleted = status === 'Completed';
          const statusColor = isRunning ? '#16A34A' : isCompleted ? '#6B7280' : '#D97706';
          const statusBg = isRunning ? '#DCFCE7' : isCompleted ? '#F3F4F6' : '#FEF3C7';

          return (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#FFF7ED',
                paddingVertical: 8,
                paddingHorizontal: 20,
                borderBottomLeftRadius: 40,
                borderBottomRightRadius: 40,
                justifyContent: 'space-between',
                borderTopWidth: 1,
                borderTopColor: '#FFE4BE',
                // marginHorizontal: 20,
              }}
              onPress={() => setShowWorkingHoursModal(true)}>
              {/* Left: clock + hours */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Clock size={14} color="#C2410C" />
                <Text style={{ color: '#92400E', fontSize: 11, fontFamily: Fonts.semiBold }}>
                  Working : {liveWorkingHours.working_hours_formatted} hrs
                </Text>
                {isRunning && (
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#16A34A' }} />
                )}
              </View>
              {/* Right: status badge + chevron */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ backgroundColor: statusBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 }}>
                  <Text style={{ color: statusColor, fontSize: 10, fontFamily: Fonts.semiBold }}>
                    {status}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={13} color="#C2410C" />
              </View>
            </TouchableOpacity>
          );
        })()}

      </View>

      {/* ── Working Hours Modal ── */}
      <Modal visible={showWorkingHoursModal} transparent animationType="slide">
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            {/* ── Drag Handle ── */}
            <View style={modalStyles.handle} />

            {/* ── Header Row ── */}
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Live Working Hours</Text>
              <TouchableOpacity
                style={modalStyles.closeIcon}
                onPress={() => setShowWorkingHoursModal(false)}>
                <X size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* ── Working Hours Highlight Card ── */}
            <View style={modalStyles.highlightCard}>
              <View style={modalStyles.highlightIconWrap}>
                <Clock size={20} color={Colors.orange} />
              </View>
              <View style={modalStyles.highlightTextWrap}>
                <Text style={modalStyles.highlightLabel}>Working Time</Text>
                <Text style={modalStyles.highlightValue}>{liveWorkingHours?.working_hours_formatted} hrs</Text>
              </View>
            </View>

            <View style={modalStyles.divider} />

            {/* ── Detail Rows with Icons ── */}
            <View style={modalStyles.row}>
              <View style={[modalStyles.iconWrap, { backgroundColor: Colors.lightBlue }]}>
                <CalendarDays size={14} color={Colors.blue} />
              </View>
              <Text style={modalStyles.label}>Date</Text>
              <Text style={modalStyles.value}>{liveWorkingHours?.date}</Text>
            </View>

            <View style={modalStyles.row}>
              <View style={[modalStyles.iconWrap, { backgroundColor: Colors.lightGreen }]}>
                <LogIn size={14} color={Colors.success} />
              </View>
              <Text style={modalStyles.label}>First Check-in</Text>
              <Text style={modalStyles.value}>
                {liveWorkingHours?.first_check_in
                  ? moment(liveWorkingHours.first_check_in, 'HH:mm:ss.SSSSSS').format('hh:mm A')
                  : 'N/A'}
              </Text>
            </View>

            <View style={modalStyles.row}>
              <View style={[modalStyles.iconWrap, { backgroundColor: Colors.lightRed }]}>
                <LogOut size={14} color={Colors.primary} />
              </View>
              <Text style={modalStyles.label}>Last Check-out</Text>
              <Text style={modalStyles.value}>
                {liveWorkingHours?.last_check_out
                  ? moment(liveWorkingHours.last_check_out, 'HH:mm:ss.SSSSSS').format('hh:mm A')
                  : 'N/A'}
              </Text>
            </View>

            <View style={modalStyles.row}>
              <View style={[modalStyles.iconWrap, { backgroundColor: Colors.lightBlue }]}>
                <Store size={14} color={Colors.info} />
              </View>
              <Text style={modalStyles.label}>Stores Visited</Text>
              <Text style={modalStyles.value}>{liveWorkingHours?.stores_visited}</Text>
            </View>

            <View style={modalStyles.row}>
              <View style={[modalStyles.iconWrap, { backgroundColor: Colors.lightSuccess }]}>
                <CheckCircle size={14} color={Colors.sucess} />
              </View>
              <Text style={modalStyles.label}>Activities Done</Text>
              <Text style={modalStyles.value}>{liveWorkingHours?.activities_done}</Text>
            </View>

            <View style={modalStyles.row}>
              <View style={[modalStyles.iconWrap, { backgroundColor: Colors.lightYellow }]}>
                <FileText size={14} color={Colors.warning} />
              </View>
              <Text style={modalStyles.label}>PJP Status</Text>
              {(() => {
                const status = liveWorkingHours?.pjp_status;
                const isCompleted = status === 'Completed';
                const isRunning = status === 'Running';
                const badgeBg = isCompleted ? Colors.lightSuccess : isRunning ? Colors.lightBlue : Colors.lightOrange;
                const badgeColor = isCompleted ? Colors.sucess : isRunning ? Colors.blue : Colors.orange;
                return (
                  <View style={[modalStyles.statusBadge, { backgroundColor: badgeBg }]}>
                    <Text style={[modalStyles.statusText, { color: badgeColor }]}>{status}</Text>
                  </View>
                );
              })()}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerSec: {
    backgroundColor: Colors.white,
    minHeight: 200,
    width: '100%',
    // paddingHorizontal: 20,
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
    shadowColor: '#979797',
    shadowOffset: { width: 0, height: 6 },
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
    marginHorizontal: 20
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
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    position: 'relative',
    gap: 5,
    marginTop: 10,
  },
  checkinButtonText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: Colors.white,
    lineHeight: 18,
  },
  checkinButtonDisabled: {
    backgroundColor: Colors.black,
    opacity: 0.8,
  },
  checkinButtonTextDisabled: {
    color: Colors.gray,
  },
  planLink: {
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    padding: 10,
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
  checkinMessageText: {
    color: Colors.white, // or Colors.white with opacity
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    elevation: 10,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: Size.xsmd,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    flex: 1,
  },
  closeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lightestGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightOrange,
    borderRadius: 14,
    padding: 10,
    gap: 12,
    marginBottom: 4,
  },
  highlightIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightTextWrap: {
    flex: 1,
  },
  highlightLabel: {
    fontSize: Size.xxs,
    color: Colors.orange,
    fontFamily: Fonts.medium,
    marginBottom: 2,
  },
  highlightValue: {
    fontSize: Size.sm,
    color: Colors.darkButton,
    fontFamily: Fonts.bold,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    gap: 10,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: Size.xs,
    color: '#64748b',
    fontFamily: Fonts.regular,
  },
  value: {
    fontSize: Size.xs,
    color: Colors.darkButton,
    fontFamily: Fonts.semiBold,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xxs,
  },
});
