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
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  try {
    const {
      page = 1,
      limit = 10,
      courseId,
      search,
      status,
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

    // Fetch all lessons first if we need to filter by status
    // (since status is computed, not stored in DB)
    let lessons: any[];
    let total: number;
    
    if (status) {
      // Need to fetch all and then filter
      const allLessons = await prisma.lesson.findMany({
        where,
        orderBy,
        select: {
          id: true,
          title: true,
          content: true,
          videoUrl: true,
          order: true,
          courseId: true,
          chapterId: true,
          duration: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          course: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });
      
      // Use status from database instead of computing
      const allLessonsWithStatus = allLessons.map(lesson => ({
        ...lesson,
        status: lesson.status || 'draft' // Use database status with fallback
      }));
      
      const filteredLessons = allLessonsWithStatus.filter(
        lesson => lesson.status === status.toLowerCase()
      );
      
      total = filteredLessons.length;
      // Apply pagination to filtered results
      lessons = filteredLessons.slice(skip, skip + take);
    } else {
      // Normal pagination without status filter
      total = await prisma.lesson.count({ where });
      
      const dbLessons = await prisma.lesson.findMany({
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
          duration: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          course: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });
      
      // Use status from database instead of computing
      lessons = dbLessons.map(lesson => ({
        ...lesson,
        status: lesson.status || 'draft' // Use database status with fallback
      }));
    }

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

    // Use status from database instead of computing
    const lessonsWithStatus = lessons.map(lesson => ({
      ...lesson,
      status: lesson.status || 'draft' // Use database status with fallback
    }));

    return lessonsWithStatus;
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

/**
 * Bulk delete lessons
 * @param lessonIds Array of lesson IDs to delete
 * @returns Object with deleted and failed arrays
 */
export async function bulkDeleteLessons(lessonIds: string[]): Promise<{
  deleted: string[];
  failed: { id: string; error: string }[];
}> {
  const deleted: string[] = [];
  const failed: { id: string; error: string }[] = [];

  for (const lessonId of lessonIds) {
    try {
      await prisma.lesson.delete({
        where: { id: lessonId }
      });
      deleted.push(lessonId);
    } catch (error: unknown) {
      console.error(`Failed to delete lesson ${lessonId}:`, error);
      failed.push({
        id: lessonId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return { deleted, failed };
}

/**
 * Find all materials for a lesson
 * @param lessonId Lesson ID
 * @returns Array of lesson materials
 */
export async function findLessonMaterialsByLessonId(lessonId: string) {
  try {
    const materials = await prisma.lessonMaterial.findMany({
      where: { 
        lessonId,
        isActive: true
      },
      orderBy: { order: 'asc' }
    });
    return materials;
  } catch (error: unknown) {
    console.error('Error finding lesson materials:', error);
    throw error;
  }
}

/**
 * Create a new lesson material
 * @param lessonId Lesson ID
 * @param data Material data
 * @returns Created lesson material or null if creation failed
 */
export async function createLessonMaterial(
  lessonId: string,
  data: {
    title: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    mimeType: string;
    description?: string;
    url: string;
  }
) {
  try {
    // Import file management functions
    const { moveTempFileToPermanent } = await import('@/server/services/file/file-management-service');
    
    // Fetch lesson title for folder naming
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { title: true }
    });
    
    // Move file from temp to permanent storage with original filename in organized folders
    let permanentUrl = data.url;
    if (data.url.includes('/uploads/temp/')) {
      try {
        const lessonTitle = lesson?.title || 'untitled-lesson';
        permanentUrl = await moveTempFileToPermanent(data.url, 'lesson-material', lessonTitle, data.fileName);
        console.log(`Moved lesson material to permanent storage (${lessonTitle}): ${data.url} -> ${permanentUrl}`);
      } catch (error) {
        console.error('Failed to move temp file to permanent storage:', error);
        // Continue with temp URL if move fails
      }
    }

    // Auto-assign order (calculate next order number)
    const lastMaterial = await prisma.lessonMaterial.findFirst({
      where: { lessonId },
      orderBy: { order: 'desc' },
    });
    const orderNumber = (lastMaterial?.order ?? -1) + 1;

    const lessonMaterial = await prisma.lessonMaterial.create({
      data: {
        title: data.title,
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileType: data.fileType,
        mimeType: data.mimeType,
        description: data.description,
        url: permanentUrl, // Use the permanent URL with original filename
        lessonId,
        order: orderNumber,
      },
    });

    return lessonMaterial;
  } catch (error: unknown) {
    console.error('Error creating lesson material:', error);
    throw error;
  }
}

/**
 * Find a lesson material by ID
 * @param id Material ID
 * @returns Lesson material or null if not found
 */
export async function findLessonMaterialById(id: string) {
  try {
    const material = await prisma.lessonMaterial.findUnique({
      where: { id },
    });
    return material;
  } catch (error: unknown) {
    console.error('Error finding lesson material by ID:', error);
    throw error;
  }
}

/**
 * Delete a lesson material
 * @param id Material ID
 */
export async function deleteLessonMaterial(id: string): Promise<void> {
  try {
    // Import file management functions
    const { deleteFileByUrl } = await import('@/server/services/file/file-management-service');
    
    // Get the material to find its URL before deletion
    const material = await prisma.lessonMaterial.findUnique({
      where: { id },
      select: { url: true }
    });

    // Delete from database
    await prisma.lessonMaterial.delete({
      where: { id },
    });

    // Delete the physical file from permanent storage
    if (material?.url) {
      try {
        await deleteFileByUrl(material.url);
        console.log(`Deleted lesson material file: ${material.url}`);
      } catch (error) {
        console.error(`Failed to delete file ${material.url}:`, error);
        // Continue even if file deletion fails
      }
    }
  } catch (error: unknown) {
    console.error('Error deleting lesson material:', error);
    throw error;
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
  updateLessonsOrder,
  bulkDeleteLessons,
  // Material functions
  findLessonMaterialsByLessonId,
  createLessonMaterial,
  findLessonMaterialById,
  deleteLessonMaterial
};