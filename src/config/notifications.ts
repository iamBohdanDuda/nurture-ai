import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure default notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Notifications] Permission not granted');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'NurtureAI',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#ED64A6',
    });
  }

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  trigger: Notifications.NotificationTriggerInput
) {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger,
  });
}
