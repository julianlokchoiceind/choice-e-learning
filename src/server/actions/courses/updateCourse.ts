'use server';

import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/server/auth/auth-options';
import { courseSchema } from '@/shared/schemas/courses';

export async function updateCourse(courseId: string, formData: FormData) {
  try {
    // Kiểm tra phiên đăng nhập
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { error: 'Yêu cầu đăng nhập' };
    }
    
    // Kiểm tra quyền
    const userRole = session.user.role;
    if (!userRole || !['ADMIN', 'INSTRUCTOR'].includes(userRole)) {
      return { error: 'Không có quyền cập nhật khóa học' };
    }
    
    // TODO: Kiểm tra xem khóa học có tồn tại không
    
    // Xử lý dữ liệu form
    const title = formData.get('title')?.toString() || '';
    const description = formData.get('description')?.toString() || '';
    const price = Number(formData.get('price') || 0);
    const level = formData.get('level')?.toString() || 'beginner';
    const topicsInput = formData.get('topics')?.toString() || '';
    const topics = topicsInput.split(',').map(t => t.trim()).filter(Boolean);
    const isPublished = formData.get('isPublished') === 'true';
    
    // Validate input
    const validatedData = courseSchema.safeParse({
      title,
      description,
      price,
      level,
      topics,
      isPublished
    });
    
    if (!validatedData.success) {
      return {
        error: 'Dữ liệu không hợp lệ',
        issues: validatedData.error.issues,
      };
    }
    
    // TODO: Implement actual course update logic
    
    // Revalidate paths
    revalidatePath('/admin/courses');
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath('/courses');
    revalidatePath(`/courses/${courseId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Update course error:', error);
    
    return { 
      error: error instanceof Error 
        ? error.message 
        : 'Cập nhật khóa học thất bại. Vui lòng thử lại sau.' 
    };
  }
}
