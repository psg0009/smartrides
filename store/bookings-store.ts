import { create } from 'zustand';
import { Booking, Ride, User } from '@/types';
import { mockBookings } from '@/mocks/data';
import { useAuthStore } from './auth-store';

interface BookingsState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  fetchUserBookings: () => Promise<void>;
  createBooking: (ride: Ride, passengers: number) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
}

export const useBookingsStore = create<BookingsState>((set, get) => ({
  bookings: [],
  isLoading: false,
  error: null,
  
  fetchUserBookings: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = useAuthStore.getState().user;
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // In a real app, you would fetch from an API with the user ID
      const userBookings = mockBookings.filter(booking => booking.user.id === user.id);
      set({ bookings: userBookings, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch bookings', isLoading: false });
    }
  },
  
  createBooking: async (ride, passengers) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = useAuthStore.getState().user as User;
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // In a real app, you would send this to an API
      const newBooking: Booking = {
        id: `booking-${Date.now()}`,
        ride,
        user,
        status: 'pending',
        createdAt: new Date().toISOString(),
        passengers,
        totalPrice: ride.price * passengers,
      };
      
      set(state => ({ 
        bookings: [...state.bookings, newBooking], 
        isLoading: false 
      }));
    } catch (error) {
      set({ error: 'Failed to create booking', isLoading: false });
    }
  },
  
  cancelBooking: async (bookingId) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would send this to an API
      set(state => ({
        bookings: state.bookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' } 
            : booking
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to cancel booking', isLoading: false });
    }
  },
}));