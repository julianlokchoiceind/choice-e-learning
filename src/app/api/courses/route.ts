/**
 * Courses API endpoint
 * Handles fetching and managing course information
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAllCourses } from '@/lib/services/courses/course-service';
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
  parseQueryParams 
} from '@/lib/api/request-parser';
import { 
  documentEndpoint 
} from '@/lib/api/api-docs';

// Define the schema for query parameters with proper input/output types
const courseQueryParamsSchema = z.object({
  // Input: string from URL, Output: number after transformation
  page: z.string().optional().pipe(z.coerce.number().int().positive().default(1)),
  limit: z.string().optional().pipe(z.coerce.number().int().positive().default(10)),
  category: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'createdAt', 'popularity']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc')
});

// Infer the output type from the schema for type safety
type CourseQueryParams = z.infer<typeof courseQueryParamsSchema>;

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
  // Parse query parameters using our enhanced parser
  const queryResult = parseQueryParams(req, courseQueryParamsSchema);
  
  if (!queryResult.success) {
    return queryResult.error;
  }
  
  const { page, limit, category, search, sortBy, order } = queryResult.data;
  
  try {
    // Get courses from service
    const courses = await getAllCourses();
    
    // Apply filtering based on category if provided
    let filteredCourses = courses;
    if (category) {
      filteredCourses = courses.filter(course => 
        course.learningPoints?.includes(category) || 
        course.level === category
      );
    }
    
    // Apply search filtering if provided
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCourses = filteredCourses.filter(course => 
        course.title.toLowerCase().includes(searchLower) || 
        course.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    if (sortBy) {
      filteredCourses.sort((a, b) => {
        let valueA, valueB;
        
        switch (sortBy) {
          case 'title':
            valueA = a.title || '';
            valueB = b.title || '';
            return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
          
          case 'popularity':
            valueA = a.students || 0;
            valueB = b.students || 0;
            return order === 'asc' ? valueA - valueB : valueB - valueA;
          
          case 'createdAt':
          default:
            // Default fallback to using students/popularity for sorting
            valueA = a.students || 0;
            valueB = b.students || 0;
            return order === 'asc' ? valueA - valueB : valueB - valueA;
        }
      });
    }
    
    // Apply pagination
    const totalItems = filteredCourses.length;
    const startIndex = (page - 1) * limit;
    const paginatedCourses = filteredCourses.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(totalItems / limit);
    
    // Return courses with pagination info
    return apiSuccess(paginatedCourses, undefined, {
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
