/**
 * Courses API endpoint
 * Handles fetching and managing course information
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAllCourses } from '@/services/courses';
import { 
  apiSuccess, 
  apiServerError 
} from '@/lib/api/api-response';
import { 
  createRouteHandler, 
  withErrorHandling, 
  withAdmin 
} from '@/lib/api/route-handlers';
import { 
  validateRequest, 
  parseQueryParams 
} from '@/lib/api/request-parser';
import { 
  documentEndpoint 
} from '@/lib/api/api-docs';

// Query parameters schema for course listing
const courseQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'createdAt', 'popularity']).optional(),
  order: z.enum(['asc', 'desc']).optional()
}).transform(data => ({
  page: data.page || 1,
  limit: data.limit || 10,
  category: data.category,
  search: data.search,
  sortBy: data.sortBy || 'createdAt',
  order: data.order || 'desc'
}));

// Document the API endpoint
documentEndpoint({
  path: '/api/courses',
  method: 'GET',
  description: 'Get a list of all available courses',
  requiresAuth: false,
  queryParams: [
    { 
      name: 'page', 
      type: 'number', 
      required: false, 
      description: 'Page number for pagination (default: 1)' 
    },
    { 
      name: 'limit', 
      type: 'number', 
      required: false, 
      description: 'Number of items per page (default: 10)' 
    },
    { 
      name: 'category', 
      type: 'string', 
      required: false, 
      description: 'Filter by course category' 
    },
    { 
      name: 'search', 
      type: 'string', 
      required: false, 
      description: 'Search term to filter courses' 
    },
    { 
      name: 'sortBy', 
      type: 'string', 
      required: false, 
      description: 'Field to sort by (title, createdAt, popularity)' 
    },
    { 
      name: 'order', 
      type: 'string', 
      required: false, 
      description: 'Sort order (asc, desc)' 
    }
  ],
  responses: [
    {
      status: 200,
      description: 'Courses retrieved successfully',
      example: {
        success: true,
        data: [
          {
            id: '1234567890',
            title: 'Introduction to Programming',
            description: 'Learn the basics of programming',
            category: 'Programming',
            imageUrl: 'https://example.com/course.jpg',
            difficulty: 'Beginner',
            createdAt: '2023-01-01T00:00:00.000Z'
          }
        ],
        meta: {
          pagination: {
            page: 1,
            pageSize: 10,
            totalItems: 100,
            totalPages: 10,
            hasNextPage: true,
            hasPrevPage: false
          }
        }
      }
    },
    {
      status: 500,
      description: 'Server error',
      example: {
        success: false,
        error: 'Failed to fetch courses',
        code: 'SERVER_ERROR'
      }
    }
  ]
});

// GET handler to fetch courses
const getCourses = withErrorHandling(async (req: NextRequest) => {
  // Parse query parameters
  const queryResult = parseQueryParams(req, courseQuerySchema);
  
  if (!queryResult.success) {
    return queryResult.error;
  }
  
  const { page, limit, category, search, sortBy, order } = queryResult.data;
  
  try {
    // Get courses from service
    const coursesResult = await getAllCourses({
      page,
      limit,
      category,
      search,
      sortBy,
      order
    });
    
    const { courses, totalItems } = coursesResult;
    const totalPages = Math.ceil(totalItems / limit);
    
    // Return courses with pagination info
    return apiSuccess(courses, undefined, {
      pagination: {
        page,
        pageSize: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return apiServerError('Failed to fetch courses');
  }
});

// Export the route handler
export const GET = getCourses;

// TODO: Add POST handler for creating courses (admin only)
// POST is intentionally not implemented yet pending further requirements
