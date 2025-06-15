'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFAQsQuery } from '@/client/hooks/faq';
import { LoadingState } from '@/client/components/common';

export default function NewFAQPage() {
  const router = useRouter();
  const { useCreateFAQ } = useFAQsQuery();
  const createFAQ = useCreateFAQ();
  
  useEffect(() => {
    // Create a new FAQ immediately and redirect to edit page
    const createNewFAQ = async () => {
      try {
        const response = await createFAQ.mutateAsync({
          question: '', // Let backend generate the question
          answer: '', // Backend will set default
          category: '' // Backend will set default
        });
        
        // The mutation returns the FAQ data directly from the hook
        const faqId = response?.id;
        if (!faqId) {
          throw new Error('No FAQ ID returned');
        }
        
        // Redirect to the edit page
        router.push(`/admin/faqs/${faqId}/edit`);
      } catch (error) {
        console.error('Failed to create FAQ:', error);
        // If creation fails, redirect back to FAQs list
        router.push('/admin/faqs');
      }
    };
    
    createNewFAQ();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  return (
    <LoadingState 
      variant="page" 
      message="Creating new FAQ..." 
      size="large"
    />
  );
}