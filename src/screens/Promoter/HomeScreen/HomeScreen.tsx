/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
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
import {Fonts} from '../../../constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Size} from '../../../utils/fontSize';
import {Divider} from '@rneui/themed';
import {
  ArrowRight,
  BookOpen,
  ChartCandlestick,
  Clock3,
  FilePenLine,
  MessageSquareQuote,
  Network,
  Package,
  Store,
  UserRoundCog,
} from 'lucide-react-native';
import {
  useGetPromoterHomeQuery,
  usePromoterStatusQuery,
} from '../../../features/base/promoter-base-api';
import {useAppSelector} from '../../../store/hook';
import {
  IPromoterHomeData,
  IAttendanceStatusData,
} from '../../../types/baseType';
import {TargetMetricBox} from '../../../components/SO/HomeScreen/Common';
import moment from 'moment';

const {width} = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  PromoterAppStackParamList,
  'HomeScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const getLastCheckMessage = (attendance: IPromoterHomeData['attendance']) => {
  const {checked_in, checked_out, checkin_time, checkout_time} = attendance;

  const checkInTime = checkin_time
    ? moment(checkin_time, 'HH:mm:ss.SSSSSS').format('hh:mm A')
    : null;

  const checkOutTime = checkout_time
    ? moment(checkout_time, 'HH:mm:ss.SSSSSS').format('hh:mm A')
    : null;

  if (checked_in && checked_out && checkOutTime) {
    return `Last check-out at ${checkOutTime}.`;
  }
  if (attendance.can_check_in) {
    return "You haven't checked in yet.";
  }

  if (checked_in && checkInTime) {
    return `Last check-in at ${checkInTime}.`;
  }

  return 'No attendance records yet.';
};

const formatDay = (date: string) => moment(date).format('DD');
const formatMonth = (date: string) => moment(date).format('MMM').toUpperCase();

const formatTime = (time: string | null | undefined) =>
  time ? moment(time, 'HH:mm:ss.SSSSSS').format('hh:mm A') : null;

