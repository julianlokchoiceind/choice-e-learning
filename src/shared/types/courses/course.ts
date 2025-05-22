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
 * Course status enum
 */
export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published'
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
  slug: string;
  description: string;
  price: number;
  imageUrl?: string;
  isPublished?: boolean;
  level?: string;
  duration?: number;
  status?: CourseStatus;
  createdAt?: Date;
  updatedAt?: Date;
  topics?: string[];
  lessons?: Lesson[];
  authorId?: string;
  // Relationships that might come from Prisma
  creator?: any;
  students?: any[];
  studentsCount?: number; // Count of students enrolled in the course
  chapters?: Chapter[];
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
  level?: string;
  duration?: number;
  topics?: string[];
  isPublished?: boolean;
  status?: CourseStatus;
}

/**
 * Course update parameters
 */
export interface UpdateCourseParams extends Partial<CreateCourseParams> {
  id: string;
}

/**
 * Course list item interface (for display in course listings)
 */
export interface CourseListItem {
  id: string;
  title: string;
  description: string;
  image: string;
  imageUrl?: string; // Added to fix the type error in courses API
  level: string;
  price: number;
  duration: string;
  isFeatured: boolean;
  students: number;
  studentsCount?: number; // Added to fix build error
  rating: number;
  reviews: number;
  instructorName: string;
  learningPoints?: string[];
  topics?: string[]; // Added to fix build error
  updatedAt?: Date; // Added to match what's returned by the service
  status?: CourseStatus; // Added to show course publication status
  isPublished?: boolean; // Added as fallback for status
  displayTitle?: string; // Formatted title for UI display
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
  courseId: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
  content?: string;
  videoUrl?: string | null;
  chapterId?: string | null;
  duration?: number;
  chapter?: Chapter;
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
  courseId: string;
  order: number;
  content?: string;
  videoUrl?: string | null;
  chapterId?: string | null;
}

/**
 * Lesson update parameters
 */
export interface UpdateLessonParams extends Partial<CreateLessonParams> {
  id: string;
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
 * @deprecated Use UserProgress from the progress module instead
 */
export interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
}

/**
 * Enrolled course interface for student's enrolled courses
 */
export interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  level: string;
  progress: number;
  lastAccessed?: Date;
  completed: boolean;
  instructor: string;
  lessonsCompleted: number;
  totalLessons: number;
  timeSpent: number;
  enrolledAt: Date;
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

/**
 * Course filter interface for searching and filtering courses
 */
export interface CourseFilter {
  search?: string;
  level?: string;
  topics?: string[];
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isPublished?: boolean;
}
