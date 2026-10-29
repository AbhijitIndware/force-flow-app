import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../HomeScreen/HomeScreen';
import AttendanceScreen from '../Attendance/AttendanceScreen';
import Home from '../HomeScreen/Home';
import {PromoterAppStackParamList} from '../../../types/Navigation';
import SalesScreen from '../Sales/Sales';
import StockScreen from '../Stock/Stock';
import StockEntryFormScreen from '../Stock/StockEntryFormScreen';
import StockReceivedScreen from '../Stock/StockReceivedScreen';
import {
  CustomerReturnScreen,
  DistributorReturnScreen,
} from '../Stock/StockReturnScreen';
import MySalesScreen from '../Sales/MySalesScreen';
import IncentiveScreen from '../Incentive/Incentive';
import DownloadScreen from '../DownloadScreen/DownloadScreen';
import ProductFeedbackScreen from '../ProductFeedbackScreen/ProductfeedbackScreen';
import AddProductFeedbackScreen from '../ProductFeedbackScreen/AddProductFeedbackScreen';
import ProductFeedbackDetailScreen from '../ProductFeedbackScreen/ProductFeedbackDetailScreen';
import StoreActivityScreen from '../StoreActivity/StoreActivityScreen';
import AddStoreActivityScreen from '../StoreActivity/AddStoreActivityScreen';
import ProfileScreen from '../ProfileScreen/ProfileScreen';
import CheckingScreen from '../CheckingScreen/CheckingScreen';
import CheckOutScreen from '../CheckingScreen/CheckOutScreen';
import AddSalesScreen from '../Sales/AddSales';
import PromoterSaleDetailScreen from '../Sales/SaleDetailScreen';
import NotificationListScreen from '../../NotificationListScreen';
import UserManualScreen from '../../UserManualScreen/UserManualScreen';
import UserManualVideoScreen from '../../UserManualScreen/UserManualVideoScreen';
import {useIsTeamLeader} from '../../../utils/roles';
// SO / ASM screens a Team Leader also gets.
import PartnersScreen from '../../SO/PartnersScreen/PartnersScreen';
import OrdersScreen from '../../SO/OrdersScreen/OrdersScreen';
import AddStoreScreen from '../../SO/PartnersScreen/AddStoreScreen';
import AddDistributorScreen from '../../SO/PartnersScreen/AddDistributorScreen';
import StoreDetailScreen from '../../SO/PartnersScreen/StoreDetailScreen';
import AddSaleScreen from '../../SO/OrdersScreen/AddSaleScreen';
import SaleDetailScreen from '../../SO/OrdersScreen/SaleDetailScreen';
import PurchaseDetailScreen from '../../SO/OrdersScreen/PurchaseDetailScreen';
import DeliveryNoteDetailScreen from '../../SO/OrdersScreen/DeliveryNoteDetailScreen';
import PromoterShiftsScreen from '../../SO/HomeScreen/PromoterShiftsScreen';
import PromoterDayDetailScreen from '../../SO/HomeScreen/PromoterDayDetailScreen';
import TeamPromotersScreen from '../../SO/Team/TeamPromotersScreen';
import TeamTargetsScreen from '../../SO/Team/TeamTargetsScreen';
import TeamAttendanceScreen from '../../SO/Team/TeamAttendanceScreen';
import TeamReportsScreen from '../../SO/Team/TeamReportsScreen';

const Stack = createNativeStackNavigator<PromoterAppStackParamList>();

// Typed against the SO stack; the routes they use exist here too.
const TEAM_LEADER_SCREENS: {name: string; component: any}[] = [
  {name: 'PartnersScreen', component: PartnersScreen},
  {name: 'OrdersScreen', component: OrdersScreen},
  {name: 'AddStoreScreen', component: AddStoreScreen},
  {name: 'AddDistributorScreen', component: AddDistributorScreen},
  {name: 'StoreDetailScreen', component: StoreDetailScreen},
  {name: 'AddSaleScreen', component: AddSaleScreen},
  {name: 'SaleDetailScreen', component: SaleDetailScreen},
  {name: 'PurchaseDetailScreen', component: PurchaseDetailScreen},
  {name: 'DeliveryNoteDetailScreen', component: DeliveryNoteDetailScreen},
  {name: 'PromoterShiftsScreen', component: PromoterShiftsScreen},
  {name: 'PromoterDayDetailScreen', component: PromoterDayDetailScreen},
  {name: 'TeamPromotersScreen', component: TeamPromotersScreen},
  {name: 'TeamTargetsScreen', component: TeamTargetsScreen},
  {name: 'TeamAttendanceScreen', component: TeamAttendanceScreen},
  {name: 'TeamReportsScreen', component: TeamReportsScreen},
];

const PromoterNavigation = () => {
  const isTL = useIsTeamLeader();
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
        name="PromoterSaleDetailScreen"
        component={PromoterSaleDetailScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="StockScreen"
        component={StockScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="StockReceivedScreen"
        component={StockReceivedScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CustomerReturnScreen"
        component={CustomerReturnScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="DistributorReturnScreen"
        component={DistributorReturnScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="MySalesScreen"
        component={MySalesScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="StockEntryFormScreen"
        component={StockEntryFormScreen}
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
        name="ProductFeedbackDetailScreen"
        component={ProductFeedbackDetailScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AddProductFeedbackScreen"
        component={AddProductFeedbackScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="StoreActivityScreen"
        component={StoreActivityScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AddStoreActivityScreen"
        component={AddStoreActivityScreen}
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
      <Stack.Screen
        name="NotificationListScreen"
        component={NotificationListScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="UserManualScreen"
        component={UserManualScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="UserManualVideoScreen"
        component={UserManualVideoScreen}
        options={{headerShown: false}}
      />
      {isTL &&
        TEAM_LEADER_SCREENS.map(({name, component}) => (
          <Stack.Screen
            key={name}
            name={name as keyof PromoterAppStackParamList}
            component={component}
            options={{headerShown: false}}
          />
        ))}
    </Stack.Navigator>
  );
};

export default PromoterNavigation;
