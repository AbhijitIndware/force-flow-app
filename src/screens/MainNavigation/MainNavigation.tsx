import React from 'react';
import PromoterNavigation from '../Promoter/PromoterNavigation/PromoterNavigation';
import SoNavigation from '../SO/SoNavigation/SoNavigation';
import { MainNavigationStackParamList } from '../../types/Navigation';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../AuthScreen/LoginScreen';
import SignupScreen from '../AuthScreen/SignupScreen';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  logout,
  useCheckSessionQuery,
  useGetProfileDataQuery,
} from '../../features/auth/auth';
import { ActivityIndicator } from 'react-native';
import { StyleSheet } from 'react-native';
import DistributorNavigation from '../Distributor/DistributorNavigation/DistributorNavigation';

const AuthStack = createStackNavigator<MainNavigationStackParamList>();
const AppStack = createStackNavigator<MainNavigationStackParamList>();

const MainNavigation = () => {
  const dispatch = useAppDispatch();
  const [sessionExpired, setSessionExpired] = React.useState(false);

  const sId = useAppSelector(state => state?.persistedReducer?.authSlice?.sId);
  const isAuthenticated = !!sId;
  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );
  const employeeId = useAppSelector(
    state => state?.persistedReducer?.authSlice?.empId,
  );
  const designation = employee?.designation;

  let userType: 'PROMOTER' | 'SALES_OFFICER' | 'DISTRIBUTOR' | null = null;

  if (designation === 'Promoter') {
    userType = 'PROMOTER';
  } else if (
    ['ASM', 'ASE', 'Area Sales Executive', 'Sales Officer'].includes(
      designation || '',
    )
  ) {
    userType = 'SALES_OFFICER';
  } else if (designation === 'Distributor') {
    userType = 'DISTRIBUTOR';
  }

  const insets = useSafeAreaInsets();
  useGetProfileDataQuery(
    { emp_id: employeeId as string },
    {
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
      skip: !employeeId,
    },
  );

  const {
    data,
    isLoading,
    error: sessionError,
  } = useCheckSessionQuery({ sId: sId as string }, { skip: !sId });

  React.useEffect(() => {
    if (
      (sessionError as any)?.data?.message?.valid === false &&
      (sessionError as any)?.status === 401
    ) {
      setSessionExpired(true);
      // Small delay so the user can read the banner before being logged out
      const timer = setTimeout(() => {
        setSessionExpired(false);
        dispatch(logout());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [sessionError, data]);

  // 🔥 Show loader while validating session
  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <View style={{ flex: 1 }}>
      {sessionExpired && <SessionExpiredBanner />}
      {isAuthenticated && userType ? (
        <AppStackNavigator userType={userType} insets={insets} />
      ) : (
        <AuthStackNavigator insets={insets} />
      )}
    </View>
  );
};
const SessionExpiredBanner = () => (
  <View style={styles.banner}>
    <Text style={styles.bannerText}>
      ⚠️ Session expired — please log in again
    </Text>
  </View>
);

const AuthStackNavigator = ({ insets }: any) => (
  <View
    style={{
      flex: 1,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    }}>
    <AuthStack.Navigator
      screenOptions={{ headerShown: false }}
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
  userType: "PROMOTER" | "SALES_OFFICER" | "DISTRIBUTOR";
  insets: any;
}) => (
  <View
    style={{
      flex: 1,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    }}>
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      {userType === 'PROMOTER' && (
        <AppStack.Screen
          name="PromoterNavigation"
          component={PromoterNavigation}
        />
      )}

      {userType === 'SALES_OFFICER' && (
        <AppStack.Screen
          name="SoNavigation"
          component={SoNavigation}
        />
      )}

      {userType === 'DISTRIBUTOR' && (
        <AppStack.Screen
          name="DistributorNavigation"
          component={DistributorNavigation}
        />
      )}
    </AppStack.Navigator>
  </View>
);

const FullScreenLoader = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#000" />
  </View>
);

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#B91C1C',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default MainNavigation;
