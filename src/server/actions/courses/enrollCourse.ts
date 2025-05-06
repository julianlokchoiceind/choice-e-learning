'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/server/auth/auth-options';

// Validation schema
const enrollSchema = z.object({
  courseId: z.string().min(1, 'ID khóa học không được trống'),
});

export async function enrollCourse(formData: FormData) {
  try {
    // Lấy session người dùng
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { error: 'Yêu cầu đăng nhập' };
    }
    
    // Validate input
    const courseId = formData.get('courseId')?.toString() || '';
    
    const validatedData = enrollSchema.safeParse({
      courseId,
    });
    
    if (!validatedData.success) {
      return {
        error: 'Dữ liệu không hợp lệ',
        issues: validatedData.error.issues,
      };
    }
    
    // TODO: Implement actual enrollment logic
    
    // Revalidate paths
    revalidatePath('/courses');
    revalidatePath('/dashboard/my-courses');
    revalidatePath(`/courses/${courseId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Enroll course error:', error);
    
    return { 
      error: error instanceof Error 
        ? error.message 
        : 'Đăng ký khóa học thất bại. Vui lòng thử lại sau.' 
    };
  }
}
