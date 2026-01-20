import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../HomeScreen/HomeScreen';
import AttendanceScreen from '../Attendance/AttendanceScreen';
import Home from '../HomeScreen/Home';
import {PromoterAppStackParamList} from '../../../types/Navigation';
import SalesScreen from '../Sales/Sales';
import StockScreen from '../Stock/Stock';
import IncentiveScreen from '../Incentive/Incentive';
import DownloadScreen from '../DownloadScreen/DownloadScreen';
import ProductFeedbackScreen from '../ProductFeedbackScreen/ProductfeedbackScreen';
import ProfileScreen from '../ProfileScreen/ProfileScreen';
import CheckingScreen from '../CheckingScreen/CheckingScreen';
import CheckOutScreen from '../CheckingScreen/CheckOutScreen';
import AddSalesScreen from '../Sales/AddSales';

const Stack = createNativeStackNavigator<PromoterAppStackParamList>();

const PromoterNavigation = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={Home}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AttendanceScreen"
        component={AttendanceScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SalesScreen"
        component={SalesScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="StockScreen"
        component={StockScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="IncentiveScreen"
        component={IncentiveScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CheckingScreen"
        component={CheckingScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CheckOutScreen"
        component={CheckOutScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="DownloadScreen"
        component={DownloadScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ProductFeedbackScreen"
        component={ProductFeedbackScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AddSalesScreen"
        component={AddSalesScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default PromoterNavigation;
