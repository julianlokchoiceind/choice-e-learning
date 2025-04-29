/**
 * Course Detail API endpoint
 * Handles fetching, updating, and deleting specific course information
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCourseById } from '@/lib/services/courses/course-service';
import prisma from '@/lib/db/prisma-client';
import { 
  apiSuccess, 
  apiServerError,
  apiError,
  apiNotFound
} from '@/lib/api/api-response';
import { ApiErrorCode } from '@/lib/api/api-error-codes';
import { 
  createRouteHandler, 
  withErrorHandling, 
  withAdmin,
  RouteContext,
  AuthenticatedContext 
} from '@/lib/api/route-handlers';

// Define the course detail API path parameters
// Không cần định nghĩa riêng, sử dụng RouteContext từ route-handlers


// GET handler to fetch a specific course by ID
export const GET = withErrorHandling(async (
  _req: NextRequest,
  context: RouteContext
) => {
  const courseId = context.params.courseId;
  
  try {
    // Get course details from service
    const course = await getCourseById(courseId);
    
    if (!course) {
      return apiNotFound('Course');
    }
    
    // Thêm timestamp vào hình ảnh để tránh cache
    const processedCourse = {
      ...course,
      imageUrl: course?.imageUrl ? `${course.imageUrl}?t=${Date.now()}` : course?.imageUrl
    };
    
    // Trả về với header ngăn cache
    const response = apiSuccess(processedCourse);
    
    // Thêm header để không cache kết quả
    if (response.headers) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
    }
    
    return response;
  } catch (error) {
    console.error(`Error fetching course ${courseId}:`, error);
    return apiServerError('Failed to fetch course details');
  }
});

// PUT handler for updating a course (admin only)
export const PUT = withAdmin(async (
  req: NextRequest, 
  context: AuthenticatedContext
) => {
  const courseId = context.params.courseId;
  
  try {
    const body = await req.json();
    
    // Validate course update data with Zod
    const courseSchema = z.object({
      title: z.string().min(1, { message: 'Title is required' }),
      description: z.string().min(1, { message: 'Description is required' }),
      imageUrl: z.string().optional().nullable(),
      price: z.number().nonnegative({ message: 'Price must be a positive number' }),
      level: z.enum(['beginner', 'intermediate', 'advanced', 'all']),
      topics: z.array(z.string()).optional().default([])
    });
    
    const validation = courseSchema.safeParse(body);
    
    if (!validation.success) {
      return apiError(
        'Invalid course data',
        validation.error.format(),
        ApiErrorCode.VALIDATION_ERROR
      );
    }
    
    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    if (!existingCourse) {
      return apiNotFound('Course');
    }
    
    // Convert 'all' level to 'beginner' to match the database schema
    const { level, ...courseData } = validation.data;
    const normalizedLevel = level === 'all' ? 'beginner' : level;
    
    // Update the course with Prisma
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        level: normalizedLevel,
        imageUrl: courseData.imageUrl || null,
        topics: courseData.topics || []
      }
    });
    
    return apiSuccess(updatedCourse, 'Course updated successfully');
  } catch (error) {
    console.error(`Error updating course ${courseId}:`, error);
    return apiServerError('Failed to update course');
  }
});

// DELETE handler for deleting a course (admin only)
export const DELETE = withAdmin(async (
  _req: NextRequest, 
  context: AuthenticatedContext
) => {
  const courseId = context.params.courseId;
  
  try {
    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    if (!existingCourse) {
      return apiNotFound('Course');
    }
    
    // Delete the course with Prisma
    await prisma.course.delete({
      where: { id: courseId }
    });
    
    return apiSuccess(null, 'Course deleted successfully');
  } catch (error) {
    console.error(`Error deleting course ${courseId}:`, error);
    return apiServerError('Failed to delete course');
  }
});
