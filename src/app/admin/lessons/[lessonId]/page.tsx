import { notFound } from 'next/navigation';
import { getLesson } from '@/server/services/lessons/lesson-service';

interface LessonDetailPageProps {
  params: {
    lessonId: string;
  };
}

export default async function LessonDetailPage({ params }: LessonDetailPageProps) {
  const lesson = await getLesson(params.lessonId);
  
  if (!lesson) {
    notFound();
  }
  
  return (
    <div className="admin-lesson-detail">
      <h1>{lesson.title}</h1>
      {/* Lesson details and management UI */}
    </div>
  );
}