const formatWorkingHours = (hours: number) => {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

const getStoreStatusLabel = (store: {
  checked_in: boolean;
  checked_out: boolean;
}) => {
  if (store.checked_out) return 'Checked Out';
  if (store.checked_in) return 'Checked In';
  return 'Not Checked In';
};

const HomeScreen = ({navigation, route}: Props) => {
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const {
    data,
    refetch,
    isLoading: homeLoading,
  } = useGetPromoterHomeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const {data: statusData, isLoading: statusLoading} = usePromoterStatusQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
    },
  );
  console.log('🚀 ~ HomeScreen ~ statusData:', statusData);

  const homeData = data?.message?.data;
  const attendance = homeData?.attendance;
  const target = homeData?.target;
  const employee = homeData?.employee;
  const attendanceStatus = statusData?.message?.data;
  const storesToday = attendanceStatus?.stores_today ?? [];

  const salesPct =
    target && target.sales_target > 0
      ? parseFloat(
          ((target.achieved_value / target.sales_target) * 100).toFixed(2),
        )
      : 0;
  const ddnPct =
    target && target.ddn_target > 0
      ? parseFloat(((target.ddn_value / target.ddn_target) * 100).toFixed(2))
      : 0;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      refetch();
    }, 2000);
  }, []);

  return (
    <SafeAreaView
      style={[
        flexCol,
        {
          flex: 1,
          backgroundColor: Colors.lightBg,
        },
      ]}>
      {refreshing ? (
        <LoadingScreen />
      ) : (
        <ScrollView
          nestedScrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={styles.headerSec}>
            <View style={{position: 'relative', marginBottom: 0}}>
              <View style={styles.welcomBox}>
                {/* ── Greeting + Date Row ── */}
                <View style={styles.greetingRow}>
                  <Text style={styles.welcomeText}>
                    Hello{' '}
                    <Text style={styles.name}>{employee?.employee_name}</Text>
                  </Text>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateText}>
                      {formatDay(homeData?.date as string)}
                    </Text>
                    <Text style={styles.monthText}>
                      {formatMonth(homeData?.date as string)}
                    </Text>
                  </View>
                </View>

                {/* ── Store info ── */}
                {homeLoading || statusLoading ? (
                  <View style={styles.attendanceLoader}>
                    <ActivityIndicator size="small" color={Colors.white} />
                  </View>
                ) : attendanceStatus?.shift_info?.store_name &&
                  !attendance?.can_check_in ? (
                  <View style={styles.storeInfoCard}>
                    <Text style={styles.storeInfoName}>
                      Store — {attendanceStatus.shift_info.store_name}
                    </Text>
                    {attendanceStatus.shift_info.start_time &&
                      attendanceStatus.shift_info.end_time && (
                        <Text style={styles.storeInfoText}>
                          Shift:{' '}
                          {formatTime(attendanceStatus.shift_info.start_time)} –{' '}
                          {formatTime(attendanceStatus.shift_info.end_time)}
                          {attendanceStatus.shift_info.is_floater
                            ? ' · Floater'
                            : ''}
                        </Text>
                      )}
                    <Text style={styles.storeInfoText}>
                      {attendance && getLastCheckMessage(attendance)}
                    </Text>
                  </View>
                ) : null}

                {/* ── Check-in / Check-out ── */}
                {attendance?.can_check_in && (
                  <TouchableOpacity
                    style={styles.checkinButton}
                    onPress={() => navigation.navigate('CheckingScreen')}>
                    <Text style={styles.checkinButtonText}>Check-in</Text>
                    <Ionicons
                      name="chevron-forward-circle-sharp"
                      size={24}
                      color={Colors.white}
                    />
                  </TouchableOpacity>
                )}
                {attendance?.can_check_out && (
                  <TouchableOpacity
                    style={styles.checkinButton}
                    onPress={() => navigation.navigate('CheckOutScreen')}>
                    <Text style={styles.checkinButtonText}>Check-out</Text>
                    <Ionicons
                      name="chevron-forward-circle-sharp"
                      size={24}
                      color={Colors.white}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* ── View attendance link ── */}
              <View style={styles.planLink}>
                <TouchableOpacity
                  style={{flexDirection: 'row', alignItems: 'center'}}
                  onPress={() => navigation.navigate('AttendanceScreen')}>
                  <Text style={styles.planLinkText}>
                    View Attendance & Shift Records
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

          {storesToday.length > 0 && (
            <View style={[styles.container, {paddingTop: 25}]}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.SectionHeading}>Today's Stores</Text>
                <View style={styles.storeCountBadge}>
                  <Text style={styles.storeCountText}>
                    {storesToday.length} store
                    {storesToday.length > 1 ? 's' : ''}
                  </Text>
                </View>
              </View>

              {storesToday.map((store, idx) => {
                const statusLabel = getStoreStatusLabel(store);
                const isOut = store.checked_out;
                const isIn = store.checked_in;
                const statusColor = isOut
                  ? '#dc2626'
                  : isIn
                  ? '#16a34a'
                  : Colors.gray;
                const statusBg = isOut
                  ? '#FEF2F2'
                  : isIn
                  ? '#E6F7EE'
                  : '#F2F3F5';
                return (
                  <View key={store.store ?? idx} style={styles.storeCard}>
                    <View style={styles.storeIconBox}>
                      <Store strokeWidth={1.8} color={Colors.white} size={16} />
                    </View>

                    <View style={styles.storeInfo}>
                      <Text style={styles.storeName} numberOfLines={1}>
                        {store.store_name}
                      </Text>
                      <View style={styles.storeMetaRow}>
                        <Clock3 size={11} color={Colors.gray} strokeWidth={2} />
                        <Text style={styles.storeTime}>
                          {formatTime(store.start_time)} –{' '}
                          {formatTime(store.end_time)}
                        </Text>
                      </View>

                      {store.checked_out && (
                        <View style={styles.hoursChip}>
                          <Text style={styles.hoursChipLabel}>
                            Working Hours:{' '}
                          </Text>
                          <Text style={styles.hoursChipText}>
                            {formatWorkingHours(store.working_hours)}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View
                      style={[styles.storeStatus, {backgroundColor: statusBg}]}>
                      <View
                        style={[
                          styles.statusDot,
                          {backgroundColor: statusColor},
                        ]}
                      />
                      <Text
                        style={[styles.storeStatusText, {color: statusColor}]}>
                        {statusLabel}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* <View style={styles.countBoxSection}>
            <View style={styles.countBox}>
              <View style={styles.countBoxIcon}>
                <CalendarCheck2 strokeWidth={1.4} color={Colors.white} />
              </View>
              <Text style={styles.countBoxTitle}>Attendance</Text>
              <Text style={styles.countBoxDay}>0 Days</Text>
            </View>
            <View style={styles.countBox}>
              <View style={styles.countBoxIcon}>
                <Network strokeWidth={1.4} color={Colors.white} />
              </View>
              <Text style={styles.countBoxTitle}>AON</Text>
              <Text style={styles.countBoxDay}>0 Days</Text>
            </View>
          </View>

          <View
            style={[
              styles.container,
              {backgroundColor: Colors.transparent, paddingTop: 10},
            ]}>
            <TouchableOpacity
              style={[
                styles.linkBox,
                {backgroundColor: Colors.orange, padding: 7, borderRadius: 15},
              ]}
              onPress={() => navigation.navigate('StockScreen')}>
              <View
                style={[
                  styles.dateBox,
                  {
                    backgroundColor: Colors.Orangelight,
                    borderTopWidth: 1,
                    borderLeftWidth: 1,
                    borderRightWidth: 1,
                    borderColor: '#FFBF83',
                    borderBottomWidth: 0,
                    width: 60,
                    height: 60,
                    borderRadius: 18,
                  },
                ]}>
                <Ionicons name="cube-outline" size={28} color={Colors.white} />
              </View>
              <View style={styles.linkContent}>
                <View>
                  <Text style={styles.paraText}>Stock Valuation</Text>
                  <Text
                    style={[
                      styles.paraText,
                      {
                        fontFamily: Fonts.semiBold,
                        fontSize: Size.md,
                        lineHeight: 20,
                      },
                    ]}>
                    <Text style={{fontFamily: Fonts.customefont}}>₹</Text>0
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward-circle-sharp"
                  size={24}
                  color={Colors.white}
                />
              </View>
            </TouchableOpacity>
          </View> */}

          <View style={[styles.container, {paddingTop: 20}]}>
            <Text style={styles.SectionHeading}>
              Target vs Achievement{' '}
              <Text style={{fontFamily: Fonts.regular}}>(Value)</Text>
            </Text>
            <View style={styles.metricRow}>
              <TargetMetricBox
                label="Sales Target"
                achieved={`₹${
                  (target?.achieved_value ?? 0) % 1 !== 0
                    ? (target?.achieved_value ?? 0).toFixed(2)
                    : target?.achieved_value ?? 0
                }`}
                target={`₹${
                  target?.sales_target?.toLocaleString('en-IN') || 0
                }`}
                rate={target?.percentage ?? salesPct}
                accentColor="#0F6E56"
              />
              <TargetMetricBox
                label="DDN Target"
                achieved={`₹${
                  (target?.ddn_value ?? 0) % 1 !== 0
                    ? (target?.ddn_value ?? 0).toFixed(2)
                    : target?.ddn_value ?? 0
                }`}
                target={`₹${target?.ddn_target?.toLocaleString('en-IN') || 0}`}
                rate={ddnPct}
                accentColor="#185FA5"
              />
            </View>
            <View style={[styles.metricRow, {marginTop: 10}]}>
              <TargetMetricBox
                label="Orders"
                achieved={`${target?.order_count || 0}`}
                target=""
                accentColor="#534AB7"
              />
            </View>
          </View>

          {/* <View style={[styles.container, {paddingTop: 20}]}>
            <Text style={styles.SectionHeading}>Incentive Status</Text>
            <View
              style={[
                styles.dataBox,
                {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  marginTop: 10,
                },
              ]}>
              <View style={styles.incentiveContent}>
                <View style={styles.iconbox}>
                  <Banknote strokeWidth={2} color={Colors.white} size={30} />
                </View>
                <View>
                  <Text style={styles.quantityCount}>₹2115</Text>
                  <Text style={styles.quantitytime}>Earned this month</Text>
                </View>
              </View>
              <View
                style={[
                  styles.positionValue,
                  {
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 20,
                  },
                ]}>
                <Text
                  style={[
                    styles.incressValu,
                    {
                      width: width * 0.82,
                      height: 40,
                      textAlign: 'center',
                      lineHeight: 34,
                      borderStyle: 'dashed',
                      borderWidth: 1,
                      borderColor: Colors.sucess,
                    },
                  ]}>
                  See how you can earn upto ₹15999
                </Text>
              </View>
            </View>
          </View> */}

          <View style={[styles.container, {paddingTop: 20}]}>
            <Text style={styles.SectionHeading}>Are you in a new store?</Text>
            <View style={styles.newStoreCard}>
              <TouchableOpacity
                style={styles.listLink}
                onPress={() => navigation.navigate('StockScreen')}>
                <View style={styles.linkIconBox}>
                  <Package strokeWidth={1.8} color={Colors.white} size={18} />
                </View>
                <Text style={styles.listLinkText}>
                  Set up the opening stock of your store
                </Text>
                <Ionicons
                  name="chevron-forward-outline"
                  size={16}
                  color={Colors.gray}
                />
              </TouchableOpacity>
              <Divider
                width={1}
                color={Colors.lightGray}
                style={{borderStyle: 'dashed'}}
              />
              <TouchableOpacity style={styles.listLink}>
                <View style={styles.linkIconBox}>
                  <BookOpen strokeWidth={1.8} color={Colors.white} size={18} />
                </View>
                <Text style={styles.listLinkText}>Check the user manual</Text>
                <Ionicons
                  name="chevron-forward-outline"
                  size={16}
                  color={Colors.gray}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.LinkSection, {paddingVertical: 15}]}>
            <Text
              style={[
                styles.SectionHeading,
                {marginBottom: 10, paddingHorizontal: 20},
              ]}>
              Quick links
            </Text>
            <TouchableOpacity
              style={styles.IconlinkBox}
              onPress={() => navigation.navigate('AddSalesScreen')}>
              <View
                style={[
                  styles.iconbox,
                  {width: 35, height: 35, borderRadius: 10},
                ]}>
                <UserRoundCog strokeWidth={2} color={Colors.white} size={20} />
              </View>
              <Text style={[styles.linkTitle]}>Create Sales Order</Text>
              <View style={[styles.arrobox, {marginLeft: 'auto'}]}>
                <Ionicons
                  name="chevron-forward-outline"
                  size={12}
                  color={Colors.darkButton}
                />
              </View>
            </TouchableOpacity>
            <Divider
              width={1}
              color={Colors.lightGray}
              style={{marginBottom: 10, borderStyle: 'dashed'}}
            />
            <TouchableOpacity
              style={styles.IconlinkBox}
              onPress={() => navigation.navigate('StockScreen')}>
              <View
                style={[
                  styles.iconbox,
                  {width: 35, height: 35, borderRadius: 10},
                ]}>
                <Package strokeWidth={2} color={Colors.white} size={20} />
              </View>
              <Text style={styles.linkTitle}>New Stock Entry</Text>
              <View style={[styles.arrobox, {marginLeft: 'auto'}]}>
                <Ionicons
                  name="chevron-forward-outline"
                  size={12}
                  color={Colors.darkButton}
                />
              </View>
            </TouchableOpacity>
            {/* <Divider
              width={1}
              color={Colors.lightGray}
              style={{marginBottom: 10, borderStyle: 'dashed'}}
            />
            <View style={styles.IconlinkBox}>
              <View
                style={[
                  styles.iconbox,
                  {width: 35, height: 35, borderRadius: 10},
                ]}>
                <FilePenLine strokeWidth={2} color={Colors.white} size={20} />
              </View>
              <Text style={styles.linkTitle}>Stock Requisition</Text>
              <View style={[styles.arrobox, {marginLeft: 'auto'}]}>
                <Ionicons
                  name="chevron-forward-outline"
                  size={12}
                  color={Colors.darkButton}
                />
              </View>
            </View>
            <Divider
              width={1}
              color={Colors.lightGray}
              style={{marginBottom: 10, borderStyle: 'dashed'}}
            />
            <View style={styles.IconlinkBox}>
              <View
                style={[
                  styles.iconbox,
                  {width: 35, height: 35, borderRadius: 10},
                ]}>
                <ChartCandlestick
                  strokeWidth={2}
                  color={Colors.white}
                  size={20}
                />
              </View>
              <Text style={styles.linkTitle}>Stock Taking</Text>
              <View style={[styles.arrobox, {marginLeft: 'auto'}]}>
                <Ionicons
                  name="chevron-forward-outline"
                  size={12}
                  color={Colors.darkButton}
                />
              </View>
            </View>
            <Divider
              width={1}
              color={Colors.lightGray}
              style={{marginBottom: 10, borderStyle: 'dashed'}}
            />
            <View style={styles.IconlinkBox}>
              <View
                style={[
                  styles.iconbox,
                  {width: 35, height: 35, borderRadius: 10},
                ]}>
                <MessageSquareQuote
                  strokeWidth={2}
                  color={Colors.white}
                  size={20}
                />
              </View>
              <Text style={styles.linkTitle}>Feedback</Text>
              <View style={[styles.arrobox, {marginLeft: 'auto'}]}>
                <Ionicons
                  name="chevron-forward-outline"
                  size={12}
                  color={Colors.darkButton}
                />
              </View>
            </View> */}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
    position: 'relative',
    paddingHorizontal: 20,
  },

  //header-box-section css start
  headerSec: {
    backgroundColor: Colors.white,
    minHeight: 200,
    width: '100%',
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
    // iOS Shadow
    shadowColor: '#979797',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 6,

    // Android Shadow
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
    marginHorizontal: 20,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  monthText: {
    fontFamily: Fonts.regular,
    color: Colors.white,
    fontSize: Size.xs,
  },

  linkContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    color: Colors.white,
    gap: 2,
    alignItems: 'flex-start',
    width: '80%',
  },

  paraText: {fontFamily: Fonts.light, color: Colors.white, fontSize: Size.sm},
  storeInfoCard: {
    backgroundColor: Colors.orange,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 3,
    marginTop: 4,
  },
  attendanceLoader: {
    backgroundColor: Colors.orange,
    borderRadius: 12,
    marginTop: 4,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeInfoName: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.white,
    lineHeight: 20,
  },
  storeInfoText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: Colors.white,
    lineHeight: 18,
    opacity: 0.9,
  },
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
  planLink: {
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    padding: 10,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  planLinkText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },

  //header-box-section css end
  //countBox-section css start
  countBoxSection: {
    paddingHorizontal: 20,
    paddingTop: 35,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 17,
    flexDirection: 'row',
  },
  countBox: {
    backgroundColor: Colors.white,
    width: width * 0.43,
    borderRadius: 14,
    padding: 15,
    minHeight: 107,
    shadowColor: '#9F9D9D',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  countBoxIcon: {
    width: 38,
    height: 38,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 10,
    marginBottom: 10,
  },
  countBoxTitle: {
    fontFamily: Fonts.regular,
    color: Colors.darkButton,
    fontSize: Size.sm,
  },
  countBoxDay: {
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
    fontSize: Size.xsmd,
    lineHeight: 18,
  },
  //countBox-section css end

  //target&achivement section css start
  SectionHeading: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  storeCountBadge: {
    backgroundColor: Colors.lightGray,
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  storeCountText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.gray,
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 8,
    shadowColor: '#9F9D9D',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  storeIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.Orangelight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 6,
  },
  storeName: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xxs,
    color: Colors.darkButton,
    lineHeight: 16,
  },
  storeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  storeTime: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.gray,
    lineHeight: 14,
    marginLeft: 4,
    flexShrink: 1,
  },
  hoursChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  hoursChipLabel: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.black,
    lineHeight: 14,
  },
  hoursChipText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xxs,
    color: Colors.orange,
    backgroundColor: Colors.lightOrange,
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  storeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  storeStatusText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
  },
  dataBoxSection: {paddingTop: 15},
  metricRow: {flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 12},
  dataBox: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  positionValue: {display: 'flex', flexDirection: 'row', alignItems: 'center'},
  incressValu: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightSuccess,
    color: Colors.sucess,
    paddingHorizontal: 15,
    paddingVertical: 4,
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    borderRadius: 8,
  },
  quantityCount: {
    fontFamily: Fonts.bold,
    fontSize: Size.md,
    color: Colors.darkButton,
    lineHeight: 22,
  },
  quantitytime: {
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: Colors.darkButton,
    lineHeight: 20,
  },

  decriseValu: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightDenger,
    color: Colors.denger,
    paddingHorizontal: 15,
    paddingVertical: 4,
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    borderRadius: 8,
  },

  //incentive section css start
  incentiveContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  iconbox: {
    width: 38,
    height: 38,
    backgroundColor: Colors.darkButton,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  newStoreCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 30,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: '#9F9D9D',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  listLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingRight: 10,
  },
  linkIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.Orangelight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listLinkText: {
    // flex: 1,
    color: Colors.darkButton,
    fontSize: Size.xs,
    fontFamily: Fonts.medium,
    lineHeight: 18,
  },
  arrobox: {
    width: 20,
    height: 20,
    backgroundColor: '#F0F2F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },

  //incentive section css start
  LinkSection: {backgroundColor: Colors.white},

  IconlinkBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  linkTitle: {
    color: Colors.darkButton,
    fontSize: Size.sm,
    fontFamily: Fonts.medium,
  },
});
