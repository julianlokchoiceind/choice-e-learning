'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFAQsQuery } from '@/client/hooks/faq';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  TrashIcon, 
  PencilSquareIcon, 
  QuestionMarkCircleIcon 
} from '@heroicons/react/24/outline';
import { LoadingState } from '@/client/components/common';
import { FAQItem, FAQFilter } from '@/shared/types/faq';

export default function FAQsAdminPage() {
  const {
    useGetFAQs,
    useDeleteFAQ,
  } = useFAQsQuery();

  // State for filters and pagination
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Create filter parameters
  const filter: FAQFilter = {
    search: search || undefined,
    category: selectedCategory || undefined,
    page: currentPage,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  };

  // Fetch FAQs with React Query
  const {
    data,
    isLoading,
    refetch
  } = useGetFAQs(filter);

  // Setup delete mutation
  const deleteFAQ = useDeleteFAQ();

  // Extract data safely
  const faqs = data?.data || [];
  const pagination = data?.meta || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  };

  // Get unique categories from FAQs
  const categories = Array.from(
    new Set(faqs.map((faq) => faq.category))
  );

  // Add CSS for buttons with no transform on hover - matching sidebar behavior
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
      
      /* Styling for Add FAQ button */
      .add-faq-btn {
        background-image: linear-gradient(to right, #3b82f6, #1d4ed8) !important;
        color: white !important;
        transition: none !important;
      }
      
      .add-faq-btn:hover {
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

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    refetch();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    refetch();
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      await deleteFAQ.mutateAsync(id);
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting FAQ:', err);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div className='flex items-center mb-6'>
          <QuestionMarkCircleIcon className='h-7 w-7 text-indigo-600 mr-3' />
          <h1 className='text-2xl font-bold text-gray-800'>FAQs Management</h1>
        </div>
        <Link 
          href='/admin/faqs/new' 
          className='px-4 py-2 rounded-md flex items-center admin-button add-faq-btn'
        >
          <PlusIcon className='h-5 w-5 mr-1' />
          Add New FAQ
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
              placeholder='Search FAQs...' 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='py-2 pl-10 pr-4 block w-full sm:w-80 border border-gray-300 rounded-md focus:ring-0 focus:border-[var(--color-primary)] outline-none'
            />
          </div>
          <div className='flex items-center space-x-2'>
            <select 
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className='py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none sm:text-sm'
            >
              <option value=''>All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* FAQ list */}
        <div className='bg-white shadow-md rounded-lg overflow-hidden'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base'>Question</th>
                <th className='py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base'>Category</th>
                <th className='py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base'>Created</th>
                <th className='py-4 px-6 text-right font-medium text-indigo-700 capitalize tracking-wider text-base'>Actions</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className='text-center py-10'>
                    <LoadingState 
                      variant="table" 
                      message="Loading FAQs..." 
                      columns={4}
                      rows={6}
                      columnWidths={['40%', '20%', '20%', '20%']}
                    />
                  </td>
                </tr>
              ) : faqs.length === 0 ? (
                <tr>
                  <td colSpan={4} className='text-center py-10 text-gray-500'>
                    <p>No FAQs found</p>
                    <p className='text-sm mt-1'>Try with a different search term or add a new FAQ.</p>
                  </td>
                </tr>
              ) : (
                faqs.map((faq) => (
                  <tr key={faq.id} className='hover:bg-gray-50 transition-colors duration-150'>
                    <td className='py-4 px-6 text-gray-800'>
                      <div className='font-medium truncate max-w-sm'>
                        {faq.question}
                      </div>
                    </td>
                    <td className='py-4 px-6 text-gray-600'>
                      <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs'>
                        {faq.category}
                      </span>
                    </td>
                    <td className='py-4 px-6 text-gray-600'>
                      {new Date(faq.createdAt).toLocaleDateString()}
                    </td>
                    <td className='py-4 px-6 text-right'>
                      <div className='flex justify-end space-x-2'>
                        <Link
                          href={`/admin/faqs/${faq.id}/edit`}
                          className='text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 rounded-md p-1.5 transition-colors duration-150 admin-button'
                          title='Edit'
                        >
                          <PencilSquareIcon className='h-5 w-5' />
                        </Link>
                        
                        {confirmDelete === faq.id ? (
                          <div className='flex items-center space-x-2'>
                            <button
                              onClick={() => handleDeleteConfirm(faq.id)}
                              className='text-red-600 hover:text-red-800 font-medium bg-red-50 px-2 py-1 rounded admin-button'
                              disabled={deleteFAQ.isPending}
                            >
                              {deleteFAQ.isPending ? 'Deleting...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className='text-gray-600 hover:text-gray-800 bg-gray-50 px-2 py-1 rounded admin-button'
                              disabled={deleteFAQ.isPending}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(faq.id)}
                            className='text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-md p-1.5 transition-colors duration-150 admin-button'
                            title='Delete'
                          >
                            <TrashIcon className='h-5 w-5' />
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
          <div className='px-6 py-4 flex justify-center'>
            <div className='flex space-x-2'>
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } admin-button`}
              >
                Previous
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md admin-button ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              
              <button
                onClick={() =>
                  handlePageChange(Math.min(pagination.totalPages, currentPage + 1))
                }
                disabled={currentPage === pagination.totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === pagination.totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } admin-button`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}