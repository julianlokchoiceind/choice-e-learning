/**
 * Export all hooks from the courses domain
 */

/**
 * Exports the useCourses hook for managing courses state
 */
export * from './useCourses';
export { default as useCourses } from './useCourses';

/**
 * Exports the useCoursePlaceholder hook for course placeholder data
 */
export * from './useCoursePlaceholder';
export { default as useCoursePlaceholder } from './useCoursePlaceholder';

/**
 * Exports the useCoursesQuery hook for React Query operations on courses
 */
export * from './useCoursesQuery';
export { default as useCoursesQuery } from './useCoursesQuery';
