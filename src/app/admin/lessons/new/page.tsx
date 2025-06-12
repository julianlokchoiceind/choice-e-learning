import { LessonEditForm } from '@/client/components/admin/lessons/LessonEditForm';

export const metadata = {
  title: 'Create New Lesson | Admin',
  description: 'Create a new lesson',
};

export default function NewLessonPage() {
  const emptyLesson = {
    id: '',
    title: '',
    courseId: '',
    chapterId: '',
    videoUrl: '',
    duration: 0,
    order: 1,
    status: 'Draft' as const,
    content: '',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <LessonEditForm lesson={emptyLesson} isNew={true} />
    </div>
  );
}