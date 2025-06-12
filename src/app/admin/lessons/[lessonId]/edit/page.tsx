'use client';

import { useParams } from 'next/navigation';
import { LessonEditForm } from '@/client/components/admin/lessons/LessonEditForm';
import { useLessonsQuery } from '@/client/hooks/lessons';
import { LoadingState } from '@/client/components/common';

export default function EditLessonPage() {
  const params = useParams();
  const lessonId = params.lessonId as string;
  const { useGetLesson } = useLessonsQuery();
  
  const { data: lesson, isLoading, error } = useGetLesson(lessonId);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingState variant="page" message="Loading lesson..." />
      </div>
    );
  }
  
  if (error || !lesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Lesson Not Found</h2>
          <p className="mt-2 text-gray-600">The lesson you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <LessonEditForm lesson={lesson} />
    </div>
  );
}
