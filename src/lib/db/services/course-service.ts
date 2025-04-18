"use server";

import prisma from '@/lib/db';
import { Course, Prisma } from '@prisma/client';

/**
 * Find a course by ID
 * @param id Course ID
 * @param includeRelations Include related data like lessons, students, reviews
 * @returns Course object or null if not found
 */
export async function findCourseById(
  id: string, 
  includeRelations: boolean = false
): Promise<Course | null> {
  try {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
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
  } catch (error) {
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
  page: number = 1,
  pageSize: number = 10,
  filters: Prisma.CourseWhereInput = {}
): Promise<{
  courses: Course[];
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
  } catch (error) {
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
export async function createCourse(data: Prisma.CourseCreateInput): Promise<Course | null> {
  try {
    return await prisma.course.create({
      data,
      include: {
        lessons: true
      }
    });
  } catch (error) {
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
): Promise<Course | null> {
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
  } catch (error) {
    console.error('Error updating course:', error);
    return null;
  }
}

/**
 * Delete a course
 * @param id Course ID
 * @returns Deleted course or null if deletion failed
 */
export async function deleteCourse(id: string): Promise<Course | null> {
  try {
    return await prisma.course.delete({
      where: { id },
      include: {
        lessons: true
      }
    });
  } catch (error) {
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
): Promise<Course | null> {
  try {
    return await prisma.course.update({
      where: { id: courseId },
      data: {
        students: {
          connect: { id: userId }
        }
      }
    });
  } catch (error) {
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
): Promise<Course | null> {
  try {
    return await prisma.course.update({
      where: { id: courseId },
      data: {
        students: {
          disconnect: { id: userId }
        }
      }
    });
  } catch (error) {
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
  page: number = 1,
  pageSize: number = 10
): Promise<{
  courses: Course[];
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
  } catch (error) {
    console.error('Error getting enrolled courses:', error);
    return {
      courses: [],
      total: 0,
      pages: 0
    };
  }
}
