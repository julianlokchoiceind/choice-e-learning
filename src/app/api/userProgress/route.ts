import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { checkAndAwardAchievements } from '@/services/achievements';

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
    if (!data.courseId || !data.lessonId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Course ID and Lesson ID are required' 
      }, { status: 400 });
    }
    
    const { courseId, lessonId, completed = false, progress = 0, timeSpent = 0 } = data;
    
    // Check if progress entry already exists
    const existingProgress = await prisma.userProgress.findFirst({
      where: {
        userId,
        courseId,
        lessonId
      }
    });
    
    const now = new Date();
    
    if (existingProgress) {
      // Update existing progress
      const updateData: Record<string, any> = {
        progress: Math.max(existingProgress.progress || 0, progress),
        timeSpent: (existingProgress.timeSpent || 0) + timeSpent,
        updatedAt: now
      };
      
      // Only update completed and completedAt if it's newly completed
      if (completed && !existingProgress.completed) {
        updateData.completed = true;
        updateData.completedAt = now;
      }
      
      await prisma.userProgress.update({
        where: { id: existingProgress.id },
        data: updateData
      });
      
      // If lesson was newly completed, check for achievements
      if (completed && !existingProgress.completed) {
        await checkAndAwardAchievements(userId);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Progress updated successfully' 
      });
    } else {
      // Create new progress entry
      const result = await prisma.userProgress.create({
        data: {
          userId,
          courseId,
          lessonId,
          completed,
          completedAt: completed ? now : null,
          progress,
          timeSpent
        }
      });
      
      // If lesson was completed, check for achievements
      if (completed) {
        await checkAndAwardAchievements(userId);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Progress recorded successfully',
        id: result.id
      });
    }
  } catch (error) {
    console.error('Error in user progress API route:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to record progress' 
    }, { status: 500 });
  }
}

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
    
    // Get course ID from query params
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    
    // Build query based on whether courseId is provided
    const where: Record<string, any> = { userId };
    if (courseId) {
      where.courseId = courseId;
    }
    
    // Get progress entries using Prisma
    const progressEntries = await prisma.userProgress.findMany({
      where
    });
    
    // Calculate course progress if courseId is provided
    if (courseId) {
      // Count total lessons for this course
      const totalLessons = await prisma.lesson.count({
        where: { courseId }
      });
      const completedLessons = progressEntries.filter(entry => entry.completed).length;
      
      const courseProgress = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100) 
        : 0;
      
      return NextResponse.json({
        success: true,
        progress: {
          courseId,
          totalLessons,
          completedLessons,
          progress: courseProgress,
          entries: progressEntries.map(entry => ({
            id: entry.id,
            lessonId: entry.lessonId,
            completed: entry.completed,
            completedAt: entry.completedAt,
            progress: entry.progress,
            timeSpent: entry.timeSpent
          }))
        }
      });
    }
    
    // Return all progress entries if no courseId specified
    return NextResponse.json({
      success: true,
      entries: progressEntries.map(entry => ({
        id: entry.id,
        courseId: entry.courseId,
        lessonId: entry.lessonId,
        completed: entry.completed,
        completedAt: entry.completedAt,
        progress: entry.progress,
        timeSpent: entry.timeSpent
      }))
    });
  } catch (error) {
    console.error('Error in user progress API route:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch progress' 
    }, { status: 500 });
  }
} 