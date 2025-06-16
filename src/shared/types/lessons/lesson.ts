// src/shared/types/lessons/lesson.ts
import { z } from 'zod';
import { Chapter } from '../courses/course';

/**
 * Lesson status enum
 */
export type LessonStatus = 'draft' | 'published';

/**
 * Lesson interface - Được trích xuất từ courses/course.ts
 */
export interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string | null;
  order: number;
  status: LessonStatus;
  courseId: string;
  chapterId?: string | null;
  chapter?: Chapter;
  createdAt: Date;
  updatedAt: Date;
  duration?: string | null;
  resourcesData?: string | null;
}

/**
 * Lesson creation parameters
 */
export interface CreateLessonParams {
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  status?: LessonStatus;
  courseId: string;
  chapterId?: string;
}

/**
 * Lesson with content interface
 */
export interface LessonWithContent extends Lesson {
  content: string;
  nextLessonId?: string;
  prevLessonId?: string;
}

/**
 * Lesson schema for validation
 */
export const LessonSchema = z.object({
  id: z.string(),
  title: z.string().min(3, 'Tiêu đề phải có ít nhất 3 ký tự'),
  content: z.string().optional(),
  videoUrl: z.string().url('URL video không hợp lệ').optional().nullable(),
  order: z.number().min(0, 'Thứ tự phải là số không âm'),
  status: z.enum(['draft', 'published']).default('draft'),
  courseId: z.string(),
  chapterId: z.string().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type LessonInput = z.infer<typeof LessonSchema>;
