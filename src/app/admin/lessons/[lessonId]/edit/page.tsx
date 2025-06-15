'use client';

import { useParams } from 'next/navigation';
import { GuardedFormPage } from '@/client/components/admin';
import { LessonEditForm } from '@/client/components/admin/lessons';
import { useLessonsQuery } from '@/client/hooks/lessons';
import { useState } from 'react';

export default function EditLessonPage() {
  const params = useParams();
  const lessonId = params.lessonId as string;
  const [currentFormData, setCurrentFormData] = useState<any>(null);
  
  const { useGetLesson, useUpdateLesson } = useLessonsQuery();
  const { data: lesson, isLoading, error } = useGetLesson(lessonId);
  const updateLesson = useUpdateLesson();
  
  const handleSave = async () => {
    if (!lesson) return;
    
    // Extract only the fields that can be updated
    const dataToSave = currentFormData ? {
      title: currentFormData.title,
      content: currentFormData.content,
      videoUrl: currentFormData.videoUrl && currentFormData.videoUrl.trim() !== '' ? currentFormData.videoUrl : null,
      duration: currentFormData.duration?.toString() || null,
      order: parseInt(currentFormData.order?.toString() || '1')
    } : {
      title: lesson.title,
      content: lesson.content,
      videoUrl: lesson.videoUrl,
      duration: lesson.duration?.toString(),
      order: lesson.order
    };
    
    await updateLesson.mutateAsync({
      id: lessonId,
      data: dataToSave
    });
  };

  return (
    <GuardedFormPage
      backHref="/admin/lessons"
      backText="Back to Lessons"
      title="Edit Lesson"
      status={lesson?.status || 'draft'}
      isLoading={isLoading}
      error={error}
      notFoundTitle="Lesson Not Found"
      notFoundMessage="The lesson you're looking for doesn't exist or has been deleted."
      data={lesson}
      onFormChange={(data, isDirty) => {
        setCurrentFormData(data);
      }}
      onSave={handleSave}
      isSaving={updateLesson.isPending}
    >
      {(handleFormChange: any) => 
        lesson ? (
          <LessonEditForm 
            lesson={lesson} 
            onFormChange={handleFormChange}
          />
        ) : null
      }
    </GuardedFormPage>
  );
}
