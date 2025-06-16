'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '@/client/hooks/common';
import { LoadingState } from '@/client/components/common';

const ADMIN_TOPIC_DEFAULTS = {
  name: '',
  description: '',
  isActive: true
};

export default function NewTopicPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  
  // Use our API request hook like courses
  const apiRequest = useApiRequest({
    trackRequestInSession: true,
    sessionKey: 'create_topic_request',
    idempotencyTimeout: 5000, // 5 seconds
    onError: (error) => {
      console.error('Error creating topic draft:', error);
      alert('Error creating topic: ' + error.message);
      router.push('/admin/topics');
    }
  });
  
  // Automatically create draft on page load
  useEffect(() => {
    const createDraft = async () => {
      // Skip if already loading or if we already have data
      if (apiRequest.loading || apiRequest.data) return;
      
      setIsCreating(true);
      
      try {
        const response = await apiRequest.post('/api/admin/topics', ADMIN_TOPIC_DEFAULTS);
        
        if (response?.data?.success) {
          const topicId = response.data.data.id;
          // Invalidate topics queries to refresh data like Course
          queryClient.invalidateQueries({ 
            queryKey: ['topics'],
            exact: false
          });
          // Redirect to edit page with replace to avoid double loading
          router.replace(`/admin/topics/${topicId}/edit`);
        } else {
          throw new Error(response?.data?.error || 'Failed to create topic draft');
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
      message="Setting up your topic..." 
      size="large"
    />
  );
}
