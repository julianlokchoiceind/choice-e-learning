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
  withAdmin 
} from '@/lib/api/route-handlers';

// Define the course detail API path parameters
type CourseDetailParams = {
  params: {
    courseId: string;
  };
};

// GET handler to fetch a specific course by ID
export const GET = withErrorHandling(async (
  _req: NextRequest,
  { params }: CourseDetailParams
) => {
  const { courseId } = params;
  
  try {
    // Get course details from service
    const course = await getCourseById(courseId);
    
    if (!course) {
      return apiNotFound('Course');
    }
    
    // Return course details
    return apiSuccess(course);
  } catch (error) {
    console.error(`Error fetching course ${courseId}:`, error);
    return apiServerError('Failed to fetch course details');
  }
});

// PUT handler for updating a course (admin only)
export const PUT = withAdmin(async (
  req: NextRequest, 
  { params }: CourseDetailParams
) => {
  const { courseId } = params;
  
  try {
    const body = await req.json();
    
    // Validate course update data with Zod
    const courseSchema = z.object({
      title: z.string().min(1, { message: 'Title is required' }),
      description: z.string().min(1, { message: 'Description is required' }),
      imageUrl: z.string().url({ message: 'Please provide a valid URL for image' }).optional().nullable(),
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
  { params }: CourseDetailParams
) => {
  const { courseId } = params;
  
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
