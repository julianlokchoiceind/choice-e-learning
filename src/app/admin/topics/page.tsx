'use client';

import { useState, useEffect } from 'react';
import { useTopics } from '@/client/hooks/topics';
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

export default function TopicsPage() {
  const { 
    topics, 
    loading, 
    error, 
    pagination, 
    fetchTopics, 
    deleteTopic 
  } = useTopics(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [showActive, setShowActive] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

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

  useEffect(() => {
    // Fetch topics on initial load with error handling
    try {
      console.log('[TopicsPage] Fetching topics with params:', {
        page: currentPage,
        isActive: showActive
      });
      
      fetchTopics({
        page: currentPage,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc',
        isActive: showActive
      }).catch(err => {
        console.error('[TopicsPage] Error fetching topics in effect:', err);
        // Error is already handled in the hook, so we don't need to do anything here
      });
    } catch (error: unknown) {
      console.error('[TopicsPage] Exception in topics fetch effect:', error);
      // Continue rendering with empty data
    }
  }, [fetchTopics, currentPage, showActive]);

  const handleSearch = () => {
    try {
      console.log('[TopicsPage] Searching topics with query:', searchQuery);
      
      fetchTopics({
        search: searchQuery,
        isActive: showActive,
        page: 1,
        limit: 10,
      }).catch(err => {
        console.error('[TopicsPage] Error during search:', err);
        // Error is already handled in the hook
      });
      
      setCurrentPage(1);
    } catch (error: unknown) {
      console.error('[TopicsPage] Exception in search handler:', error);
      // Continue with UI
    }
  };

  const handleStatusChange = (status: string) => {
    try {
      let isActiveFilter: boolean | undefined;
      
      if (status === 'all') {
        isActiveFilter = undefined;
      } else if (status === 'active') {
        isActiveFilter = true;
      } else if (status === 'inactive') {
        isActiveFilter = false;
      }
      
      console.log(`[TopicsPage] Changing status filter to: ${status} (${isActiveFilter})`);
      
      setShowActive(isActiveFilter);
      setCurrentPage(1);
      
      // Immediately fetch topics with the new filter
      fetchTopics({
        search: searchQuery,
        isActive: isActiveFilter,
        page: 1,
        limit: 10,
      }).catch(err => {
        console.error('[TopicsPage] Error during status change:', err);
        // Error is already handled in the hook
      });
    } catch (error: unknown) {
      console.error('[TopicsPage] Exception in status change handler:', error);
      // Continue with UI
    }
  };

  const handlePageChange = (page: number) => {
    try {
      console.log(`[TopicsPage] Changing to page ${page}`);
      
      setCurrentPage(page);
      fetchTopics({
        search: searchQuery,
        isActive: showActive,
        page,
        limit: 10,
      }).catch(err => {
        console.error(`[TopicsPage] Error when fetching page ${page}:`, err);
        // Error is already handled in the hook
      });
    } catch (error: unknown) {
      console.error(`[TopicsPage] Exception in page change handler:`, error);
      // Continue with UI
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      console.log(`[TopicsPage] Attempting to delete topic: ${id}`);
      
      try {
        await deleteTopic(id);
        console.log(`[TopicsPage] Topic deleted successfully: ${id}`);
        
        // Refresh the list after deletion
        fetchTopics({
          search: searchQuery,
          isActive: showActive,
          page: currentPage,
          limit: 10,
        }).catch(err => {
          console.error('[TopicsPage] Error refreshing after delete:', err);
          // Error is already handled in the hook
        });
      } catch (deleteError: unknown) {
        console.error(`[TopicsPage] Error when trying to delete topic ${id}:`, deleteError);
        // Continue with UI
      }
      
      setConfirmDelete(null);
    } catch (err: unknown) {
      console.error('[TopicsPage] Exception in delete handler:', err);
      setConfirmDelete(null); // Reset the confirmation state
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
          className='px-4 py-2 rounded-md flex items-center admin-button add-topic-btn'
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
              onKeyDown={(e: any) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
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
            <button
              onClick={handleSearch}
              className='py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md admin-button'
            >
              Search
            </button>
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
                <th className='py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base'>#</th>
                <th className='py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base'>Name</th>
                <th className='py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base'>Description</th>
                <th className='py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base'>Status</th>
                <th className='py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base'>Courses</th>
                <th className='py-4 px-6 text-right font-medium text-indigo-700 capitalize tracking-wider text-base'>Actions</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {loading ? (
                <tr>
                  <td colSpan={6} className='text-center py-10'>
                    <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto'></div>
                    <p className='mt-2 text-gray-500'>Loading topics...</p>
                  </td>
                </tr>
              ) : topics.length === 0 ? (
                <tr>
                  <td colSpan={6} className='text-center py-10 text-gray-500'>
                    <p>No topics found</p>
                    <p className='text-sm mt-1'>Try with a different search term or add a new topic.</p>
                  </td>
                </tr>
              ) : (
                topics.map((topic, index) => (
                  <tr key={topic.id} className='hover:bg-gray-50 transition-colors duration-150'>
                    <td className='py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {index + 1}
                    </td>
                    <td className='py-4 px-6 text-gray-800'>
                      <div className='font-medium truncate max-w-sm'>
                        {topic.name}
                      </div>
                    </td>
                    <td className='py-4 px-6 text-gray-600 max-w-xs truncate'>
                      {topic.description || '-'}
                    </td>
                    <td className='py-4 px-6 whitespace-nowrap'>
                      {topic.isActive ? (
                        <span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs'>
                          Active
                        </span>
                      ) : (
                        <span className='px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs'>
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
        {pagination && (
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
                  key={"page"}
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