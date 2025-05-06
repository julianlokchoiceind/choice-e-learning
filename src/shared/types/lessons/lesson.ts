export interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  courseId: string;
  videoUrl?: string;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonWithProgress extends Lesson {
  completed: boolean;
  progress: number;
}
