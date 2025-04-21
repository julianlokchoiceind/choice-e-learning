/**
 * Helper utilities for safe database operations
 * Provides wrappers around common Prisma operations with error handling
 */

import { PrismaClient, Prisma } from '@prisma/client';
import prisma from './prisma-client';

/**
 * Safely execute a Prisma operation with proper error handling
 * @param operation Function that executes a Prisma operation
 * @param defaultValue Value to return on error (optional)
 * @param logPrefix Prefix for error logging (optional)
 * @returns Result of the operation or defaultValue if it fails
 */
export async function safeExec<T>(
  operation: () => Promise<T>,
  defaultValue?: T,
  logPrefix = 'Prisma operation'
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`${logPrefix} failed:`, error);
    
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw error;
  }
}

/**
 * Safely execute findMany with proper error handling
 * @param model Prisma model to query
 * @param args Prisma query arguments
 * @returns Array of results or empty array on error
 */
export async function safeFindMany<T, A>(
  model: any,
  args?: A
): Promise<T[]> {
  if (!model || !model.findMany) {
    console.error('Invalid Prisma model provided to safeFindMany');
    return [];
  }
  
  return safeExec<T[]>(
    () => model.findMany(args),
    [],
    `Prisma ${model.name || 'model'}.findMany`
  );
}

/**
 * Safely execute findUnique with proper error handling
 * @param model Prisma model to query
 * @param args Prisma query arguments
 * @returns Result or null on error
 */
export async function safeFindUnique<T, A>(
  model: any,
  args: A
): Promise<T | null> {
  if (!model || !model.findUnique) {
    console.error('Invalid Prisma model provided to safeFindUnique');
    return null;
  }
  
  return safeExec<T | null>(
    () => model.findUnique(args),
    null,
    `Prisma ${model.name || 'model'}.findUnique`
  );
}

/**
 * Safely execute findFirst with proper error handling
 * @param model Prisma model to query
 * @param args Prisma query arguments
 * @returns Result or null on error
 */
export async function safeFindFirst<T, A>(
  model: any,
  args: A
): Promise<T | null> {
  if (!model || !model.findFirst) {
    console.error('Invalid Prisma model provided to safeFindFirst');
    return null;
  }
  
  return safeExec<T | null>(
    () => model.findFirst(args),
    null,
    `Prisma ${model.name || 'model'}.findFirst`
  );
}

/**
 * Safely execute create with proper error handling
 * @param model Prisma model to query
 * @param args Prisma query arguments
 * @returns Created object or null on error
 */
export async function safeCreate<T, A>(
  model: any,
  args: A
): Promise<T | null> {
  if (!model || !model.create) {
    console.error('Invalid Prisma model provided to safeCreate');
    return null;
  }
  
  return safeExec<T | null>(
    () => model.create(args),
    null,
    `Prisma ${model.name || 'model'}.create`
  );
}

/**
 * Safely check if prisma client is available
 * @returns True if prisma client is available
 */
export function isPrismaAvailable(): boolean {
  return !!prisma;
}

/**
 * Get a safe reference to a Prisma model
 * @param modelName Name of the model to get
 * @returns Prisma model or null if not available
 */
export function getModel(modelName: keyof PrismaClient): any {
  if (!prisma) {
    console.error('Prisma client is not available');
    return null;
  }
  
  const model = prisma[modelName];
  if (!model) {
    console.error(`Model ${modelName} not found in Prisma client`);
    return null;
  }
  
  return model;
}

// Export prisma client for convenience
export { prisma };
