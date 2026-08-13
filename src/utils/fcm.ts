import {
  getMessaging,
  requestPermission,
  getToken,
  onTokenRefresh,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { Platform } from 'react-native';

const firebaseMessaging = getMessaging();

export async function requestFCMPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      const authStatus = await requestPermission(firebaseMessaging);
      return (
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL
      );
    }
    return true;
  } catch {
    return false;
  }
}

export async function getFcmToken(): Promise<string | null> {
  try {
    const hasPermission = await requestFCMPermission();
    if (!hasPermission) {
      return null;
    }
    const token = await getToken(firebaseMessaging);
    return token;
  } catch {
    return null;
  }
}

export function onFcmTokenRefresh(callback: (token: string) => void) {
  return onTokenRefresh(firebaseMessaging, callback);
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
  smallIcon?: string,
) {
  await createNotificationChannel();
  await notifee.displayNotification({
    title,
    body,
    data,
    android: {
      channelId: 'default',
      importance: AndroidImportance.HIGH,
      smallIcon: smallIcon || 'ic_notification',
      color: '#FF6B35',
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
