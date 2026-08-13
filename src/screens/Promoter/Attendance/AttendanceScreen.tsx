/* eslint-disable react-native/no-inline-styles */
import {Dimensions, FlatList, SafeAreaView, StyleSheet, Text, View, RefreshControl} from 'react-native';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useState} from 'react';
import {PromoterAppStackParamList} from '../../../types/Navigation';
import PageHeader from '../../../components/ui/PageHeader';
import {Tab, TabView} from '@rneui/themed';
import {Size} from '../../../utils/fontSize';
import {Fonts} from '../../../constants';
import {Funnel, Search} from 'lucide-react-native';
import RecentPromoterAttendanceScreen from '../../../components/Promoter/Attendance/RecentPromoterAttendanceScreen';
import {useGetMonthlyRosterQuery} from '../../../features/base/promoter-base-api';
import {RosterDay} from '../../../types/baseType';
import moment from 'moment';
const {width} = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  PromoterAppStackParamList,
  'AttendanceScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const AttendanceScreen = ({navigation}: Props) => {
  const [index, setIndex] = React.useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const {data: rosterData, refetch: refetchRoster} = useGetMonthlyRosterQuery({
    month: moment().month() + 1,
    year: moment().year(),
  });

  const rosterDays = rosterData?.message?.data?.days || [];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      refetchRoster();
    }, 2000);
  }, []);

  const renderRosterDay = ({item}: {item: RosterDay}) => (
    <View style={styles.atteddanceCard}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.time}>
            {moment(item.date).format('DD MMM YYYY')}
          </Text>
          <Text style={styles.counttext}>{item.shift_label}</Text>
        </View>
        <View
          style={[
            styles.present,
            item.is_split
              ? {backgroundColor: Colors.holdLight}
              : {},
          ]}>
          <Text
            style={{
              color: item.is_split ? Colors.orange : Colors.sucess,
              fontFamily: Fonts.regular,
              fontSize: Size.sm,
            }}>
            {item.shift_label}
          </Text>
        </View>
      </View>
      {item.slots.map((slot, idx) => (
        <View key={idx} style={[styles.cardbody, {marginTop: 8}]}>
          <View>
            <Text style={styles.contentText}>{slot.store_name}</Text>
            <Text style={styles.counttext}>
              {slot.start_time} - {slot.end_time}
            </Text>
            <Text style={styles.counttext}>{slot.shift_type}</Text>
          </View>
        </View>
      ))}
    </View>
  );

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
          <RecentPromoterAttendanceScreen navigation={navigation} />
        </TabView.Item>

        <TabView.Item style={{width: '100%', backgroundColor: Colors.lightBg}}>
          <View style={styles.container}>
            <FlatList
              data={rosterDays}
              keyExtractor={item => item.date}
              renderItem={renderRosterDay}
              contentContainerStyle={{paddingBottom: 30, paddingTop: 10}}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={
                <View style={{padding: 20, alignItems: 'center'}}>
                  <Text style={styles.counttext}>No shifts scheduled</Text>
                </View>
              }
            />
          </View>
        </TabView.Item>
      </TabView>
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
