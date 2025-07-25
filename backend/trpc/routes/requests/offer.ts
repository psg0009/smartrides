import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { prisma } from '../../../prisma';

export default protectedProcedure
  .input(z.object({
    offerId: z.string(),
    userId: z.string(),
  }))
  .mutation(async ({ input }) => {
    // Accept the offer
    const offer = await prisma.rideOffer.update({
      where: { id: input.offerId },
      data: { status: 'accepted' },
    });
    // Create a booking
    const booking = await prisma.booking.create({
      data: {
        offerId: input.offerId,
        userId: input.userId,
        status: 'confirmed',
        passengers: 1, // TODO: Passengers should be dynamic
        totalPrice: offer.price,
      },
    });
    return { success: true, booking };
  }); 