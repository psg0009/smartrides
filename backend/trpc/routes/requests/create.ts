import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { prisma } from '../../../prisma';

export default protectedProcedure
  .input(z.object({
    from: z.string(),
    to: z.string(),
    date: z.string(),
    passengers: z.string(),
    bags: z.string(),
    notes: z.string().optional(),
    priceRange: z.string().optional(),
    userId: z.string(),
  }))
  .mutation(async ({ input }) => {
    const request = await prisma.rideRequest.create({
      data: {
        from: input.from,
        to: input.to,
        date: new Date(input.date),
        passengers: parseInt(input.passengers, 10),
        bags: parseInt(input.bags, 10),
        notes: input.notes,
        priceRange: input.priceRange,
        userId: input.userId,
        status: 'open',
      },
    });
    return { success: true, request };
  }); 