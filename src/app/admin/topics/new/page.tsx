'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTopicsQuery } from '@/client/hooks/topics';
import { LoadingState } from '@/client/components/common';

export default function NewTopicPage() {
  const router = useRouter();
  const { useCreateTopic } = useTopicsQuery();
  const createTopic = useCreateTopic();
  
  useEffect(() => {
    // Create a new topic immediately and redirect to edit page
    const createNewTopic = async () => {
      try {
        const response = await createTopic.mutateAsync({
          name: '', // Let backend generate the name
          description: '',
          isActive: true
        });
        
        // The mutation returns the topic data directly from the hook
        const topicId = response?.id;
        if (!topicId) {
          throw new Error('No topic ID returned');
        }
        
        // Redirect to the edit page
        router.push(`/admin/topics/${topicId}/edit`);
      } catch (error) {
        console.error('Failed to create topic:', error);
        // If creation fails, redirect back to topics list
        router.push('/admin/topics');
      }
    };
    
    createNewTopic();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  return (
    <LoadingState 
      variant="page" 
      message="Creating new topic..." 
      size="large"
    />
  );
}
