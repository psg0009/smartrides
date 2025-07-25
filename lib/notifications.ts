import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  type: 'booking_confirmed' | 'ride_reminder' | 'ride_cancelled' | 'new_booking';
  rideId?: string;
  bookingId?: string;
  title: string;
  body: string;
}

class NotificationService {
  private expoPushToken: string | null = null;

  async registerForPushNotifications(): Promise<string | null> {
    if (Platform.OS === 'web') {
      console.log('Push notifications are not supported on web');
      return null;
    }

    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
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
    
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      
      const token = await Notifications.getExpoPushTokenAsync({ projectId });
      this.expoPushToken = token.data;
      console.log('Expo push token:', token.data);
      return token.data;
    } catch (error) {
      console.log('Error getting push token:', error);
      return null;
    }
  }

  async sendLocalNotification(data: NotificationData) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.body,
          data: {
            type: data.type,
            rideId: data.rideId,
            bookingId: data.bookingId,
          },
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.log('Error sending local notification:', error);
    }
  }

  async scheduleRideReminder(rideId: string, rideTime: string, destination: string) {
    // For now, just send immediate notification for demo purposes
    // In production, you would use proper scheduling
    console.log(`Would schedule reminder for ride ${rideId} to ${destination} at ${rideTime}`);
    
    await this.sendLocalNotification({
      type: 'ride_reminder',
      rideId,
      title: '🚗 Ride Reminder',
      body: `Your ride to ${destination} is coming up!`,
    });
  }

  async cancelRideReminder(rideId: string) {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const rideNotifications = scheduledNotifications.filter(
        notification => notification.content.data?.rideId === rideId
      );
      
      for (const notification of rideNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      console.log('Error cancelling ride reminder:', error);
    }
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }
}

export const notificationService = new NotificationService();