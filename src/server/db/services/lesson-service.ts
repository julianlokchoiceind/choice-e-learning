'use server';

import prisma from '@/server/db/prisma-client';
import { Lesson, Prisma } from '@prisma/client';

/**
 * Find a lesson by ID
 * @param id Lesson ID
 * @param includeCourse Include related course data
 * @returns Lesson object or null if not found
 */
export async function findLessonById(
  id: string,
  includeCourse = false
): Promise<Lesson | null> {
  try {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return null;
    }
    
    return await prisma.lesson.findUnique({
      where: { id },
      include: includeCourse ? {
        course: true
      } : undefined
    });
  } catch (error: unknown) {
    console.error('Error finding lesson by ID:', error);
    return null;
  }
}

/**
 * Get lessons for a course
 * @param courseId Course ID
 * @returns Array of lessons
 */
export async function getLessonsForCourse(courseId: string): Promise<Lesson[]> {
  try {
    return await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' }
    });
  } catch (error: unknown) {
    console.error('Error getting lessons for course:', error);
    return [];
  }
}

/**
 * Create a new lesson
 * @param data Lesson data
 * @returns Created lesson or null if creation failed
 */
export async function createLesson(data: {
  title: string;
  content?: string | null;
  videoUrl?: string | null;
  duration?: string | null;
  resourcesData?: string | null;
  order?: number;
  courseId: string;
  chapterId?: string | null;
}): Promise<Lesson | null> {
  try {
    // Verify that the course exists
    const course = await prisma.course.findUnique({
      where: { id: data.courseId }
    });

    if (!course) {
      console.error(`Course with ID ${data.courseId} not found`);
      return null;
    }

    // If order is not provided or is 0, get the highest order and add 1
    let orderValue = data.order || 0;
    if (orderValue <= 0) {
      const highestOrderLesson = await prisma.lesson.findFirst({
        where: { courseId: data.courseId },
        orderBy: { order: 'desc' }
      });
      
      orderValue = highestOrderLesson ? highestOrderLesson.order + 1 : 1;
    }

    // Let Prisma handle default status - don't override it
    // This prevents conflicts with Prisma schema defaults
    
    // Create lesson with proper data structure
    const lessonCreateData: Prisma.LessonCreateInput = {
      title: data.title,
      content: data.content || '',
      videoUrl: data.videoUrl,
      duration: data.duration,
      resourcesData: data.resourcesData,
      order: orderValue,
      // Remove status field - let Prisma use default value from schema
      course: {
        connect: { id: data.courseId }
      },
      ...(data.chapterId && {
        chapter: {
          connect: { id: data.chapterId }
        }
      })
    };
    
    return await prisma.lesson.create({
      data: lessonCreateData
    });
  } catch (error: unknown) {
    console.error('Error creating lesson:', error);
    return null;
  }
}

/**
 * Update lesson data
 * @param id Lesson ID
 * @param data Lesson data to update
 * @returns Updated lesson or null if update failed
 */
export async function updateLesson(
  id: string,
  data: Prisma.LessonUpdateInput
): Promise<Lesson | null> {
  try {
    return await prisma.lesson.update({
      where: { id },
      data
    });
  } catch (error: unknown) {
    console.error('Error updating lesson:', error);
    return null;
  }
}

/**
 * Delete a lesson
 * @param id Lesson ID
 * @returns Deleted lesson or null if deletion failed
 */
export async function deleteLesson(id: string): Promise<Lesson | null> {
  try {
    // Get the lesson to be deleted
    const lessonToDelete = await prisma.lesson.findUnique({
      where: { id }
    });
    
    if (!lessonToDelete) {
      return null;
    }
    
    // Delete the lesson
    const deletedLesson = await prisma.lesson.delete({
      where: { id }
    });
    
    // Re-order the remaining lessons
    await prisma.lesson.updateMany({
      where: {
        courseId: lessonToDelete.courseId,
        order: {
          gt: lessonToDelete.order
        }
      },
      data: {
        order: {
          decrement: 1
        }
      }
    });
    
    return deletedLesson;
  } catch (error: unknown) {
    console.error('Error deleting lesson:', error);
    return null;
  }
}

/**
 * Reorder lessons for a course
 * @param courseId Course ID
 * @param lessonIds Array of lesson IDs in the desired order
 * @returns Success flag
 */
export async function reorderLessons(
  courseId: string,
  lessonIds: string[]
): Promise<boolean> {
  try {
    // Verify all lessons exist and belong to the course
    const lessons = await prisma.lesson.findMany({
      where: {
        courseId,
        id: {
          in: lessonIds
        }
      }
    });
    
    if (lessons.length !== lessonIds.length) {
      console.error('Not all lessons exist or belong to the course');
      return false;
    }
    
    // Update the order of each lesson
    await prisma.$transaction(
      lessonIds.map((lessonId, index) => 
        prisma.lesson.update({
          where: { id: lessonId },
          data: { order: index + 1 }
        })
      )
    );
    
    return true;
  } catch (error: unknown) {
    console.error('Error reordering lessons:', error);
    return false;
  }
}
