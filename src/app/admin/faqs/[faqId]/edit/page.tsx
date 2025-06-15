'use client';

import { useParams } from 'next/navigation';
import { GuardedFormPage } from '@/client/components/admin';
import { FAQForm } from '@/client/components/admin/faqs';
import { useFAQsQuery } from '@/client/hooks/faq';
import { useState } from 'react';

export default function EditFAQPage() {
  const params = useParams();
  const faqId = params.faqId as string;
  const [currentFormData, setCurrentFormData] = useState<any>(null);
  
  const { useGetFAQ, useGetFAQs, useUpdateFAQ } = useFAQsQuery();
  const { data: faq, isLoading, error } = useGetFAQ(faqId);
  const { data: faqs = [] } = useGetFAQs({});
  const updateFAQ = useUpdateFAQ();
  
  // Extract unique categories from all FAQs
  const categories = Array.isArray(faqs) 
    ? Array.from(
        new Set(faqs.filter(f => f.category).map(f => f.category))
      ).sort()
    : [];

  const handleSave = async () => {
    await updateFAQ.mutateAsync({
      id: faqId,
      data: currentFormData || faq
    });
  };

  return (
    <GuardedFormPage
      backHref="/admin/faqs"
      backText="Back to FAQs"
      title="Edit FAQ"
      status={faq?.isActive ? 'active' : 'inactive'}
      isLoading={isLoading}
      error={error}
      notFoundTitle="FAQ Not Found"
      notFoundMessage="The FAQ you're looking for doesn't exist or has been deleted."
      data={faq}
      onFormChange={(data, isDirty) => {
        setCurrentFormData(data);
      }}
      onSave={handleSave}
      isSaving={updateFAQ.isPending}
    >
      {(handleFormChange: any) => (
        <FAQForm 
          faq={faq} 
          categories={categories}
          onFormChange={handleFormChange}
        />
      )}
    </GuardedFormPage>
  );
}