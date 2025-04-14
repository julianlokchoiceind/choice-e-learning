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
    
    const instructorsCollection = await getCollection('users');

    // Process the courses to match our CourseListItem interface
    const processedCourses = await Promise.all(
      courses.map(async (course) => {
        // Get instructor
        const instructor = await instructorsCollection.findOne({ _id: new ObjectId(course.instructorId) });
        
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
          instructorName: instructor?.name || 'Unknown Instructor',
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
    
    // Get instructor
    const instructorsCollection = await getCollection('users');
    const instructor = await instructorsCollection.findOne({ _id: new ObjectId(course.instructorId) });
    
    // Get lessons
    const lessonsCollection = await getCollection('lessons');
    const lessons = await lessonsCollection.find({ courseId: courseId }).toArray();
    
    // Get reviews
    const reviewsCollection = await getCollection('reviews');
    const reviews = await reviewsCollection.find({ courseId: courseId }).toArray();
    
    // Process reviews to include user names
    const processedReviews = await Promise.all(
      reviews.map(async (review) => {
        const user = await instructorsCollection.findOne({ _id: new ObjectId(review.userId) });
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
        name: instructor?.name || 'Unknown Instructor',
        role: instructor?.role === 'instructor' ? 'Senior Instructor' : 'Instructor',
        bio: 'Experienced instructor with a passion for teaching',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        rating: 4.9,
        students: await getInstructorStudentCount(course.instructorId),
        courses: await getInstructorCourseCount(course.instructorId),
      },
      reviews: processedReviews,
    };
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    return null;
  }
}

/**
 * Get total number of students for an instructor
 */
async function getInstructorStudentCount(instructorId: string): Promise<number> {
  try {
    const coursesCollection = await getCollection('courses');
    const courses = await coursesCollection.find({ instructorId }).toArray();
    
    // Count unique students across all courses
    const uniqueStudentIds = new Set<string>();
    courses.forEach(course => {
      if (Array.isArray(course.studentIds)) {
        course.studentIds.forEach((studentId: string) => {
          uniqueStudentIds.add(studentId);
        });
      }
    });
    
    return uniqueStudentIds.size;
  } catch (error) {
    console.error('Error getting instructor student count:', error);
    return 0;
  }
}

/**
 * Get course count for an instructor
 */
async function getInstructorCourseCount(instructorId: string): Promise<number> {
  try {
    const coursesCollection = await getCollection('courses');
    return coursesCollection.countDocuments({ instructorId });
  } catch (error) {
    console.error('Error getting instructor course count:', error);
    return 0;
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
    const coursesCollection = await getCollection('courses');
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
      
      // Count total lessons
      const courseTotalLessons = courseLessons.length;
      totalLessons += courseTotalLessons;
      
      // Get completed lessons for this course
      const courseCompletedLessons = userProgress.filter(progress => 
        progress.courseId === courseId.toString() && 
        progress.completed === true
      ).length;
      
      // Add to total completed lessons
      completedLessons += courseCompletedLessons;
      
      // Calculate hours based on lessons (assuming 30 minutes per lesson)
      totalHoursLearned += (courseCompletedLessons * 0.5);
      
      // Check if course is completed
      if (courseTotalLessons > 0 && courseCompletedLessons === courseTotalLessons) {
        coursesCompleted++;
      }
    }
    
    // Calculate streak based on login history or activity dates
    let currentStreak = 0;
    if (user.loginHistory && Array.isArray(user.loginHistory)) {
      // Sort login dates in descending order
      const sortedLoginDates = [...user.loginHistory].sort((a, b) => 
        new Date(b).getTime() - new Date(a).getTime()
      );
      
      if (sortedLoginDates.length > 0) {
        // Check if most recent login is today or yesterday
        const now = new Date();
        const mostRecentLogin = new Date(sortedLoginDates[0]);
        const isRecentLogin = 
          mostRecentLogin.toDateString() === now.toDateString() || 
          mostRecentLogin.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString();
        
        if (isRecentLogin) {
          currentStreak = 1; // Start with 1 for today/yesterday
          
          // Check consecutive days before today/yesterday
          let prevDate = new Date(mostRecentLogin);
          prevDate.setDate(prevDate.getDate() - 1);
          
          for (let i = 1; i < sortedLoginDates.length; i++) {
            const loginDate = new Date(sortedLoginDates[i]);
            
            // If this login is 1 day before the previous one we checked, increment streak
            if (loginDate.toDateString() === prevDate.toDateString()) {
              currentStreak++;
              prevDate.setDate(prevDate.getDate() - 1);
            } else {
              break; // Streak broken
            }
          }
        }
      }
    }
    
    return {
      coursesCompleted,
      lessonsCompleted: completedLessons,
      totalHoursLearned: parseFloat(totalHoursLearned.toFixed(1)),
      currentStreak,
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