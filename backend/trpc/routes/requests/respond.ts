import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { prisma } from '../../../prisma';

export const getOfferById = protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const offer = await prisma.rideOffer.findUnique({
      where: { id: input.id },
      include: {
        request: true,
        driver: true,
      },
    });
    return offer;
  });

export default protectedProcedure
  .input(z.object({
    requestId: z.string(),
    driverId: z.string(),
    price: z.string(),
  }))
  .mutation(async ({ input }) => {
    const offer = await prisma.rideOffer.create({
      data: {
        requestId: input.requestId,
        driverId: input.driverId,
        price: parseFloat(input.price),
        status: 'pending',
      },
    });
    return { success: true, offer };
  }); 