'use client';

// src/client/hooks/learn/useLesson.ts
import { useState, useEffect } from 'react';
import apiClient from '@/client/utils/http/api-client';
import { Lesson } from '@/shared/types/lessons/lesson';

interface UseLessonOptions {
  initialLesson?: Lesson;
  autoLoad?: boolean;
}

export function useLesson(lessonId: string, options: UseLessonOptions = {}) {
  const [lesson, setLesson] = useState<Lesson | null>(options.initialLesson || null);
  const [isLoading, setIsLoading] = useState(!options.initialLesson);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const fetchLesson = async () => {
    if (!lessonId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(`/api/lessons/${lessonId}`);
      setLesson(response.data);
      
      // Kiểm tra xem bài học đã hoàn thành chưa
      const progressResponse = await apiClient.get('/api/userProgress', {
        params: { lessonId }
      });
      
      setIsCompleted(progressResponse.data?.completed || false);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải bài học. Vui lòng thử lại sau.');
      console.error('Error fetching lesson:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const completeLesson = async () => {
    if (!lessonId || !lesson) return;
    
    try {
      await apiClient.post('/api/userProgress', {
        lessonId,
        courseId: lesson.courseId,
        completed: true
      });
      
      setIsCompleted(true);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đánh dấu hoàn thành. Vui lòng thử lại sau.');
      console.error('Error completing lesson:', err);
      return false;
    }
  };
  
  const updateProgress = async (progress: number) => {
    if (!lessonId || !lesson) return;
    
    try {
      await apiClient.post('/api/userProgress', {
        lessonId,
        courseId: lesson.courseId,
        progress
      });
      
      return true;
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
