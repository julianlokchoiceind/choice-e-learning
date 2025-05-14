'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCoursePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  
  // Automatically create draft on page load
  useEffect(() => {
    const createDraft = async () => {
      // Don't do anything if we're already creating
      if (isCreating) return;
      
      setIsCreating(true);
      
      try {
        // Default course data for draft
        const courseData = {
          title: 'Untitled Course',
          description: 'Course description...',
          price: 0,
          level: 'beginner',
          topics: [],
          imageUrl: '/images/placeholder-course.jpg',
          status: 'draft',
          chapters: [],
          lessons: [{
            title: 'Introduction',
            order: 1,
            videoUrl: '',
            description: '',
            resources: []
          }]
        };
        
        // Send data to API
        const apiClient = (await import('@/client/utils/http/api-client')).default;
        const response = await apiClient.post('/api/admin/courses', courseData);
        
        if (response.data.success) {
          const courseId = response.data.data.id;
          // Redirect to edit page
          router.push(`/admin/courses/${courseId}/edit`);
        } else {
          throw new Error(response.data.error || 'Failed to create course draft');
        }
      } catch (error: any) {
        console.error('Error creating course draft:', error);
        alert('Error creating course: ' + (error.message || 'Unknown error'));
        router.push('/admin/courses');
      }
    };
    
    createDraft();
  }, [router, isCreating]);
  
  // Simple loading UI
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">Creating New Course...</h1>
        <p className="text-gray-600">Please wait while we set up your course draft.</p>
        <div className="mt-6">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
}