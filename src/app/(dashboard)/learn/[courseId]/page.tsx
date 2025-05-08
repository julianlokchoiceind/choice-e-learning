import { Suspense } from 'react';
import { CourseDetail } from '@/client/components/courses/CourseDetail';
import { LoadingState } from '@/client/components/common/LoadingState';
import { getCourse } from '@/server/services/courses/course-service';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    courseId: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  const course = await getCourse(params.courseId);
  
  if (!course) {
    return {
      title: 'Course Not Found | Choice E-Learning',
      description: 'The requested course could not be found',
    };
  }
  
  return {
    title: `${course.title} | Choice E-Learning`,
    description: `Learn ${course.title} at Choice E-Learning`,
  };
}

export default async function Page({ params }: PageProps) {
  const course = await getCourse(params.courseId);
  
  if (!course) {
    notFound();
  }
  
  return (
    <div className='page-container'>
      <h1>{course.title}</h1>
      
      <Suspense fallback={<LoadingState />}>
        {/* Course content and lessons list */}
      </Suspense>
    </div>
  );
}