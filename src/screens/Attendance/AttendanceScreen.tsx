/* eslint-disable react-native/no-inline-styles */
import {RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text} from 'react-native';
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
            backgroundColor:Colors.lightBg,
          },
        ]}>
          <PageHeader title="Attendance" navigation={()=>navigation.goBack()}/>
        {refreshing ? (
          <LoadingScreen />
        ) : (
          <ScrollView
            nestedScrollEnabled={true}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
              <Text style={styles.container}>djhfdxbnkhk</Text>
          </ScrollView>
        )}
      </SafeAreaView>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({

 container: {
    flex:1,
    backgroundColor:Colors.transparent,
    position:'relative',
    paddingHorizontal:20,
  },

});
