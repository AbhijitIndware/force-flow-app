import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DistributorAppStackParamList } from '../../../types/Navigation';
import DistributorHome from '../HomeScreen/Home';
import DistributorHomeScreen from '../HomeScreen/HomeScreen';
import PurchaseOrdersScreen from '../Purchase/Purchaseordersscreen';
import DeliveryNotesScreen from '../DeliveryNote/Deliverynotesscreen';
import DistributorProfileScreen from '../Profile/Distributorprofilescreen';

const Stack = createNativeStackNavigator<DistributorAppStackParamList>();

const DistributorNavigation = () => {
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
      <Stack.Screen
        name="PurchaseOrdersScreen"
        component={PurchaseOrdersScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DeliveryNotesScreen"
        component={DeliveryNotesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DistributorProfileScreen"
        component={DistributorProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default DistributorNavigation;
