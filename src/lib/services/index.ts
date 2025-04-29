/**
 * Central export point for all services
 */

// Export course services
export * from './courses/course-service';

// Export achievement services without dynamic
import * as AchievementService from './achievements/achievement-service';
export const {
  createAchievement,
  checkAndAwardAchievements,
  getUserAchievements,
  getAchievementTypes
} = AchievementService;

// File upload services
export * from './file/file-upload-service';
