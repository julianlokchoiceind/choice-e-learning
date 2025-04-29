export const dynamic = "force-dynamic";

/**
 * Achievement services for managing user achievements
 */
import prisma from '@/lib/db/prisma-client';
import { safeFindMany, safeFindFirst, safeFindUnique, safeCreate } from '@/lib/db/prisma-helper';
import { UserAchievement, AchievementType } from '@/types/achievement';
import { Lesson } from '@/types/course';
import { getUserLoginStreak } from '@/lib/db/services/user-service';

// Extended lesson interface for internal use
interface ExtendedLesson extends Lesson {
  [key: string]: any;
}

// Define interface for achievement database record
interface AchievementRecord {
  id: string;
  userId: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  type: string;
}

// Define interface for user progress record
interface UserProgressRecord {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: Date | null;
  progress: number;
}

/**
 * Get all achievements for a user
 * @param userId User ID to get achievements for
 * @returns Array of user achievements
 */
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  try {
    if (!userId) {
      console.warn('getUserAchievements called with empty userId');
      return [];
    }

    // Use safeFindMany with proper typing
    const achievements = await safeFindMany<AchievementRecord, any>(prisma.achievement, {
      where: { userId }
    });
    
    if (!achievements || !Array.isArray(achievements)) {
      console.warn('No achievements found or invalid response format');
      return [];
    }
    
    return achievements.map(achievement => ({
      id: achievement.id,
      userId: achievement.userId,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      earnedAt: achievement.earnedAt,
      type: achievement.type as AchievementType,
    }));
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }
}

/**
 * Create a new achievement for a user
 * @param userId User ID to create achievement for
 * @param type Achievement type
 * @param title Achievement title
 * @param description Achievement description
 * @param icon Achievement icon identifier
 * @returns Created achievement or null on failure
 */
export async function createAchievement(
  userId: string,
  type: AchievementType,
  title: string,
  description: string,
  icon: string
): Promise<UserAchievement | null> {
  try {
    if (!userId || !type) {
      console.warn('createAchievement called with missing parameters');
      return null;
    }
    
    // Check if user already has this achievement using safeFindFirst
    const existingAchievement = await safeFindFirst<AchievementRecord, any>(prisma.achievement, {
      where: {
        userId,
        type
      }
    });
    
    if (existingAchievement) {
      // User already has this achievement, return it
      return {
        id: existingAchievement.id,
        userId: existingAchievement.userId,
        title: existingAchievement.title,
        description: existingAchievement.description,
        icon: existingAchievement.icon,
        earnedAt: existingAchievement.earnedAt,
        type: existingAchievement.type as AchievementType,
      };
    }
    
    // Create new achievement using safeCreate
    const now = new Date();
    const achievement = await safeCreate<AchievementRecord, any>(prisma.achievement, {
      data: {
        userId,
        type,
        title,
        description,
        icon,
        earnedAt: now
      }
    });
    
    if (!achievement) {
      console.error('Failed to create achievement');
      return null;
    }
    
    return {
      id: achievement.id,
      userId,
      title,
      description,
      icon,
      earnedAt: now,
      type,
    };
  } catch (error) {
    console.error('Error creating achievement:', error);
    return null;
  }
}

/**
 * Check and award achievements for a user
 * @param userId User ID to check and award achievements for
 * @returns Array of newly awarded achievements
 */
