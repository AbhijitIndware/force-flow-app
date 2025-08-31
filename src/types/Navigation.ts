import {PjpDailyStore} from './baseType';

//Stack ParamList Type
export type MainNavigationStackParamList = {
  PromoterNavigation: undefined;
  SoNavigation: undefined;
  LoginScreen: undefined;
  SignupScreen: undefined;
};
export type PromoterAppStackParamList = {
  Home: undefined;
  HomeScreen: undefined;
  AttendanceScreen: undefined;
  SalesScreen: undefined;
  StockScreen: undefined;
  IncentiveScreen: undefined;
  CheckingScreen: undefined;
  DownloadScreen: undefined;
  ProductFeedbackScreen: undefined;
  ProfileScreen: undefined;
};

export type SoAppStackParamList = {
  Home: undefined;
  HomeScreen: undefined;
  AttendanceScreen: undefined;
  SalesScreen: undefined;
  ActivityScreen: undefined;
  OrdersScreen: {index?: number} | undefined;
  PartnersScreen: undefined;
  ProfileScreen: undefined;
  AddDistributorScreen: undefined;
  AddStoreScreen: undefined;
  AddMarketVisitScreen: undefined;
  AddPjpScreen: {id?: string} | undefined;
  AddSaleScreen: {orderId?: string} | undefined;
  AddPurchaseScreen: undefined;
  CheckInForm: undefined;
  MarkActivityScreen: undefined;
  SaleDetailScreen: {id: string};
  PurchaseDetailScreen: {id: string};
  PjpDetailScreen: {details: PjpDailyStore};
};

export type menuType = {
  name: string;
  leftIcon: any;
};
export type DropDownList = {
  label: string;
  value: string;
};

export type ApiResponse = {
  message: {
    status: string;
  };
};
export interface PaginationInfo {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
