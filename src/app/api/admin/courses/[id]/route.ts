import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/mongodb';
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
    if (!courseId || !ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }
    
    // Get collections
    const coursesCollection = await getCollection('courses');
    
    // Find course by ID
    const course = await coursesCollection.findOne({ _id: new ObjectId(courseId) });
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Transform for response
    const transformedCourse = {
      id: course._id.toString(),
      title: course.title,
      description: course.description,
      price: course.price,
      level: course.level,
      topics: course.topics,
      imageUrl: course.imageUrl,
      instructorId: course.instructorId,
      studentCount: Array.isArray(course.studentIds) ? course.studentIds.length : 0,
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
    if (!courseId || !ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    
    // Get collections
    const coursesCollection = await getCollection('courses');
    
    // Prepare update data
    const updateData = {
      ...body,
      updatedAt: new Date()
    };
    
    // Update course
    const result = await coursesCollection.updateOne(
      { _id: new ObjectId(courseId) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
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
    if (!courseId || !ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }
    
    // Get collections
    const coursesCollection = await getCollection('courses');
    const lessonsCollection = await getCollection('lessons');
    
    // Find course to verify it exists
    const course = await coursesCollection.findOne({ _id: new ObjectId(courseId) });
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Delete associated lessons
    await lessonsCollection.deleteMany({ courseId: courseId });
    
    // Delete the course
    await coursesCollection.deleteOne({ _id: new ObjectId(courseId) });
    
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