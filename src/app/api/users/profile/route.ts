import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticateUser } from '@/lib/auth/auth-middleware';
import { hashPassword, comparePasswords } from '@/utils/auth-utils';
import { z } from 'zod';

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
  message: "Current password is required when changing password",
  path: ["currentPassword"]
});

// GET handler to fetch user profile
export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const auth = await authenticateUser(req);
    if (!auth.success) {
      return auth.response;
    }

    // Get user from database
    const userId = auth.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found in session' },
        { status: 401 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        avatar: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user profile
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio || '',
        avatar: user.avatar || '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

// PUT handler to update user profile
export async function PUT(req: NextRequest) {
  try {
    // Authenticate user
    const auth = await authenticateUser(req);
    if (!auth.success) {
      return auth.response;
    }

    // Parse request body
    const body = await req.json();
    
    // Validate input
    const validation = profileUpdateSchema.safeParse(body);
    if (!validation.success) {
      const errorMessages = validation.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      
      return NextResponse.json(
        { success: false, error: errorMessages },
        { status: 400 }
      );
    }
    
    // Extract validated data
    const { name, currentPassword, newPassword, bio, avatar } = validation.data;
    
    // Create update document
    const updateDoc: any = { updatedAt: new Date() };
    if (name) updateDoc.name = name;
    if (bio !== undefined) updateDoc.bio = bio;
    if (avatar) updateDoc.avatar = avatar;
    
    // Get user from database
    const userId = auth.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found in session' },
        { status: 401 }
      );
    }
    
    // Handle password update if requested
    if (newPassword && currentPassword) {
      // Get current user with password
      const user = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { password: true }
      });
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Verify current password
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 400 }
        );
      }
      
      // Hash the new password
      updateDoc.password = await hashPassword(newPassword);
    }
    
    // Update user
    try {
      await prisma.user.update({
        where: { id: userId },
        data: updateDoc
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return success
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
} 