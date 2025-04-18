/**
 * @file User progress type definitions
 * @description Type definitions for tracking user progress through courses and lessons
 */

/**
 * User progress interface
 */
export interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: Date;
  progress: number; // 0-100
  timeSpent: number; // in seconds
  lastAccessed?: Date;
}

/**
 * User stats interface
 */
export interface UserStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalChallenges: number;
  completedChallenges: number;
  averageRating?: number;
}

/**
 * Course progress summary
 */
export interface CourseProgressSummary {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  lastAccessedAt?: Date;
}

/**
 * Update progress request parameters
 */
export interface UpdateProgressParams {
  userId: string;
  courseId: string;
  lessonId: string;
  completed?: boolean;
  progress?: number;
  timeSpent?: number;
}
