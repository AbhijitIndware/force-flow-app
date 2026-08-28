import React from 'react';
import PromoterNavigation from '../Promoter/PromoterNavigation/PromoterNavigation';
import SoNavigation from '../SO/SoNavigation/SoNavigation';
import {MainNavigationStackParamList} from '../../types/Navigation';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../AuthScreen/LoginScreen';
import ForgotPasswordScreen from '../AuthScreen/ForgotPasswordScreen';
import SignupScreen from '../AuthScreen/SignupScreen';
import UserManualScreen from '../UserManualScreen/UserManualScreen';
import UserManualVideoScreen from '../UserManualScreen/UserManualVideoScreen';
import {useAppDispatch, useAppSelector} from '../../store/hook';
import {
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  useCheckSessionQuery,
  setSessionExpired,
  performLogout,
} from '../../features/auth/auth';
import DistributorNavigation from '../Distributor/DistributorNavigation/DistributorNavigation';
import NetInfo from '@react-native-community/netinfo';
import {Colors} from '../../utils/colors';
import {windowWidth} from '../../utils/utils';

const AuthStack = createStackNavigator<MainNavigationStackParamList>();
const AppStack = createStackNavigator<MainNavigationStackParamList>();

const MainNavigation = () => {
  const dispatch = useAppDispatch();
  const [isConnected, setIsConnected] = React.useState<boolean>(true);

  // ── Global session-expired flag (set by any 401 across all API slices) ──
  const sessionExpired = useAppSelector(
    state => state?.persistedReducer?.authSlice?.sessionExpired,
  );
  const sId = useAppSelector(state => {
    return state?.persistedReducer?.authSlice?.sId;
  });

  const isAuthenticated = !!sId;
  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
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
  } else {
    userType = 'SALES_OFFICER';
  }

  const insets = useSafeAreaInsets();

  const {
    data,
    isLoading,
    error: sessionError,
  } = useCheckSessionQuery(
    {sId: sId as string},
    {refetchOnFocus: true, refetchOnMountOrArgChange: true},
  );

  React.useEffect(() => {
    if (
      (sessionError as any)?.data?.message?.valid === false &&
      (sessionError as any)?.status === 401
    ) {
      dispatch(setSessionExpired(true));
      // Small delay so the user can read the banner before being logged out
      const timer = setTimeout(() => {
        dispatch(setSessionExpired(false));
        dispatch(performLogout());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sessionError, data]);

  // ── Network connectivity listener ─────────────────────────────────────────
  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  // Show loader while validating session
  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <View style={{flex: 1}}>
      {!isConnected && <NoInternetBanner />}
      {sessionExpired && <SessionExpiredBanner />}
      {/* <ApiErrorBanner
        errors={[globalError]}
        onDismiss={() => dispatch(setGlobalError(null))}
      /> */}
      {isAuthenticated && userType ? (
        <AppStackNavigator userType={userType} insets={insets} />
      ) : (
        <AuthStackNavigator insets={insets} />
      )}
    </View>
  );
};

// ── No Internet Banner ────────────────────────────────────────────────────────
const NoInternetBanner = () => (
  <View style={styles.noInternetBanner}>
    <Text style={styles.bannerText}>📡 No internet connection</Text>
  </View>
);

// ── Session Expired Banner ────────────────────────────────────────────────────
const SessionExpiredBanner = () => (
  <View style={styles.sessionBanner}>
    <Text style={styles.bannerText}>
      ⚠️ Session expired — please log in again
    </Text>
  </View>
);

// ── Auth Stack ────────────────────────────────────────────────────────────────
const AuthStackNavigator = ({insets}: any) => (
  <View
    style={{
      flex: 1,
      paddingBottom: insets.bottom,
    }}>
    <AuthStack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="LoginScreen">
      <AuthStack.Screen name="LoginScreen" component={LoginScreen} />
      <AuthStack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
      />
      <AuthStack.Screen name="SignupScreen" component={SignupScreen} />
      <AuthStack.Screen name="UserManualScreen" component={UserManualScreen} />
      <AuthStack.Screen
        name="UserManualVideoScreen"
        component={UserManualVideoScreen}
      />
    </AuthStack.Navigator>
  </View>
);

// ── App Stack ─────────────────────────────────────────────────────────────────
const AppStackNavigator = ({
  userType,
  insets,
}: {
  userType: 'PROMOTER' | 'SALES_OFFICER' | 'DISTRIBUTOR';
  insets: any;
}) => (
  <View
    style={{
      flex: 1,
      paddingBottom: insets.bottom,
    }}>
    <AppStack.Navigator screenOptions={{headerShown: false}}>
      {userType === 'PROMOTER' && (
        <AppStack.Screen
          name="PromoterNavigation"
          component={PromoterNavigation}
        />
      )}
      {userType === 'SALES_OFFICER' && (
        <AppStack.Screen name="SoNavigation" component={SoNavigation} />
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

// ── Full Screen Loader ────────────────────────────────────────────────────────
const FullScreenLoader = () => {
  const fadeAnim = React.useRef(new Animated.Value(0.4)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [fadeAnim, scaleAnim]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
      }}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{scale: scaleAnim}],
        }}>
        <Image
          source={require('../../assets/images/softsence-logo-login.png')}
          resizeMode="contain"
          style={styles.logoImage}
        />
      </Animated.View>
      <ActivityIndicator
        size="small"
        color={Colors.primary}
        style={{marginTop: 24}}
      />
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  noInternetBanner: {
    backgroundColor: '#92400E', // deep amber
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionBanner: {
    backgroundColor: '#B91C1C', // deep red
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  logoImage: {
    width: windowWidth * 0.8,
    height: 100,
    // marginBottom: 10,
  },
});

export {FullScreenLoader};
export default MainNavigation;
