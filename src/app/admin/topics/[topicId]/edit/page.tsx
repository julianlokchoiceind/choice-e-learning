'use client';

import { useParams } from 'next/navigation';
import { GuardedFormPage } from '@/client/components/admin';
import { TopicForm } from '@/client/components/admin/topics';
import { useTopicsQuery } from '@/client/hooks/topics';
import { useState } from 'react';

export default function EditTopicPage() {
  const params = useParams();
  const topicId = params.topicId as string;
  const [currentFormData, setCurrentFormData] = useState<any>(null);
  
  const { useGetTopic, useUpdateTopic } = useTopicsQuery();
  const { data: topic, isLoading, error } = useGetTopic(topicId);
  const updateTopic = useUpdateTopic();
  
  const handleSave = async () => {
    await updateTopic.mutateAsync({
      id: topicId,
      data: currentFormData || topic
    });
  };

  return (
    <GuardedFormPage
      backHref="/admin/topics"
      backText="Back to Topics"
      title="Edit Topic"
      status={topic?.isActive ? 'active' : 'inactive'}
      isLoading={isLoading}
      error={error}
      notFoundTitle="Topic Not Found"
      notFoundMessage="The topic you're looking for doesn't exist or has been deleted."
      data={topic}
      onFormChange={(data, isDirty) => {
        setCurrentFormData(data);
      }}
      onSave={handleSave}
      isSaving={updateTopic.isPending}
    >
      {(handleFormChange: any) => (
        <TopicForm 
          topic={topic} 
          onFormChange={handleFormChange}
        />
      )}
    </GuardedFormPage>
  );
}