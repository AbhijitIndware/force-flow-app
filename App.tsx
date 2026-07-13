import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';
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
import { displayNotification, createNotificationChannel, requestFCMPermission } from './src/utils/fcm';

const firebaseMessaging = getMessaging();

// Register background message handler (fires when app is in background/killed)
setBackgroundMessageHandler(firebaseMessaging, async remoteMessage => {
  const title = (remoteMessage.notification?.title || remoteMessage.data?.title || 'Notification') as string;
  const body = (remoteMessage.notification?.body || remoteMessage.data?.body || '') as string;
  await displayNotification(title, body, remoteMessage.data);
});

// Register Notifee background event handler
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;
  console.log('Notifee background event:', type, notification?.data);
});

function App(): React.JSX.Element {
  useEffect(() => {
    requestFCMPermission();
    createNotificationChannel();

    // Handle notification tap when app was opened from a killed state
    getInitialNotification(firebaseMessaging)
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('FCM opened from quit state:', remoteMessage.data);
        }
      });

    // Handle notification tap when app is in background (FCM)
    const unsubscribeOnOpened = onNotificationOpenedApp(firebaseMessaging,
      remoteMessage => {
        console.log('FCM opened from background:', remoteMessage.data);
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
        console.log('Notifee foreground event:', type, detail.notification.data);
      }
    });

    return () => {
      unsubscribeOnOpened();
      unsubscribeOnMessage();
      unsubscribeNotifee();
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
              <NavigationContainer>
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
