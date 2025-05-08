'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { registerUserSchema } from '@/shared/schemas/auth';

export async function register(formData: FormData) {
  try {
    // Validate input
    const name = formData.get('name')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const password = formData.get('password')?.toString() || '';
    
    const validatedData = registerUserSchema.safeParse({ 
      name, 
      email, 
      password,
      role: 'student' // Default role
    });
    
    if (!validatedData.success) {
      return {
        error: 'Dữ liệu không hợp lệ',
        issues: validatedData.error.issues,
      };
    }
    
    // TODO: Implement actual registration logic using auth services
    // For now, mock a successful registration
    
    // Revalidate path
    revalidatePath('/login');
    
    return { success: true };
  } catch (error: unknown) {
    console.error('Registration error:', error);
    
    return { 
      error: error instanceof Error 
        ? error.message 
        : 'Đăng ký thất bại. Vui lòng thử lại sau.' 
    };
  }
}
