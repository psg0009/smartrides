import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const createRideSchema = z.object({
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  departureTime: z.string().datetime(),
  price: z.number().positive("Price must be positive"),
  availableSeats: z.number().int().min(1).max(8),
  rideType: z.enum(["carpool", "chauffeur"]),
  description: z.string().optional(),
  driverId: z.string(),
});

export default publicProcedure
  .input(createRideSchema)
  .mutation(async ({ input }) => {
    // In a real app, you would save this to a database
    const ride = {
      id: `ride-${Date.now()}`,
      ...input,
      createdAt: new Date().toISOString(),
      status: "active" as const,
      bookedSeats: 0,
    };
    
    console.log("Creating ride:", ride);
    
    return {
      success: true,
      ride,
      message: "Ride created successfully",
    };
  });