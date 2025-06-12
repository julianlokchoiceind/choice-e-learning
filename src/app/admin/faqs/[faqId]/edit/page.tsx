'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFAQsQuery } from '@/client/hooks/faq';
import { ArrowLeftIcon, DocumentCheckIcon as SaveIcon } from '@heroicons/react/24/outline';
import { LoadingState } from '@/client/components/common';

interface EditFAQPageProps {
  params: {
    faqId: string;
  };
}

export default function EditFAQPage({ params }: EditFAQPageProps) {
  const router = useRouter();
  const { faqId } = params;
  
  // Sử dụng React Query thay vì hook cũ
  const {
    useGetFAQ,
    useGetFAQs,
    useUpdateFAQ
  } = useFAQsQuery();

  // Lấy dữ liệu FAQ
  const {
    data: faq,
    isLoading: isFAQLoading,
    error: faqError
  } = useGetFAQ(faqId);

  // Lấy danh sách categories từ kết quả của useGetFAQs
  const {
    data: faqsData,
    isLoading: isFAQsLoading,
    error: faqsError
  } = useGetFAQs();
  
  // Extract categories từ danh sách FAQs sử dụng Array.from thay vì spread operator
  const categories = faqsData?.data 
    ? Array.from(new Set(faqsData.data.map(faq => faq.category)))
    : [];

  // Mutation cho việc cập nhật FAQ
  const updateFAQMutation = useUpdateFAQ();

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    newCategory: '', // For custom category input
  });

  const [useNewCategory, setUseNewCategory] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Cập nhật form data khi có dữ liệu FAQ
  useEffect(() => {
    if (faq) {
      setFormData({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        newCategory: '',
      });
    }
  }, [faq]);

  const validate = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.question.trim()) {
      errors.question = 'Question is required';
    }
    
    if (!formData.answer.trim()) {
      errors.answer = 'Answer is required';
    }
    
    if (useNewCategory) {
      if (!formData.newCategory.trim()) {
        errors.newCategory = 'Category name is required';
      }
    } else if (!formData.category) {
      errors.category = 'Please select a category';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setSubmitError(null);
    
    try {
      // Use either existing category or new category
      const categoryToUse = useNewCategory ? formData.newCategory : formData.category;
      
      await updateFAQMutation.mutateAsync({
        id: faqId,
        data: {
          question: formData.question,
          answer: formData.answer,
          category: categoryToUse,
        }
      });
      
      // Redirect to FAQ list page on success
      router.push('/admin/faqs');
    } catch (err: unknown) {
      console.error('Error updating FAQ:', err);
      setSubmitError(
        'Failed to update FAQ. Please check your inputs and try again.'
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Hiển thị trạng thái loading
  const isLoading = isFAQLoading || isFAQsLoading;
  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <LoadingState variant="page" message="Loading FAQ data..." />
      </div>
    );
  }

  // Hiển thị lỗi nếu có
  const error = faqError || faqsError;
  if (error) {
    return (
      <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4'>
        <p className='font-bold'>Error</p>
        <p>{error instanceof Error ? error.message : 'Failed to load FAQ data'}</p>
        <Link href="/admin/faqs" className="text-red-700 underline mt-2 inline-block">
          Back to FAQs
        </Link>
      </div>
    );
  }

  return (
    <div className='p-6 bg-white rounded-lg shadow-md'>
      <div className='flex items-center mb-6'>
        <Link
          href='/admin/faqs'
          className='mr-4 text-gray-600 hover:text-gray-900'
        >
          <ArrowLeftIcon className='w-5 h-5' />
        </Link>
        <h1 className='text-2xl font-bold text-gray-800'>Edit FAQ</h1>
      </div>

      {/* Error message */}
      {submitError && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4'>
          {submitError}
        </div>
      )}

      {/* FAQ form */}
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='space-y-4'>
          {/* Question field */}
          <div>
            <label htmlFor='question' className='block text-sm font-medium text-gray-700 mb-1'>
              Question <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              id='question'
              name='question'
              value={formData.question}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${
                formErrors.question ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='Enter the question'
            />
            {formErrors.question && (
              <p className='mt-1 text-sm text-red-500'>{formErrors.question}</p>
            )}
          </div>

          {/* Answer field */}
          <div>
            <label htmlFor='answer' className='block text-sm font-medium text-gray-700 mb-1'>
              Answer <span className='text-red-500'>*</span>
            </label>
            <textarea
              id='answer'
              name='answer'
              value={formData.answer}
              onChange={handleChange}
              rows={6}
              className={`w-full p-3 border rounded-lg ${
                formErrors.answer ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='Enter the answer'
            />
            {formErrors.answer && (
              <p className='mt-1 text-sm text-red-500'>{formErrors.answer}</p>
            )}
          </div>

          {/* Category selection */}
          <div>
            <div className='flex items-center justify-between mb-1'>
              <label htmlFor='category' className='block text-sm font-medium text-gray-700'>
                Category <span className='text-red-500'>*</span>
              </label>
              <button
                type='button'
                onClick={() => setUseNewCategory(!useNewCategory)}
                className='text-sm text-[var(--color-primary-text)] hover:text-[var(--color-primary-dark)]'
              >
                {useNewCategory ? 'Select Existing Category' : 'Add New Category'}
              </button>
            </div>

            {useNewCategory ? (
              <div>
                <input
                  type='text'
                  id='newCategory'
                  name='newCategory'
                  value={formData.newCategory}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg ${
                    formErrors.newCategory ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='Enter new category name'
                />
                {formErrors.newCategory && (
                  <p className='mt-1 text-sm text-red-500'>{formErrors.newCategory}</p>
                )}
              </div>
            ) : (
              <div>
                <select
                  id='category'
                  name='category'
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg ${
                    formErrors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value=''>Select a category</option>
                  {categories.map((category: string) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {formErrors.category && (
                  <p className='mt-1 text-sm text-red-500'>{formErrors.category}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Form actions */}
        <div className='flex justify-end space-x-3'>
          <Link
            href='/admin/faqs'
            className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
          >
            Cancel
          </Link>
          <button
            type='submit'
            className='px-4 py-2 bg-[var(--color-primary-text)] text-white rounded-md hover:bg-[var(--color-primary-dark)] flex items-center'
            disabled={updateFAQMutation.isPending}
          >
            {updateFAQMutation.isPending ? (
              <>
                <span className='inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></span>
                Saving...
              </>
            ) : (
              <>
                <SaveIcon className='h-5 w-5 mr-2' />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}