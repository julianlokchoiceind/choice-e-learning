'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/server/auth/auth-options';
import { courseSchema } from '@/shared/schemas/courses';
import { UserRole } from '@/shared/types/auth/roles';

export async function createCourse(formData: FormData) {
  try {
    // Kiểm tra phiên đăng nhập
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { error: 'Yêu cầu đăng nhập' };
    }
    
    // Kiểm tra quyền
    const userRole = session.user.role;
    if (!userRole || userRole !== UserRole.ADMIN) {
      return { error: 'Không có quyền tạo khóa học' };
    }
    
    // Xử lý dữ liệu form
    const title = formData.get('title')?.toString() || '';
    const description = formData.get('description')?.toString() || '';
    const price = Number(formData.get('price') || 0);
    const level = formData.get('level')?.toString() || 'beginner';
    const topicsInput = formData.get('topics')?.toString() || '';
    const topics = topicsInput.split(',').map(t => t.trim()).filter(Boolean);
    
    // Validate input
    const validatedData = courseSchema.safeParse({
      title,
      description,
      price,
      level,
      topics
    });
    
    if (!validatedData.success) {
      return {
        error: 'Dữ liệu không hợp lệ',
        issues: validatedData.error.issues,
      };
    }
    
    // TODO: Implement actual course creation logic
    // For now, mock a successful creation
    const mockCourseId = 'course-' + Date.now();
    
    // Revalidate paths
    revalidatePath('/admin/courses');
    revalidatePath('/courses');
    
    return { 
      success: true,
      courseId: mockCourseId
    };
  } catch (error: unknown) {
    console.error('Create course error:', error);
    
    return { 
      error: error instanceof Error 
        ? error.message 
        : 'Tạo khóa học thất bại. Vui lòng thử lại sau.' 
    };
  }
}
