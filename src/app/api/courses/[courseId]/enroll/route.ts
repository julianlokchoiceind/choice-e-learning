/**
 * Course enrollment API endpoint
 * Handles enrolling in and unenrolling from courses
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { checkAndAwardAchievements } from '@/lib/services/achievements/achievement-service';

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    // Get the currently authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user ID
    const userId = session.user.id;

    // Validate course ID
    const courseId = params.courseId;
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }

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

    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        courseId
      }
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, error: 'User already enrolled in this course' },
        { status: 409 }
      );
    }

    // Create the enrollment by connecting user and course
    const now = new Date();
    
    // Update the course with the new student
    await prisma.course.update({
      where: { id: courseId },
      data: {
        students: {
          connect: { id: userId }
        }
      }
    });
    
    // Create an enrollment record
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        enrolledAt: now,
        status: 'active',
        progress: 0,
        completedLessons: 0
      }
    });

    // Check and award achievements (like "Course Starter")
    await checkAndAwardAchievements(userId);

    // Success response
    return NextResponse.json({
      success: true,
      message: 'Successfully enrolled in course',
      course: {
        id: course.id,
        title: course.title
      },
      enrollmentId: enrollment.id
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
    // Get the currently authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user ID
    const userId = session.user.id;

    // Validate course ID
    const courseId = params.courseId;
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }

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

    // Check if user is actually enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        courseId
      }
    });

    if (!existingEnrollment) {
      return NextResponse.json(
        { success: false, error: 'User is not enrolled in this course' },
        { status: 409 }
      );
    }

    // Update the course to remove the student
    await prisma.course.update({
      where: { id: courseId },
      data: {
        students: {
          disconnect: { id: userId }
        }
      }
    });
    
    // Delete the enrollment record
    await prisma.enrollment.delete({
      where: {
        id: existingEnrollment.id
      }
    });

    // Success response
    return NextResponse.json({
      success: true,
      message: 'Successfully unenrolled from course',
      course: {
        id: course.id,
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