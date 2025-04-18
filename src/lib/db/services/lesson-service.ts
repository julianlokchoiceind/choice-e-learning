"use server";

import prisma from '@/lib/db';
import { Lesson, Prisma } from '@prisma/client';

/**
 * Find a lesson by ID
 * @param id Lesson ID
 * @param includeCourse Include related course data
 * @returns Lesson object or null if not found
 */
export async function findLessonById(
  id: string,
  includeCourse: boolean = false
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
  } catch (error) {
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
  } catch (error) {
    console.error('Error getting lessons for course:', error);
    return [];
  }
}

/**
 * Create a new lesson
 * @param data Lesson data
 * @returns Created lesson or null if creation failed
 */
export async function createLesson(data: Prisma.LessonCreateInput): Promise<Lesson | null> {
  try {
    // If order is not provided, get the highest order and add 1
    if (!data.order) {
      const highestOrderLesson = await prisma.lesson.findFirst({
        where: { courseId: data.course.connect?.id as string },
        orderBy: { order: 'desc' }
      });
      
      data.order = highestOrderLesson ? highestOrderLesson.order + 1 : 1;
    }
    
    return await prisma.lesson.create({
      data
    });
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    console.error('Error reordering lessons:', error);
    return false;
  }
}
