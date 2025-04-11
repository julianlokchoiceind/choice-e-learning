// Try to import prisma but handle the case where it fails
import { PrismaClient } from '@prisma/client';
let prisma: PrismaClient | null = null;

try {
  // Create a new PrismaClient instance
  prisma = new PrismaClient();
  console.log('PrismaClient initialized successfully');
} catch (error) {
  console.warn('Failed to initialize PrismaClient:', error);
  console.warn('The application will continue using MongoDB directly');
}

// Export all MongoDB functions from the server-only file
export * from './db/mongodb';

// Export prisma client (which might be null if initialization failed)
export { prisma };

// Export prisma client as default (but may be null)
export default prisma;