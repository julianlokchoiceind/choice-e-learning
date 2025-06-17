'use server';

import prisma from '@/server/db/prisma-client';
import { Prisma } from '@prisma/client';
import { Course as CourseType } from '@/shared/types/courses/course';
import { Course as PrismaCourse } from '@prisma/client';

/**
 * Find a course by ID
 * @param id Course ID
 * @param includeRelations Include related data like lessons, students, reviews
 * @returns Course object or null if not found
 */
export async function findCourseById(
  id: string, 
  includeRelations = false
): Promise<PrismaCourse | null> {
  try {
    if (!id) {
      return null;
    }
    
    return await prisma.course.findUnique({
      where: { id },
      include: includeRelations ? {
        lessons: { orderBy: { order: 'asc' } },
        students: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      } : undefined
    });
  } catch (error: unknown) {
    console.error('Error finding course by ID:', error);
    return null;
  }
}

/**
 * Get all courses with pagination and optional filtering
 * @param page Page number (1-based)
 * @param pageSize Page size
 * @param filters Optional filter criteria
 * @returns Paginated courses
 */
export async function getCourses(
  page = 1,
  pageSize = 10,
  filters: Prisma.CourseWhereInput = {}
): Promise<{
  courses: PrismaCourse[];
  total: number;
  pages: number;
}> {
  try {
    // Ensure page and pageSize are valid
    page = Math.max(1, page);
    pageSize = Math.max(1, Math.min(100, pageSize));
    
    // Get total count
    const total = await prisma.course.count({
      where: filters
    });
    
    // Calculate total pages
    const pages = Math.ceil(total / pageSize);
    
    // Get courses for the requested page
    const courses = await prisma.course.findMany({
      where: filters,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            order: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        reviews: {
          select: {
            rating: true
          }
        },
        _count: {
          select: {
            students: true,
            lessons: true,
            reviews: true
          }
        }
      }
    });
    
    return {
      courses,
      total,
      pages
    };
  } catch (error: unknown) {
    console.error('Error getting courses:', error);
    return {
      courses: [],
      total: 0,
      pages: 0
    };
  }
}

/**
 * Create a new course
 * @param data Course data
 * @returns Created course or null if creation failed
 */
export async function createCourse(data: Prisma.CourseCreateInput): Promise<PrismaCourse | null> {
  try {
    return await prisma.course.create({
      data,
      include: {
        lessons: true
      }
    });
  } catch (error: unknown) {
    console.error('Error creating course:', error);
    return null;
  }
}

/**
 * Update course data
 * @param id Course ID
 * @param data Course data to update
 * @returns Updated course or null if update failed
 */
export async function updateCourse(
  id: string,
  data: Prisma.CourseUpdateInput
): Promise<PrismaCourse | null> {
  try {
    return await prisma.course.update({
      where: { id },
      data,
      include: {
        lessons: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
  } catch (error: unknown) {
    console.error('Error updating course:', error);
    return null;
  }
}

/**
 * Delete a course
 * @param id Course ID
 * @returns Deleted course or null if deletion failed
 */
export async function deleteCourse(id: string): Promise<PrismaCourse | null> {
  try {
    return await prisma.course.delete({
      where: { id },
      include: {
        lessons: true
      }
    });
  } catch (error: unknown) {
    console.error('Error deleting course:', error);
    return null;
  }
}

/**
 * Enroll a student in a course
 * @param courseId Course ID
 * @param userId User ID
 * @returns Updated course or null if enrollment failed
 */
export async function enrollStudent(
  courseId: string,
  userId: string
): Promise<PrismaCourse | null> {
  try {
    return await prisma.course.update({
      where: { id: courseId },
      data: {
        students: {
          connect: { id: userId }
        }
      }
    });
  } catch (error: unknown) {
    console.error('Error enrolling student:', error);
    return null;
  }
}

/**
 * Unenroll a student from a course
 * @param courseId Course ID
 * @param userId User ID
 * @returns Updated course or null if unenrollment failed
 */
export async function unenrollStudent(
  courseId: string,
  userId: string
): Promise<PrismaCourse | null> {
  try {
    return await prisma.course.update({
      where: { id: courseId },
      data: {
        students: {
          disconnect: { id: userId }
        }
      }
    });
  } catch (error: unknown) {
    console.error('Error unenrolling student:', error);
    return null;
  }
}

/**
 * Get courses a user is enrolled in
 * @param userId User ID
 * @param page Page number (1-based)
 * @param pageSize Page size
 * @returns Paginated courses the user is enrolled in
 */
export async function getEnrolledCourses(
  userId: string,
  page = 1,
  pageSize = 10
): Promise<{
  courses: PrismaCourse[];
  total: number;
  pages: number;
}> {
  try {
    // Ensure page and pageSize are valid
    page = Math.max(1, page);
    pageSize = Math.max(1, Math.min(100, pageSize));
    
    // Get total count
    const total = await prisma.course.count({
      where: {
        students: {
          some: {
            id: userId
          }
        }
      }
    });
    
    // Calculate total pages
    const pages = Math.ceil(total / pageSize);
    
    // Get courses for the requested page
    const courses = await prisma.course.findMany({
      where: {
        students: {
          some: {
            id: userId
          }
        }
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            order: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        reviews: {
          where: {
            userId
          },
          select: {
            id: true,
            rating: true,
            comment: true
          }
        }
      }
    });
    
    return {
      courses,
      total,
      pages
    };
  } catch (error: unknown) {
    console.error('Error getting enrolled courses:', error);
    return {
      courses: [],
      total: 0,
      pages: 0
    };
  }
}

/**
 * Find course materials by course ID
 * @param courseId Course ID
 * @returns Array of course materials
 */
export async function findCourseMaterialsByCourseId(courseId: string) {
  try {
    return await prisma.courseMaterial.findMany({
      where: { 
        courseId,
        isActive: true
      },
      orderBy: { order: 'asc' }
    });
  } catch (error: unknown) {
    console.error('Error finding course materials:', error);
    return [];
  }
}

/**
 * Create a new course material
 * @param courseId Course ID
 * @param data Course material data
 * @returns Created course material or null if creation failed
 */
export async function createCourseMaterial(
  courseId: string,
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
    // Verify that the course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      console.error(`Course with ID ${courseId} not found`);
      return null;
    }

    // Get the highest order and add 1
    const highestOrderMaterial = await prisma.courseMaterial.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' }
    });
    
    const orderValue = highestOrderMaterial ? highestOrderMaterial.order + 1 : 1;

    return await prisma.courseMaterial.create({
      data: {
        ...data,
        courseId,
        order: orderValue
      }
    });
  } catch (error: unknown) {
    console.error('Error creating course material:', error);
    return null;
  }
}

