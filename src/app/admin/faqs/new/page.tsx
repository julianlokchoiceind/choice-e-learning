'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '@/client/hooks/common';
import { LoadingState } from '@/client/components/common';

const ADMIN_FAQ_DEFAULTS = {
  question: '',
  answer: '',
  category: ''
};

export default function NewFAQPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  
  // Use our API request hook like courses
  const apiRequest = useApiRequest({
    trackRequestInSession: true,
    sessionKey: 'create_faq_request',
    idempotencyTimeout: 5000, // 5 seconds
    onError: (error) => {
      console.error('Error creating FAQ draft:', error);
      alert('Error creating FAQ: ' + error.message);
      router.push('/admin/faqs');
    }
  });
  
  // Automatically create draft on page load
  useEffect(() => {
    const createDraft = async () => {
      // Skip if already loading or if we already have data
      if (apiRequest.loading || apiRequest.data) return;
      
      setIsCreating(true);
      
      try {
        const response = await apiRequest.post('/api/admin/faqs', ADMIN_FAQ_DEFAULTS);
        
        if (response?.data?.success) {
          const faqId = response.data.data.id;
          // Invalidate FAQs queries to refresh data like Course
          queryClient.invalidateQueries({ 
            queryKey: ['faqs'],
            exact: false
          });
          // Redirect to edit page with replace to avoid double loading
          router.replace(`/admin/faqs/${faqId}/edit`);
        } else {
          throw new Error(response?.data?.error || 'Failed to create FAQ draft');
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
      message="Setting up your FAQ..." 
      size="large"
    />
  );
}