export async function checkAndAwardAchievements(userId: string): Promise<UserAchievement[]> {
  try {
    if (!userId) {
      console.warn('checkAndAwardAchievements called with empty userId');
      return [];
    }
    
    // Define user record interface for this context
    interface UserRecord {
      id: string;
      enrolledIn?: Array<{ id: string }>;
      enrolledIds?: string[];
    }
    
    // Use safeFindUnique with proper typing
    const user = await safeFindUnique<UserRecord, any>(prisma.user, {
      where: { id: userId },
      include: {
        enrolledIn: true
      }
    });
    
    if (!user) {
      console.warn(`User with ID ${userId} not found`);
      return [];
    }
    
    const newAchievements: UserAchievement[] = [];
    
    // First login achievement
    const firstLoginAchievement = await createAchievement(
      userId,
      AchievementType.FIRST_LOGIN,
      'First Login',
      'You logged into the platform for the first time.',
      'login'
    );
    
    if (firstLoginAchievement) {
      newAchievements.push(firstLoginAchievement);
    }
    
    // Check for course started achievement
    if (user.enrolledIn && user.enrolledIn.length > 0) {
      const courseStartedAchievement = await createAchievement(
        userId,
        AchievementType.COURSE_STARTED,
        'Course Starter',
        'You enrolled in your first course.',
        'course'
      );
      
      if (courseStartedAchievement) {
        newAchievements.push(courseStartedAchievement);
      }
    }
    
    // Check for daily streak achievement
    await checkDailyStreakAchievement(userId, newAchievements);
    
    // Check for course completion achievement
    const userProgress = await safeFindMany<UserProgressRecord, any>(prisma.userProgress, {
      where: { userId }
    });
    
    if (userProgress.length > 0) {
      // Get all courses enrolled in
      const enrolledCourseIds = user.enrolledIds || 
        (Array.isArray(user.enrolledIn) ? 
          user.enrolledIn.map(course => course?.id).filter(Boolean) : []);
      
      // Get all lessons for these courses using safeFindMany
      const lessons = await safeFindMany<ExtendedLesson, any>(prisma.lesson, {
        where: {
          courseId: {
            in: enrolledCourseIds.length > 0 ? enrolledCourseIds : ['none']
          }
        }
      });
      
      // Group lessons by courseId
      const courseLessons: Record<string, number> = {};
      if (lessons && Array.isArray(lessons)) {
        for (const lesson of lessons) {
          if (!courseLessons[lesson.courseId]) {
            courseLessons[lesson.courseId] = 0;
          }
          courseLessons[lesson.courseId]++;
        }
      }
      
      // Count completed lessons per course
      const courseProgress: Record<string, number> = {};
      if (userProgress && Array.isArray(userProgress)) {
        for (const progress of userProgress) {
          if (progress.completed) {
            if (!courseProgress[progress.courseId]) {
              courseProgress[progress.courseId] = 0;
            }
            courseProgress[progress.courseId]++;
          }
        }
      }
      
      // Check if any course is completed
      for (const [courseId, completedCount] of Object.entries(courseProgress)) {
        const totalLessons = courseLessons[courseId] || 0;
        
        if (totalLessons > 0 && completedCount >= totalLessons) {
          const courseCompletedAchievement = await createAchievement(
            userId,
            AchievementType.COURSE_COMPLETED,
            'Course Completer',
            'You completed your first course.',
            'certificate'
          );
          
          if (courseCompletedAchievement) {
            newAchievements.push(courseCompletedAchievement);
          }
          
          break; // Only need one course completed for the achievement
        }
      }
      
      // Quick Learner achievement - X lessons in Y days
      const completedLessons = userProgress && Array.isArray(userProgress) ? userProgress.filter(p => p.completed) : [];
      const completedLessonCount = completedLessons.length;
      
      if (completedLessonCount >= 10) {
        const completedDates = completedLessons
          .filter(p => p.completedAt)
          .map(p => p.completedAt!)
          .sort((a, b) => a.getTime() - b.getTime());
        
        if (completedDates.length > 0) {
          const firstCompletionDate = completedDates[0];
          const daysSinceFirstCompletion = Math.floor(
            (Date.now() - firstCompletionDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysSinceFirstCompletion <= 7) {
            const quickLearnerAchievement = await createAchievement(
              userId,
              AchievementType.QUICK_LEARNER,
              'Quick Learner',
              'You completed 10 lessons within a week.',
              'speed'
            );
            
            if (quickLearnerAchievement) {
              newAchievements.push(quickLearnerAchievement);
            }
          }
        }
      }
    }
    
    return newAchievements;
  } catch (error) {
    console.error('Error checking and awarding achievements:', error);
    return [];
  }
}

/**
 * Check and award daily streak achievement
 * @param userId User ID to check streak for
 * @param achievementsArray Array to add new achievements to
 */
async function checkDailyStreakAchievement(
  userId: string, 
  achievementsArray: UserAchievement[]
): Promise<void> {
  try {
    // Get user's login streak from the specialized service
    const loginStreak = await getUserLoginStreak(userId);
    
    // Award achievement if streak is 7 or more days
    if (loginStreak >= 7) {
      const streakAchievement = await createAchievement(
        userId,
        AchievementType.DAILY_STREAK,
        'Daily Streak',
        'You logged in for 7 consecutive days.',
        'calendar'
      );
      
      if (streakAchievement) {
        achievementsArray.push(streakAchievement);
      }
    }
  } catch (error) {
    console.error('Error checking daily streak achievement:', error);
  }
}

/**
 * Get all achievement types with their details
 * @returns Map of achievement types to their details
 */
export function getAchievementTypes(): Record<AchievementType, { title: string, description: string, icon: string }> {
  return {
    [AchievementType.FIRST_LOGIN]: {
      title: 'First Login',
      description: 'You logged into the platform for the first time.',
      icon: 'login',
    },
    [AchievementType.COURSE_STARTED]: {
      title: 'Course Starter',
      description: 'You enrolled in your first course.',
      icon: 'course',
    },
    [AchievementType.COURSE_COMPLETED]: {
      title: 'Course Completer',
      description: 'You completed your first course.',
      icon: 'certificate',
    },
    [AchievementType.QUICK_LEARNER]: {
      title: 'Quick Learner',
      description: 'You completed 10 lessons within a week.',
      icon: 'speed',
    },
    [AchievementType.DAILY_STREAK]: {
      title: 'Daily Streak',
      description: 'You logged in for 7 consecutive days.',
      icon: 'calendar',
    },
    [AchievementType.LESSON_COMPLETED]: {
      title: 'Lesson Completed',
      description: 'You completed your first lesson.',
      icon: 'book',
    },
  };
}