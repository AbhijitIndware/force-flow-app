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
import {Fonts} from '../../../constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Size} from '../../../utils/fontSize';
import {Divider} from '@rneui/themed';
import {
  Banknote,
  CalendarCheck,
  CalendarCheck2,
  ChartCandlestick,
  FilePenLine,
  MessageSquareQuote,
  MoveDown,
  MoveUp,
  Network,
  Package,
  UserRoundCog,
} from 'lucide-react-native';
import {usePromoterStatusQuery} from '../../../features/base/promoter-base-api';
import {useAppSelector} from '../../../store/hook';
import {AttendanceData} from '../../../types/baseType';
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

const getLastCheckMessage = (data: AttendanceData) => {
  const {actions, checkin_records} = data;

  const checkInTime = checkin_records.check_in
    ? moment(checkin_records.check_in).format('hh:mm A')
    : null;

  const checkOutTime = checkin_records.check_out
    ? moment(checkin_records.check_out).format('hh:mm A')
    : null;

  if (actions.can_check_in) {
    if (checkInTime) return `Last check-in at ${checkInTime}.`;
    return "You haven't checked in yet.";
  }

  if (checkOutTime) return `Last check-out at ${checkOutTime}.`;

  return 'No attendance records yet.';
};

const formatDay = (date: string) => moment(date).format('DD');
const formatMonth = (date: string) => moment(date).format('MMM').toUpperCase();

const HomeScreen = ({navigation, route}: Props) => {
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const {data} = usePromoterStatusQuery();
  const user = useAppSelector(
    state => state?.persistedReducer?.authSlice?.user,
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
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
            <View style={styles.welcomBox}>
              <Text style={styles.welcomeText}>
                Hello <Text style={styles.name}>{user?.full_name}</Text>
              </Text>
              <TouchableOpacity
                style={styles.linkBox}
                onPress={() => navigation.navigate('AttendanceScreen')}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateText}>
                    {formatDay(data?.message?.data?.attendance_date as string)}
                  </Text>

                  <Text style={styles.monthText}>
                    {formatMonth(
                      data?.message?.data?.attendance_date as string,
                    )}
                  </Text>
                </View>

                <View style={styles.linkContent}>
                  <Text style={styles.paraText}>
                    {data?.message?.data &&
                      getLastCheckMessage(data?.message?.data!)}
                  </Text>

                  <Ionicons
                    name="chevron-forward-circle-sharp"
                    size={24}
                    color={Colors.white}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {data?.message?.data?.actions?.can_check_in ? (
              <TouchableOpacity
                style={styles.checkinButton}
                onPress={() => navigation.navigate('CheckingScreen')}>
                <CalendarCheck strokeWidth={1.4} color={Colors.white} />
                <Text style={styles.checkinButtonText}>Check-in</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.checkinButton}
                onPress={() => navigation.navigate('CheckOutScreen')}>
                <CalendarCheck strokeWidth={1.4} color={Colors.white} />
                <Text style={styles.checkinButtonText}>Check-out</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.countBoxSection}>
            <View style={styles.countBox}>
              <View style={styles.countBoxIcon}>
                <CalendarCheck2 strokeWidth={1.4} color={Colors.white} />
              </View>
              <Text style={styles.countBoxTitle}>Attendance</Text>
              <Text style={styles.countBoxDay}>0Days</Text>
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
                {backgroundColor: Colors.orange, padding: 7, borderRadius: 18},
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
          </View>

          <View style={[styles.container, {paddingTop: 20}]}>
            <Text style={styles.SectionHeading}>
              Target vs Achievement{' '}
              <Text style={{fontFamily: Fonts.regular}}>(Qty)</Text>
            </Text>
            <View style={styles.dataBoxSection}>
              <View style={styles.dataBox}>
                <View>
                  <Text style={styles.quantityCount}>25 / 11</Text>
                  <Text style={styles.quantitytime}>Daily quantity</Text>
                </View>
                <View style={styles.positionValue}>
                  <MoveUp strokeWidth={2} color={Colors.darkButton} />
                  <Text style={styles.incressValu}>+3%</Text>
                </View>
              </View>
              <View style={styles.dataBox}>
                <View>
                  <Text style={styles.quantityCount}>375 / 221</Text>
                  <Text style={styles.quantitytime}>Monthly quantity</Text>
                </View>
                <View style={styles.positionValue}>
                  <MoveDown strokeWidth={2} color={Colors.darkButton} />
                  <Text style={styles.decriseValu}>-2%</Text>
                </View>
              </View>
              <View style={styles.dataBox}>
                <View>
                  <Text style={styles.quantityCount}>2230 / 1224</Text>
                  <Text style={styles.quantitytime}>Quartely quantity</Text>
                </View>
                <View style={styles.positionValue}>
                  <MoveDown strokeWidth={2} color={Colors.darkButton} />
                  <Text style={styles.decriseValu}>-2%</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.container, {paddingTop: 20}]}>
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
          </View>
          <View style={[styles.container, {paddingTop: 20}]}>
            <Text style={styles.SectionHeading}>Are you in a new store?</Text>
            <View
              style={{
                backgroundColor: Colors.white,
                borderRadius: 20,
                paddingVertical: 20,
                marginBottom: 30,
              }}>
              <TouchableOpacity style={styles.listLink}>
                <Text style={styles.listLinkText}>
                  Set up the opening stock of your store
                </Text>
                <View style={styles.arrobox}>
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
                style={{borderStyle: 'dashed'}}
              />
              <TouchableOpacity style={styles.listLink}>
                <Text style={styles.listLinkText}>Check the user manual </Text>
                <View style={styles.arrobox}>
                  <Ionicons
                    name="chevron-forward-outline"
                    size={12}
                    color={Colors.darkButton}
                  />
                </View>
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
            <View style={styles.IconlinkBox}>
              <View
                style={[
                  styles.iconbox,
                  {width: 35, height: 35, borderRadius: 10},
                ]}>
                <UserRoundCog strokeWidth={2} color={Colors.white} size={20} />
              </View>
              <Text style={[styles.linkTitle]}>Register Sales</Text>
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
            </View>
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
    paddingHorizontal: 20,
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
    // iOS Shadow
    shadowColor: '#979797',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 6,

    // Android Shadow
    elevation: 2,
  },
  welcomeText: {
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
  },

  linkBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: Colors.Orangelight,
    borderRadius: 15,
    padding: 12,
    marginTop: 8,
    gap: 10,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#FFBF83',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: Colors.white,
    gap: 5,
    alignItems: 'center',
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
    bottom: -15,
    gap: 5,
  },
  checkinButtonText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.white,
    lineHeight: 22,
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
    borderRadius: 15,
    padding: 15,
    minHeight: 107,
  },
  countBoxIcon: {
    width: 45,
    height: 45,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 100,
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
    fontSize: Size.md,
    color: Colors.darkButton,
  },
  dataBoxSection: {paddingTop: 15},
  dataBox: {
    backgroundColor: Colors.white,
    borderRadius: 18,
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
    width: 60,
    height: 60,
    backgroundColor: Colors.darkButton,
    borderRadius: 18,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  listLink: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width * 0.9,
  },
  listLinkText: {
    color: Colors.darkButton,
    fontSize: Size.sm,
    fontFamily: Fonts.regular,
  },
  arrobox: {
    width: 20,
    height: 20,
    backgroundColor: '#F0F2F6',
    display: 'flex',
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
