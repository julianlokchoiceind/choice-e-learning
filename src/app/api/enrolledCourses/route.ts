import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { EnrolledCourse } from '@/types/course';

import { checkAndAwardAchievements } from '@/services/achievements';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // Get the currently authenticated user for verification
    const session = await getServerSession(authOptions);
    
    // Only allow users to fetch their own enrolled courses
    if (!session?.user?.id || (session.user.id !== userId && session.user.role !== 'admin')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // Use Prisma to get enrollment data
    
    // Get all courses the user is enrolled in
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrolledIn: true
      }
    });
    
    if (!user || !user.enrolledIn.length) {
      return NextResponse.json({ 
        success: true, 
        courses: [] 
      });
    }
    
    // Get the course IDs from enrolled courses
    const courseIds = user.enrolledIn.map(course => course.id);
    
    // Get basic course data for all enrolled courses using their IDs
    const courses = await prisma.course.findMany({
      where: {
        id: { in: courseIds }
      },
      include: {
        lessons: true
      }
    });
    
    // Get progress data for each course
    const userProgress = await prisma.userProgress.findMany({
      where: {
        userId: userId,
        courseId: { in: courseIds }
      }
    });
    
    // Calculate aggregated progress data
    const progressData = courseIds.map(courseId => {
      const courseProgress = userProgress.filter(p => p.courseId === courseId);
      const completedLessons = courseProgress.filter(p => p.completed).length;
      const totalTimeSpent = courseProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
      
      return {
        _id: courseId,
        completedLessons,
        totalTimeSpent
      };
    });

    // Create a map of progress data by courseId
    const progressMap = progressData.reduce((map, item) => {
      map[item._id] = {
        completedLessons: item.completedLessons,
        totalTimeSpent: item.totalTimeSpent
      };
      return map;
    }, {} as Record<string, { completedLessons: number, totalTimeSpent: number }>);
    
    // Format the response data
    const enrolledCourses: EnrolledCourse[] = courses.map((course) => {
      const courseId = course.id;
      
      // Get total lessons for the course
      const totalLessons = course.lessons.length;
      
      // Get progress data or default values
      const progress = progressMap[courseId] || { completedLessons: 0, totalTimeSpent: 0 };
      
      // Calculate progress percentage
      const progressPercentage = totalLessons > 0 
        ? Math.round((progress.completedLessons / totalLessons) * 100) 
        : 0;
      
      return {
        id: courseId,
        title: course.title,
        progress: progressPercentage,
        imageUrl: course.imageUrl || '/images/course-placeholder.jpg',
        totalLessons,
        completedLessons: progress.completedLessons
      };
    });
    
    return NextResponse.json({
      success: true,
      courses: enrolledCourses
    });
    
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch enrolled courses' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the currently authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.courseId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Course ID is required' 
      }, { status: 400 });
    }
    
    const { courseId } = data;
    
    // Check if user is already enrolled in the course
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrolledIn: {
          where: { id: courseId }
        }
      }
    });
    
    const existingEnrollment = user?.enrolledIn.length > 0;
    
    if (existingEnrollment) {
      return NextResponse.json({ 
        success: false, 
        error: 'Already enrolled in this course' 
      }, { status: 409 });
    }
    
    // Get the course to make sure it exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    if (!course) {
      return NextResponse.json({ 
        success: false, 
        error: 'Course not found' 
      }, { status: 404 });
    }
    
    // Create the enrollment by connecting user and course
    const now = new Date();
    const result = await prisma.course.update({
      where: { id: courseId },
      data: {
        students: {
          connect: { id: userId }
        }
      }
    });
    
    // Also create an enrollment record
    await prisma.enrollment.create({
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
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully enrolled in course',
      enrollmentId: `${userId}_${courseId}`
    });
    
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to enroll in course' 
    }, { status: 500 });
  }
} 