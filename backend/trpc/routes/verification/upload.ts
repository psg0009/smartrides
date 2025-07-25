import { z } from 'zod';
import { publicProcedure } from '../../create-context';

export default publicProcedure
  .input(z.object({ userId: z.string(), idImage: z.string() }))
  .mutation(async ({ input }) => {
    // TODO: Store image in cloud storage or DB
    // For now, just log and return success
    console.log('Received ID upload:', input.userId, input.idImage.slice(0, 30) + '...');
    // TODO: Set user verification status to 'pending' in DB
    return { success: true, status: 'pending' };
  }); 