// Export the Prisma client from our central location
import prisma from './db/index';

// Re-export all database services
export * from './db/services';

// Export prisma client directly for convenience
export { prisma };

// Export prisma client as default
export default prisma;