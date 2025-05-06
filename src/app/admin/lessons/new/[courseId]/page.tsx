import { notFound } from 'next/navigation';
import { LessonForm } from '@/client/components/admin/lessons/LessonForm';
import { getCourse } from '@/server/services/courses/course-service';

interface NewLessonPageProps {
  params: {
    courseId: string;
  };
}

export default async function NewLessonPage({ params }: NewLessonPageProps) {
  const course = await getCourse(params.courseId);
  
  if (!course) {
    notFound();
  }
  
  return (
    <div className="admin-new-lesson">
      <h1>Add New Lesson to: {course.title}</h1>
      <LessonForm courseId={params.courseId} />
    </div>
  );
}
