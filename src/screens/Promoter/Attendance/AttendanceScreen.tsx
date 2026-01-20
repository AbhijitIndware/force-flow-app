/* eslint-disable react-native/no-inline-styles */
import {
  Dimensions,
  FlatList,
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
import {Tab, TabView} from '@rneui/themed';
import {Size} from '../../../utils/fontSize';
import {Fonts} from '../../../constants';
// import { Fonts } from '../../constants';
import {
  AlarmClockMinus,
  CalendarCheck,
  Clock2,
  Funnel,
  Search,
  UserRoundCheck,
  UserRoundX,
} from 'lucide-react-native';
import {useGetAttendanceHistoryQuery} from '../../../features/base/promoter-base-api';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import { Size } from '../../utils/fontSize';

const {width} = Dimensions.get('window');
//const { height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  PromoterAppStackParamList,
  'AttendanceScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

type ItemProps = {
  title: string;
  storeName: string;
  time: string;
  date: string;
  month: string;
  status: string;
};

const AttendanceCard = ({
  time,
  title,
  status,
  date,
  month,
  storeName,
}: ItemProps) => (
  <View style={styles.atteddanceCard}>
    <View style={styles.cardHeader}>
      <View style={styles.timeSection}>
        <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
        <Text style={styles.time}> {time}</Text>
      </View>
      <Text style={styles.present}>{status}</Text>
      {/* <Text style={styles.lateEntry}>Present</Text>
      <Text style={styles.leave}>Present</Text>
      <Text style={styles.absent}>Present</Text> */}
    </View>
    <View style={styles.cardbody}>
      <View style={styles.dateBox}>
        <Text style={styles.dateText}>{date}</Text>
        <Text style={styles.monthText}>{month}</Text>
      </View>
      <View>
        <Text style={styles.contentText}>{storeName}</Text>
        <Text style={styles.contentText}>{title}</Text>
        <View style={styles.timeSection}>
          <Clock2 size={14} color="#4A4A4A" strokeWidth={2} />
          <Text style={styles.time}>Shift Time: 11:03:45 AM</Text>
        </View>
      </View>
    </View>
  </View>
);

const AttendanceScreen = ({navigation}: Props) => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [index, setIndex] = React.useState(0);

  const {
    data: attendanceHistory,
    isLoading,
    isFetching,
    refetch,
  } = useGetAttendanceHistoryQuery({
    page: 1,
    page_size: 20,
    from_date: '2026-01-01',
    to_date: '2026-01-31',
  });
  console.log('🚀 ~ AttendanceScreen ~ attendanceHistory:', attendanceHistory);

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
      <PageHeader
        title="Attendance & Shifts"
        navigation={() => navigation.goBack()}
      />
      {refreshing ? (
        <LoadingScreen />
      ) : (
        <>
          <View style={styles.tabSection}>
            <Tab
              value={index}
              onChange={e => setIndex(e)}
              indicatorStyle={{
                height: 0,
              }}
              variant="primary"
              style={{backgroundColor: Colors.transparent, padding: 0}}>
              <Tab.Item
                title="Attendance"
                titleStyle={{
                  fontSize: Size.xs,
                  fontFamily: Fonts.medium,
                  lineHeight: 6,
                }}
                containerStyle={active => ({
                  backgroundColor: active ? Colors.Orangelight : undefined,
                  borderRadius: active ? 10 : undefined,
                  borderColor: active ? '#FFBF83' : undefined,
                  borderTopWidth: active ? 1 : undefined,
                  borderLeftWidth: active ? 1 : undefined,
                  borderRightWidth: active ? 1 : undefined,
                })}
              />
              <Tab.Item
                title="Shifts"
                titleStyle={{
                  fontSize: Size.xs,
                  fontFamily: Fonts.medium,
                  lineHeight: 6,
                }}
                containerStyle={active => ({
                  backgroundColor: active ? Colors.Orangelight : undefined,
                  borderRadius: active ? 10 : undefined,
                  borderColor: active ? '#FFBF83' : undefined,
                  borderTopWidth: active ? 1 : undefined,
                  borderLeftWidth: active ? 1 : undefined,
                  borderRightWidth: active ? 1 : undefined,
                })}
              />
            </Tab>
          </View>
          <TabView value={index} onChange={setIndex} animationType="spring">
            <TabView.Item
              style={{width: '100%', flex: 1, backgroundColor: Colors.lightBg}}>
              <View style={[styles.container]}>
                <View style={styles.counterSection}>
                  <View style={styles.countCard}>
                    <View>
                      <View style={styles.boxIcon}>
                        <UserRoundCheck size={22} color={Colors.sucess} />
                      </View>
                    </View>
                    <View style={styles.countBox}>
                      <Text style={styles.countNumber}>21</Text>
                      <Text style={styles.counttext}>Present</Text>
                    </View>
                  </View>
                  <View style={styles.countCard}>
                    <View>
                      <View
                        style={[
                          styles.boxIcon,
                          {backgroundColor: Colors.lightDenger},
                        ]}>
                        <UserRoundX size={22} color={Colors.denger} />
                      </View>
                    </View>
                    <View style={styles.countBox}>
                      <Text style={styles.countNumber}>02</Text>
                      <Text style={styles.counttext}>Absent</Text>
                    </View>
                  </View>
                  <View style={styles.countCard}>
                    <View>
                      <View
                        style={[
                          styles.boxIcon,
                          {backgroundColor: Colors.holdLight},
                        ]}>
                        <AlarmClockMinus size={22} color={Colors.orange} />
                      </View>
                    </View>
                    <View style={styles.countBox}>
                      <Text style={styles.countNumber}>03</Text>
                      <Text style={styles.counttext}> Late entry</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.bodyContent}>
                  <View style={styles.bodyHeader}>
                    <Text style={styles.bodyHeaderTitle}>
                      Recent Attendance
                    </Text>
                    <View style={styles.bodyHeaderIcon}>
                      <Search size={20} color="#4A4A4A" strokeWidth={1.7} />
                      <Funnel size={20} color="#4A4A4A" strokeWidth={1.7} />
                    </View>
                  </View>
                  {/* card section start here */}

                  <ScrollView
                    nestedScrollEnabled={true}
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                      />
                    }>
                    <View style={styles.atteddanceCard}>
                      <View style={styles.cardHeader}>
                        <View style={styles.timeSection}>
                          <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
                          <Text style={styles.time}> In Time: 11:03:45 AM</Text>
                        </View>
                        <Text style={styles.present}>Present</Text>
                        {/* <Text style={styles.lateEntry}>Present</Text>
                          <Text style={styles.leave}>Present</Text>
                          <Text style={styles.absent}>Present</Text> */}
                      </View>
                      <View style={styles.cardbody}>
                        <View style={styles.dateBox}>
                          <Text style={styles.dateText}>19</Text>
                          <Text style={styles.monthText}>APR</Text>
                        </View>
                        <View>
                          <Text style={styles.contentText}>Store name</Text>
                          <Text style={styles.contentText}>
                            Accestisa new mart
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.atteddanceCard}>
                      <View style={styles.cardHeader}>
                        <View style={styles.timeSection}>
                          <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
                          <Text style={styles.time}> In Time: 11:03:45 AM</Text>
                        </View>
                        <Text style={styles.lateEntry}>Late entry</Text>
                        {/* <Text style={styles.present}>Present</Text>
                          <Text style={styles.leave}>Present</Text>
                          <Text style={styles.absent}>Present</Text> */}
                      </View>
                      <View style={styles.cardbody}>
                        <View style={styles.dateBox}>
                          <Text style={styles.dateText}>19</Text>
                          <Text style={styles.monthText}>APR</Text>
                        </View>
                        <View>
                          <Text style={styles.contentText}>Store name</Text>
                          <Text style={styles.contentText}>
                            Accestisa new mart
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.atteddanceCard}>
                      <View style={styles.cardHeader}>
                        <View style={styles.timeSection}>
                          <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
                          <Text style={styles.time}> In Time: 11:03:45 AM</Text>
                        </View>
                        <Text style={styles.leave}>Leave</Text>
                        {/* <Text style={styles.lateEntry}>Present</Text>
                          <Text style={styles.leave}>Present</Text>
                          <Text style={styles.absent}>Present</Text> */}
                      </View>
                      <View style={styles.cardbody}>
                        <View style={styles.dateBox}>
                          <Text style={styles.dateText}>19</Text>
                          <Text style={styles.monthText}>APR</Text>
                        </View>
                        <View>
                          <Text style={styles.contentText}>Store name</Text>
                          <Text style={styles.contentText}>
                            Accestisa new mart
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.atteddanceCard}>
                      <View style={styles.cardHeader}>
                        <View style={styles.timeSection}>
                          <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
                          <Text style={styles.time}> In Time: 11:03:45 AM</Text>
                        </View>
                        <Text style={styles.absent}>Absent</Text>
                        {/* <Text style={styles.lateEntry}>Present</Text>
                          <Text style={styles.leave}>Present</Text>
                          <Text style={styles.absent}>Present</Text> */}
                      </View>
                      <View style={styles.cardbody}>
                        <View style={styles.dateBox}>
                          <Text style={styles.dateText}>19</Text>
                          <Text style={styles.monthText}>APR</Text>
                        </View>
                        <View>
                          <Text style={styles.contentText}>Store name</Text>
                          <Text style={styles.contentText}>
                            Accestisa new mart
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.atteddanceCard}>
                      <View style={styles.cardHeader}>
                        <View style={styles.timeSection}>
                          <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
                          <Text style={styles.time}> In Time: 11:03:45 AM</Text>
                        </View>
                        <Text style={styles.present}>Present</Text>
                        {/* <Text style={styles.lateEntry}>Present</Text>
                          <Text style={styles.leave}>Present</Text>
                          <Text style={styles.absent}>Present</Text> */}
                      </View>
                      <View style={styles.cardbody}>
                        <View style={styles.dateBox}>
                          <Text style={styles.dateText}>19</Text>
                          <Text style={styles.monthText}>APR</Text>
                        </View>
                        <View>
                          <Text style={styles.contentText}>Store name</Text>
                          <Text style={styles.contentText}>
                            Accestisa new mart
                          </Text>
                        </View>
                      </View>
                    </View>
                  </ScrollView>

                  <TouchableOpacity
                    style={styles.checkinButton}
                    onPress={() => navigation.navigate('AttendanceScreen')}>
                    <CalendarCheck strokeWidth={1.4} color={Colors.white} />
                    <Text style={styles.checkinButtonText}>Check-in</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TabView.Item>

            <TabView.Item
              style={{width: '100%', backgroundColor: Colors.lightBg}}>
              <View style={styles.container}>
                <View
                  style={[
                    styles.bodyContent,
                    {paddingTop: 15, paddingBottom: 30},
                  ]}>
                  <View style={styles.bodyHeader}>
                    <Text style={styles.bodyHeaderTitle}>
                      Recent Attendance
                    </Text>
                    <View style={styles.bodyHeaderIcon}>
                      <Search size={20} color="#4A4A4A" strokeWidth={1.7} />
                      <Funnel size={20} color="#4A4A4A" strokeWidth={1.7} />
                    </View>
                  </View>
                  {/* card section start here */}
                  {/* <FlatList
                    data={[]}
                    renderItem={({item}) => (
                      <AttendanceCard
                        time={item.time}
                        status={item.status}
                        title={item.title}
                        storeName={item.storename}
                        date={item.date}
                        month={item.month}
                      />
                    )}
                    keyExtractor={item => item.id}
                  /> */}
                </View>
              </View>
            </TabView.Item>
          </TabView>
        </>
      )}
    </SafeAreaView>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
    position: 'relative',
    paddingHorizontal: 20,
  },
  tabSection: {
    backgroundColor: Colors.orange,
    paddingHorizontal: 20,
    paddingVertical: 8,
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

  //countCard section css
  counterSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 20,
  },
  countCard: {
    width: width * 0.29,
    minHeight: 100,
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 15,
  },
  boxIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: Colors.lightSuccess,
    marginLeft: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBox: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 4,
  },
  countNumber: {
    color: Colors.darkButton,
    fontFamily: Fonts.semiBold,
    fontSize: Size.xslg,
    lineHeight: 25,
  },
  counttext: {
    color: Colors.darkButton,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    lineHeight: 18,
  },

  //bodyContent section css
  bodyContent: {flex: 1, paddingBottom: 100},
  bodyHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E4E9',
  },
  bodyHeaderTitle: {
    color: Colors.darkButton,
    fontFamily: Fonts.semiBold,
    fontSize: Size.xsmd,
    lineHeight: 20,
  },
  bodyHeaderIcon: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
  },

  //atteddanceCard section css
  atteddanceCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 10,
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
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

  present: {
    backgroundColor: Colors.lightSuccess,
    color: Colors.sucess,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    lineHeight: 18,
    padding: 8,
    borderRadius: 50,
    paddingHorizontal: 15,
  },

  lateEntry: {
    backgroundColor: Colors.holdLight,
    color: Colors.orange,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    lineHeight: 18,
    padding: 8,
    borderRadius: 50,
    paddingHorizontal: 15,
  },

  leave: {
    backgroundColor: Colors.lightBlue,
    color: Colors.blue,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    lineHeight: 18,
    padding: 8,
    borderRadius: 50,
    paddingHorizontal: 15,
  },
  absent: {
    backgroundColor: Colors.lightDenger,
    color: Colors.denger,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    lineHeight: 18,
    padding: 8,
    borderRadius: 50,
    paddingHorizontal: 15,
  },

  cardbody: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
  },
  dateBox: {
    width: 50,
    height: 50,
    borderColor: Colors.darkButton,
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
    color: Colors.darkButton,
    padding: 0,
    margin: 0,
    lineHeight: 18,
  },
  monthText: {
    fontFamily: Fonts.regular,
    color: Colors.darkButton,
    fontSize: Size.xs,
  },
  contentText: {
    fontFamily: Fonts.regular,
    color: Colors.darkButton,
    fontSize: Size.sm,
    lineHeight: 20,
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
    position: 'absolute',
    bottom: 30,
    gap: 5,
    zIndex: 1,
    width: width * 0.9,
  },
  checkinButtonText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.white,
    lineHeight: 22,
  },
});
