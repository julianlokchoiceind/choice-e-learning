import { Level } from '@prisma/client';

/**
 * Course type returned by getAllCourses
 */
export interface CourseListItem {
  id: string;
  title: string;
  description: string;
  image: string;
  level: Level;
  price: number;
  duration: string;
  isFeatured: boolean;
  students: number;
  rating: number;
  reviews: number;
  instructorName: string;
}

/**
 * Full course details interface
 */
export interface CourseDetails {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  level: Level;
  price: number;
  duration: string;
  lessonsCount: number;
  totalHours: number;
  lastUpdated: string;
  rating: number;
  reviewsCount: number;
  isFeatured: boolean;
  learningPoints: string[];
  prerequisites: string[];
  modules: CourseModule[];
  instructor: Instructor;
  reviews: CourseReview[];
}

/**
 * Course module interface
 */
export interface CourseModule {
  title: string;
  duration: string;
  lessons: CourseLesson[];
}

/**
 * Course lesson interface
 */
export interface CourseLesson {
  title: string;
  duration: string;
}

/**
 * Instructor interface
 */
export interface Instructor {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  rating: number;
  students: number;
  courses: number;
}

/**
 * Course review interface
 */
export interface CourseReview {
  name: string;
  rating: number;
  avatar: string;
  date: string;
  comment: string;
}

/**
 * User stats interface
 */
export interface UserCourseStats {
  coursesCompleted: number;
  lessonsCompleted: number;
  totalHoursLearned: number;
  currentStreak: number;
}

/**
 * Enrolled course interface for dashboard display
 */
export interface EnrolledCourse {
  id: string;
  title: string;
  progress: number;
  imageUrl: string;
  totalLessons: number;
  completedLessons: number;
} 