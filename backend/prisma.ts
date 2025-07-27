import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

console.log('🔍 Prisma client initialization starting...');
console.log('📁 Current working directory:', process.cwd());
console.log('🔧 Node environment:', process.env.NODE_ENV);

// Create a single instance for the entire application
const prisma = global.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

console.log('✅ Prisma client initialized successfully');

export { prisma }; 