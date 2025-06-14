import { DEFAULT_COURSE_PLACEHOLDER } from '@/client/hooks/courses';

export const ADMIN_COURSE_DEFAULTS = {
  title: '', // Để trống để backend tạo title theo định dạng
  description: '', // Để trống để hiển thị placeholder
  price: 0,
  level: 'beginner',
  topics: [],
  imageUrl: DEFAULT_COURSE_PLACEHOLDER,
  status: 'draft',
  chapters: [],
  lessons: []
};

// Course constants
export const COURSE_CONSTANTS = {
  DEFAULT_IMAGE: DEFAULT_COURSE_PLACEHOLDER,
  DEFAULT_LEVEL: 'beginner',
  DEFAULT_PRICE: 0,
  DEFAULT_HOURS: 0,
  DEFAULT_LESSONS_COUNT: 0,
};

export const COURSE_LEVELS = ['beginner', 'intermediate', 'advanced', 'all-levels'] as const;
export type CourseLevel = typeof COURSE_LEVELS[number];

export const COURSE_STATUSES = ['draft', 'published', 'archived'] as const;
export type CourseStatus = typeof COURSE_STATUSES[number];
