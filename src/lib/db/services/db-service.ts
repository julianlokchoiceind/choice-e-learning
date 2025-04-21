"use server";

import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';

/**
 * Generic method to find a record by ID
 * @param model The Prisma model name
 * @param id The record ID
 * @returns The record or null if not found
 */
export async function findById<T extends keyof typeof prisma>(
  model: T, 
  id: string
): Promise<any | null> {
  try {
    // Validate ID format for MongoDB
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.error(`Invalid ID format: ${id}`);
      return null;
    }
    
    const record = await (prisma[model] as any).findUnique({
      where: { id }
    });
    
    return record;
  } catch (error) {
    console.error(`Error finding ${String(model)} by ID:`, error);
    return null;
  }
}

/**
 * Generic method to find records by a filter
 * @param model The Prisma model name
 * @param where The filter criteria
 * @param options Additional options like include, orderBy, etc.
 * @returns Array of matching records
 */
export async function findMany<T extends keyof typeof prisma>(
  model: T,
  where: any = {},
  options: any = {}
): Promise<any[]> {
  try {
    const records = await (prisma[model] as any).findMany({
      where,
      ...options
    });
    
    return records;
  } catch (error) {
    console.error(`Error finding ${String(model)} records:`, error);
    return [];
  }
}

/**
 * Generic method to find a single record by filter
 * @param model The Prisma model name
 * @param where The filter criteria
 * @param options Additional options like include
 * @returns The record or null if not found
 */
export async function findOne<T extends keyof typeof prisma>(
  model: T,
  where: any,
  options: any = {}
): Promise<any | null> {
  try {
    const record = await (prisma[model] as any).findFirst({
      where,
      ...options
    });
    
    return record;
  } catch (error) {
    console.error(`Error finding ${String(model)} record:`, error);
    return null;
  }
}

/**
 * Generic method to create a record
 * @param model The Prisma model name
 * @param data The record data
 * @returns The created record or null if creation failed
 */
export async function createRecord<T extends keyof typeof prisma>(
  model: T,
  data: any
): Promise<any | null> {
  try {
    const record = await (prisma[model] as any).create({
      data
    });
    
    return record;
  } catch (error) {
    console.error(`Error creating ${String(model)}:`, error);
    return null;
  }
}

/**
 * Generic method to update a record
 * @param model The Prisma model name
 * @param id The record ID
 * @param data The update data
 * @returns The updated record or null if update failed
 */
export async function updateRecord<T extends keyof typeof prisma>(
  model: T,
  id: string,
  data: any
): Promise<any | null> {
  try {
    // Validate ID format for MongoDB
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.error(`Invalid ID format: ${id}`);
      return null;
    }
    
    const record = await (prisma[model] as any).update({
      where: { id },
      data
    });
    
    return record;
  } catch (error) {
    console.error(`Error updating ${String(model)}:`, error);
    return null;
  }
}

/**
 * Generic method to delete a record
 * @param model The Prisma model name
 * @param id The record ID
 * @returns The deleted record or null if deletion failed
 */
export async function deleteRecord<T extends keyof typeof prisma>(
  model: T,
  id: string
): Promise<any | null> {
  try {
    // Validate ID format for MongoDB
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.error(`Invalid ID format: ${id}`);
      return null;
    }
    
    const record = await (prisma[model] as any).delete({
      where: { id }
    });
    
    return record;
  } catch (error) {
    console.error(`Error deleting ${String(model)}:`, error);
    return null;
  }
}

/**
 * Generic method to count records
 * @param model The Prisma model name
 * @param where The filter criteria
 * @returns The count of matching records
 */
export async function countRecords<T extends keyof typeof prisma>(
  model: T,
  where: any = {}
): Promise<number> {
  try {
    const count = await (prisma[model] as any).count({
      where
    });
    
    return count;
  } catch (error) {
    console.error(`Error counting ${String(model)} records:`, error);
    return 0;
  }
}

/**
 * Execute a transaction with multiple operations
 * @param fn Function containing the transaction operations
 * @returns Result of the transaction
 */
export async function executeTransaction<T>(
  fn: (prisma: Prisma.TransactionClient) => Promise<T>
): Promise<T | null> {
  try {
    return await prisma.$transaction(fn);
  } catch (error) {
    console.error('Transaction error:', error);
    return null;
  }
}
