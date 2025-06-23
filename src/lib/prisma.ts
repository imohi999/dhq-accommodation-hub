import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Add more detailed logging
const logLevel: Prisma.LogLevel[] = process.env.NODE_ENV === 'development' 
  ? ['query', 'error', 'warn'] 
  : ['error', 'warn'];

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: logLevel,
});

// Always store in global to prevent multiple instances
globalForPrisma.prisma = prisma;

// Log database connection info
console.log('[Prisma] Environment:', process.env.NODE_ENV);
console.log('[Prisma] Database URL exists:', !!process.env.DATABASE_URL);