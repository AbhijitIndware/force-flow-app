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
  OrdersScreen: undefined;
  PartnersScreen: undefined;
  ProfileScreen: undefined;
  AddDistributorScreen: undefined;
  AddStoreScreen: undefined;
  AddMarketVisitScreen: undefined;
  AddPjpScreen: undefined;
  AddSaleScreen: undefined;
  AddPurchaseScreen: undefined;
  CheckInForm: undefined;
  MarkActivityScreen: undefined;
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
