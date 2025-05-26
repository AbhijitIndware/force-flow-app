import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../AuthScreen/LoginScreen';
import SignupScreen from '../AuthScreen/SignupScreen';
import HomeScreen from '../HomeScreen/HomeScreen';
import AttendanceScreen from '../Attendance/AttendanceScreen';
import Home from '../HomeScreen/Home';
import {AppStackParamList} from '../../types/Navigation';

const Stack = createNativeStackNavigator<AppStackParamList>();

const MainScreen = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SignupScreen"
        component={SignupScreen}
        options={{headerShown: false}}
      />
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
        options={{headerShown:false}}
      />
    </Stack.Navigator>
  );
};

export default MainScreen;
