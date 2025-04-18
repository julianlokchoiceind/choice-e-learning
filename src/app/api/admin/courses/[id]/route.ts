import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth/auth-middleware';

// GET a specific course by ID (admin view)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate and authorize admin
    const auth = await requireAdmin(req);
    if (!auth.success) {
      return auth.response;
    }

    const courseId = params.id;
    
    // Validate course ID
    if (!courseId || !courseId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }
    
    // Find course by ID using Prisma
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: { 
            students: true 
          }
        }
      }
    });
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Transform for response
    const transformedCourse = {
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      level: course.level,
      topics: course.topics,
      imageUrl: course.imageUrl,
      instructorId: course.instructorId,
      studentCount: course._count.students,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    };
    
    return NextResponse.json({
      success: true,
      course: transformedCourse
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

// PUT - Update a course
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate and authorize admin
    const auth = await requireAdmin(req);
    if (!auth.success) {
      return auth.response;
    }

    const courseId = params.id;
    
    // Validate course ID
    if (!courseId || !courseId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    
    // Prepare update data with updated timestamp
    const updateData = {
      ...body,
      updatedAt: new Date()
    };
    
    try {
      // Update course with Prisma
      await prisma.course.update({
        where: { id: courseId },
        data: updateData
      });
    } catch (error) {
      // Course not found
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Course updated successfully'
    });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a course
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate and authorize admin
    const auth = await requireAdmin(req);
    if (!auth.success) {
      return auth.response;
    }

    const courseId = params.id;
    
    // Validate course ID
    if (!courseId || !courseId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }
    
    try {
      // Check if course exists
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      });
      
      if (!course) {
        return NextResponse.json(
          { success: false, error: 'Course not found' },
          { status: 404 }
        );
      }
      
      // Delete the course and cascade delete associated lessons (if cascade is set up)
      await prisma.course.delete({
        where: { id: courseId }
      });
    
    return NextResponse.json({
      success: true,
      message: 'Course and associated lessons deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete course' },
      { status: 500 }
    );
  }
} 