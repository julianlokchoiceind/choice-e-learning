/**
 * Route path constants
 * Contains all frontend routes used in the application
 */

// Auth routes
export const AUTH_ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
};

// Public routes
export const PUBLIC_ROUTES = {
  HOME: '/',
  COURSES: '/courses',
  COURSE_DETAIL: (id: string) => `/courses/${id}`,
  FAQ: '/faq',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  ROADMAP: '/roadmap',
  CHALLENGES: '/challenges',
  REVIEWS: '/reviews',
};

// Dashboard routes
export const DASHBOARD_ROUTES = {
  DASHBOARD: '/dashboard',
  MY_COURSES: '/my-courses',
  PROFILE: '/profile',
  SETTINGS: '/settings',
};

// Learning routes
export const LEARN_ROUTES = {
  BASE: '/learn',
  COURSE: (id: string) => `/learn/${id}`,
  LESSON: (courseId: string, lessonId: string) => `/learn/${courseId}/${lessonId}`,
};

// Admin routes
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  COURSES: '/admin/courses',
  NEW_COURSE: '/admin/courses/new',
  EDIT_COURSE: (id: string) => `/admin/courses/${id}/edit`,
  LESSONS: '/admin/lessons',
  EDIT_LESSON: (id: string) => `/admin/lessons/${id}/edit`,
  STUDENTS: '/admin/students',
  NEW_STUDENT: '/admin/students/new',
  EDIT_STUDENT: (id: string) => `/admin/students/${id}/edit`,
  TOPICS: '/admin/topics',
  NEW_TOPIC: '/admin/topics/new',
  EDIT_TOPIC: (id: string) => `/admin/topics/${id}/edit`,
  FAQS: '/admin/faqs',
  NEW_FAQ: '/admin/faqs/new',
  EDIT_FAQ: (id: string) => `/admin/faqs/${id}/edit`,
};
