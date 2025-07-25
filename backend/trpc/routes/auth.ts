import { z } from 'zod';
import { publicProcedure, protectedProcedure } from '../create-context';
import { prisma } from '../../prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { emailQueue } from '../../lib/queue';
import { rateLimit } from '../rate-limit';
import { logCompliance } from '../../lib/compliance-log';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8081';

export const loginProcedure = publicProcedure
  .input(z.object({ email: z.string().email(), password: z.string().min(6) }))
  .mutation(async ({ input }) => {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw new Error('Invalid credentials');
    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, university: user.university, avatar: user.avatar, rating: user.rating, verified: user.verified, verificationStatus: user.verificationStatus },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return { token, user };
  });

export const signupProcedure = publicProcedure
  .input(z.object({ name: z.string(), email: z.string().email(), password: z.string().min(6), university: z.string() }))
  .mutation(async ({ input }) => {
    rateLimit(input.email);
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new Error('Email already in use');
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        university: input.university,
        avatar: '',
        rating: 5,
        verified: false,
        verificationStatus: 'none',
        role: 'student',
      },
    });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, university: user.university, avatar: user.avatar, rating: user.rating, verified: user.verified, verificationStatus: user.verificationStatus },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    // Email verification token
    const verifyToken = jwt.sign({ id: user.id, purpose: 'verify' }, JWT_SECRET, { expiresIn: '1d' });
    await emailQueue.add('send', {
      to: user.email,
      subject: 'Verify your SmartRides email',
      html: `<p>Click <a href="${FRONTEND_URL}/verify-email?token=${verifyToken}">here</a> to verify your email address.</p>`,
    });
    await logCompliance({ userId: user.id, action: 'signup', details: `Email: ${input.email}` });
    return { token, user };
  });

export const requestPasswordReset = publicProcedure
  .input(z.object({ email: z.string().email() }))
  .mutation(async ({ input }) => {
    rateLimit(input.email);
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) return { success: true };
    const token = jwt.sign({ id: user.id, purpose: 'reset' }, JWT_SECRET, { expiresIn: '15m' });
    await emailQueue.add('send', {
      to: user.email,
      subject: 'Reset your SmartRides password',
      html: `<p>Click <a href="${FRONTEND_URL}/reset-password?token=${token}">here</a> to reset your password. This link expires in 15 minutes.</p>`,
    });
    await logCompliance({ userId: user.id, action: 'password_reset_request', details: `Email: ${input.email}` });
    return { success: true };
  });

export const confirmPasswordReset = publicProcedure
  .input(z.object({ token: z.string(), newPassword: z.string().min(6) }))
  .mutation(async ({ input }) => {
    let payload: any;
    try {
      payload = jwt.verify(input.token, JWT_SECRET);
      if (payload.purpose !== 'reset') throw new Error('Invalid token');
    } catch {
      throw new Error('Invalid or expired token');
    }
    const passwordHash = await bcrypt.hash(input.newPassword, 10);
    await prisma.user.update({ where: { id: payload.id }, data: { passwordHash } });
    return { success: true };
  });

export const verifyEmail = publicProcedure
  .input(z.object({ token: z.string() }))
  .mutation(async ({ input }) => {
    let payload: any;
    try {
      payload = jwt.verify(input.token, JWT_SECRET);
      if (payload.purpose !== 'verify') throw new Error('Invalid token');
    } catch {
      throw new Error('Invalid or expired token');
    }
    await prisma.user.update({ where: { id: payload.id }, data: { verified: true } });
    return { success: true };
  });

export const deleteAccount = protectedProcedure.mutation(async ({ ctx }) => {
  const user = ctx.user as { id: string; email: string };
  if (!user?.id) throw new Error('Not authenticated');
  await prisma.user.delete({ where: { id: user.id } });
  await logCompliance({ userId: user.id, action: 'delete_account', details: `Email: ${user.email}` });
  return { success: true };
});

export default {
  login: loginProcedure,
  signup: signupProcedure,
  requestPasswordReset,
  confirmPasswordReset,
  verifyEmail,
  deleteAccount,
}; 