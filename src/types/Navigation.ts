//Stack ParamList Type
export type AppStackParamList = {
  LoginScreen: undefined;
  SignupScreen: undefined;
  Home: undefined;
  HomeScreen: undefined;
  AttendanceScreen:undefined;
  SalesScreen:undefined;
  StockScreen:undefined;
  IncentiveScreen:undefined;
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
