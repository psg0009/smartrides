import { protectedProcedure } from '../create-context';
import { getUploadUrl } from '../../lib/s3';
import { z } from 'zod';

export const getSignedUploadUrl = protectedProcedure
  .input(z.object({ contentType: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const user = ctx.user as { id: string };
    const key = `uploads/${user.id}/${Date.now()}`;
    const url = await getUploadUrl(key, input.contentType);
    return { url, key };
  });

export default { getSignedUploadUrl }; 