import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const getRideSchema = z.object({
  id: z.string(),
});

export default publicProcedure
  .input(getRideSchema)
  .query(async ({ input }) => {
    // Mock data - in a real app, you would query your database
    const mockRide = {
      id: input.id,
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
        phone: "+1 (555) 123-4567",
        email: "sarah.j@psu.edu",
      },
      description: "Comfortable ride with AC and music. No smoking please.",
      pickupInstructions: "Meet at the main entrance of the HUB building",
      carDetails: {
        make: "Honda",
        model: "Civic",
        year: 2020,
        color: "Silver",
        licensePlate: "ABC-1234",
      },
      createdAt: new Date().toISOString(),
    };
    
    if (!mockRide) {
      throw new Error("Ride not found");
    }
    
    return mockRide;
  });