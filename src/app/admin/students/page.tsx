import { Metadata } from 'next';
import StudentList from '@/client/components/admin/students/StudentList';

export const metadata: Metadata = {
  title: 'Students Management - Admin Dashboard',
  description: 'Manage all students in the e-learning platform',
};

export default function StudentsPage() {
  return (
    <div className='space-y-6'>
      <StudentList />
    </div>
  );
}