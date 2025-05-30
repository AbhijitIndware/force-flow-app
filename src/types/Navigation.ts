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
  statusCode: number;
  message: string;
  count: number;
};
