import { z } from 'zod';
import { protectedProcedure } from '../create-context';
import { prisma } from '../../prisma';

// Mock ride locations for now - will be replaced with real database
const rideLocations = new Map();
const rideStatusUpdates = new Map();

// Update ride location
export const updateRideLocation = protectedProcedure
  .input(z.object({
    rideId: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    accuracy: z.number().optional(),
    speed: z.number().optional(),
    heading: z.number().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;

    // Verify user is the driver of this ride
    const ride = await prisma.ride.findUnique({
      where: { id: input.rideId },
      include: { driver: true }
    });

    if (!ride || ride.driverId !== userId) {
      throw new Error('Not authorized to update this ride location');
    }

    // Update location
    const location = {
      rideId: input.rideId,
      latitude: input.latitude,
      longitude: input.longitude,
      accuracy: input.accuracy,
      speed: input.speed,
      heading: input.heading,
      updatedAt: new Date(),
    };

    rideLocations.set(input.rideId, location);

    // TODO: Broadcast to WebSocket clients
    // wsManager.broadcastToRide(input.rideId, {
    //   type: 'location_update',
    //   data: location
    // });

    return { success: true, location };
  });

// Get ride location
export const getRideLocation = protectedProcedure
  .input(z.object({
    rideId: z.string(),
  }))
  .query(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;

    // Verify user is part of this ride (driver or passenger)
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
      throw new Error('Not authorized to view this ride location');
    }

    const location = rideLocations.get(input.rideId);
    return location || null;
  });

// Update ride status
export const updateRideStatus = protectedProcedure
  .input(z.object({
    rideId: z.string(),
    status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']),
    notes: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;

    // Verify user is the driver of this ride
    const ride = await prisma.ride.findUnique({
      where: { id: input.rideId },
      include: { driver: true }
    });

    if (!ride || ride.driverId !== userId) {
      throw new Error('Not authorized to update this ride status');
    }

    // Update ride status in database
    const updatedRide = await prisma.ride.update({
      where: { id: input.rideId },
      data: { 
        status: input.status,
      },
      include: { 
        driver: true,
        bookings: {
          include: { user: true }
        }
      }
    });

    // Store status update
    const statusUpdate = {
      rideId: input.rideId,
      status: input.status,
      notes: input.notes,
      updatedBy: userId,
      updatedAt: new Date(),
    };

    rideStatusUpdates.set(input.rideId, statusUpdate);

    // TODO: Send notifications to all passengers
    // const passengerIds = ride.bookings.map(booking => booking.userId);
    // await notificationService.sendRideUpdateNotification(
    //   input.rideId,
    //   input.status,
    //   passengerIds
    // );

    // TODO: Broadcast to WebSocket clients
    // wsManager.broadcastToRide(input.rideId, {
    //   type: 'ride_update',
    //   data: statusUpdate
    // });

    return { success: true, ride: updatedRide };
  });

// Get ride status history
export const getRideStatusHistory = protectedProcedure
  .input(z.object({
    rideId: z.string(),
  }))
  .query(async ({ input, ctx }) => {
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
      throw new Error('Not authorized to view this ride status');
    }

    const statusUpdate = rideStatusUpdates.get(input.rideId);
    return statusUpdate ? [statusUpdate] : [];
  });

// Start ride tracking
export const startRideTracking = protectedProcedure
  .input(z.object({
    rideId: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;

    // Verify user is the driver
    const ride = await prisma.ride.findUnique({
      where: { id: input.rideId },
      include: { driver: true }
    });

    if (!ride || ride.driverId !== userId) {
      throw new Error('Not authorized to start tracking for this ride');
    }

    // Update ride status to in_progress
    const updatedRide = await prisma.ride.update({
      where: { id: input.rideId },
      data: { 
        status: 'in_progress',
      }
    });

    // TODO: Subscribe to WebSocket for real-time updates
    // wsManager.subscribeToRide(userId, input.rideId);

    return { success: true, ride: updatedRide };
  });

// Stop ride tracking
export const stopRideTracking = protectedProcedure
  .input(z.object({
    rideId: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;

    // Verify user is the driver
    const ride = await prisma.ride.findUnique({
      where: { id: input.rideId },
      include: { driver: true }
    });

    if (!ride || ride.driverId !== userId) {
      throw new Error('Not authorized to stop tracking for this ride');
    }

    // TODO: Unsubscribe from WebSocket
    // wsManager.unsubscribeFromRide(userId, input.rideId);

    return { success: true };
  });

// Get estimated arrival time
export const getEstimatedArrival = protectedProcedure
  .input(z.object({
    rideId: z.string(),
  }))
  .query(async ({ input, ctx }) => {
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
      throw new Error('Not authorized to view this ride information');
    }

    const location = rideLocations.get(input.rideId);
    if (!location) {
      return { estimatedArrival: null, message: 'Driver location not available' };
    }

    // TODO: Calculate ETA using Google Maps API or similar
    // For now, return a mock ETA
    const estimatedArrival = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    return {
      estimatedArrival: estimatedArrival.toISOString(),
      currentLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      speed: location.speed,
      heading: location.heading,
    };
  });

export default {
  updateRideLocation,
  getRideLocation,
  updateRideStatus,
  getRideStatusHistory,
  startRideTracking,
  stopRideTracking,
  getEstimatedArrival,
}; 