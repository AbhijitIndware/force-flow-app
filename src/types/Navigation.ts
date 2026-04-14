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
  PromoterSaleDetailScreen: {id: string};
  AddSalesScreen: undefined;
  StockScreen: undefined;
  IncentiveScreen: undefined;
  CheckingScreen: undefined;
  CheckOutScreen: undefined;
  DownloadScreen: undefined;
  ProductFeedbackScreen: undefined;
  ProfileScreen: undefined;
};

export type SoAppStackParamList = {
  Home: undefined;
  HomeScreen: undefined;
  AttendanceScreen: undefined;
  SalesScreen: {index?: number} | undefined;
  ActivityScreen: undefined;
  OrdersScreen: {index?: number} | undefined;
  PartnersScreen: undefined;
  ProfileScreen: undefined;
  AddDistributorScreen: undefined;
  AddStoreScreen: {storeId?: string} | undefined;
  AddMarketVisitScreen: undefined;
  AddPjpScreen: {id?: string} | undefined;
  AddSaleScreen: {orderId?: string} | undefined;
  AddPurchaseScreen: undefined;
  CheckInForm: undefined;
  MarkActivityScreen: undefined;
  SaleDetailScreen: {id: string};
  PurchaseDetailScreen: {id: string};
  PjpDetailScreen: {details: PjpDailyStore};
  StockReport: {reportName: string};
  TeamsSalesReport: {reportName: string};
  AsmDashboard: undefined;

  ExpenseScreen: undefined;
  AddExpenseScreen: undefined;
  AddExpenseItemScreen: undefined;
  ExpenseClaimScreen: {id: string; name: string};
  ExpenseListScreen: {id: string; name: string};

  VisibilityScreen: undefined;
  AddVisibilityScreen: undefined;
  StoreDetailScreen: {storeId: string};
  TeamDetailScreen: {date:string,employee_id:string};
  DetailByStoreScreen: {
    store_id: string;
    date: string;
    employee_id: string;
  };
  DetailByUserScreen: {
    employee_id: string;
    date: string;
  };
  AllOrdersScreen:{ date:string, employee:string};
  OrderDetailScreen: {order_id: string};
  TeamAttendanceListScreen: { apiParams: any; today: string };
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
// Filters
export interface Filters {
  search: string | null;
  item_group: string | null;
  price_range: string | null;
}
