'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTopicsQuery } from '@/client/hooks/topics';
import { ArrowLeftIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { LoadingState } from '@/client/components/common';

export default function EditTopicPage({ params }: { params: { topicId: string } }) {
  const router = useRouter();
  const { useGetTopic, useUpdateTopic } = useTopicsQuery();
  
  // Fetch topic using React Query
  const {
    data: topic,
    isLoading,
    error: fetchError
  } = useGetTopic(params.topicId);
  
  // Setup update mutation
  const updateTopic = useUpdateTopic();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true as boolean
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    description?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  
  // Update form data when topic is loaded
  useEffect(() => {
    if (topic) {
      setFormData({
        name: topic.name || '',
        description: topic.description || '',
        isActive: topic.isActive ?? true
      });
    }
  }, [topic]);
  
  // Set server error if fetch fails
  useEffect(() => {
    if (fetchError) {
      setServerError(fetchError instanceof Error ? fetchError.message : 'Failed to load topic');
    }
  }, [fetchError]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }));
    
    // Clear error for this field when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    // Clear server error on any change
    if (serverError) {
      setServerError(null);
    }
  };
  
  const validateForm = () => {
    const errors: {
      name?: string;
      description?: string;
    } = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Topic name is required';
    } else if (formData.name.length > 100) {
      errors.name = 'Topic name must be less than 100 characters';
    }
    
    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await updateTopic.mutateAsync({
        id: params.topicId,
        data: {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          isActive: formData.isActive
        }
      });
      
      router.push('/admin/topics');
    } catch (err) {
      console.error('Error updating topic:', err);
      setServerError(err instanceof Error ? err.message : 'Failed to update topic');
    }
  };
  
  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <LoadingState variant="section" message="Loading topic..." />
      </div>
    );
  }
  
  if (!topic && !isLoading) {
    return (
      <div className='text-center py-10'>
        <h1 className='text-2xl font-bold text-red-600 mb-4'>Topic Not Found</h1>
        <p className='text-gray-600 mb-6'>The requested topic could not be found.</p>
        <Link 
          href='/admin/topics' 
          className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700'
        >
          Back to Topics
        </Link>
      </div>
    );
  }
  
  const courseCount = topic?._count?.courses || 0;
  
  return (
    <div className='space-y-6'>
      <div className='flex items-center mb-4'>
        <Link 
          href='/admin/topics' 
          className='mr-4 text-gray-600 hover:text-gray-900'
        >
          <ArrowLeftIcon className='h-5 w-5' />
        </Link>
        <h1 className='text-2xl font-bold'>Edit Topic</h1>
      </div>
      
      <div className='bg-white rounded-lg shadow-md border border-gray-100 p-6'>
        {/* Server error message */}
        {serverError && (
          <div className='mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
            {serverError}
          </div>
        )}
        
        {/* Course usage warning */}
        {courseCount > 0 && (
          <div className='mb-6 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded flex items-start'>
            <ExclamationCircleIcon className='h-5 w-5 mr-2 mt-0.5 flex-shrink-0' />
            <p>
              This topic is currently used by <strong>{courseCount} course{courseCount !== 1 ? 's' : ''}</strong>. 
              Changes to the topic name or status will affect these courses.
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-1'>
              Topic Name <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              id='name'
              name='name'
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                formErrors.name ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              disabled={updateTopic.isPending}
            />
            {formErrors.name && (
              <p className='mt-1 text-sm text-red-600'>{formErrors.name}</p>
            )}
          </div>
          
          <div>
            <label htmlFor='description' className='block text-sm font-medium text-gray-700 mb-1'>
              Description
            </label>
            <textarea
              id='description'
              name='description'
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-3 py-2 border ${
                formErrors.description ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              disabled={updateTopic.isPending}
            ></textarea>
            {formErrors.description && (
              <p className='mt-1 text-sm text-red-600'>{formErrors.description}</p>
            )}
          </div>
          
          <div className='flex items-center'>
            <input
              type='checkbox'
              id='isActive'
              name='isActive'
              checked={formData.isActive}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, isActive: e.target.checked }))
              }
              className='h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500'
              disabled={updateTopic.isPending}
            />
            <label htmlFor='isActive' className='ml-2 block text-sm text-gray-700'>
              Active
            </label>
          </div>
          
          <div className='flex justify-end space-x-4 pt-4'>
            <Link 
              href='/admin/topics'
              className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
            >
              Cancel
            </Link>
            <button
              type='submit'
              disabled={updateTopic.isPending}
              className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {updateTopic.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
