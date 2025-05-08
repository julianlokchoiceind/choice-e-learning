/**
 * User profile API endpoint
 * Handles fetching and updating user profile information
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/server/db/prisma-client';
import { createRouteHandler, withAuth } from '@/server/api/route-handlers';
import { apiSuccess, apiError, apiUpdated, apiNotFound } from '@/server/api/api-response';
import { validateRequest } from '@/server/api/request-parser';
import { comparePasswords, hashPassword } from '@/server/auth/utils/password-utils';
import { documentEndpoint } from '@/server/api/api-docs';
import { ApiErrorCode } from '@/server/api/api-errors';

// Schema for profile update validation
const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
}).refine(data => {
  // If new password is provided, current password must also be provided
  return !(data.newPassword && !data.currentPassword);
}, {
  message: 'Current password is required when changing password',
  path: ['currentPassword']
});

// Document the API endpoint
documentEndpoint({
  path: '/api/users/profile',
  method: 'GET',
  description: 'Get the current user\'s profile information',
  requiresAuth: true,
  responses: [
    {
      status: 200,
      description: 'User profile retrieved successfully',
      example: {
        success: true,
        data: {
          id: '1234567890',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
          bio: 'A short bio',
          avatar: 'https://example.com/avatar.jpg',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        }
      }
    },
    {
      status: 401,
      description: 'User is not authenticated',
      example: {
        success: false,
        error: 'You must be logged in to access this resource',
        code: 'UNAUTHORIZED'
      }
    },
    {
      status: 404,
      description: 'User not found',
      example: {
        success: false,
        error: 'User not found',
        code: 'NOT_FOUND'
      }
    }
  ]
});

documentEndpoint({
  path: '/api/users/profile',
  method: 'PUT',
  description: 'Update the current user\'s profile information',
  requiresAuth: true,
  requestBody: {
    contentType: 'application/json',
    schema: 'name?: string, currentPassword?: string, newPassword?: string, bio?: string, avatar?: string',
    example: {
      name: 'New Name',
      bio: 'New bio information',
      avatar: 'https://example.com/new-avatar.jpg'
    }
  },
  responses: [
    {
      status: 200,
      description: 'Profile updated successfully',
      example: {
        success: true,
        data: {
          id: '1234567890',
          name: 'New Name',
          email: 'john@example.com',
        },
        message: 'Profile updated successfully'
      }
    },
    {
      status: 400,
      description: 'Invalid input data',
      example: {
        success: false,
        error: 'Validation failed',
        details: ['name: String must contain at least 2 character(s)'],
        code: 'VALIDATION_ERROR'
      }
    },
    {
      status: 401,
      description: 'User is not authenticated',
      example: {
        success: false,
        error: 'You must be logged in to access this resource',
        code: 'UNAUTHORIZED'
      }
    }
  ]
});

// GET handler to fetch user profile
const getProfile = withAuth(async (req, { user }) => {
  const userId = user?.id || ''; // Ensure userId is always string
  
  // Get user from database
  const userProfile = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!userProfile) {
    return apiNotFound('User');
  }

  // Select only fields we want to return
  const { password, ...userWithoutPassword } = userProfile;

  // Return user profile
  return apiSuccess(userWithoutPassword);
});

// PUT handler to update user profile
const updateProfile = withAuth(async (req, { user }) => {
  const userId = user?.id || ''; // Ensure userId is always string
  
  // Validate request body
  const validationResult = await validateRequest(req, profileUpdateSchema);
  
  if (!validationResult.success) {
    return validationResult.error;
  }
  
  // Extract validated data
  const { name, currentPassword, newPassword, bio, avatar } = validationResult.data;
  
  // Create update document
  const updateDoc: any = { updatedAt: new Date() };
  if (name) updateDoc.name = name;
  if (bio !== undefined) updateDoc.bio = bio;  // bio đã là string hoặc null/undefined
  if (avatar) updateDoc.avatar = avatar;
  
  // Handle password update if requested
  if (newPassword && currentPassword) {
    // Get current user with password
    const userWithPassword = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { password: true }
    });
    
    if (!userWithPassword) {
      return apiNotFound('User');
    }
    
    // Verify current password
    const isPasswordValid = await comparePasswords(currentPassword, userWithPassword.password || '');
    if (!isPasswordValid) {
      return apiError(
        'Current password is incorrect',
        undefined,
        ApiErrorCode.INVALID_PASSWORD,
        400
      );
    }
    
    // Hash the new password
    updateDoc.password = await hashPassword(newPassword);
  }
  
  // Update user
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateDoc
    });
    
    // Remove sensitive fields
    const { password: _, ...userData } = updatedUser;
    
    // Return success with updated user data
    return apiUpdated(userData);
  } catch (error: unknown) {
    if ((error as any).code === 'P2025') {
      return apiNotFound('User');
    }
    throw error; // Let the error handler catch other errors
  }
});

// Export the route handler with method routing
export const GET = getProfile;
export const PUT = updateProfile;
