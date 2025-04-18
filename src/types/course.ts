/**
 * @file Course type definitions
 * @description Type definitions for courses, lessons, and related features
 */

/**
 * Course difficulty level
 * @enum {string}
 */
export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

/**
 * Basic course interface
 */
export interface Course {
  id: string;
  title: string;
  description: string;
  image?: string;
  level: string;
  price: number;
  topics: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Featured course interface
 */
export interface FeaturedCourse {
  id: string;
  title: string;
  description: string;
  image: string;
  level: string;
  price: number;
  isFeatured?: boolean;
}

/**
 * Popular course interface
 */
export interface PopularCourse {
  id: string;
  title: string;
  category: string;
  students: number;
  image: string;
}

/**
 * Course creation parameters
 */
export interface CreateCourseParams {
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  level: string;
  topics: string[];
}

/**
 * Course update parameters
 */
export interface UpdateCourseParams {
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  level?: string;
  topics?: string[];
}

/**
 * Lesson interface
 */
export interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Lesson creation parameters
 */
export interface CreateLessonParams {
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  courseId: string;
}

/**
 * Course with lessons interface
 */
export interface CourseWithLessons extends Course {
  lessons: Lesson[];
}

/**
 * Represents a learning roadmap step
 */
export interface Roadmap {
  title: string;
  description: string;
}

/**
 * Represents a student testimonial
 */
export interface Testimonial {
  name: string;
  title: string;
  avatar: string;
  quote: string;
}

/**
 * Represents a how it works step
 */
export interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
}