/**
 * Update course material
 * @param materialId Material ID
 * @param data Update data
 * @returns Updated course material or null if update failed
 */
export async function updateCourseMaterial(
  materialId: string,
  data: Partial<{
    title: string;
    description: string;
    order: number;
  }>
) {
  try {
    return await prisma.courseMaterial.update({
      where: { id: materialId },
      data
    });
  } catch (error: unknown) {
    console.error('Error updating course material:', error);
    return null;
  }
}

/**
 * Delete course material
 * @param materialId Material ID
 * @returns Deleted course material or null if deletion failed
 */
export async function deleteCourseMaterial(materialId: string) {
  try {
    return await prisma.courseMaterial.delete({
      where: { id: materialId }
    });
  } catch (error: unknown) {
    console.error('Error deleting course material:', error);
    return null;
  }
}

/**
 * Find lesson materials by lesson ID
 * @param lessonId Lesson ID
 * @returns Array of lesson materials
 */
export async function findLessonMaterialsByLessonId(lessonId: string) {
  try {
    return await prisma.lessonMaterial.findMany({
      where: { 
        lessonId,
        isActive: true
      },
      orderBy: { order: 'asc' }
    });
  } catch (error: unknown) {
    console.error('Error finding lesson materials:', error);
    return [];
  }
}

/**
 * Create a new lesson material
 * @param lessonId Lesson ID
 * @param data Lesson material data
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
    // Verify that the lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    });

    if (!lesson) {
      console.error(`Lesson with ID ${lessonId} not found`);
      return null;
    }

    // Get the highest order and add 1
    const highestOrderMaterial = await prisma.lessonMaterial.findFirst({
      where: { lessonId },
      orderBy: { order: 'desc' }
    });
    
    const orderValue = highestOrderMaterial ? highestOrderMaterial.order + 1 : 1;

    return await prisma.lessonMaterial.create({
      data: {
        ...data,
        lessonId,
        order: orderValue
      }
    });
  } catch (error: unknown) {
    console.error('Error creating lesson material:', error);
    return null;
  }
}

/**
 * Update lesson material
 * @param materialId Material ID
 * @param data Update data
 * @returns Updated lesson material or null if update failed
 */
export async function updateLessonMaterial(
  materialId: string,
  data: Partial<{
    title: string;
    description: string;
    order: number;
  }>
) {
  try {
    return await prisma.lessonMaterial.update({
      where: { id: materialId },
      data
    });
  } catch (error: unknown) {
    console.error('Error updating lesson material:', error);
    return null;
  }
}

/**
 * Delete lesson material
 * @param materialId Material ID
 * @returns Deleted lesson material or null if deletion failed
 */
export async function deleteLessonMaterial(materialId: string) {
  try {
    return await prisma.lessonMaterial.delete({
      where: { id: materialId }
    });
  } catch (error: unknown) {
    console.error('Error deleting lesson material:', error);
    return null;
  }
}
