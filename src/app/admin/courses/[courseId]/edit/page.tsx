'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditCoursePage() {
  const router = useRouter();

  useEffect(() => {
    // Show a message and redirect to courses page
    alert("The course editing interface is being rebuilt with the new tab-based approach. Please check back soon.");
    router.push('/admin/courses');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Redirecting...</h1>
        <p className="text-gray-500">The course editing interface is being upgraded.</p>
      </div>
    </div>
  );
}