import { z } from 'zod';
import { adminProcedure } from '../../create-context';

export default adminProcedure
  .input(z.object({
    userId: z.string(),
    status: z.enum(['approved', 'rejected']),
  }))
  .mutation(async ({ input }) => {
    // TODO: Mark user as verified/rejected in DB
    console.log('Admin verification:', input);
    return { success: true, status: input.status };
  }); 