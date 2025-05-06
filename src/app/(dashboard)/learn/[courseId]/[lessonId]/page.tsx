import { Suspense } from 'react';
import { LessonPlayer } from '@/client/components/learn/LessonPlayer';
import { LoadingState } from '@/client/components/common/LoadingState';
import { LessonPlayer } from '@/client/components/learn/LessonPlayer';
import { getLesson } from '@/server/services/learn/lesson-service';
import { notFound } from 'next/navigation';

interface LessonPageProps {
  params: {
    courseId: string;
    lessonId: string;
  };
};
}

export async function generateMetadata({ params }: PageProps) {
  const lesson = await getLesson(params.lessonId);
  
  if (!lesson) {
    return {
      title: 'Lesson Not Found | Choice E-Learning',
      description: 'The requested lesson could not be found',
    };
  }
  
  return {
    title: `${lesson.title} | Choice E-Learning`,
    description: `Lesson from course: ${lesson.course.title}`,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const lesson = await getLesson(params.lessonId);
  
  if (!lesson || lesson.courseId !== params.courseId) {
    notFound();
  }
  
  return (
    <div className="page-container">
      <h1>{lesson.title}</h1>
      
      <Suspense fallback={<LoadingState />}>
        <LessonPlayer lesson={lesson} />
      </Suspense>
    </div>
  );
}