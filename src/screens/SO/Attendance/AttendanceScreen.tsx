/* eslint-disable react-native/no-inline-styles */
import {SafeAreaView, StyleSheet, View} from 'react-native';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {PromoterAppStackParamList} from '../../../types/Navigation';
import PageHeader from '../../../components/ui/PageHeader';
import {Tab, TabView} from '@rneui/themed';
import {Size} from '../../../utils/fontSize';
import {Fonts} from '../../../constants';
import RecentAttendanceScreen from '../../../components/SO/Attendance/RecentAttendanceScreen';
import RecentShiftsScreen from '../../../components/SO/Attendance/RecentShiftsScreen';
import RecentLeaveScreen from '../../../components/SO/Attendance/RecentLeaveScreen';
import {useState} from 'react';

type NavigationProp = NativeStackNavigationProp<
  PromoterAppStackParamList,
  'AttendanceScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const AttendanceScreen = ({navigation}: Props) => {
  const [index, setIndex] = useState(0);

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
              fontSize: Size.xxs,
              fontFamily: Fonts.medium,
              lineHeight: 9,
              paddingHorizontal: 0,
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
              fontSize: Size.xxs,
              fontFamily: Fonts.medium,
              lineHeight: 9,
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
            title="Leave"
            titleStyle={{
              fontSize: Size.xxs,
              fontFamily: Fonts.medium,
              lineHeight: 9,
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
          <RecentAttendanceScreen />
        </TabView.Item>
        <TabView.Item style={{width: '100%', backgroundColor: Colors.lightBg}}>
          <RecentShiftsScreen />
        </TabView.Item>
        <TabView.Item
          style={{width: '100%', flex: 1, backgroundColor: Colors.lightBg}}>
          <RecentLeaveScreen />
        </TabView.Item>
      </TabView>
    </SafeAreaView>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  tabSection: {
    backgroundColor: Colors.orange,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});
