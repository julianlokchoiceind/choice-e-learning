'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ADMIN_COURSE_DEFAULTS } from '@/shared/constants/courses/admin-course-defaults';
import { useApiRequest } from '@/client/hooks/common';
import { LoadingState } from '@/client/components/common';

export default function NewCoursePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  
  // Use our new API request hook
  const apiRequest = useApiRequest({
    trackRequestInSession: true,
    sessionKey: 'create_course_request',
    idempotencyTimeout: 5000, // 5 seconds
    onError: (error) => {
      console.error('Error creating course draft:', error);
      alert('Error creating course: ' + error.message);
      router.push('/admin/courses');
    }
  });
  
  // Automatically create draft on page load
  useEffect(() => {
    const createDraft = async () => {
      // Skip if already loading or if we already have data
      if (apiRequest.loading || apiRequest.data) return;
      
      setIsCreating(true);
      
      try {
        const response = await apiRequest.post('/api/admin/courses', ADMIN_COURSE_DEFAULTS);
        
        if (response?.data?.success) {
          const courseId = response.data.data.id;
          // Redirect to edit page with replace to avoid double loading
          router.replace(`/admin/courses/${courseId}/edit`);
        } else {
          throw new Error(response?.data?.error || 'Failed to create course draft');
        }
      } catch (error: any) {
        // Error is already handled by the hook's onError callback
      }
    };
    
    createDraft();
  }, [router, apiRequest]); 
  
  // Optimized loading UI using standardized LoadingState component
  return (
    <LoadingState 
      variant="page" 
      message="Setting up your course..." 
      size="large"
    />
  );
}