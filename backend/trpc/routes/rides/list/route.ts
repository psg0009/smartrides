import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const listRidesSchema = z.object({
  origin: z.string().optional(),
  destination: z.string().optional(),
  date: z.string().optional(),
  rideType: z.enum(["carpool", "chauffeur"]).optional(),
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0),
});

export default publicProcedure
  .input(listRidesSchema)
  .query(async ({ input }) => {
    // Mock data - in a real app, you would query your database
    const mockRides = [
      {
        id: "ride-1",
        origin: "Penn State University",
        destination: "Philadelphia International Airport",
        departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        price: 45,
        availableSeats: 3,
        bookedSeats: 1,
        rideType: "carpool" as const,
        status: "active" as const,
        driver: {
          id: "driver-1",
          name: "Sarah Johnson",
          rating: 4.9,
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
          university: "Penn State University",
          verified: true,
        },
        description: "Comfortable ride with AC and music. No smoking please.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "ride-2",
        origin: "University of Pittsburgh",
        destination: "Pittsburgh International Airport",
        departureTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        price: 35,
        availableSeats: 2,
        bookedSeats: 2,
        rideType: "carpool" as const,
        status: "active" as const,
        driver: {
          id: "driver-2",
          name: "Mike Chen",
          rating: 4.8,
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          university: "University of Pittsburgh",
          verified: true,
        },
        description: "Early morning departure. Please be on time!",
        createdAt: new Date().toISOString(),
      },
    ];
    
    // Filter rides based on input
    let filteredRides = mockRides;
    
    if (input.origin) {
      filteredRides = filteredRides.filter(ride => 
        ride.origin.toLowerCase().includes(input.origin!.toLowerCase())
      );
    }
    
    if (input.destination) {
      filteredRides = filteredRides.filter(ride => 
        ride.destination.toLowerCase().includes(input.destination!.toLowerCase())
      );
    }
    
    if (input.rideType) {
      filteredRides = filteredRides.filter(ride => ride.rideType === input.rideType);
    }
    
    // Apply pagination
    const paginatedRides = filteredRides.slice(input.offset, input.offset + input.limit);
    
    return {
      rides: paginatedRides,
      total: filteredRides.length,
      hasMore: input.offset + input.limit < filteredRides.length,
    };
  });