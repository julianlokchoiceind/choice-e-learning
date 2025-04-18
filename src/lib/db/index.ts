// Re-export the prisma client from our more robust implementation
import prisma from './prisma-client';

// Re-export the prisma helper functions
export * from './prisma-helper';

// Export both as named export and default export for flexibility
export { prisma };
export default prisma; 