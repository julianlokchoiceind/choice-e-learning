// src/server/services/lessons/lesson-service.ts
import { prisma } from '@/server/db/prisma-client';
import { Lesson, LessonInput } from '@/shared/types/lessons/lesson';
import { ApiError } from '@/server/api/api-errors';

/**
 * Lấy thông tin của một bài học theo ID
 */
export async function getLesson(lessonId: string) {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { 
        id: lessonId 
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            level: true,
          }
        },
        chapter: true,
      },
    });
    
    if (!lesson) {
      throw new ApiError('NOT_FOUND', 'Không tìm thấy bài học');
    }
    
    return lesson;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Error in getLesson:', error);
    throw new ApiError('INTERNAL_SERVER_ERROR', 'Lỗi khi lấy thông tin bài học');
  }
}

/**
 * Lấy tất cả các bài học của một khóa học
 */
export async function getLessonsByCourse(courseId: string) {
  try {
    const lessons = await prisma.lesson.findMany({
      where: { 
        courseId 
      },
      orderBy: {
        order: 'asc',
      },
      include: {
        chapter: true,
      },
    });
    
    return lessons;
  } catch (error) {
    console.error('Error in getLessonsByCourse:', error);
    throw new ApiError('INTERNAL_SERVER_ERROR', 'Lỗi khi lấy danh sách bài học');
  }
}

/**
 * Lấy bài học tiếp theo trong khóa học
 */
export async function getNextLesson(lessonId: string) {
  try {
    const currentLesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { courseId: true, order: true },
    });
    
    if (!currentLesson) {
      throw new ApiError('NOT_FOUND', 'Không tìm thấy bài học hiện tại');
    }
    
    const nextLesson = await prisma.lesson.findFirst({
      where: {
        courseId: currentLesson.courseId,
        order: {
          gt: currentLesson.order,
        },
      },
      orderBy: {
        order: 'asc',
      },
    });
    
    return nextLesson;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Error in getNextLesson:', error);
    throw new ApiError('INTERNAL_SERVER_ERROR', 'Lỗi khi lấy bài học tiếp theo');
  }
}

/**
 * Tạo bài học mới
 */
export async function createLesson(data: LessonInput) {
  try {
    // Kiểm tra xem khóa học tồn tại không
    const courseExists = await prisma.course.findUnique({
      where: { id: data.courseId },
    });
    
    if (!courseExists) {
      throw new ApiError('NOT_FOUND', 'Không tìm thấy khóa học');
    }
    
    // Tạo bài học mới
    const lesson = await prisma.lesson.create({
      data: {
        title: data.title,
        content: data.content || '',
        videoUrl: data.videoUrl,
        order: data.order,
        courseId: data.courseId,
        chapterId: data.chapterId,
      },
    });
    
    return lesson;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Error in createLesson:', error);
    throw new ApiError('INTERNAL_SERVER_ERROR', 'Lỗi khi tạo bài học mới');
  }
}

/**
 * Cập nhật thông tin bài học
 */
export async function updateLesson(lessonId: string, data: Partial<LessonInput>) {
  try {
    // Kiểm tra xem bài học tồn tại không
    const lessonExists = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    
    if (!lessonExists) {
      throw new ApiError('NOT_FOUND', 'Không tìm thấy bài học');
    }
    
    // Cập nhật bài học
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data,
    });
    
    return updatedLesson;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Error in updateLesson:', error);
    throw new ApiError('INTERNAL_SERVER_ERROR', 'Lỗi khi cập nhật bài học');
  }
}

/**
 * Xóa bài học
 */
export async function deleteLesson(lessonId: string) {
  try {
    // Kiểm tra xem bài học tồn tại không
    const lessonExists = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    
    if (!lessonExists) {
      throw new ApiError('NOT_FOUND', 'Không tìm thấy bài học');
    }
    
    // Xóa bài học
    await prisma.lesson.delete({
      where: { id: lessonId },
    });
    
    return true;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Error in deleteLesson:', error);
    throw new ApiError('INTERNAL_SERVER_ERROR', 'Lỗi khi xóa bài học');
  }
}

/**
 * Cập nhật thứ tự của các bài học
 */
export async function updateLessonsOrder(lessonIds: string[]) {
  try {
    const updates = lessonIds.map((id, index) => {
      return prisma.lesson.update({
        where: { id },
        data: { order: index },
      });
    });
    
    await prisma.$transaction(updates);
    
    return true;
  } catch (error) {
    console.error('Error in updateLessonsOrder:', error);
    throw new ApiError('INTERNAL_SERVER_ERROR', 'Lỗi khi cập nhật thứ tự bài học');
  }
}
