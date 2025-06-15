'use client';

import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { StudentForm } from '@/client/components/admin/students';

export default function NewStudentPage() {
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

      <StudentForm />
    </div>
  );
}