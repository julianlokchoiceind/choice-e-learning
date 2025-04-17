import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email cannot exceed 255 characters');

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password cannot exceed 100 characters');

/**
 * User registration validation schema
 */
export const registerUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['student', 'admin']).default('student'),
});

/**
 * User login validation schema
 */
export const loginUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Course validation schema
 */
export const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description cannot exceed 2000 characters'),
  price: z.number().min(0, 'Price cannot be negative'),
  imageUrl: z.string().url('Image URL must be a valid URL').optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  topics: z.array(z.string()).min(1, 'At least one topic is required'),
});

/**
 * Challenge validation schema
 */
export const challengeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description cannot exceed 2000 characters'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  startDate: z.string().datetime({ offset: true }),
  endDate: z.string().datetime({ offset: true }),
});

/**
 * Review validation schema
 */
export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().min(5, 'Comment must be at least 5 characters').max(500, 'Comment cannot exceed 500 characters'),
  courseId: z.string().min(1, 'Course ID is required'),
});

/**
 * FAQ validation schema
 */
export const faqSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters').max(200, 'Question cannot exceed 200 characters'),
  answer: z.string().min(5, 'Answer must be at least 5 characters').max(1000, 'Answer cannot exceed 1000 characters'),
  category: z.string().min(2, 'Category must be at least 2 characters').max(50, 'Category cannot exceed 50 characters'),
});

/**
 * Roadmap step validation schema
 */
export const roadmapStepSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description cannot exceed 1000 characters'),
  order: z.number().int().min(1, 'Order must be at least 1'),
  resources: z.array(z.string()).optional(),
});

/**
 * Roadmap validation schema
 */
export const roadmapSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description cannot exceed 1000 characters'),
  steps: z.array(roadmapStepSchema).min(1, 'At least one step is required'),
});

/**
 * Pagination validation schema
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
}); 