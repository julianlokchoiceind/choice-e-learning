'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTopicsQuery } from '@/client/hooks/topics';
import { 
  ArrowLeftIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  ExclamationCircleIcon,
  DocumentTextIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';
import { LoadingState } from '@/client/components/common';

export default function TopicDetailPage({ params }: { params: { topicId: string } }) {
  const router = useRouter();
  const { useGetTopic, useDeleteTopic } = useTopicsQuery();
  
  // Fetch topic using React Query
  const {
    data: topic,
    isLoading,
    error
  } = useGetTopic(params.topicId);
  
  // Setup delete mutation
  const deleteTopic = useDeleteTopic();
  
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const handleDeleteClick = () => {
    setConfirmDelete(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      await deleteTopic.mutateAsync(params.topicId);
      router.push('/admin/topics');
    } catch (err) {
      console.error('Error deleting topic:', err);
      setConfirmDelete(false);
    }
  };
  
  const handleDeleteCancel = () => {
    setConfirmDelete(false);
  };
  
  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <LoadingState variant="section" message="Loading topic..." />
      </div>
    );
  }
  
  if (!topic) {
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
  
  const courseCount = topic._count?.courses || 0;
  const hasAssociatedCourses = courseCount > 0;
  
  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div className='flex items-center'>
          <Link 
            href='/admin/topics' 
            className='mr-4 text-gray-600 hover:text-gray-900 no-transform'
          >
            <ArrowLeftIcon className='h-5 w-5' />
          </Link>
          <h1 className='text-2xl font-bold'>Topic Details</h1>
        </div>
        
        <div className='flex space-x-3'>
          <Link
            href={`/admin/topics/${params.topicId}/edit`}
            className='inline-flex items-center px-4 py-2 border border-gray-300 bg-white rounded-md text-gray-700 shadow-sm hover:bg-gray-50'
          >
            <PencilSquareIcon className='h-4 w-4 mr-2' />
            Edit
          </Link>
          
          {!hasAssociatedCourses && !confirmDelete && (
            <button
              onClick={handleDeleteClick}
              className='inline-flex items-center px-4 py-2 border border-red-300 bg-white rounded-md text-red-700 shadow-sm hover:bg-red-50'
              disabled={hasAssociatedCourses}
            >
              <TrashIcon className='h-4 w-4 mr-2' />
              Delete
            </button>
          )}
          
          {confirmDelete && (
            <div className='flex items-center space-x-2'>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteTopic.isPending}
                className='inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700'
              >
                {deleteTopic.isPending ? (
                  <span className='flex items-center'>
                    <svg className='animate-spin h-4 w-4 mr-2' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  <>
                    <CheckCircleIcon className='h-4 w-4 mr-1' />
                    Confirm
                  </>
                )}
              </button>
              <button
                onClick={handleDeleteCancel}
                disabled={deleteTopic.isPending}
                className='inline-flex items-center px-3 py-2 border border-gray-300 bg-white rounded-md text-gray-700 shadow-sm hover:bg-gray-50'
              >
                <XCircleIcon className='h-4 w-4 mr-1' />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md'>
          {error instanceof Error ? error.message : 'Failed to load topic'}
        </div>
      )}
      
      {/* Topic details */}
      <div className='bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden'>
        <div className='border-b border-gray-200 px-6 py-5 bg-gray-50'>
          <h2 className='text-xl font-semibold text-gray-800'>Topic Information</h2>
        </div>
        
        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h3 className='text-sm font-medium text-gray-500 mb-1'>Name</h3>
              <p className='text-lg font-medium text-gray-900'>{topic.name}</p>
            </div>
            
            <div>
              <h3 className='text-sm font-medium text-gray-500 mb-1'>Status</h3>
              <div>
                {topic.isActive ? (
                  <span className='px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full'>
                    Active
                  </span>
                ) : (
                  <span className='px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full'>
                    Inactive
                  </span>
                )}
              </div>
            </div>
            
            <div className='md:col-span-2'>
              <h3 className='text-sm font-medium text-gray-500 mb-1'>Description</h3>
              <p className='text-gray-700'>
                {topic.description || 'No description provided.'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Courses related to this topic */}
      <div className='bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden'>
        <div className='border-b border-gray-200 px-6 py-5 bg-gray-50 flex justify-between items-center'>
          <div className='flex items-center'>
            <DocumentTextIcon className='h-5 w-5 text-gray-500 mr-2' />
            <h2 className='text-xl font-semibold text-gray-800'>Related Courses</h2>
          </div>
          <span className='bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full'>
            {courseCount} {courseCount === 1 ? 'Course' : 'Courses'}
          </span>
        </div>
        
        <div className='p-6'>
          {hasAssociatedCourses ? (
            <div className='text-gray-700'>
              <p>This topic is currently used in {courseCount} {courseCount === 1 ? 'course' : 'courses'}.</p>
              <p className='mt-2'>To view these courses, go to <Link href='/admin/courses' className='text-indigo-600 hover:text-indigo-800 underline'>Course Management</Link> and filter by this topic.</p>
            </div>
          ) : (
            <div className='text-center py-6 text-gray-500'>
              <TagIcon className='h-12 w-12 mx-auto text-gray-400' />
              <p className='mt-2'>No courses are currently using this topic.</p>
              <Link
                href='/admin/courses/new'
                className='mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200'
              >
                <PlusCircleIcon className='h-5 w-5 mr-2' />
                Create a New Course
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Meta data */}
      <div className='bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden'>
        <div className='border-b border-gray-200 px-6 py-5 bg-gray-50'>
          <h2 className='text-xl font-semibold text-gray-800'>Meta Information</h2>
        </div>
        
        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h3 className='text-sm font-medium text-gray-500 mb-1'>Created</h3>
              <p className='text-gray-700'>
                {topic.createdAt ? new Date(topic.createdAt).toLocaleString() : 'N/A'}
              </p>
            </div>
            
            <div>
              <h3 className='text-sm font-medium text-gray-500 mb-1'>Last Updated</h3>
              <p className='text-gray-700'>
                {topic.updatedAt ? new Date(topic.updatedAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
