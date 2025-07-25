import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const listBookingsSchema = z.object({
  userId: z.string(),
  status: z.enum(["confirmed", "cancelled", "completed"]).optional(),
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0),
});

export default publicProcedure
  .input(listBookingsSchema)
  .query(async ({ input }) => {
    // Mock data - in a real app, you would query your database
    const mockBookings = [
      {
        id: "booking-1",
        rideId: "ride-1",
        userId: input.userId,
        passengers: 2,
        totalAmount: 90,
        paymentMethod: "card" as const,
        status: "confirmed" as const,
        bookingDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        confirmationCode: "SR12345678",
        ride: {
          id: "ride-1",
          origin: "Penn State University",
          destination: "Philadelphia International Airport",
          departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          driver: {
            name: "Sarah Johnson",
            rating: 4.9,
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
          },
        },
      },
      {
        id: "booking-2",
        rideId: "ride-2",
        userId: input.userId,
        passengers: 1,
        totalAmount: 35,
        paymentMethod: "university" as const,
        status: "completed" as const,
        bookingDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        confirmationCode: "SR87654321",
        ride: {
          id: "ride-2",
          origin: "University of Pittsburgh",
          destination: "Pittsburgh International Airport",
          departureTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          driver: {
            name: "Mike Chen",
            rating: 4.8,
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          },
        },
      },
    ];
    
    // Filter bookings based on input
    let filteredBookings = mockBookings;
    
    if (input.status) {
      filteredBookings = filteredBookings.filter(booking => booking.status === input.status);
    }
    
    // Apply pagination
    const paginatedBookings = filteredBookings.slice(input.offset, input.offset + input.limit);
    
    return {
      bookings: paginatedBookings,
      total: filteredBookings.length,
      hasMore: input.offset + input.limit < filteredBookings.length,
    };
  });