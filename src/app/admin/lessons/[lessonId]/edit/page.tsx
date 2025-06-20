'use client';

import { useParams } from 'next/navigation';
import { GuardedFormPage } from '@/client/components/admin';
import { LessonEditForm } from '@/client/components/admin/lessons';
import { useLessonsQuery } from '@/client/hooks/lessons';
import { useState, useRef } from 'react';

export default function EditLessonPage() {
  const params = useParams();
  const lessonId = params.lessonId as string;
  const [currentFormData, setCurrentFormData] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const lessonFormRef = useRef<any>(null);
  
  const { useGetLesson, useUpdateLesson } = useLessonsQuery();
  const { data: lesson, isLoading, error } = useGetLesson(lessonId);
  const updateLesson = useUpdateLesson();
  
  const handleSave = async () => {
    if (!lesson) return;
    
    // Call the lesson form's save method if it exists
    if (lessonFormRef.current && lessonFormRef.current.handleSave) {
      await lessonFormRef.current.handleSave();
      return;
    }
    
    // Fallback: Extract only the fields that can be updated
    const dataToSave = currentFormData ? {
      title: currentFormData.title,
      content: currentFormData.content,
      videoUrl: currentFormData.videoUrl && currentFormData.videoUrl.trim() !== '' ? currentFormData.videoUrl : null,
      duration: currentFormData.duration?.toString() || null,
      order: parseInt(currentFormData.order?.toString() || '1'),
      courseId: currentFormData.courseId,
      chapterId: currentFormData.chapterId || null,
      resourcesData: currentFormData.resourcesData ? JSON.stringify(currentFormData.resourcesData) : null
    } : {
      title: lesson.title,
      content: lesson.content,
      videoUrl: lesson.videoUrl,
      duration: lesson.duration?.toString(),
      order: lesson.order,
      courseId: lesson.courseId,
      chapterId: lesson.chapterId,
      resourcesData: lesson.resourcesData
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
        setHasUnsavedChanges(isDirty);
      }}
      onSave={handleSave}
      isSaving={updateLesson.isPending}
    >
      {(handleFormChange: any) => 
        lesson ? (
          <LessonEditForm 
            ref={lessonFormRef}
            lesson={lesson} 
            onFormChange={handleFormChange}
          />
        ) : null
      }
    </GuardedFormPage>
  );
}
