/**
 * Course enrollment API endpoint
 * Handles enrolling in and unenrolling from courses
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/db/prisma-client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/server/auth/auth-options';
import { checkAndAwardAchievements } from '@/server/services/achievements/achievement-service';

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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrolledIn: {
          where: { id: courseId }
        }
      }
    });
    
    const existingEnrollment = user?.enrolledIn && user.enrolledIn.length > 0;

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
    
    // Create initial progress records for all lessons in the course
    const lessons = await prisma.lesson.findMany({
      where: { courseId }
    });
    
    if (lessons.length > 0) {
      // Create progress records for each lesson
      await prisma.userProgress.createMany({
        data: lessons.map(lesson => ({
          userId,
          courseId,
          lessonId: lesson.id,
          completed: false,
          progress: 0,
          timeSpent: 0,
          lastAccessed: now
        }))
      });
    }

    // Check and award achievements (like 'Course Starter')
    await checkAndAwardAchievements(userId);

    // Success response
    return NextResponse.json({
      success: true,
      message: 'Successfully enrolled in course',
      course: {
        id: course.id,
        title: course.title
      },
      enrollmentId: `${userId}_${courseId}`
    });
  } catch (error: unknown) {
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrolledIn: {
          where: { id: courseId }
        }
      }
    });
    
    const existingEnrollment = user?.enrolledIn && user.enrolledIn.length > 0;

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
    
    // Delete any progress records for this course
    await prisma.userProgress.deleteMany({
      where: {
        userId,
        courseId
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
  } catch (error: unknown) {
    console.error('Error unenrolling from course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unenroll from course' },
      { status: 500 }
    );
  }
}