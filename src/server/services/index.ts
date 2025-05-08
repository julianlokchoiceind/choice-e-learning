// Export service functions from /achievements directory
export {
  getUserAchievements,
  createAchievement,
  checkAndAwardAchievements,
  getAchievementTypes
} from './achievements';

// Export service functions from /courses directory
export {
  getAllCourses,
  getCourseById,
  getTotalStudentCount,
  getCourseEnrollmentCount,
  enrollUserInCourse,
  getUserStats,
  getFeaturedCourses,
  searchCourses,
  getAllTopics,
  getCourse,
  getUserCourses
} from './courses';

// Export other services
export * from './faq';
export * from './file';
export * from './lessons';
export * from './students';
export * from './topics';
export * from './user';
