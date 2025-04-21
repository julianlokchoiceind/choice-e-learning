/**
 * @file Achievement type definitions
 * @description Type definitions for user achievements
 */

/**
 * Achievement types enum
 * @enum {string}
 */
export enum AchievementType {
  FIRST_LOGIN = 'first_login',
  COURSE_STARTED = 'course_started',
  COURSE_COMPLETED = 'course_completed',
  LESSON_COMPLETED = 'lesson_completed',
  STREAK = 'streak',
  QUICK_LEARNER = 'quick_learner',
}

/**
 * User achievement interface
 */
export interface UserAchievement {
  id: string;
  userId: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  type: AchievementType;
}

/**
 * Create achievement parameters
 */
export interface CreateAchievementParams {
  userId: string;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
}
