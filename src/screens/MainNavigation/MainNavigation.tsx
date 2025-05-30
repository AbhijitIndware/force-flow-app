import React from 'react';
import PromoterNavigation from '../Promoter/PromoterNavigation/PromoterNavigation';
import SoNavigation from '../SO/SoNavigation/SoNavigation';
import {MainNavigationStackParamList} from '../../types/Navigation';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../AuthScreen/LoginScreen';
import SignupScreen from '../AuthScreen/SignupScreen';

const AuthStack = createStackNavigator<MainNavigationStackParamList>();
const AppStack = createStackNavigator<MainNavigationStackParamList>();

const MainNavigation = () => {
  const token = 'hhfuyf';
  const isAuthenticated = !!token;
  const userType = false ? 'SO' : 'PROMOTER';

  return isAuthenticated && userType ? (
    <AppStackNavigator userType={userType} />
  ) : (
    <AuthStackNavigator />
  );
};

const AuthStackNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{headerShown: false}}
    initialRouteName="LoginScreen">
    <AuthStack.Screen name="LoginScreen" component={LoginScreen} />
    <AuthStack.Screen name="SignupScreen" component={SignupScreen} />
  </AuthStack.Navigator>
);

const AppStackNavigator = ({userType}: {userType: 'PROMOTER' | 'SO'}) => (
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
);

export default MainNavigation;
