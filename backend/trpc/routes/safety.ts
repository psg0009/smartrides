import { z } from 'zod';
import { protectedProcedure } from '../create-context';
import { prisma } from '../../prisma';
import notificationService from '../../lib/notifications';

// Get emergency contacts
export const getEmergencyContacts = protectedProcedure
  .query(async ({ ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;

    // TODO: Replace with real database query when models are added
    // For now, return mock data
    const mockContacts = [
      {
        id: 'contact-1',
        name: 'John Doe',
        phone: '+1 (555) 123-4567',
        email: 'john.doe@email.com',
        relationship: 'Parent',
        isActive: true,
      },
      {
        id: 'contact-2',
        name: 'Jane Smith',
        phone: '+1 (555) 987-6543',
        email: 'jane.smith@email.com',
        relationship: 'Spouse',
        isActive: true,
      },
    ];

    return mockContacts;
  });

// Add emergency contact
export const addEmergencyContact = protectedProcedure
  .input(z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email().optional(),
    relationship: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;

    // TODO: Replace with real database creation when models are added
    const newContact = {
      id: `contact-${Date.now()}`,
      userId,
      ...input,
      isActive: true,
      createdAt: new Date(),
    };

    console.log('Adding emergency contact:', newContact);

    return newContact;
  });

// Update emergency contact
export const updateEmergencyContact = protectedProcedure
  .input(z.object({
    id: z.string(),
    name: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    email: z.string().email().optional(),
    relationship: z.string().optional(),
    isActive: z.boolean().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;

    // TODO: Replace with real database update when models are added
    console.log('Updating emergency contact:', input);

    return { success: true, contact: input };
  });

// Delete emergency contact
export const deleteEmergencyContact = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;

    // TODO: Replace with real database deletion when models are added
    console.log('Deleting emergency contact:', input.id);

    return { success: true };
  });

// Share ride
export const shareRide = protectedProcedure
  .input(z.object({
    rideId: z.string(),
    shareType: z.enum(['location', 'status', 'both']),
    expiresAt: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;

    // Verify user is part of this ride
    const ride = await prisma.ride.findUnique({
      where: { id: input.rideId },
      include: { 
        driver: true,
        bookings: {
          include: { user: true }
        }
      }
    });

    if (!ride) {
      throw new Error('Ride not found');
    }

    const isDriver = ride.driverId === userId;
    const isPassenger = ride.bookings.some(booking => booking.userId === userId);

    if (!isDriver && !isPassenger) {
      throw new Error('Not authorized to share this ride');
    }

    // TODO: Replace with real database creation when models are added
    const rideShare = {
      id: `share-${Date.now()}`,
      rideId: input.rideId,
      sharedWith: 'external', // Could be specific email or user ID
      shareType: input.shareType,
      expiresAt: new Date(input.expiresAt),
      createdAt: new Date(),
    };

    console.log('Creating ride share:', rideShare);

    return { success: true, shareId: rideShare.id };
  });

// Send safety alert
export const sendSafetyAlert = protectedProcedure
  .input(z.object({
    rideId: z.string(),
    alertType: z.enum(['user_triggered', 'automatic', 'driver_concern']),
    message: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;
    const userName = typeof ctx.user === 'object' ? ctx.user.name : 'Unknown User';
    const userEmail = typeof ctx.user === 'object' ? ctx.user.email : 'unknown@example.com';

    // Verify user is part of this ride
    const ride = await prisma.ride.findUnique({
      where: { id: input.rideId },
      include: { 
        driver: true,
        bookings: {
          include: { user: true }
        }
      }
    });

    if (!ride) {
      throw new Error('Ride not found');
    }

    const isDriver = ride.driverId === userId;
    const isPassenger = ride.bookings.some(booking => booking.userId === userId);

    if (!isDriver && !isPassenger) {
      throw new Error('Not authorized to send safety alert for this ride');
    }

    // Get user's emergency contacts
    // TODO: Replace with real database query when models are added
    const emergencyContacts = [
      { name: 'Emergency Contact', phone: '+1 (555) 123-4567', email: 'emergency@example.com' }
    ];

    // Send notifications to emergency contacts
    const notificationPromises = emergencyContacts.map(contact => 
      notificationService.sendNotification({
        title: 'Safety Alert - SmartRides',
        message: `Safety alert triggered by ${userName} during ride from ${ride.origin} to ${ride.destination}. Please check on them immediately.`,
        userId: contact.email || contact.phone, // In real app, this would be user ID
        type: 'safety_alert',
        data: {
          rideId: input.rideId,
          alertType: input.alertType,
          triggeredBy: userId,
          rideDetails: {
            origin: ride.origin,
            destination: ride.destination,
            driver: ride.driver.name,
          }
        }
      })
    );

    // Send notification to SmartRides support
    notificationPromises.push(
      notificationService.sendNotification({
        title: 'Safety Alert - Support Team',
        message: `Safety alert triggered by user ${userName} (${userEmail}) during ride ${input.rideId}.`,
        userId: 'support', // In real app, this would be support team user ID
        type: 'safety_alert',
        data: {
          rideId: input.rideId,
          alertType: input.alertType,
          triggeredBy: userId,
          userDetails: {
            name: userName,
            email: userEmail,
            phone: 'unknown',
          }
        }
      })
    );

    try {
      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Error sending safety alert notifications:', error);
    }

    // Log the safety alert (TODO: Replace with real database call when model is available)
    console.log('Safety alert logged:', {
      userId,
      action: 'safety_alert_triggered',
      details: JSON.stringify({
        rideId: input.rideId,
        alertType: input.alertType,
        message: input.message,
        timestamp: new Date().toISOString(),
      })
    });

    return { success: true, message: 'Safety alert sent successfully' };
  });

// Get ride share status
export const getRideShareStatus = protectedProcedure
  .input(z.object({
    rideId: z.string(),
  }))
  .query(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;

    // TODO: Replace with real database query when models are added
    const mockShareStatus = {
      isShared: true,
      shareType: 'both',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      sharedWith: ['john.doe@email.com', 'jane.smith@email.com'],
    };

    return mockShareStatus;
  });

// Get safety statistics
export const getSafetyStats = protectedProcedure
  .query(async ({ ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;

    // TODO: Replace with real database queries when models are added
    const mockStats = {
      totalRides: 45,
      safetyAlertsTriggered: 0,
      emergencyContactsCount: 3,
      lastSafetyCheck: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      safetyScore: 95, // 0-100
    };

    return mockStats;
  });

export default {
  getEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  shareRide,
  sendSafetyAlert,
  getRideShareStatus,
  getSafetyStats,
}; 