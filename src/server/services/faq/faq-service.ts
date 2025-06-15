/**
 * FAQ Service
 * Provides functionalities to manage FAQ entries
 */

import prismaInstance from '@/server/db/prisma-client';
import { Prisma, FAQ } from '@prisma/client';

export interface FAQFilters {
  search?: string;
  category?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FAQPaginatedResult {
  data: FAQ[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateFAQData {
  question: string;
  answer: string;
  category: string;
  isActive?: boolean;
}

export interface UpdateFAQData {
  question?: string;
  answer?: string;
  category?: string;
  isActive?: boolean;
}

/**
 * FAQ Service Implementation
 */
class FAQService {
  /**
   * Get all FAQs with filtering and pagination
   */
  async getAllFAQs(filters: FAQFilters = {}): Promise<FAQPaginatedResult> {
    const {
      search,
      category,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    // Build where conditions for filtering
    const where: Prisma.FAQWhereInput = {};

    // Apply search filter if provided
    if (search) {
      where.OR = [
        { question: { contains: search, mode: 'insensitive' } },
        { answer: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Apply category filter if provided
    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    // Apply isActive filter if provided
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Count total FAQs matching the criteria
    const total = await prismaInstance.fAQ.count({ where });

    // Calculate pagination values
    const skip = (page - 1) * limit;
    const take = limit;
    const totalPages = Math.ceil(total / limit);

    // Create sort object
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Fetch FAQs with pagination and sorting
    const faqs = await prismaInstance.fAQ.findMany({
      where,
      skip,
      take,
      orderBy
    });

    // Return FAQs with pagination metadata
    return {
      data: faqs,
      meta: {
        total,
        page,
        limit,
        totalPages
      }
    };
  }

  /**
   * Get all distinct FAQ categories
   */
  async getAllCategories(): Promise<string[]> {
    const results = await prismaInstance.fAQ.findMany({
      select: {
        category: true
      },
      distinct: ['category']
    });

    return results.map(item => item.category);
  }

  /**
   * Get a single FAQ by ID
   */
  async getFAQById(id: string): Promise<FAQ | null> {
    return prismaInstance.fAQ.findUnique({
      where: { id }
    });
  }

  /**
   * Create a new FAQ
   */
  async createFAQ(data: CreateFAQData): Promise<FAQ> {
    return prismaInstance.fAQ.create({
      data
    });
  }

  /**
   * Update an existing FAQ
   */
  async updateFAQ(id: string, data: UpdateFAQData): Promise<FAQ> {
    return prismaInstance.fAQ.update({
      where: { id },
      data
    });
  }

  /**
   * Delete a FAQ
   */
  async deleteFAQ(id: string): Promise<FAQ> {
    return prismaInstance.fAQ.delete({
      where: { id }
    });
  }
}

export const faqService = new FAQService();

/**
 * Bulk delete FAQs
 * @param faqIds Array of FAQ IDs to delete
 * @returns Object with deleted and failed arrays
 */
export async function bulkDeleteFAQs(faqIds: string[]): Promise<{
  deleted: string[];
  failed: { id: string; error: string }[];
}> {
  const deleted: string[] = [];
  const failed: { id: string; error: string }[] = [];

  for (const faqId of faqIds) {
    try {
      await faqService.deleteFAQ(faqId);
      deleted.push(faqId);
    } catch (error: unknown) {
      console.error(`Failed to delete FAQ ${faqId}:`, error);
      failed.push({
        id: faqId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return { deleted, failed };
}
