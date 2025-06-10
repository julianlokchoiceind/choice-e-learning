import { Suspense } from 'react';
import { LessonPlayer } from '@/client/components/learn/LessonPlayer';
import { getLesson } from '@/server/services/lessons/lesson-service';
import { getCourse } from '@/server/services/courses/course-service';
import { notFound } from 'next/navigation';

interface LessonPageProps {
  params: {
    courseId: string;
    lessonId: string;
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseId, lessonId } = params;
  
  const [lesson, course] = await Promise.all([
    getLesson(lessonId),
    getCourse(courseId),
  ]);
  
  if (!lesson || !course) {
    notFound();
  }
  
  return (
    <div className='lesson-page'>
      <Suspense fallback={<div>Loading lesson...</div>}>
        <LessonPlayer lesson={lesson} course={course} />
      </Suspense>
    </div>
  );
}
