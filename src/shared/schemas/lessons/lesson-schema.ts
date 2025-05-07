// src/shared/schemas/lessons/lesson-schema.ts
import { z } from 'zod';

/**
 * Schema cho tạo/cập nhật bài học
 */
export const lessonSchema = z.object({
  title: z.string()
    .min(3, 'Tiêu đề phải có ít nhất 3 ký tự')
    .max(200, 'Tiêu đề không được vượt quá 200 ký tự'),
  content: z.string()
    .optional(),
  videoUrl: z.string()
    .url('URL video không hợp lệ')
    .optional()
    .nullable(),
  order: z.number()
    .int('Thứ tự phải là số nguyên')
    .min(0, 'Thứ tự phải là số không âm'),
  courseId: z.string()
    .min(1, 'ID khóa học không được để trống'),
  chapterId: z.string()
    .optional()
    .nullable(),
});

/**
 * Schema cho tạo bài học mới
 */
export const createLessonSchema = lessonSchema;

/**
 * Schema cho cập nhật bài học
 */
export const updateLessonSchema = lessonSchema.partial();

/**
 * Schema cho lấy bài học
 */
export const getLessonSchema = z.object({
  id: z.string().min(1, 'ID bài học không được để trống'),
});

/**
 * Types được sinh ra từ schemas
 */
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type GetLessonInput = z.infer<typeof getLessonSchema>;
