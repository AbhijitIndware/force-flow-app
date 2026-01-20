import React from 'react';
import PromoterNavigation from '../Promoter/PromoterNavigation/PromoterNavigation';
import SoNavigation from '../SO/SoNavigation/SoNavigation';
import {MainNavigationStackParamList} from '../../types/Navigation';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../AuthScreen/LoginScreen';
import SignupScreen from '../AuthScreen/SignupScreen';
import {useAppDispatch, useAppSelector} from '../../store/hook';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {logout, useCheckSessionQuery} from '../../features/auth/auth';
import {useNavigation} from '@react-navigation/native';
import {ActivityIndicator} from 'react-native';

const AuthStack = createStackNavigator<MainNavigationStackParamList>();
const AppStack = createStackNavigator<MainNavigationStackParamList>();

const MainNavigation = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const sId = useAppSelector(state => state?.persistedReducer?.authSlice?.sId);
  const isAuthenticated = !!sId;
  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );
  const userType =
    employee?.designation !== 'Promoter' ? 'Sales Officer' : 'PROMOTER';
  const insets = useSafeAreaInsets();

  const {data, isLoading, isError} = useCheckSessionQuery(
    {sId: sId as string},
    {skip: !sId},
  );
  React.useEffect(() => {
    if (data?.message?.valid === false) {
      dispatch(logout());
    }
  }, [data]);

  // 🔥 Show loader while validating session
  if (isLoading && isAuthenticated) {
    return <FullScreenLoader />;
  }

  return isAuthenticated && userType ? (
    <AppStackNavigator userType={userType} insets={insets} />
  ) : (
    <AuthStackNavigator insets={insets} />
  );
};

const AuthStackNavigator = ({insets}: any) => (
  <View
    style={{
      flex: 1,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    }}>
    <AuthStack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="LoginScreen">
      <AuthStack.Screen name="LoginScreen" component={LoginScreen} />
      <AuthStack.Screen name="SignupScreen" component={SignupScreen} />
    </AuthStack.Navigator>
  </View>
);

const AppStackNavigator = ({
  userType,
  insets,
}: {
  userType: 'PROMOTER' | 'Sales Officer';
  insets: any;
}) => (
  <View
    style={{
      flex: 1,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    }}>
    <AppStack.Navigator screenOptions={{headerShown: false}}>
      {userType === 'PROMOTER' ? (
        <AppStack.Screen
          name="PromoterNavigation"
          component={PromoterNavigation}
        />
      ) : (
        <AppStack.Screen name="SoNavigation" component={SoNavigation} />
      )}
    </AppStack.Navigator>
  </View>
);

export default MainNavigation;

const FullScreenLoader = () => (
  <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    <ActivityIndicator size="large" color="#000" />
  </View>
);
