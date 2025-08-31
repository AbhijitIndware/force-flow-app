import React from 'react';
import PromoterNavigation from '../Promoter/PromoterNavigation/PromoterNavigation';
import SoNavigation from '../SO/SoNavigation/SoNavigation';
import {MainNavigationStackParamList} from '../../types/Navigation';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../AuthScreen/LoginScreen';
import SignupScreen from '../AuthScreen/SignupScreen';
import {useAppSelector} from '../../store/hook';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const AuthStack = createStackNavigator<MainNavigationStackParamList>();
const AppStack = createStackNavigator<MainNavigationStackParamList>();

const MainNavigation = () => {
  const sId = useAppSelector(state => state?.persistedReducer?.authSlice?.sId);
  const isAuthenticated = !!sId;
  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );
  const userType = employee?.designation !== 'Promoter' ? 'SO' : 'PROMOTER';
  const insets = useSafeAreaInsets();

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
  userType: 'PROMOTER' | 'SO';
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
