"use server";

import prisma from '@/lib/db';
import { safeFindMany, safeFindUnique } from '@/lib/db/prisma-helper';
import { CourseListItem, CourseDetails, UserCourseStats } from '@/types';

/**
 * Get all courses from the database
 */
export async function getAllCourses(): Promise<CourseListItem[]> {
  try {
    const courses = await prisma.course.findMany({
      include: {
        reviews: true,
        lessons: true,
        _count: {
          select: {
            students: true,
            reviews: true,
            lessons: true
          }
        }
      }
    });
    
    // Process the courses to match our CourseListItem interface
    const processedCourses = await Promise.all(
      courses.map(async (course) => {
        // Get creator info if available
        const creator = course.creatorId 
          ? await prisma.user.findUnique({ where: { id: course.creatorId } })
          : null;
        
        // Calculate rating
        const rating = course.reviews.length > 0 
          ? Number((course.reviews.reduce((acc, review) => acc + review.rating, 0) / course.reviews.length).toFixed(1))
          : 4.5; // Default if no reviews
        
        return {
          id: course.id,
          title: course.title,
          description: course.description,
          image: course.imageUrl || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
          level: course.level,
          price: course.price,
          duration: `${Math.ceil(course._count.lessons / 2)} weeks`, // Approximate duration
          isFeatured: Array.isArray(course.topics) && course.topics.includes('featured'),
          students: course._count.students,
          rating: rating,
          reviews: course._count.reviews,
          instructorName: creator?.name || 'Administrator',
        };
      })
    );

    return processedCourses;
  } catch (error) {
    console.error('Error fetching all courses:', error);
    return [];
  }
}

/**
 * Get a course by ID
 */
export async function getCourseById(courseId: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { order: 'asc' }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        students: true,
        _count: {
          select: {
            students: true,
            reviews: true,
            lessons: true
          }
        }
      }
    });
    
    if (!course) return null;
    
    // Get creator info if available
    const creator = course.creatorId 
      ? await prisma.user.findUnique({ where: { id: course.creatorId } })
      : null;
    
    // Process reviews to include user names
    const processedReviews = course.reviews.map(review => {
      return {
        name: review.user?.name || 'Anonymous',
        rating: review.rating,
        avatar: 'https://randomuser.me/api/portraits/women/63.jpg', // Default avatar
        date: `${Math.floor((Date.now() - new Date(review.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30))} months ago`,
        comment: review.comment || 'Great course!',
      };
    });
    
    // Calculate rating
    const rating = course.reviews.length > 0 
      ? Number((course.reviews.reduce((acc, review) => acc + review.rating, 0) / course.reviews.length).toFixed(1))
      : 4.5; // Default if no reviews
    
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      fullDescription: course.description,
      image: course.imageUrl || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
      level: course.level,
      price: course.price,
      duration: `${Math.ceil(course.lessons.length / 2)} weeks`, // Approximate duration
      lessonsCount: course.lessons.length,
      totalHours: Number((course.lessons.length * 0.5).toFixed(1)), // Approximate hours
      lastUpdated: new Date(course.updatedAt).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      rating: rating,
      reviewsCount: course.reviews.length,
      isFeatured: Array.isArray(course.topics) && course.topics.includes('featured'),
      learningPoints: course.topics || [],
      instructor: {
        name: creator?.name || 'Administrator',
        role: 'Course Creator',
        bio: 'Course creator and educator',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        rating: 4.9,
        students: course.students.length || 0,
        courses: 1, // Simplified
      },
      reviews: processedReviews,
    };
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    return null;
  }
}

/**
 * Get total student count
 */
export async function getTotalStudentCount(): Promise<number> {
  try {
    return await prisma.user.count({
      where: { role: 'student' }
    });
  } catch (error) {
    console.error('Error getting total student count:', error);
    return 0;
  }
}

/**
 * Get enrollment count for a course
 */
