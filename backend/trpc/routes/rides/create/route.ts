import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { prisma } from "../../../../prisma";

export default protectedProcedure
  .input(z.object({
    type: z.enum(["carpool", "chauffeur"]),
    driverId: z.string(),
    passengers: z.string(),
    origin: z.string(),
    destination: z.string(),
    departureTime: z.string(),
    arrivalTime: z.string(),
    price: z.string(),
    availableSeats: z.string(),
    status: z.enum(["scheduled", "in-progress", "completed", "cancelled"]),
    distance: z.string(),
    duration: z.string(),
  }))
  .mutation(async ({ input }) => {
    const ride = await prisma.ride.create({
      data: {
        type: input.type,
        driverId: input.driverId,
        passengers: parseInt(input.passengers, 10),
        origin: input.origin,
        destination: input.destination,
        departureTime: new Date(input.departureTime),
        arrivalTime: new Date(input.arrivalTime),
        price: parseFloat(input.price),
        availableSeats: parseInt(input.availableSeats, 10),
        status: input.status,
        distance: input.distance,
        duration: input.duration,
      },
    });
    return { success: true, ride };
  });