import { prisma } from '../../prisma';
export async function logCompliance({ userId, action, details }: { userId?: string, action: string, details?: string }) {
  await prisma.complianceLog.create({ data: { userId, action, details } });
} 