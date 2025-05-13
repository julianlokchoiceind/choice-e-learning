/**
 * Course Detail API endpoint
 * Handles fetching, updating, and deleting specific course information
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCourseById } from '@/server/services/courses/course-service';
import prisma from '@/server/db/prisma-client';
import { 
  apiSuccess, 
  apiServerError,
  apiError,
  apiNotFound
} from '@/server/api/api-response';
import { ApiErrorCode } from '@/server/api/api-errors';
import { 
  createRouteHandler, 
  withErrorHandling, 
  withAdmin,
  RouteContext,
  AuthenticatedContext 
} from '@/server/api/route-handlers';

// GET handler to fetch a specific course by ID
export const GET = withErrorHandling(async (
  _req: NextRequest,
  context: RouteContext) => {
  const courseId = context.params.courseId;
  
  try {
    // Get course details from service
    const course = await getCourseById(courseId);
    
    if (!course) {
      return apiNotFound('Course');
    }
    
    // CRITICAL: Check if course is published for public API
    // Admin routes should be handled separately
    if (course.status === 'draft') {
      console.log(`Attempt to access draft course ${courseId} from public API`);
      return apiNotFound('Course'); // Return 404 instead of revealing existence of draft
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
  } catch (error: unknown) {
    console.error(`Error fetching course ${courseId}:`, error);
    return apiServerError('Failed to fetch course details');
  }
});

// PUT handler for updating a course (admin only)
export const PUT = withAdmin(async (
  req: NextRequest, 
  context: AuthenticatedContext) => {
  const courseId = context.params.courseId;
  
  try {
    const body = await req.json();
    
    // Determine if this is a draft or published course
    const status = body.status || 'draft';
    
    // Schema for published course validation
    const publishedCourseSchema = z.object({
      title: z.string().min(1, { message: 'Title is required' }),
      description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
      imageUrl: z.string().optional().nullable(),
      price: z.number().nonnegative({ message: 'Price must be a positive number' }),
      level: z.enum(['beginner', 'intermediate', 'advanced', 'all']),
      topics: z.array(z.string()).min(1, { message: 'At least one topic is required' }),
      status: z.literal('published')
    });
    
    // Schema for draft course validation
    const draftCourseSchema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      imageUrl: z.string().optional().nullable(),
      price: z.number().nonnegative({ message: 'Price must be a positive number' }).optional(),
      level: z.enum(['beginner', 'intermediate', 'advanced', 'all']).optional(),
      topics: z.array(z.string()).optional(),
      status: z.literal('draft')
    });
    
    // Apply different validation based on status
    let validation;
    
    if (status === 'published') {
      validation = publishedCourseSchema.safeParse(body);
    } else {
      validation = draftCourseSchema.safeParse(body);
    }
    
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
    
    // Generate auto title for draft if not provided
    if (status === 'draft' && (!body.title || body.title.trim() === '')) {
      // Get count of existing draft courses to generate sequence number
      const draftCount = await prisma.course.count({
        where: {
          title: {
            startsWith: 'Untitled-'
          },
          // @ts-ignore - Prisma schema đã được cập nhật nhưng TypeScript chưa nhận diện
          status: 'draft'
        }
      });
      
      // Format: Untitled-{sequence}-{DDMMYYYY}
      const today = new Date();
      const dateStr = `${today.getDate().toString().padStart(2, '0')}${
        (today.getMonth() + 1).toString().padStart(2, '0')}${
        today.getFullYear()}`;
      
      body.title = `Untitled-${draftCount + 1}-${dateStr}`;
    }
    
    // Convert 'all' level to 'beginner' to match the database schema if level is provided
    let normalizedLevel = existingCourse.level;
    if (body.level) {
      normalizedLevel = body.level === 'all' ? 'beginner' : body.level;
    }
    
    // Prepare update data
    const updateData: any = {
      // @ts-ignore - Prisma schema đã được cập nhật nhưng TypeScript chưa nhận diện
      status
    };
    
    // Only update fields that are provided
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.level !== undefined) updateData.level = normalizedLevel;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl || null;
    if (body.topics !== undefined) updateData.topics = body.topics || [];
    
    // Update the course with Prisma
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: updateData
    });
    
    return apiSuccess(updatedCourse, 'Course updated successfully');
  } catch (error: unknown) {
    console.error(`Error updating course ${courseId}:`, error);
    return apiServerError('Failed to update course');
  }
});

// DELETE handler for deleting a course (admin only)
export const DELETE = withAdmin(async (
  _req: NextRequest, 
  context: AuthenticatedContext) => {
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
  } catch (error: unknown) {
    console.error(`Error deleting course ${courseId}:`, error);
    return apiServerError('Failed to delete course');
  }
});
