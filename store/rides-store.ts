import { create } from 'zustand';
import { Ride, RideType } from '@/types';
import { mockRides } from '@/mocks/data';

interface RidesState {
  rides: Ride[];
  filteredRides: Ride[];
  isLoading: boolean;
  error: string | null;
  fetchRides: () => Promise<void>;
  filterRides: (type?: RideType, origin?: string, destination?: string, date?: string) => void;
  getRideById: (id: string) => Ride | undefined;
}

export const useRidesStore = create<RidesState>((set, get) => ({
  rides: [],
  filteredRides: [],
  isLoading: false,
  error: null,
  
  fetchRides: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would fetch from an API
      set({ rides: mockRides, filteredRides: mockRides, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch rides', isLoading: false });
    }
  },
  
  filterRides: (type, origin, destination, date) => {
    const { rides } = get();
    
    let filtered = [...rides];
    
    if (type) {
      filtered = filtered.filter(ride => ride.type === type);
    }
    
    if (origin) {
      filtered = filtered.filter(ride => 
        ride.origin.toLowerCase().includes(origin.toLowerCase())
      );
    }
    
    if (destination) {
      filtered = filtered.filter(ride => 
        ride.destination.toLowerCase().includes(destination.toLowerCase())
      );
    }
    
    if (date) {
      filtered = filtered.filter(ride => {
        const rideDate = new Date(ride.departureTime).toDateString();
        const filterDate = new Date(date).toDateString();
        return rideDate === filterDate;
      });
    }
    
    set({ filteredRides: filtered });
  },
  
  getRideById: (id) => {
    return get().rides.find(ride => ride.id === id);
  },
}));