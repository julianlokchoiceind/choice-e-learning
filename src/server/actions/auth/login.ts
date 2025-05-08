'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { loginUserSchema } from '@/shared/schemas/auth';
import { AuthError } from '@/server/auth/utils/auth-errors';

export async function login(formData: FormData) {
  try {
    // Validate input
    const email = formData.get('email')?.toString() || '';
    const password = formData.get('password')?.toString() || '';
    
    const validatedData = loginUserSchema.safeParse({ email, password });
    
    if (!validatedData.success) {
      return {
        error: 'Dữ liệu không hợp lệ',
        issues: validatedData.error.issues,
      };
    }
    
    // TODO: Implement actual login logic using auth services
    // For now, mock a successful login
    const mockUserId = 'user-123';
    
    // Set cookies for logged in user
    cookies().set('userId', mockUserId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    // Revalidate relevant paths
    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error: unknown) {
    console.error('Login error:', error);
    
    if (error instanceof AuthError) {
      return { error: error.message };
    }
    
    return { error: 'Đăng nhập thất bại. Vui lòng thử lại sau.' };
  }
}
