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
import AddDistributorScreen from '../PartnersScreen/AddDistributorScreen';
import AddStoreScreen from '../PartnersScreen/AddStoreScreen';
import AddPjpScreen from '../ActivityScreen/AddPjpScreen';
import AddMarketVisitScreen from '../ActivityScreen/AddMarketVisitScreen';
import CheckInForm from '../HomeScreen/CheckInForm';
import MarkActivityScreen from '../HomeScreen/MarkActivityScreen';
import AddSaleScreen from '../OrdersScreen/AddSaleScreen';
import SaleDetailScreen from '../OrdersScreen/SaleDetailScreen';
import PurchaseDetailScreen from '../OrdersScreen/PurchaseDetailScreen';
import PjpDetailScreen from '../ActivityScreen/PjpDetailScreen';
import StockReport from '../ActivityScreen/StockReport';
import AddExpenseItemScreen from '../ExpenseScreen/AddExpenseItemScreen';
import AddExpenseScreen from '../ExpenseScreen/AddExpenseScreen';
import ExpenseScreen from '../ExpenseScreen/ExpenseScreen';
import ExpenseClaimScreen from '../ExpenseScreen/ExpenseClaimScreen';
import ExpenseListScreen from '../ExpenseScreen/ExpenseListScreen';
import VisibilityScreen from '../VisibilityScreen/VisibilityScreen';
import AddVisibilityScreen from '../VisibilityScreen/AddVisibilityClaim';
import TeamsSalesReport from '../Sales/TeamSalesReport';
import StoreDetailScreen from '../PartnersScreen/StoreDetailScreen';

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
      <Stack.Screen
        name="AddDistributorScreen"
        component={AddDistributorScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AddStoreScreen"
        component={AddStoreScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="StoreDetailScreen"
        component={StoreDetailScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AddMarketVisitScreen"
        component={AddMarketVisitScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AddPjpScreen"
        component={AddPjpScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PjpDetailScreen"
        component={PjpDetailScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CheckInForm"
        component={CheckInForm}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="MarkActivityScreen"
        component={MarkActivityScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AddSaleScreen"
        component={AddSaleScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SaleDetailScreen"
        component={SaleDetailScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PurchaseDetailScreen"
        component={PurchaseDetailScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="StockReport"
        component={StockReport}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ExpenseScreen"
        component={ExpenseScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AddExpenseScreen"
        component={AddExpenseScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AddExpenseItemScreen"
        component={AddExpenseItemScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ExpenseClaimScreen"
        component={ExpenseClaimScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ExpenseListScreen"
        component={ExpenseListScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="VisibilityScreen"
        component={VisibilityScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AddVisibilityScreen"
        component={AddVisibilityScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="TeamsSalesReport"
        component={TeamsSalesReport}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default SoNavigation;
