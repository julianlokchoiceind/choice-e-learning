'use client';

import { useParams } from 'next/navigation';
import { GuardedFormPage } from '@/client/components/admin';
import { StudentForm } from '@/client/components/admin/students';
import { useStudentsQuery } from '@/client/hooks/students';
import { useState } from 'react';

export default function EditStudentPage() {
  const params = useParams();
  const studentId = params.studentId as string;
  const [currentFormData, setCurrentFormData] = useState<any>(null);
  
  const { useGetStudentById, useUpdateStudent } = useStudentsQuery();
  const { data: student, isLoading, error } = useGetStudentById(studentId);
  const updateStudent = useUpdateStudent();
  
  const handleSave = async () => {
    await updateStudent.mutateAsync({
      id: studentId,
      data: currentFormData || student
    });
  };

  return (
    <GuardedFormPage
      backHref="/admin/students"
      backText="Back to Students"
      title="Edit Student"
      status={student?.isActive ? 'active' : 'inactive'}
      isLoading={isLoading}
      error={error}
      notFoundTitle="Student Not Found"
      notFoundMessage="The student you're looking for doesn't exist or has been deleted."
      data={student}
      onFormChange={(data, isDirty) => {
        setCurrentFormData(data);
      }}
      onSave={handleSave}
      isSaving={updateStudent.isPending}
    >
      {(handleFormChange: any) => (
        <StudentForm 
          student={student} 
          studentId={studentId}
          onFormChange={handleFormChange}
        />
      )}
    </GuardedFormPage>
  );
}