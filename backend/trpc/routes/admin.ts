import { z } from 'zod';
import { adminProcedure } from '../create-context';
import { prisma } from '../../prisma';
import { sendEmail } from '../../lib/email';
import jwt from 'jsonwebtoken';
import { emailQueue } from '../../lib/queue';
import { logCompliance } from '../../lib/compliance-log';

const JWT_SECRET = process.env.JWT_SECRET!;
const FRONTEND_URL = process.env.FRONTEND_URL!;

export const listUsers = adminProcedure.query(async () => {
  return prisma.user.findMany();
});

export const resendVerification = adminProcedure.input(
  z.object({ userId: z.string() })
).mutation(async ({ input, ctx }) => {
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) throw new Error('User not found');
  const verifyToken = jwt.sign({ id: user.id, purpose: 'verify' }, JWT_SECRET, { expiresIn: '1d' });
  await emailQueue.add('send', {
    to: user.email,
    subject: 'Verify your SmartRides email',
    html: `<p>Click <a href="${FRONTEND_URL}/verify-email?token=${verifyToken}">here</a> to verify your email address.</p>`,
  });
  const adminUser = ctx.user as { id: string };
  await logCompliance({ userId: adminUser.id, action: 'admin_resend_verification', details: `Target: ${user.email}` });
  return { success: true };
});

export const getLogs = adminProcedure.query(async () => {
  // Scaffold: return empty array or fetch from a logs table if implemented
  return [];
});

export const exportLogs = adminProcedure.query(async () => {
  // Scaffold: return CSV format of logs
  const headers = 'Timestamp,User ID,Action,Details\n';
  const logs: string[] = []; // TODO: Fetch from ComplianceLog table
  
  return headers + logs.join('\n');
});

export default {
  listUsers,
  resendVerification,
  getLogs,
  exportLogs,
}; 