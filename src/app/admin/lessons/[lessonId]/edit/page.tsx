import { notFound } from 'next/navigation';
import { LessonForm } from '@/client/components/admin/lessons/LessonForm';
import { getLesson } from '@/server/services/lessons/lesson-service';

interface EditLessonPageProps {
  params: {
    lessonId: string;
  };
}

export default async function EditLessonPage({ params }: EditLessonPageProps) {
  const lesson = await getLesson(params.lessonId);
  
  if (!lesson) {
    notFound();
  }
  
  return (
    <div className="admin-edit-lesson">
      <h1>Edit Lesson: {lesson.title}</h1>
      <LessonForm lessonId={params.lessonId} courseId={lesson.courseId} initialData={lesson} />
    </div>
  );
}
