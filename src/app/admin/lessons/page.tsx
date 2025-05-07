import { LessonList } from '@/client/components/admin/lessons/LessonList';

export const metadata = {
  title: 'Manage Lessons | Admin',
  description: 'Manage all lessons on the platform',
};

export default function LessonsPage() {
  return (
    <div className='admin-lessons-page'>
      <h1>Manage Lessons</h1>
      <LessonList />
    </div>
  );
}
