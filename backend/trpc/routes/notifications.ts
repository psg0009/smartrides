import { z } from 'zod';
import { protectedProcedure } from '../create-context';
import { prisma } from '../../prisma';
import notificationService from '../../lib/notifications';

// Get all notifications for user
export const getAll = protectedProcedure
  .input(z.object({
    limit: z.number().int().min(1).max(100).default(50),
    offset: z.number().int().min(0).default(0),
  }).optional())
  .query(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;
    const limit = input?.limit || 50;
    const offset = input?.offset || 0;

    // TODO: Replace with real database query when notification model is ready
    // For now, return mock data
    const mockNotifications = [
      {
        id: 'notif_1',
        type: 'ride_update' as const,
        title: 'Ride Update',
        message: 'Your ride to Downtown has been confirmed',
        data: { rideId: 'ride_1' },
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      },
      {
        id: 'notif_2',
        type: 'booking_confirmed' as const,
        title: 'Booking Confirmed',
        message: 'Your booking for tomorrow has been confirmed',
        data: { bookingId: 'booking_1' },
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      },
      {
        id: 'notif_3',
        type: 'payment_received' as const,
        title: 'Payment Received',
        message: 'You received $25.00 for your ride',
        data: { amount: 25.00 },
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      },
    ];

    return mockNotifications.slice(offset, offset + limit);
  });

// Get unread notification count
export const getUnreadCount = protectedProcedure
  .query(async ({ ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;

    // TODO: Replace with real database query
    // For now, return mock count
    return 2;
  });

// Mark notification as read
export const markAsRead = protectedProcedure
  .input(z.object({
    notificationId: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;

    // TODO: Update database when notification model is ready
    console.log('Marking notification as read:', { userId, notificationId: input.notificationId });

    return { success: true };
  });

// Delete notification
export const deleteNotification = protectedProcedure
  .input(z.object({
    notificationId: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;

    // TODO: Delete from database when notification model is ready
    console.log('Deleting notification:', { userId, notificationId: input.notificationId });

    return { success: true };
  });

// Mark all notifications as read
export const markAllAsRead = protectedProcedure
  .mutation(async ({ ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;

    // TODO: Update database when notification model is ready
    console.log('Marking all notifications as read for user:', userId);

    return { success: true };
  });

// Create notification (for internal use)
export const createNotification = protectedProcedure
  .input(z.object({
    userId: z.string(),
    type: z.enum(['ride_update', 'booking_confirmed', 'payment_received', 'chat_message', 'safety_alert']),
    title: z.string(),
    message: z.string(),
    data: z.record(z.any()).optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    // Only admins can create notifications for other users
    if (!ctx.isAdmin && ctx.user.id !== input.userId) {
      throw new Error('Not authorized to create notifications for other users');
    }

    try {
      // Create notification in database
      const notification = await notificationService.sendNotification({
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        data: input.data,
      });

      return { success: true, notification };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  });

export default {
  getAll,
  getUnreadCount,
  markAsRead,
  deleteNotification,
  markAllAsRead,
  createNotification,
}; 