import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { prisma } from '../../../prisma';

export const getById = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const request = await prisma.rideRequest.findUnique({
      where: { id: input.id },
    });
    return request;
  });

export default publicProcedure.query(async () => {
  const requests = await prisma.rideRequest.findMany({
    where: { status: 'open' },
    orderBy: { createdAt: 'desc' },
  });
  return requests;
}); 