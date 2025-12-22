import { PrismaClient } from '../generated/prisma';

// Extend global type to store Prisma instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create or reuse Prisma client
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Optional: Add logging in development
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],

    // Database connection configuration
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Store in global to prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Default export for convenience
export default prisma;
