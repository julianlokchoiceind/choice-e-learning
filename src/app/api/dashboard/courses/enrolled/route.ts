import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/db/prisma-client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/server/auth/auth-options';

export async function GET(request: NextRequest) {
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
    
    // Fetch enrolled courses for the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        enrolledIn: {
          include: {
            lessons: true,
            _count: {
              select: {
                lessons: true
              }
            }
          }
        }
      }
    });
    
    if (!user?.enrolledIn) {
      return NextResponse.json({
        success: true,
        courses: []
      });
    }
    
    // Get progress for all courses
    const progress = await prisma.userProgress.findMany({
      where: {
        userId,
        courseId: {
          in: user.enrolledIn.map(course => course.id)
        }
      }
    });
    
    // Format course data with progress
    const courses = user.enrolledIn.map(course => {
      // Count completed lessons for this course
      const completedLessons = progress.filter(
        p => p.courseId === course.id && p.completed
      ).length;
      
      // Calculate progress percentage
      const totalLessons = course._count.lessons;
      const progressPercentage = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100) 
        : 0;
      
      return {
        id: course.id,
        title: course.title,
        imageUrl: course.imageUrl || '/images/placeholder-course.jpg',
        progress: progressPercentage,
        completedLessons,
        totalLessons
      };
    });
    
    return NextResponse.json({
      success: true,
      courses
    });
  } catch (error: unknown) {
    console.error('Error in enrolled courses API route:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch enrolled courses' 
    }, { status: 500 });
  }
} 