/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Colors} from '../../../utils/colors';
import React, {useCallback, useEffect, useState} from 'react';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {
  AlarmClockMinus,
  CalendarCheck,
  Clock2,
  Funnel,
  Search,
  UserRoundCheck,
  UserRoundX,
} from 'lucide-react-native';
import {FlatList} from 'react-native';
import {windowHeight} from '../../../utils/utils';
import {PromoterAttendanceRecord} from '../../../types/baseType';
import moment from 'moment';
import {useGetAttendanceHistoryQuery} from '../../../features/base/promoter-base-api';
import DateTimePicker from 'react-native-modal-datetime-picker';
import {useAppSelector} from '../../../store/hook';

const {width} = Dimensions.get('window');
const PAGE_SIZE = 10;

const RecentPromoterAttendanceScreen = ({navigation}: any) => {
  const [page, setPage] = useState<number>(1);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filterVisible, setFilterVisible] = useState(false);

  const [fromDate, setFromDate] = useState<Date>(new Date('2026-01-01'));
  const [toDate, setToDate] = useState<Date>(new Date('2026-01-31'));

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const promoterStatus = useAppSelector(
    state => state?.persistedReducer?.promoterSlice?.promoterStatus,
  );

  const {data, isLoading, isUninitialized, isFetching, refetch} =
    useGetAttendanceHistoryQuery({
      page,
      page_size: PAGE_SIZE,
      from_date: moment(fromDate).format('YYYY-MM-DD'),
      to_date: moment(toDate).format('YYYY-MM-DD'),
    });
  console.log('🚀 ~ RecentPromoterAttendanceScreen ~ data:', data);

  // append new data when page changes
  useEffect(() => {
    if (data?.message?.data?.records) {
      setAttendance(prev => {
        const map = new Map();
        [...prev, ...data?.message?.data?.records].forEach(item => {
          map.set(item.name, item);
        });
        return Array.from(map.values());
      });
    }
  }, [data]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      if (!isUninitialized) refetch();
    }, 2000);
  }, []);

  const loadMore = () => {
    if (
      !isFetching &&
      data?.message &&
      data?.message?.data?.pagination?.page <
        data?.message?.data?.pagination?.total_pages
    ) {
      setPage(prev => prev + 1);
    }
  };

  const renderItem = ({item}: {item: PromoterAttendanceRecord}) => {
    const inTime = item.checkin_time
      ? moment(item.checkin_time, 'H:mm:ss.SSSSSS').format('hh:mm A')
      : '--';

    return (
      <View style={styles.atteddanceCard}>
        <View style={styles.cardHeader}>
          <View style={styles.timeSection}>
            <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
            <Text style={styles.time}> In Time: {inTime}</Text>
          </View>

          <Text
            style={[
              item.status === 'Checked Out' ? styles.present : styles.absent,
            ]}>
            {item.status}
          </Text>
        </View>

        <View style={styles.cardbody}>
          <View style={styles.dateBox}>
            <Text style={styles.dateText}>
              {moment(item.attendance_date).date()}
            </Text>
            <Text style={styles.monthText}>
              {moment(item.attendance_date).format('MMM')}
            </Text>
          </View>

          <View>
            <Text style={styles.contentText}>Employee name</Text>
            <Text style={styles.contentText}>
              {data?.message?.data?.employee_name}
            </Text>

            <Text style={styles.contentText}>Store: {item.store_name}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container]}>
      <View style={styles.counterSection}>
        <View style={styles.countCard}>
          <View>
            <View style={styles.boxIcon}>
              <UserRoundCheck size={22} color={Colors.sucess} />
            </View>
          </View>
          <View style={styles.countBox}>
            <Text style={styles.countNumber}>0</Text>
            <Text style={styles.counttext}>Present</Text>
          </View>
        </View>
        <View style={styles.countCard}>
          <View>
            <View
              style={[styles.boxIcon, {backgroundColor: Colors.lightDenger}]}>
              <UserRoundX size={22} color={Colors.denger} />
            </View>
          </View>
          <View style={styles.countBox}>
            <Text style={styles.countNumber}>0</Text>
            <Text style={styles.counttext}>Absent</Text>
          </View>
        </View>
        <View style={styles.countCard}>
          <View>
            <View style={[styles.boxIcon, {backgroundColor: Colors.holdLight}]}>
              <AlarmClockMinus size={22} color={Colors.orange} />
            </View>
          </View>
          <View style={styles.countBox}>
            <Text style={styles.countNumber}>0</Text>
            <Text style={styles.counttext}> Late entry</Text>
          </View>
        </View>
      </View>
      <View style={styles.bodyContent}>
        <View style={styles.bodyHeader}>
          <Text style={styles.bodyHeaderTitle}>Recent Attendance</Text>
          <View style={styles.bodyHeaderIcon}>
            {/* <Search size={20} color="#4A4A4A" strokeWidth={1.7} /> */}
            <TouchableOpacity onPress={() => setFilterVisible(true)}>
              <Funnel size={20} color="#4A4A4A" strokeWidth={1.7} />
            </TouchableOpacity>
          </View>
          <Modal
            visible={filterVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setFilterVisible(false)}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.4)',
                justifyContent: 'flex-end',
              }}>
              <View
                style={{
                  backgroundColor: '#fff',
                  padding: 20,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}>
                <Text
                  style={{fontSize: 18, fontWeight: '800', marginBottom: 15}}>
                  Filter Attendance
                </Text>

                {/* FROM DATE */}
                <View style={styles.dateField}>
                  <Text style={styles.dateLabel}>From Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowFromPicker(true)}
                    style={styles.dateInput}>
                    <Text style={styles.dateValue}>
                      {moment(fromDate).format('DD MMM YYYY')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* TO DATE */}
                <View style={styles.dateField}>
                  <Text style={styles.dateLabel}>To Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowToPicker(true)}
                    style={styles.dateInput}>
                    <Text style={styles.dateValue}>
                      {moment(toDate).format('DD MMM YYYY')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* ACTION BUTTONS */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    marginTop: 20,
                  }}>
                  <TouchableOpacity
                    onPress={() => setFilterVisible(false)}
                    style={{marginRight: 15}}>
                    <Text style={{color: 'gray'}}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setPage(1);
                      setAttendance([]);
                      refetch();
                      setFilterVisible(false);
                    }}>
                    <Text style={{color: Colors.primary, fontWeight: '600'}}>
                      Apply
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          {showFromPicker && (
            <DateTimePicker
              isVisible={showFromPicker}
              mode="date"
              date={fromDate}
              onConfirm={(date: Date) => {
                setFromDate(date);
                setShowFromPicker(false);
              }}
              onCancel={() => setShowFromPicker(false)}
            />
          )}

          {showToPicker && (
            <DateTimePicker
              isVisible={showToPicker}
              mode="date"
              date={toDate}
              onConfirm={(date: Date) => {
                setToDate(date);
                setShowToPicker(false);
              }}
              onCancel={() => setShowToPicker(false)}
            />
          )}
        </View>
        {/* card section start here */}

        <View
          style={{
            flex: 1,
            backgroundColor: Colors.lightBg,
          }}>
          {isFetching && page === 1 ? (
            <View
              style={{
                height: windowHeight * 0.5,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ActivityIndicator size="large" />
            </View>
          ) : attendance.length === 0 ? (
            <View
              style={{
                height: windowHeight * 0.5,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{fontSize: 16, color: 'gray'}}>
                No Recent Attendance Found
              </Text>
            </View>
          ) : (
            <FlatList
              data={attendance}
              nestedScrollEnabled={true}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              renderItem={renderItem}
              keyExtractor={(item, index) => `${item?.name}-${index}`}
              showsVerticalScrollIndicator={false}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isFetching ? <ActivityIndicator size="small" /> : null
              }
            />
          )}
        </View>
        {promoterStatus?.actions?.can_check_in ? (
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
    </View>
  );
};

export default RecentPromoterAttendanceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
    position: 'relative',
    paddingHorizontal: 20,
  },
  tabSection: {
    backgroundColor: Colors.orange,
    paddingHorizontal: 10,
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
  bodyContent: {flex: 1, paddingBottom: 20},
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
  dateInput: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
  },
  dateField: {
    marginBottom: 12,
  },

  dateLabel: {
    fontSize: 14,
    color: '#000',
    marginBottom: 6,
  },

  dateValue: {
    fontSize: 15,
    color: '#111',
  },
});