export async function getCourseEnrollmentCount(courseId: string): Promise<number> {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: { students: true }
        }
      }
    });
    
    return course?._count.students || 0;
  } catch (error) {
    console.error('Error getting course enrollment count:', error);
    return 0;
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string): Promise<UserCourseStats> {
  try {
    if (!userId) {
      console.warn('getUserStats called with missing userId');
      return {
        coursesCompleted: 0,
        lessonsCompleted: 0,
        totalHoursLearned: 0,
        currentStreak: 0,
      };
    }

    // Use safeFindUnique instead of direct prisma call
    const user = await safeFindUnique(
      prisma.user,
      {
        where: { id: userId },
        include: {
          enrolledIn: true
        }
      }
    );
    
    if (!user) {
      return {
        coursesCompleted: 0,
        lessonsCompleted: 0,
        totalHoursLearned: 0,
        currentStreak: 0,
      };
    }
    
    // Use safeFindMany instead of direct prisma call
    const userProgress = await safeFindMany(
      prisma.userProgress,
      { where: { userId } }
    );
    
    if (!user.enrolledIn || !Array.isArray(user.enrolledIn) || user.enrolledIn.length === 0) {
      return {
        coursesCompleted: 0,
        lessonsCompleted: 0,
        totalHoursLearned: 0,
        currentStreak: 0,
      };
    }
    
    let completedLessons = 0;
    let coursesCompleted = 0;
    let totalHoursLearned = 0;
    
    // Get all lessons for enrolled courses
    const enrolledCourseIds = user.enrolledIn.map(course => course.id);
    
    // Process each enrolled course
    for (const courseId of enrolledCourseIds) {
      // Get all lessons for this course
      try {
        // Use safeFindMany helper function
        const courseLessons = await safeFindMany(prisma.lesson, {
          where: { courseId }
        });
        
        // Count completed lessons
        let courseCompletedLessons = 0;
        
        if (courseLessons && Array.isArray(courseLessons)) {
          for (const lesson of courseLessons) {
            const progressEntry = userProgress.find(p => 
              p.courseId === courseId && p.lessonId === lesson.id && p.completed
            );
            
            if (progressEntry) {
              completedLessons++;
              courseCompletedLessons++;
              // Add time spent to total hours (if available)
              if (progressEntry.timeSpent) {
                totalHoursLearned += progressEntry.timeSpent / 3600; // Convert seconds to hours
              } else {
                // Estimate if not available
                totalHoursLearned += 0.5; // Default 30 minutes per lesson
              }
            }
          }
          
          // Check if course is completed
          if (courseCompletedLessons === courseLessons.length && courseLessons.length > 0) {
            coursesCompleted++;
          }
        }
      } catch (err) {
        console.error(`Error processing course ${courseId}:`, err);
      }
    }
    
    // Calculate current streak
    const streakDays = calculateStreak(userProgress);
    
    return {
      coursesCompleted,
      lessonsCompleted: completedLessons,
      totalHoursLearned: Math.round(totalHoursLearned * 10) / 10, // Round to 1 decimal place
      currentStreak: streakDays,
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      coursesCompleted: 0,
      lessonsCompleted: 0,
      totalHoursLearned: 0,
      currentStreak: 0,
    };
  }
}

/**
 * Calculate user streak based on user progress
 */
function calculateStreak(userProgress: any[]): number {
  if (!userProgress || !Array.isArray(userProgress) || userProgress.length === 0) {
    return 0;
  }
  
  // Get all dates when user completed lessons
  const completionDates = userProgress
    .filter(p => p.completed)
    .map(p => new Date(p.completedAt || p.updatedAt))
    .sort((a, b) => b.getTime() - a.getTime()); // Sort in descending order
  
  if (completionDates.length === 0) {
    return 0;
  }
  
  // Check if user has completed anything today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const mostRecentDate = new Date(completionDates[0]);
  mostRecentDate.setHours(0, 0, 0, 0);
  
  // If most recent activity was before yesterday, streak is broken
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (mostRecentDate < yesterday) {
    return 0;
  }
  
  // Calculate streak by counting consecutive days
  let streak = 1; // Start with 1 for the most recent day
  let currentDate = mostRecentDate;
  
  for (let i = 1; i < completionDates.length; i++) {
    const prevDate = new Date(completionDates[i]);
    prevDate.setHours(0, 0, 0, 0);
    
    // Check if this date is the previous day
    const expectedPrevDate = new Date(currentDate);
    expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);
    
    if (prevDate.getTime() === expectedPrevDate.getTime()) {
      streak++;
      currentDate = prevDate;
    } else if (prevDate.getTime() === currentDate.getTime()) {
      // Same day activity, skip
      continue;
    } else {
      // Break in streak
      break;
    }
  }
  
  return streak;
} 