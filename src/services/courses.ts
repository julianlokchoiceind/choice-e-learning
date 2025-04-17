"use server";

import { getCollection } from '@/lib/db/mongodb';
import { CourseListItem, CourseDetails, UserCourseStats } from '@/types';
import { ObjectId } from 'mongodb';

/**
 * Get all courses from the database
 */
export async function getAllCourses(): Promise<CourseListItem[]> {
  try {
    const coursesCollection = await getCollection('courses');
    const courses = await coursesCollection.find().toArray();
    
    const usersCollection = await getCollection('users');

    // Process the courses to match our CourseListItem interface
    const processedCourses = await Promise.all(
      courses.map(async (course) => {
        // Get creator info (previously called instructor)
        const creator = await usersCollection.findOne({ _id: new ObjectId(course.creatorId || course.instructorId) });
        
        // Count students
        const studentsCount = Array.isArray(course.studentIds) ? course.studentIds.length : 0;
        
        // Calculate rating
        const reviewsCollection = await getCollection('reviews');
        const reviews = await reviewsCollection.find({ courseId: course._id.toString() }).toArray();
        const rating = reviews.length > 0 
          ? Number((reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / reviews.length).toFixed(1))
          : 4.5; // Default if no reviews
        
        // Calculate duration based on lessons
        const lessonsCollection = await getCollection('lessons');
        const lessonsCount = await lessonsCollection.countDocuments({ courseId: course._id.toString() });
        const duration = `${Math.ceil(lessonsCount / 2)} weeks`; // Approximate duration
        
        return {
          id: course._id.toString(),
          title: course.title,
          description: course.description,
          image: course.imageUrl || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
          level: course.level,
          price: course.price,
          duration: duration,
          isFeatured: Array.isArray(course.topics) && course.topics.includes('featured'),
          students: studentsCount,
          rating: rating,
          reviews: reviews.length,
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
    const coursesCollection = await getCollection('courses');
    const course = await coursesCollection.findOne({ _id: new ObjectId(courseId) });
    
    if (!course) return null;
    
    // Get creator info (previously instructor)
    const usersCollection = await getCollection('users');
    const creator = await usersCollection.findOne({ _id: new ObjectId(course.creatorId || course.instructorId) });
    
    // Get lessons
    const lessonsCollection = await getCollection('lessons');
    const lessons = await lessonsCollection.find({ courseId: courseId }).toArray();
    
    // Get reviews
    const reviewsCollection = await getCollection('reviews');
    const reviews = await reviewsCollection.find({ courseId: courseId }).toArray();
    
    // Process reviews to include user names
    const processedReviews = await Promise.all(
      reviews.map(async (review) => {
        const user = await usersCollection.findOne({ _id: new ObjectId(review.userId) });
        return {
          name: user?.name || 'Anonymous',
          rating: review.rating,
          avatar: 'https://randomuser.me/api/portraits/women/63.jpg', // Default avatar
          date: `${Math.floor((Date.now() - new Date(review.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30))} months ago`,
          comment: review.comment || 'Great course!',
        };
      })
    );
    
    // Calculate rating
    const rating = reviews.length > 0 
      ? Number((reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1))
      : 4.5; // Default if no reviews
    
    return {
      id: course._id.toString(),
      title: course.title,
      description: course.description,
      fullDescription: course.description,
      image: course.imageUrl || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
      level: course.level,
      price: course.price,
      duration: `${Math.ceil(lessons.length / 2)} weeks`, // Approximate duration
      lessonsCount: lessons.length,
      totalHours: Number((lessons.length * 0.5).toFixed(1)), // Approximate hours
      lastUpdated: new Date(course.updatedAt).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      rating: rating,
      reviewsCount: reviews.length,
      isFeatured: Array.isArray(course.topics) && course.topics.includes('featured'),
      learningPoints: course.topics || [],
      instructor: {
        name: creator?.name || 'Administrator',
        role: 'Course Creator',
        bio: 'Course creator and educator',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        rating: 4.9,
        students: course.studentIds?.length || 0,
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
    const usersCollection = await getCollection('users');
    return usersCollection.countDocuments({ role: 'student' });
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
    const coursesCollection = await getCollection('courses');
    const course = await coursesCollection.findOne({ _id: new ObjectId(courseId) });
    return Array.isArray(course?.studentIds) ? course.studentIds.length : 0;
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
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return {
        coursesCompleted: 0,
        lessonsCompleted: 0,
        totalHoursLearned: 0,
        currentStreak: 0,
      };
    }
    
    // Get courses user is enrolled in
    const enrolledIds = Array.isArray(user.enrolledIds) ? user.enrolledIds : [];
    
    if (enrolledIds.length === 0) {
      return {
        coursesCompleted: 0,
        lessonsCompleted: 0,
        totalHoursLearned: 0,
        currentStreak: 0,
      };
    }
    
    // Get data for each enrolled course
    const lessonsCollection = await getCollection('lessons');
    const userProgressCollection = await getCollection('userProgress');
    
    // Get user progress records
    const userProgress = await userProgressCollection.find({ 
      userId: userId 
    }).toArray();
    
    let completedLessons = 0;
    let totalLessons = 0;
    let coursesCompleted = 0;
    let totalHoursLearned = 0;
    
    // Process each enrolled course
    for (const courseId of enrolledIds) {
      // Get all lessons for this course
      const courseLessons = await lessonsCollection.find({ 
        courseId: courseId.toString() 
      }).toArray();
      
      totalLessons += courseLessons.length;
      
      // Count completed lessons
      let courseCompletedLessons = 0;
      courseLessons.forEach(lesson => {
        const progressEntry = userProgress.find(p => 
          p.courseId === courseId.toString() && p.lessonId === lesson._id.toString()
        );
        
        if (progressEntry && progressEntry.completed) {
          completedLessons++;
          courseCompletedLessons++;
          // Add time spent to total hours
          totalHoursLearned += (progressEntry.timeSpent || 0) / 3600; // Convert seconds to hours
        }
      });
      
      // Check if course is completed
      if (courseCompletedLessons === courseLessons.length && courseLessons.length > 0) {
        coursesCompleted++;
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
  if (!userProgress || userProgress.length === 0) {
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