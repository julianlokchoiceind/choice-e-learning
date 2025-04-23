/**
 * Courses API endpoint
 * Handles fetching and managing course information
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAllCourses } from '@/lib/services/courses/course-service';
import prisma from '@/lib/db/prisma-client';
import { 
  apiSuccess, 
  apiServerError,
  apiError
} from '@/lib/api/api-response';
import { ApiErrorCode } from '@/lib/api/api-error-codes';
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
  topics: z.union([
    z.string().array(),
    z.string().transform(val => [val])
  ]).optional(),
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
  
  const { page, limit, category, topics, search, sortBy, order } = queryResult.data;
  
  try {
    // Get courses from service
    const courses = await getAllCourses();
    
    // Apply filtering based on category and topics if provided
    let filteredCourses = courses;
    
    // Category filter (can be used for level or a single topic)
    if (category) {
      filteredCourses = courses.filter(course => 
        course.learningPoints?.includes(category) || 
        course.level === category
      );
    }
    
    // Topics filter (for multiple topics)
    if (topics && Array.isArray(topics) && topics.length > 0) {
      filteredCourses = filteredCourses.filter(course => {
        const courseLearningPoints = Array.isArray(course.learningPoints) ? course.learningPoints : [];
        // Check if the course has at least one of the selected topics
        return topics.some(topic => courseLearningPoints.includes(topic));
      });
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
    
    // Xử lý hình ảnh để tránh cache
    const timestamp = Date.now();
    const processedCourses = paginatedCourses.map(course => ({
      ...course,
      imageUrl: course.imageUrl ? `${course.imageUrl}?t=${timestamp}` : course.imageUrl
    }));
    
    // Tạo response với pagination info
    const response = apiSuccess(processedCourses, undefined, {
      pagination: {
        page,
        pageSize: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
    
    // Thêm header để ngăn cache
    if (response.headers) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return apiServerError('Failed to fetch courses');
  }
});

// Export the route handler
export const GET = getCourses;

// POST handler for creating courses (admin only)
export const POST = withAdmin(async (req: NextRequest, context: any) => {
  try {
    const body = await req.json();
    
    // Validate course data with Zod
    const courseSchema = z.object({
      title: z.string().min(1, { message: 'Title is required' }),
      description: z.string().min(1, { message: 'Description is required' }),
      imageUrl: z.string().optional(),
      price: z.number().nonnegative({ message: 'Price must be a positive number' }),
      level: z.enum(['beginner', 'intermediate', 'advanced', 'all']),
      topics: z.array(z.string()),
      lessons: z.array(z.object({
        title: z.string().min(1, "Lesson title is required"),
        description: z.string().optional().default(""),
        order: z.number().int().min(1, "Order must be a positive integer"),
        videoUrl: z.string().url("Must be a valid URL"),
        resources: z.array(z.object({
          title: z.string().min(1, "Resource title is required"),
          url: z.string().url("Must be a valid URL"),
          type: z.string()
        })).optional().default([])
      })).min(1, { message: 'At least one lesson is required' })
    });
    
    const validation = courseSchema.safeParse(body);
    
    if (!validation.success) {
      return apiError(
        'Invalid course data',
        validation.error.format(),
        ApiErrorCode.VALIDATION_ERROR
      );
    }
    
    // Convert 'all' level to 'beginner' to match the database schema
    const { level, lessons, ...courseData } = validation.data;
    const normalizedLevel = level === 'all' ? 'beginner' : level;
    
    // Create the course with Prisma - only include fields from the schema
    const newCourse = await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        imageUrl: courseData.imageUrl,
        level: normalizedLevel,
        topics: courseData.topics,
        studentIds: [],
      }
    });
    
    // Check if course was created successfully
    if (!newCourse) {
      return apiServerError('Failed to create course');
    }
    
    // Process and create lessons
    if (lessons && Array.isArray(lessons)) {
      for (const lesson of lessons) {
        try {
          // Create lesson
          await prisma.lesson.create({
            data: {
              title: lesson.title,
              content: lesson.description || '',
              videoUrl: lesson.videoUrl,
              order: lesson.order,
              courseId: newCourse.id,
              // Store resources as JSON in a field called 'resourcesData'
              resourcesData: lesson.resources ? JSON.stringify(lesson.resources) : '[]'
            }
          });
        } catch (lessonError) {
          console.error('Error creating lesson:', lessonError);
          // Continue to next lesson if this one fails
        }
      }
    }
    
    return apiSuccess(newCourse, 'Course created successfully', undefined, 201);
  } catch (error) {
    console.error('Error creating course:', error);
    return apiServerError('Failed to create course');
  }
});
