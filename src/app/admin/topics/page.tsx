'use client';

import { useState, useEffect } from 'react';
import { useTopicsQuery } from '@/client/hooks/topics';
import Link from 'next/link';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import { LoadingState } from '@/client/components/common';
import { TopicFilter, Topic, TopicPagination } from '@/shared/types/topics/topics';

// Define API response structure
interface TopicsResponse {
  data: Topic[];
  meta: {
    page: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export default function TopicsPage() {
  // Get hooks from useTopicsQuery
  const { 
    useGetTopics,
    useDeleteTopic
  } = useTopicsQuery();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showActive, setShowActive] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  // Create filter object
  const topicFilter: TopicFilter = {
    page: currentPage,
    limit: 10,
    sortBy: 'name',
    sortOrder: 'asc',
    isActive: showActive,
    search: searchQuery || undefined
  };
  
  // Use React Query for fetching topics with type assertion for the response
  const { 
    data,
    isLoading,
    error: queryError,
    refetch
  } = useGetTopics(topicFilter);
  
  // Use React Query for delete mutation
  const deleteTopicMutation = useDeleteTopic();
  
  // Extract topics and pagination from response
  // Since our API might return different formats, we need to handle both possibilities
  const topics: Topic[] = Array.isArray(data) ? data : (data as any)?.data || [];
  const pagination = {
    page: currentPage,
    totalPages: Array.isArray(data) ? 1 : ((data as any)?.meta?.totalPages || 1),
    totalItems: Array.isArray(data) ? data.length : ((data as any)?.meta?.totalItems || 0),
    hasNextPage: Array.isArray(data) ? false : ((data as any)?.meta?.hasNextPage || false),
    hasPreviousPage: Array.isArray(data) ? false : ((data as any)?.meta?.hasPreviousPage || false)
  };
  
  // Format error message
  const error = queryError ? 
    (queryError instanceof Error ? queryError.message : 'Failed to fetch topics') : 
    null;

  // Add CSS for buttons with no transform on hover - matching FAQ page behavior
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .admin-button {
        transform: none !important;
      }
      .admin-button:hover {
        transform: none !important;
        box-shadow: none !important;
      }
      
      /* Styling for Add Topic button */
      .add-topic-btn {
        background-image: linear-gradient(to right, #3b82f6, #1d4ed8) !important;
        color: white !important;
        transition: none !important;
      }
      
      .add-topic-btn:hover {
        background-image: linear-gradient(to right, #3b82f6, #1d4ed8) !important;
        box-shadow: 0 0 0 2000px rgba(59, 130, 246, 0.2) inset !important;
        color: white !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleStatusChange = (status: string) => {
    let activeStatus: boolean | undefined;
    
    if (status === 'active') {
      activeStatus = true;
    } else if (status === 'inactive') {
      activeStatus = false;
    } else {
      activeStatus = undefined;
    }
    
    setShowActive(activeStatus);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      await deleteTopicMutation.mutateAsync(id);
      setConfirmDelete(null);
    } catch (error: unknown) {
      console.error('[TopicsPage] Error confirming delete:', error);
      // Error is handled by the mutation
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div className='flex items-center mb-6'>
          <FolderIcon className='h-7 w-7 text-indigo-600 mr-3' />
          <h1 className='text-2xl font-bold text-gray-800'>Topics Management</h1>
        </div>
        <Link
          href='/admin/topics/new'
          className='btn-admin-primary'
        >
          <PlusIcon className='h-5 w-5 mr-1' />
          Add New Topic
        </Link>
      </div>

      {/* Filter and search controls */}
      <div className='bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden'>
        <div className='p-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4'>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <MagnifyingGlassIcon className='h-5 w-5 text-gray-400' />
            </div>
            <input 
              type='text' 
              placeholder='Search topics...' 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='py-2 pl-10 pr-4 block w-full sm:w-80 border border-gray-300 rounded-md focus:ring-0 focus:border-[var(--color-primary)] outline-none'
            />
          </div>
          <div className='flex items-center space-x-2'>
            <select 
              value={showActive === undefined ? 'all' : showActive ? 'active' : 'inactive'}
              onChange={(e) => handleStatusChange(e.target.value)}
              className='py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none sm:text-sm'
            >
              <option value='all'>All Status</option>
              <option value='active'>Active Only</option>
              <option value='inactive'>Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 mx-4 mt-4'>
            {error}
          </div>
        )}

        {/* Topics list */}
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='py-4 px-6 text-left font-medium text-[var(--color-primary-dark)] uppercase tracking-wider text-sm'>#</th>
                <th className='py-4 px-6 text-left font-medium text-[var(--color-primary-dark)] uppercase tracking-wider text-sm'>Name</th>
                <th className='py-4 px-6 text-left font-medium text-[var(--color-primary-dark)] uppercase tracking-wider text-sm'>Description</th>
                <th className='py-4 px-6 text-left font-medium text-[var(--color-primary-dark)] uppercase tracking-wider text-sm'>Status</th>
                <th className='py-4 px-6 text-left font-medium text-[var(--color-primary-dark)] uppercase tracking-wider text-sm'>Courses</th>
                <th className='py-4 px-6 text-right font-medium text-[var(--color-primary-dark)] uppercase tracking-wider text-sm'>Actions</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {isLoading || deleteTopicMutation.isPending ? (
                <tr>
                  <td colSpan={6} className='text-center py-10'>
                    <LoadingState 
                      variant="table" 
                      message={deleteTopicMutation.isPending ? 'Deleting topic...' : 'Loading topics...'} 
                      columns={6}
                      rows={6}
                      columnWidths={['8%', '22%', '25%', '15%', '15%', '15%']}
                    />
                  </td>
                </tr>
              ) : topics.length === 0 ? (
                <tr>
                  <td colSpan={6} className='text-center py-10 text-gray-500'>
                    <p>No topics found.</p>
                    <p className='text-sm mt-1'>Try adjusting your search criteria or add a new topic.</p>
                  </td>
                </tr>
              ) : (
                topics.map((topic, index) => (
                  <tr key={topic.id} className='hover:bg-gray-50 transition-colors duration-150'>
                    <td className='py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {(() => {
                        const page = pagination?.page || 1;
                        const limit = 10;
                        const totalItems = pagination?.totalItems || 0;
                        const sortOrder = topicFilter.sortOrder;
                        
                        if (sortOrder === 'asc') {
                          // For ASC: continuous numbering (1, 2, 3...)
                          return (page - 1) * limit + index + 1;
                        } else {
                          // For DESC: reverse continuous numbering 
                          return totalItems - ((page - 1) * limit + index);
                        }
                      })()}
                    </td>
                    <td className='py-4 px-6 text-gray-800 font-medium'>
                      {topic.name}
                    </td>
                    <td className='py-4 px-6 text-gray-600 max-w-xs truncate'>
                      {topic.description || '-'}
                    </td>
                    <td className='py-4 px-6'>
                      {topic.isActive ? (
                        <span className='px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                          Active
                        </span>
                      ) : (
                        <span className='px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800'>
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className='py-4 px-6 text-gray-600'>
                      {topic?._count?.courses ?? 0}
                    </td>
                    <td className='py-4 px-6 text-right'>
                      <div className='flex justify-end space-x-2'>
                        <Link
                          href={`/admin/topics/${topic.id}/edit`}
                          className='text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 rounded-md p-1.5 transition-colors duration-150 admin-button'
                          title='Edit'
                        >
                          <PencilSquareIcon className='h-5 w-5' />
                        </Link>
                        
                        {confirmDelete === topic.id ? (
                          <div className='flex items-center space-x-2'>
                            <button
                              onClick={() => handleDeleteConfirm(topic.id)}
                              className='text-red-600 hover:text-red-800 font-medium bg-red-50 px-2 py-1 rounded admin-button'
                              disabled={Boolean(topic?._count?.courses && topic._count.courses > 0)}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className='text-gray-600 hover:text-gray-800 bg-gray-50 px-2 py-1 rounded admin-button'
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(topic.id)}
                            className='text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded-md p-1.5 transition-colors duration-150 admin-button'
                            title='Delete'
                            disabled={Boolean(topic?._count?.courses && topic._count.courses > 0)}
                          >
                            <TrashIcon className='h-5 w-5' style={{ 
                              opacity: topic?._count?.courses && topic._count.courses > 0 ? 0.5 : 1 
                            }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!isLoading && pagination && pagination.totalPages > 1 && (
          <div className='flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200'>
            <div className='text-sm text-gray-600'>
              Showing {topics.length} of {pagination.totalItems} topics
            </div>
            <div className='flex space-x-1'>
              <button 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 rounded'} admin-button`}
              >
                <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                </svg>
              </button>
              {/* Page numbers */}
              {Array.from({length: pagination.totalPages}, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md ${
                    currentPage === page 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  } admin-button`}
                >
                  {page}
                </button>
              ))}
              
              <button 
                onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
                disabled={currentPage === pagination.totalPages}
                className={`p-2 ${currentPage === pagination.totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 rounded'} admin-button`}
              >
                <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}