import { PrismaClient } from '@prisma/client';

// Export all MongoDB functions from the server-only file
export * from './db/mongodb';

// PrismaClient singleton setup
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Export prisma client as default
export default prisma;