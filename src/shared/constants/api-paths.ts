/**
 * API path constants
 * Contains all API endpoints used in the application
 */

// Base API path
export const API_BASE_PATH = '/api';

// Authentication endpoints
export const AUTH_PATHS = {
  LOGIN: `${API_BASE_PATH}/auth/login`,
  REGISTER: `${API_BASE_PATH}/auth/register`,
  LOGOUT: `${API_BASE_PATH}/auth/logout`,
  SESSION: `${API_BASE_PATH}/auth/session`,
};

// Course endpoints
export const COURSE_PATHS = {
  BASE: `${API_BASE_PATH}/courses`,
  DETAIL: (id: string) => `${API_BASE_PATH}/courses/${id}`,
  ENROLL: (id: string) => `${API_BASE_PATH}/courses/${id}/enroll`,
  LESSONS: (id: string) => `${API_BASE_PATH}/courses/${id}/lessons`,
  LESSON_DETAIL: (courseId: string, lessonId: string) => 
    `${API_BASE_PATH}/courses/${courseId}/lessons/${lessonId}`,
};

// User endpoints
export const USER_PATHS = {
  ME: `${API_BASE_PATH}/users/me`,
  PROFILE: `${API_BASE_PATH}/users/profile`,
  MY_COURSES: `${API_BASE_PATH}/users/me/courses`,
};

// Admin endpoints
export const ADMIN_PATHS = {
  COURSES: `${API_BASE_PATH}/admin/courses`,
  COURSE_DETAIL: (id: string) => `${API_BASE_PATH}/admin/courses/${id}`,
  LESSONS: `${API_BASE_PATH}/admin/lessons`,
  LESSON_DETAIL: (id: string) => `${API_BASE_PATH}/admin/lessons/${id}`,
  STUDENTS: `${API_BASE_PATH}/admin/students`,
  STUDENT_DETAIL: (id: string) => `${API_BASE_PATH}/admin/students/${id}`,
  TOPICS: `${API_BASE_PATH}/admin/topics`,
  TOPIC_DETAIL: (id: string) => `${API_BASE_PATH}/admin/topics/${id}`,
  FAQS: `${API_BASE_PATH}/admin/faqs`,
  FAQ_DETAIL: (id: string) => `${API_BASE_PATH}/admin/faqs/${id}`,
  USERS: `${API_BASE_PATH}/admin/users`,
  USER_DETAIL: (id: string) => `${API_BASE_PATH}/admin/users/${id}`,
  USER_ROLE: (id: string) => `${API_BASE_PATH}/admin/users/${id}/role`,
};

// FAQ endpoints
export const FAQ_PATHS = {
  BASE: `${API_BASE_PATH}/faqs`,
  CATEGORIES: `${API_BASE_PATH}/faqs/categories`,
};

// Topic endpoints
export const TOPIC_PATHS = {
  BASE: `${API_BASE_PATH}/topics`,
};

// File upload endpoints
export const UPLOAD_PATHS = {
  BASE: `${API_BASE_PATH}/upload`,
};

// Progress tracking endpoints
export const PROGRESS_PATHS = {
  USER_PROGRESS: `${API_BASE_PATH}/userProgress`,
  USER_STATS: `${API_BASE_PATH}/userStats`,
  ACHIEVEMENTS: `${API_BASE_PATH}/achievements`,
};
