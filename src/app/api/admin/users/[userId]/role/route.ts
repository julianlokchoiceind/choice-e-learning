import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/mongodb';
import { requireAdmin } from '@/lib/auth/auth-middleware';
import { Role } from '@/lib/auth/auth-options';
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
    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get user from database
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { _id: 1, name: 1, email: 1, role: 1 } }
    );

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
        id: user._id.toString(),
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
    if (!userId || !ObjectId.isValid(userId)) {
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
    
    // Get user from database
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Prevent admin from changing their own role (safety measure)
    if (auth.user?.id === userId) {
      return NextResponse.json(
        { success: false, error: 'Cannot change your own role' },
        { status: 403 }
      );
    }

    // Update user role
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          role,
          updatedAt: new Date() 
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
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

// PATCH - Update a user's role
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
    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get request body and validate
    const body = await req.json();
    
    const roleSchema = z.object({
      role: z.enum(['admin', 'student'])
    });

    const validationResult = roleSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid role provided' },
        { status: 400 }
      );
    }

    const { role } = validationResult.data;

    // Get users collection
    const usersCollection = await getCollection('users');
    
    // Check if user exists
    const userExists = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!userExists) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user's role
    const updateResult = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          role,
          updatedAt: new Date()
        } 
      }
    );

    if (updateResult.modifiedCount === 0) {
      // If no document was modified (role was already set to the requested value)
      if (userExists.role === role) {
        return NextResponse.json({
          success: true,
          message: `User already has the ${role} role`
        });
      }
      
      return NextResponse.json(
        { success: false, error: 'Failed to update user role' },
        { status: 500 }
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