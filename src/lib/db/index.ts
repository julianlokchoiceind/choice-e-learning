/**
 * Database access layer
 * Central export point for database-related functionality
 */

// Re-export the prisma client from our more robust implementation
import prisma from './prisma-client';

// Re-export the prisma helper functions
export * from './prisma-helper';

// Re-export all database services
export * from './services';

// Export both as named export and default export for flexibility
export { prisma };
export default prisma;