'use client';

// src/client/components/learn/LessonPlayer.tsx
import { useState, useEffect } from 'react';
import { Lesson } from '@/shared/types/lessons/lesson';
import { useLessonsQuery } from '@/client/hooks/lessons';
import { LoadingState } from '@/client/components/common';

interface LessonPlayerProps {
  lesson: Lesson;
  course: { id: string; title: string };
  onComplete?: (lessonId: string) => void;
  onProgress?: (progress: number) => void;
  isCompleted?: boolean;
}

export const LessonPlayer = ({ 
  lesson, 
  course, 
  onComplete, 
  onProgress,
  isCompleted = false
}: LessonPlayerProps) => {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(isCompleted);
  const [error, setError] = useState<string | null>(null);
  
  // Sử dụng React Query để đánh dấu hoàn thành bài học
  const { useMarkLessonComplete } = useLessonsQuery();
  const markLessonComplete = useMarkLessonComplete();

  // Đặt lại trạng thái khi lesson thay đổi
  useEffect(() => {
    setCompleted(isCompleted);
    setProgress(isCompleted ? 100 : 0);
    setError(null);
  }, [lesson.id, isCompleted]);

  const handleProgress = (newProgress: number) => {
    if (newProgress >= 0 && newProgress <= 100) {
      setProgress(newProgress);
      
      if (onProgress) {
        onProgress(newProgress);
      }
      
      if (newProgress >= 100 && !completed) {
        setCompleted(true);
        if (onComplete) {
          onComplete(lesson.id);
        }
      }
    }
  };

  const markAsCompleted = async () => {
    try {
      if (onComplete) {
        // Gọi onComplete callback trước (cho backwards compatibility)
        await onComplete(lesson.id);
        
        // Đánh dấu hoàn thành bài học với React Query
        await markLessonComplete.mutateAsync(lesson.id);
        
        setCompleted(true);
        setProgress(100);
      }
    } catch (err: unknown) {
      setError('Không thể đánh dấu hoàn thành. Vui lòng thử lại sau.');
      console.error('Error marking lesson as completed:', err);
    }
  };

  return (
    <div className='lesson-player'>
      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded'>
          {error}
        </div>
      )}

      {/* Video Content */}
      {lesson.videoUrl && (
        <div className='video-container mb-6'>
          <div className='aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden'>
            <iframe
              src={lesson.videoUrl}
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
              className='w-full h-full'
            ></iframe>
          </div>
        </div>
      )}

      {/* Text Content */}
      {lesson.content && (
        <div className='lesson-content prose max-w-none'>
          <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
        </div>
      )}

      {/* Progress Bar */}
      <div className='mt-8'>
        <div className='flex justify-between text-sm mb-1'>
          <span>Tiến độ</span>
          <span>{progress}%</span>
        </div>
        <div className='w-full bg-gray-200 rounded-full h-2.5'>
          <div
            className='bg-blue-600 h-2.5 rounded-full transition-all duration-300'
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='mt-8 flex justify-between'>
        <div className='space-x-4'>
          {!completed && (
            <button
              onClick={() => handleProgress(Math.min(progress + 25, 100))}
              className='px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded transition'
              disabled={markLessonComplete.isPending}
            >
              +25%
            </button>
          )}
        </div>
        
        {completed ? (
          <div className='inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded'>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 mr-1' viewBox='0 0 20 20' fill='currentColor'>
              <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
            </svg>
            Đã hoàn thành
          </div>
        ) : (
          <button
            onClick={markAsCompleted}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition'
            disabled={markLessonComplete.isPending}
          >
            {markLessonComplete.isPending ? 'Processing...' : 'Đánh dấu hoàn thành'}
          </button>
        )}
      </div>
    </div>
  );
};

export default LessonPlayer;
