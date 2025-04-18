import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/auth-middleware';
import { Role } from '@/lib/auth/auth-options';
import { AuthService } from '@/lib/auth/services/auth-service';
import { z } from 'zod';

// Schema for role update validation
const roleUpdateSchema = z.object({
  role: z.enum(['student', 'instructor', 'admin'])
});

// GET handler to fetch user's role
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Authenticate and authorize admin
    const auth = await requireAdmin(req);
    if (!auth.success) {
      return auth.response;
    }

    // Validate user ID
    const userId = params.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get user from database using Auth Service
    const user = await AuthService.getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user role
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user role' },
      { status: 500 }
    );
  }
}

// PUT handler to update user's role
export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Authenticate and authorize admin
    const auth = await requireAdmin(req);
    if (!auth.success) {
      return auth.response;
    }

    // Validate user ID
    const userId = params.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json();
    
    // Validate input
    const validation = roleUpdateSchema.safeParse(body);
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
    const { role } = validation.data;
    
    // Prevent admin from changing their own role (safety measure)
    if (auth.user?.id === userId) {
      return NextResponse.json(
        { success: false, error: 'Cannot change your own role' },
        { status: 403 }
      );
    }

    // Update user role using Auth Service
    const result = await AuthService.updateUserRole(userId, role as Role);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error?.message || 'Failed to update user role' },
        { status: result.error?.status || 500 }
      );
    }
    
    // Return success
    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        id: userId,
        role
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}

// PATCH - Update a user's role (Alternative endpoint)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Verify admin access
    const auth = await requireAdmin(req);
    if (!auth.success) {
      return auth.response;
    }

    // Validate userId
    const userId = params.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get request body and validate
    const body = await req.json();
    
    const roleSchema = z.object({
      role: z.enum(['admin', 'student', 'instructor'])
    });

    const validationResult = roleSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid role provided' },
        { status: 400 }
      );
    }

    const { role } = validationResult.data;

    // Check if user exists
    const user = await AuthService.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Return early if user already has this role
    if (user.role === role) {
      return NextResponse.json({
        success: true,
        message: `User already has the ${role} role`
      });
    }

    // Update user's role using Auth Service
    const updateResult = await AuthService.updateUserRole(userId, role as Role);

    if (!updateResult.success) {
      return NextResponse.json(
        { success: false, error: updateResult.error?.message || 'Failed to update user role' },
        { status: updateResult.error?.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
      userId,
      role
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}