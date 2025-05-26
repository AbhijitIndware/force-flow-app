/* eslint-disable react-native/no-inline-styles */
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import {flexCol} from '../../utils/styles';
import {Colors} from '../../utils/colors';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LoadingScreen from '../../components/ui/LoadingScreen';
import React, {useCallback, useState} from 'react';
import {AppStackParamList} from '../../types/Navigation';
import PageHeader from '../../components/ui/PageHeader';
// import { Fonts } from '../../constants';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import { Size } from '../../utils/fontSize';
import {CheckBox} from '@rneui/themed';
import {View} from 'react-native';

// const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  'AttendanceScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const AttendanceScreen = ({navigation}: Props) => {
  const [refreshing, setRefreshing] = useState<boolean>(false);

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
      <PageHeader title="Attendance" navigation={() => navigation.goBack()} />
      {refreshing ? (
        <LoadingScreen />
      ) : (
        <ScrollView
          nestedScrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <Text style={styles.container}>djhfdxbnkhk</Text>
          <Test />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

function Test() {
  const [selectedIndex, setIndex] = React.useState(0);

  return (
    <View>
      <CheckBox
        checked={selectedIndex === 0}
        onPress={() => setIndex(0)}
        checkedIcon="dot-circle-o"
        uncheckedIcon="circle-o"
      />
      <CheckBox
        checked={selectedIndex === 1}
        onPress={() => setIndex(1)}
        checkedIcon="dot-circle-o"
        uncheckedIcon="circle-o"
      />
    </View>
  );
}

export default AttendanceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
    position: 'relative',
    paddingHorizontal: 20,
  },
});
