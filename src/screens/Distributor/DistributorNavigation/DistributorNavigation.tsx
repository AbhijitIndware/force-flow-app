import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DistributorAppStackParamList } from '../../../types/Navigation';
import DistributorHome from '../HomeScreen/Home';
import DistributorHomeScreen from '../HomeScreen/HomeScreen';

const Stack = createNativeStackNavigator<DistributorAppStackParamList>();

const SoNavigation = () => {
  return (
    <Stack.Navigator initialRouteName="DistributorHome">
      <Stack.Screen
        name="DistributorHome"
        component={DistributorHome}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DistributorHomeScreen"
        component={DistributorHomeScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default SoNavigation;
