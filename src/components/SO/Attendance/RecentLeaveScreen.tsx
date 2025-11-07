/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
  Dimensions,
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
  CalendarCheck,
  Clock2,
  FileCheck,
  FilePen,
  FileX,
  Funnel,
  Search,
} from 'lucide-react-native';
import {FlatList} from 'react-native';
import {windowHeight} from '../../../utils/utils';
import {useGetAttendanceQuery} from '../../../features/base/base-api';

const {width} = Dimensions.get('window');
const PAGE_SIZE = 10;
const DATA: any = [];

const RecentLeaveScreen = ({navigation}: any) => {
  const [page, setPage] = useState<number>(1);
  const [leave, setLeave] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const {data, isUninitialized, refetch, isFetching} = useGetAttendanceQuery(
    {
      page,
      page_size: PAGE_SIZE,
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  // append new data when page changes
  useEffect(() => {
    if (data?.message?.records) {
      // setLeave(prev => {
      //   const map = new Map();
      //   [...prev, ...data.message.records].forEach(item => {
      //     map.set(item.name, item);
      //   });
      //   return Array.from(map.values());
      // });
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
      data?.message?.pagination?.page < data?.message?.pagination?.total_pages
    ) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <View style={[styles.container]}>
      <View style={styles.counterSection}>
        <View style={styles.countCard}>
          <View>
            <View style={[styles.boxIcon, {backgroundColor: Colors.lightBlue}]}>
              <FilePen size={22} color={Colors.blue} />
            </View>
          </View>
          <View style={styles.countBox}>
            <Text style={styles.countNumber}>0</Text>
            <Text style={styles.counttext}>Applied</Text>
          </View>
        </View>
        <View style={styles.countCard}>
          <View>
            <View>
              <View style={styles.boxIcon}>
                <FileCheck size={22} color={Colors.sucess} />
              </View>
            </View>
          </View>
          <View style={styles.countBox}>
            <Text style={styles.countNumber}>0</Text>
            <Text style={styles.counttext}>Approved</Text>
          </View>
        </View>
        <View style={styles.countCard}>
          <View>
            <View
              style={[styles.boxIcon, {backgroundColor: Colors.lightDenger}]}>
              <FileX size={22} color={Colors.denger} />
            </View>
          </View>
          <View style={styles.countBox}>
            <Text style={styles.countNumber}>0</Text>
            <Text style={styles.counttext}>Rejected</Text>
          </View>
        </View>
      </View>
      <View style={[styles.bodyContent, {paddingBottom: 100}]}>
        <View style={styles.bodyHeader}>
          <Text style={styles.bodyHeaderTitle}>Recent Leave</Text>
          <View style={styles.bodyHeaderIcon}>
            <Search size={20} color="#4A4A4A" strokeWidth={1.7} />
            <Funnel size={20} color="#4A4A4A" strokeWidth={1.7} />
          </View>
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
          ) : leave.length === 0 ? (
            <View
              style={{
                height: windowHeight * 0.5,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{fontSize: 16, color: 'gray'}}>
                No Recent Leave Found
              </Text>
            </View>
          ) : (
            <FlatList
              data={leave}
              nestedScrollEnabled={true}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              renderItem={AttendanceCard}
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

        <TouchableOpacity
          style={styles.checkinButton}
          onPress={() => navigation.navigate('AttendanceScreen')}>
          <CalendarCheck strokeWidth={1.4} color={Colors.white} />
          <Text style={styles.checkinButtonText}>Apply for Leave</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RecentLeaveScreen;

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
});

const AttendanceCard = ({time, title, status, date, month, storeName}: any) => (
  <View style={styles.atteddanceCard}>
    <View style={styles.cardHeader}>
      <View style={styles.timeSection}>
        <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
        <Text style={styles.time}> In Time: 11:03:45 AM</Text>
      </View>
      <Text style={styles.present}>Approved</Text>
    </View>
    <View style={styles.cardbody}>
      <View style={styles.dateBox}>
        <Text style={styles.dateText}>19</Text>
        <Text style={styles.monthText}>APR</Text>
      </View>
      <View>
        <Text style={styles.contentText}>Store name</Text>
        <Text style={styles.contentText}>Accestisa new mart</Text>
      </View>
    </View>
  </View>
);
