'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { StudentForm } from '@/client/components/admin/students';
import { useStudentsQuery } from '@/client/hooks/students';
import { CreateStudentDTO } from '@/shared/types/students/student';

export default function NewStudentPage() {
  const router = useRouter();
  const { useCreateStudent } = useStudentsQuery();
  const createStudent = useCreateStudent();

  const handleSubmit = async (data: CreateStudentDTO) => {
    try {
      await createStudent.mutateAsync(data);
      // Redirect to students list after successful creation
      router.push('/admin/students');
    } catch (error) {
      // Error handling is managed by React Query with toast notifications
      console.error('Failed to create student:', error);
      throw error; // Re-throw to let StudentForm handle the error display
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/admin/students"
          className="back-to-link"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Students
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
      </div>

      <StudentForm 
        onSubmit={handleSubmit}
        isLoading={createStudent.isPending}
      />
    </div>
  );
}