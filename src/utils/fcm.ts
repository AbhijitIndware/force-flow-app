import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { Platform } from 'react-native';

export async function requestFCMPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    }
    return true;
  } catch (error) {
    console.log('FCM permission request error:', error);
    return false;
  }
}

export async function getFcmToken(): Promise<string | null> {
  try {
    const hasPermission = await requestFCMPermission();
    if (!hasPermission) {
      console.log('FCM permission not granted');
      return null;
    }
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.log('FCM token retrieval error:', error);
    return null;
  }
}

export function onFcmTokenRefresh(callback: (token: string) => void) {
  return messaging().onTokenRefresh(callback);
}

export async function createNotificationChannel() {
  await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });
}

export async function displayNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
) {
  await createNotificationChannel();
  await notifee.displayNotification({
    title,
    body,
    data,
    android: {
      channelId: 'default',
      importance: AndroidImportance.HIGH,
      pressAction: { id: 'default' },
    },
  });
}

export function convertFCMToNotifeeRemoteMessage(remoteMessage: any) {
  return {
    notification: {
      title: remoteMessage.notification?.title || remoteMessage.data?.title || 'Notification',
      body: remoteMessage.notification?.body || remoteMessage.data?.body || '',
    },
    data: remoteMessage.data || {},
  };
}

export async function handleForegroundMessage(remoteMessage: any) {
  const { notification, data } = convertFCMToNotifeeRemoteMessage(remoteMessage);
  await displayNotification(notification.title, notification.body, data);
}

export function setupNotifeeEventHandlers(
  onPress?: (data: Record<string, any>) => void,
) {
  return notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS && detail.notification?.data) {
      onPress?.(detail.notification.data as Record<string, any>);
    }
  });
}
