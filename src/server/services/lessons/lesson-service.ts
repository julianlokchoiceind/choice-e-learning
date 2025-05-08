import prisma from '@/server/db/prisma-client';
import { Lesson } from '@/shared/types/lessons/lesson';
import { ApiError } from '@/server/api';

export const dynamic = 'force-dynamic';

/**
 * Get all lessons with optional filtering and pagination
 */
export async function getLessons(options: {
  page?: number;
  limit?: number;
  courseId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  try {
    const {
      page = 1,
      limit = 10,
      courseId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    // Build where conditions
    const where: any = {};

    if (courseId) {
      where.courseId = courseId;
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          content: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Create sort object
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Get total count for pagination
    const total = await prisma.lesson.count({ where });

    // Fetch lessons
    const lessons = await prisma.lesson.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        title: true,
        content: true,
        videoUrl: true,
        order: true,
        courseId: true,
        chapterId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return {
      data: lessons,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error: unknown) {
    console.error('Error getting lessons:', error);
    throw ApiError.fromError(error);
  }
}

/**
 * Get a lesson by ID
 */
export async function getLessonById(id: string) {
  try {
    if (!id) {
      throw ApiError.badRequest('Lesson ID is required');
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!lesson) {
      throw ApiError.notFound(`Lesson with ID ${id} not found`);
    }

    return lesson;
  } catch (error: unknown) {
    console.error(`Error getting lesson with ID ${id}:`, error);
    throw ApiError.fromError(error);
  }
}

// Alias for backward compatibility
export const getLesson = getLessonById;

/**
 * Create a new lesson
 */
export async function createLesson(data: {
  title: string;
  content?: string;
  videoUrl?: string | null;
  order: number;
  courseId: string;
  chapterId?: string | null;
}) {
  try {
    // Validate required fields
    if (!data.title) {
      throw ApiError.badRequest('Lesson title is required');
    }

    if (!data.courseId) {
      throw ApiError.badRequest('Course ID is required');
    }

    // Verify that the course exists
    const course = await prisma.course.findUnique({
      where: { id: data.courseId }
    });

    if (!course) {
      throw ApiError.notFound(`Course with ID ${data.courseId} not found`);
    }

    // Ensure content is not undefined for Prisma
    const lessonData = {
      ...data,
      content: data.content || '', // Ensure content is never undefined
      chapterId: data.chapterId || null // Ensure chapterId is never undefined
    };

    // Create the lesson
    const lesson = await prisma.lesson.create({
      data: lessonData
    });

    return lesson;
  } catch (error: unknown) {
    console.error('Error creating lesson:', error);
    throw ApiError.fromError(error);
  }
}

/**
 * Update an existing lesson
 */
export async function updateLesson(id: string, data: Partial<Lesson>) {
  try {
    // Validate ID
    if (!id) {
      throw ApiError.badRequest('Lesson ID is required');
    }

    // Verify that the lesson exists
    const existingLesson = await prisma.lesson.findUnique({
      where: { id }
    });

    if (!existingLesson) {
      throw ApiError.notFound(`Lesson with ID ${id} not found`);
    }

    // If course ID is changing, verify that the new course exists
    if (data.courseId && data.courseId !== existingLesson.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: data.courseId }
      });

      if (!course) {
        throw ApiError.notFound(`Course with ID ${data.courseId} not found`);
      }
    }

    // Prepare update data that's compatible with Prisma types
    const updateData: any = { ...data };
    
    // Ensure content is not undefined if it's being updated
    if ('content' in data && data.content === undefined) {
      updateData.content = '';
    }
    
    // Ensure chapterId is not undefined if it's being updated
    if ('chapterId' in data && data.chapterId === undefined) {
      updateData.chapterId = null;
    }

    // Update the lesson
    const updatedLesson = await prisma.lesson.update({
      where: { id },
      data: updateData
    });

    return updatedLesson;
  } catch (error: unknown) {
    console.error(`Error updating lesson with ID ${id}:`, error);
    throw ApiError.fromError(error);
  }
}

/**
 * Delete a lesson
 */
export async function deleteLesson(id: string) {
  try {
    // Validate ID
    if (!id) {
      throw ApiError.badRequest('Lesson ID is required');
    }

    // Verify that the lesson exists
    const existingLesson = await prisma.lesson.findUnique({
      where: { id }
    });

    if (!existingLesson) {
      throw ApiError.notFound(`Lesson with ID ${id} not found`);
    }

    // Delete the lesson
    await prisma.lesson.delete({
      where: { id }
    });

    return { success: true };
  } catch (error: unknown) {
    console.error(`Error deleting lesson with ID ${id}:`, error);
    throw ApiError.fromError(error);
  }
}

/**
 * Get all lessons for a specific course
 */
export async function getLessonsByCourseId(courseId: string) {
  try {
    if (!courseId) {
      throw ApiError.badRequest('Course ID is required');
    }

    // Verify that the course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw ApiError.notFound(`Course with ID ${courseId} not found`);
    }

    // Fetch lessons for the course
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' }
    });

    return lessons;
  } catch (error: unknown) {
    console.error(`Error getting lessons for course ${courseId}:`, error);
    throw ApiError.fromError(error);
  }
}

// Alias for backward compatibility
export const getLessonsByCourse = getLessonsByCourseId;

/**
 * Update the order of multiple lessons
 */
export async function updateLessonsOrder(lessons: { id: string, order: number }[]) {
  try {
    const updates = lessons.map(lesson => 
      prisma.lesson.update({
        where: { id: lesson.id },
        data: { order: lesson.order }
      })
    );
    
    await prisma.$transaction(updates);
    
    return { success: true };
  } catch (error: unknown) {
    console.error('Error updating lessons order:', error);
    throw ApiError.fromError(error);
  }
}

export default {
  getLessons,
  getLessonById,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonsByCourseId,
  getLessonsByCourse,
  updateLessonsOrder
};