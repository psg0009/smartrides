import { prisma } from '../prisma';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  title: string;
  message: string;
  data?: any;
  userId: string;
  type: 'ride_update' | 'booking_confirmed' | 'payment_received' | 'chat_message' | 'safety_alert';
}

// Mock data for notifications
const mockNotifications = new Map<string, any[]>();

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async sendNotification(notificationData: NotificationData) {
    try {
      // Store notification in mock data
      const userNotifications = mockNotifications.get(notificationData.userId) || [];
      const newNotification = {
        id: `notification-${Date.now()}`,
        userId: notificationData.userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data || {},
        read: false,
        createdAt: new Date(),
      };
      userNotifications.unshift(newNotification);
      mockNotifications.set(notificationData.userId, userNotifications);

      // Send push notification
      await this.sendPushNotification(notificationData);

      console.log(`Notification sent to user ${notificationData.userId}: ${notificationData.title}`);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  private async sendPushNotification(notificationData: NotificationData) {
    try {
      // Get user's push token from database
      const user = await prisma.user.findUnique({
        where: { id: notificationData.userId },
        select: { id: true, name: true, email: true }
      });

      if (!user) {
        console.log(`User not found: ${notificationData.userId}`);
        return;
      }

      // TODO: Implement real push token retrieval when field is added to User model
      console.log(`Would send push notification to user ${user.name} (${user.email})`);

      // Send notification using Expo's push notification service
      const message = {
        to: 'mock-push-token', // TODO: Replace with real push token
        sound: 'default',
        title: notificationData.title,
        body: notificationData.message,
        data: notificationData.data || {},
        priority: 'high',
      };

      console.log('Push notification message:', message);

    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  async sendRideUpdateNotification(rideId: string, updateType: string, userIds: string[]) {
    // TODO: Replace with real database query when Ride model is available
    const ride = { destination: 'Unknown Destination' };

    const notifications = userIds.map(userId => ({
      title: 'Ride Update',
      message: `Your ride to ${ride.destination} has been ${updateType}`,
      data: { rideId, updateType },
      userId,
      type: 'ride_update' as const,
    }));

    await Promise.all(notifications.map(notification => this.sendNotification(notification)));
  }

  async sendBookingConfirmationNotification(bookingId: string, userId: string) {
    // TODO: Replace with real database query when Booking model is available
    const booking = { 
      ride: { 
        destination: 'Unknown Destination',
        departureTime: new Date().toISOString()
      }
    };

    await this.sendNotification({
      title: 'Booking Confirmed!',
      message: `Your ride to ${booking.ride.destination} on ${new Date(booking.ride.departureTime).toLocaleDateString()} has been confirmed.`,
      data: { bookingId, rideId: 'mock-ride-id' },
      userId,
      type: 'booking_confirmed',
    });
  }

  async sendPaymentNotification(userId: string, amount: number, type: 'received' | 'sent') {
    await this.sendNotification({
      title: `Payment ${type === 'received' ? 'Received' : 'Sent'}`,
      message: `$${amount.toFixed(2)} has been ${type === 'received' ? 'added to your account' : 'sent from your account'}.`,
      data: { amount, type },
      userId,
      type: 'payment_received',
    });
  }

  async sendChatMessageNotification(chatRoomId: string, senderId: string, message: string) {
    // TODO: Replace with real database query when ChatRoom model is available
    const chatRoom = {
      participants: [
        { userId: 'user1', user: { name: 'Unknown User' } },
        { userId: 'user2', user: { name: 'Unknown User' } }
      ]
    };

    const sender = chatRoom.participants.find((p: any) => p.userId === senderId)?.user;
    if (!sender) return;

    const notifications = chatRoom.participants
      .filter((p: any) => p.userId !== senderId)
      .map((participant: any) => ({
        title: `New message from ${sender.name}`,
        message: message.length > 50 ? `${message.substring(0, 50)}...` : message,
        data: { chatRoomId, senderId, message },
        userId: participant.userId,
        type: 'chat_message' as const,
      }));

    await Promise.all(notifications.map((notification: any) => this.sendNotification(notification)));
  }

  async sendSafetyAlertNotification(userId: string, alertType: string, rideId?: string) {
    await this.sendNotification({
      title: 'Safety Alert',
      message: `Safety alert: ${alertType}. Please check your ride status.`,
      data: { alertType, rideId },
      userId,
      type: 'safety_alert',
    });
  }

  async markNotificationAsRead(notificationId: string, userId: string) {
    const userNotifications = mockNotifications.get(userId) || [];
    const notification = userNotifications.find((n: any) => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  async getUnreadNotifications(userId: string) {
    const userNotifications = mockNotifications.get(userId) || [];
    return userNotifications.filter((n: any) => !n.read);
  }

  async getAllNotifications(userId: string, limit = 50, offset = 0) {
    const userNotifications = mockNotifications.get(userId) || [];
    return userNotifications.slice(offset, offset + limit);
  }
}

export default NotificationService.getInstance(); 