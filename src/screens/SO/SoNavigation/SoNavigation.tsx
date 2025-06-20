import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../HomeScreen/HomeScreen';
import Home from '../HomeScreen/Home';
import {SoAppStackParamList} from '../../../types/Navigation';
import AttendanceScreen from '../Attendance/AttendanceScreen';
import SalesScreen from '../Sales/Sales';
import ActivityScreen from '../ActivityScreen/ActivityScreen';
import OrdersScreen from '../OrdersScreen/OrdersScreen';
import PartnersScreen from '../PartnersScreen/PartnersScreen';
import ProfileScreen from '../ProfileScreen/ProfileScreen';

const Stack = createNativeStackNavigator<SoAppStackParamList>();

const SoNavigation = () => {
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
        name="ActivityScreen"
        component={ActivityScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="OrdersScreen"
        component={OrdersScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PartnersScreen"
        component={PartnersScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default SoNavigation;
