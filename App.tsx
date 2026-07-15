import React, { useEffect } from 'react';
import { Platform, StatusBar, useColorScheme, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './src/store/store';
import MainNavigation from './src/screens/MainNavigation/MainNavigation';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/components/ui-lib/custom-toast';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import DisclaimerModal from './DisclaimerModal';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import { SlowNetworkBanner } from './src/components/ui-lib/slow-network-banner';
import {
  getMessaging,
  setBackgroundMessageHandler,
  getInitialNotification,
  onNotificationOpenedApp,
  onMessage,
} from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { displayNotification, createNotificationChannel, requestFCMPermission, onFcmTokenRefresh } from './src/utils/fcm';
import { navigationRef, navigate } from './src/utils/navigationRef';
import { fcmApi } from './src/features/fcm/fccm-api';

function handleNotificationPress(data: Record<string, any>) {
  if (!data?.type) return;
  switch (data.type) {
    case 'late_checkin':
      navigate('LateCheckinApprovalScreen');
      break;
    case 'late_checkin_status':
      navigate('NotificationListScreen');
      break;
    case 'expense_claim':
      navigate('ExpenseApprovalScreen');
      break;
    case 'expense_claim_status':
      navigate('ExpenseScreen');
      break;
    case 'leave_application':
    case 'leave_application_status':
      navigate('NotificationListScreen');
      break;
    default:
      navigate('NotificationListScreen');
  }
}

const firebaseMessaging = getMessaging();

// Register background message handler (fires when app is in background/killed)
// Firebase auto-displays notifications with 'notification' payload (uses custom icon from manifest)
setBackgroundMessageHandler(firebaseMessaging, async remoteMessage => {
  if (remoteMessage.notification) return;
  const title = (remoteMessage.data?.title || 'Notification') as string;
  const body = (remoteMessage.data?.body || '') as string;
  await displayNotification(title, body, remoteMessage.data);
});

// Register Notifee background event handler
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;
  if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
    handleNotificationPress(notification?.data as Record<string, any>);
  }
});

function App(): React.JSX.Element {
  useEffect(() => {
    requestFCMPermission();
    createNotificationChannel();

    // Handle notification tap when app was opened from a killed state
    getInitialNotification(firebaseMessaging)
      .then(remoteMessage => {
        if (remoteMessage) {
          handleNotificationPress(remoteMessage.data as Record<string, any>);
        }
      });

    // Handle notification tap when app is in background (FCM)
    const unsubscribeOnOpened = onNotificationOpenedApp(firebaseMessaging,
      remoteMessage => {
        handleNotificationPress(remoteMessage.data as Record<string, any>);
      },
    );

    // Display foreground FCM messages as local notifications
    const unsubscribeOnMessage = onMessage(firebaseMessaging, async remoteMessage => {
      const title = (remoteMessage.notification?.title || remoteMessage.data?.title || 'Notification') as string;
      const body = (remoteMessage.notification?.body || remoteMessage.data?.body || '') as string;
      await displayNotification(title, body, remoteMessage.data);
    });

    // Handle Notifee notification press (foreground)
    const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if ((type === EventType.PRESS || type === EventType.ACTION_PRESS) && detail.notification) {
        handleNotificationPress(detail.notification.data as Record<string, any>);
      }
    });

    // Re-register FCM token when it refreshes
    const unsubscribeTokenRefresh = onFcmTokenRefresh(async newToken => {
      const deviceOs = Platform.OS === 'ios' ? 'iOS' : 'Android';
      store.dispatch(fcmApi.endpoints.registerFcmToken.initiate({ fcm_token: newToken, device_os: deviceOs }));
    });

    return () => {
      unsubscribeOnOpened();
      unsubscribeOnMessage();
      unsubscribeNotifee();
      unsubscribeTokenRefresh();
    };
  }, []);
  const isDarkMode = useColorScheme() === 'dark';
  const networkStatus = useNetworkStatus();

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <PaperProvider>
            <View style={{ flex: 1 }}>
              <SlowNetworkBanner
                isVisible={networkStatus.isSlowNetwork}
                effectiveType={networkStatus.effectiveType}
              />
              <NavigationContainer ref={navigationRef}>
                <StatusBar
                  barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                />
                <DisclaimerModal />
                <MainNavigation />
              </NavigationContainer>
            </View>
          </PaperProvider>
          <Toast config={toastConfig} />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
