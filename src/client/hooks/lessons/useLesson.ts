'use client';

// src/client/hooks/lessons/useLesson.ts
import { useState, useEffect } from 'react';
import { useApiRequest } from '@/client/hooks/common/useApiRequest';
import { Lesson } from '@/shared/types/lessons/lesson';

interface UseLessonOptions {
  initialLesson?: Lesson;
  autoLoad?: boolean;
}

export function useLesson(lessonId: string, options: UseLessonOptions = {}) {
  const [lesson, setLesson] = useState<Lesson | null>(options.initialLesson || null);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Sử dụng useApiRequest cho các API calls
  const lessonRequest = useApiRequest<Lesson>();
  const progressRequest = useApiRequest<{completed?: boolean}>();
  const updateProgressRequest = useApiRequest();
  
  // Lấy trạng thái loading và error từ useApiRequest
  const isLoading = lessonRequest.loading || progressRequest.loading;
  const error = lessonRequest.error?.message || progressRequest.error?.message || null;
  
  const fetchLesson = async () => {
    if (!lessonId) return;
    
    try {
      // Sử dụng useApiRequest.get thay vì apiClient.get
      const response = await lessonRequest.get(`/api/lessons/${lessonId}`, {
        onSuccess: (data) => {
          setLesson(data);
        }
      });
      
      // Kiểm tra xem bài học đã hoàn thành chưa
      await progressRequest.get('/api/dashboard/progress', {
        onSuccess: (data) => {
          setIsCompleted(data?.completed || false);
        },
        headers: {
          'X-Lesson-Id': lessonId
        }
      });
      
      return response;
    } catch (err) {
      console.error('Error fetching lesson:', err);
    }
  };
  
  const completeLesson = async () => {
    if (!lessonId || !lesson) return false;
    
    try {
      await updateProgressRequest.post('/api/dashboard/progress', {
        lessonId,
        courseId: lesson.courseId,
        completed: true
      }, {
        onSuccess: () => {
          setIsCompleted(true);
        },
        onError: (err) => {
          console.error('Error completing lesson:', err);
        }
      });
      
      return !updateProgressRequest.error;
    } catch (err) {
      console.error('Error completing lesson:', err);
      return false;
    }
  };
  
  const updateProgress = async (progress: number) => {
    if (!lessonId || !lesson) return false;
    
    try {
      await updateProgressRequest.post('/api/dashboard/progress', {
        lessonId,
        courseId: lesson.courseId,
        progress
      });
      
      return !updateProgressRequest.error;
    } catch (err) {
      console.error('Error updating progress:', err);
      return false;
    }
  };
  
  // Tự động tải bài học khi component được mount hoặc lessonId thay đổi
  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchLesson();
    }
  }, [lessonId]);
  
  return {
    lesson,
    isLoading,
    error,
    isCompleted,
    fetchLesson,
    completeLesson,
    updateProgress
  };
}

export default useLesson;
