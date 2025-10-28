import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_PERMISSION_KEY = '@notifications/permission';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }

  await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'granted');

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
    });
  }

  return true;
}

export async function hasNotificationPermission(): Promise<boolean> {
  const stored = await AsyncStorage.getItem(NOTIFICATION_PERMISSION_KEY);
  return stored === 'granted';
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  trigger?: Notifications.NotificationTriggerInput
) {
  if (Platform.OS === 'web') {
    return null;
  }

  const hasPermission = await hasNotificationPermission();
  if (!hasPermission) {
    return null;
  }

  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: trigger ?? null,
  });
}

export async function sendImmediateNotification(title: string, body: string, data?: Record<string, any>) {
  if (Platform.OS === 'web') {
    return null;
  }

  const hasPermission = await hasNotificationPermission();
  if (!hasPermission) {
    return null;
  }

  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null,
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getBadgeCount() {
  if (Platform.OS === 'web') {
    return 0;
  }
  return await Notifications.getBadgeCountAsync();
}

export async function setBadgeCount(count: number) {
  if (Platform.OS === 'web') {
    return;
  }
  await Notifications.setBadgeCountAsync(count);
}
