import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/mongodb';
import { authenticateUser } from '@/lib/auth/auth-middleware';

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    // Authenticate user
    const auth = await authenticateUser(req);
    if (!auth.success) {
      return auth.response;
    }

    // Get user ID
    const userId = auth.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found in session' },
        { status: 401 }
      );
    }

    // Validate course ID
    const courseId = params.courseId;
    if (!courseId || !ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    // Get database collections
    const coursesCollection = await getCollection('courses');
    const usersCollection = await getCollection('users');

    // Check if course exists
    const course = await coursesCollection.findOne({ _id: new ObjectId(courseId) });
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user is already enrolled
    const user = await usersCollection.findOne(
      { 
        _id: new ObjectId(userId),
        enrolledIds: courseId 
      }
    );

    if (user) {
      return NextResponse.json(
        { success: false, error: 'User already enrolled in this course' },
        { status: 409 }
      );
    }

    // Enroll user in course (update both collections)
    const updateUserResult = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $addToSet: { enrolledIds: courseId },
        $set: { updatedAt: new Date() }
      }
    );

    const updateCourseResult = await coursesCollection.updateOne(
      { _id: new ObjectId(courseId) },
      { 
        $addToSet: { studentIds: userId },
        $set: { updatedAt: new Date() }
      }
    );

    // Check if updates were successful
    if (updateUserResult.modifiedCount === 0 || updateCourseResult.modifiedCount === 0) {
      // Try to rollback changes if only one update succeeded
      if (updateUserResult.modifiedCount === 1) {
        await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $pull: { enrolledIds: courseId } as any }
        );
      }
      
      if (updateCourseResult.modifiedCount === 1) {
        await coursesCollection.updateOne(
          { _id: new ObjectId(courseId) },
          { $pull: { studentIds: userId } as any }
        );
      }
      
      return NextResponse.json(
        { success: false, error: 'Failed to enroll in course' },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: 'Successfully enrolled in course',
      course: {
        id: course._id.toString(),
        title: course.title
      }
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to enroll in course' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    // Authenticate user
    const auth = await authenticateUser(req);
    if (!auth.success) {
      return auth.response;
    }

    // Get user ID
    const userId = auth.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found in session' },
        { status: 401 }
      );
    }

    // Validate course ID
    const courseId = params.courseId;
    if (!courseId || !ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    // Get database collections
    const coursesCollection = await getCollection('courses');
    const usersCollection = await getCollection('users');
    const enrollmentsCollection = await getCollection('enrollments');

    // Check if course exists
    const course = await coursesCollection.findOne({ _id: new ObjectId(courseId) });
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user is actually enrolled
    const user = await usersCollection.findOne(
      { 
        _id: new ObjectId(userId),
        enrolledIds: courseId 
      }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User is not enrolled in this course' },
        { status: 409 }
      );
    }

    // Remove enrollment from both collections
    const updateUserResult = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $pull: { enrolledIds: courseId } as any,
        $set: { updatedAt: new Date() }
      }
    );

    const updateCourseResult = await coursesCollection.updateOne(
      { _id: new ObjectId(courseId) },
      { 
        $pull: { studentIds: userId } as any,
        $set: { updatedAt: new Date() }
      }
    );

    // Also remove from the enrollments collection if it exists
    await enrollmentsCollection.deleteOne({
      userId,
      courseId
    });

    // Check if updates were successful
    if (updateUserResult.modifiedCount === 0 || updateCourseResult.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to unenroll from course' },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: 'Successfully unenrolled from course',
      course: {
        id: course._id.toString(),
        title: course.title
      }
    });
  } catch (error) {
    console.error('Error unenrolling from course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unenroll from course' },
      { status: 500 }
    );
  }
} 