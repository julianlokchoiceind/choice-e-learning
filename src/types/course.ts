/**
 * @file Course type definitions
 * @description Unified type definitions for courses, lessons, and related features
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
 * Chapter interface
 */
export interface Chapter {
  id: string;
  title: string;
  description?: string;
  order: number;
  courseId: string;
  lessons?: Lesson[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Basic course interface
 */
export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  image?: string; // Alternative property name used in some places
  level: string;
  price: number;
  topics: string[];
  creatorId?: string;
  createdAt: Date;
  updatedAt: Date;
  // Relationships that might come from Prisma
  creator?: any;
  students?: any[];
  chapters?: Chapter[];
  lessons?: any[];
  reviews?: any[];
  // Virtual counts from Prisma
  _count?: {
    students?: number;
    chapters?: number;
    lessons?: number;
    reviews?: number;
  };
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
 * Course list item interface (for display in course listings)
 */
export interface CourseListItem {
  id: string;
  title: string;
  description: string;
  image: string;
  level: string;
  price: number;
  duration: string;
  isFeatured: boolean;
  students: number;
  rating: number;
  reviews: number;
  instructorName: string;
  learningPoints?: string[];
}

/**
 * Course details interface (for detailed course view)
 */
export interface CourseDetails {
  id: string;
  title: string;
  description: string;
  image: string;
  level: string;
  price: number;
  duration: string;
  isFeatured: boolean;
  students: number;
  rating: number;
  reviews: CourseReview[]; // This is different from CourseListItem's reviews (number)
  instructorName: string;
  fullDescription: string;
  lessonsCount: number;
  totalHours: number;
  lastUpdated: string;
  reviewsCount: number;
  learningPoints: string[];
  instructor: {
    name: string;
    role: string;
    bio: string;
    avatar: string;
    rating: number;
    students: number;
    courses: number;
  };
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
 * Lesson interface
 */
export interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  courseId: string;
  chapterId?: string;
  chapter?: Chapter;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Chapter creation parameters
 */
export interface CreateChapterParams {
  title: string;
  description?: string;
  order: number;
  courseId: string;
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
  chapterId?: string;
}

/**
 * Course with chapters and lessons interface
 */
export interface CourseWithChaptersAndLessons extends Course {
  chapters: (Chapter & { lessons: Lesson[] })[];
  lessons: Lesson[];
}

/**
 * Course with lessons interface
 */
export interface CourseWithLessons extends Course {
  lessons: Lesson[];
}

/**
 * User course statistics interface
 */
export interface UserCourseStats {
  coursesCompleted: number;
  lessonsCompleted: number;
  totalHoursLearned: number;
  currentStreak: number;
}

/**
 * User progress interface for tracking course completion
 */
export interface UserProgress {
  id?: string;
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: Date;
  timeSpent?: number;
  updatedAt: Date;
  createdAt?: Date;
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
