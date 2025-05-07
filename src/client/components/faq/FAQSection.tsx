'use client';

import { useState, useEffect } from 'react';
import { useFAQs } from '@/client/hooks/faq/useFAQs';
import { FAQ } from '@prisma/client';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  MagnifyingGlassIcon as SearchIcon 
} from '@heroicons/react/24/outline';

export default function FAQSection() {
  const {
    loading,
    error,
    faqs,
    categories,
    pagination,
    fetchFAQs,
    fetchCategories,
  } = useFAQs(false); // false = public view

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedFAQs, setExpandedFAQs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Fetch FAQs on initial load
    fetchFAQs({
      page: currentPage,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    
    // Fetch categories
    fetchCategories();
  }, [fetchFAQs, fetchCategories, currentPage]);

  const handleSearch = () => {
    fetchFAQs({
      search,
      category: selectedCategory || undefined,
      page: 1,
      limit: 10,
    });
    setCurrentPage(1);
    // Reset expanded state
    setExpandedFAQs({});
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchFAQs({
      search,
      category: category || undefined,
      page: 1,
      limit: 10,
    });
    setCurrentPage(1);
    // Reset expanded state
    setExpandedFAQs({});
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchFAQs({
      search,
      category: selectedCategory || undefined,
      page,
      limit: 10,
    });
    // Reset expanded state
    setExpandedFAQs({});
  };

  const toggleFAQ = (id: string) => {
    setExpandedFAQs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const groupFAQsByCategory = (faqs: FAQ[]) => {
    const grouped: Record<string, FAQ[]> = {};
    
    faqs.forEach((faq) => {
      if (!grouped[faq.category]) {
        grouped[faq.category] = [];
      }
      grouped[faq.category].push(faq);
    });
    
    return grouped;
  };

  return (
    <div className='w-full max-w-5xl mx-auto px-4 py-8'>
      {/* Search and filter */}
      <div className='bg-white shadow-md rounded-lg p-6 mb-8'>
        <div className='flex flex-col md:flex-row gap-4'>
          <div className='flex-1'>
            <div className='relative'>
              <input
                type='text'
                placeholder='Search FAQs...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='w-full p-3 pl-10 border border-gray-300 rounded-lg'
              />
              <SearchIcon className='absolute left-3 top-3.5 text-gray-400 w-5 h-5' />
            </div>
          </div>
          
          <div className='w-full md:w-1/3'>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className='w-full p-3 border border-gray-300 rounded-lg'
            >
              <option value=''>All Categories</option>
              {categories.map((category) => (
                <option key={"category"} value={"category"}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={"handleSearch"}
            className='px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
          >
            Search
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className='text-center py-12'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading FAQs...</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8'>
          {error}
        </div>
      )}

      {/* FAQs list */}
      {!loading && faqs.length === 0 ? (
        <div className='text-center py-12 bg-gray-50 rounded-lg'>
          <p className='text-gray-500 text-lg'>
            No FAQs found matching your search criteria.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('');
              fetchFAQs({ page: 1, limit: 10 });
              setCurrentPage(1);
            }}
            className='mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* If category filter is applied, show in standard list format */}
          {selectedCategory ? (
            <div className='space-y-4'>
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className='bg-white shadow-md rounded-lg overflow-hidden'
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className='w-full p-5 text-left flex justify-between items-center hover:bg-gray-50'
                  >
                    <h3 className='text-lg font-medium text-gray-800'>
                      {faq.question}
                    </h3>
                    {expandedFAQs[faq.id] ? (
                      <ChevronUpIcon className='h-5 w-5 text-gray-500' />
                    ) : (
                      <ChevronDownIcon className='h-5 w-5 text-gray-500' />
                    )}
                  </button>
                  
                  {expandedFAQs[faq.id] && (
                    <div className='px-5 pb-5'>
                      <div className='pt-3 border-t border-gray-200'>
                        <p className='text-gray-600 whitespace-pre-wrap'>{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // If no category filter, group by category
            <div className='space-y-10'>
              {Object.entries(groupFAQsByCategory(faqs)).map(
                ([category, categoryFaqs]) => (
                  <div key={category}>
                    <h2 className='text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200'>
                      {category}
                    </h2>
                    <div className='space-y-4'>
                      {categoryFaqs.map((faq) => (
                        <div
                          key={faq.id}
                          className='bg-white shadow-md rounded-lg overflow-hidden'
                        >
                          <button
                            onClick={() => toggleFAQ(faq.id)}
                            className='w-full p-5 text-left flex justify-between items-center hover:bg-gray-50'
                          >
                            <h3 className='text-lg font-medium text-gray-800'>
                              {faq.question}
                            </h3>
                            {expandedFAQs[faq.id] ? (
                              <ChevronUpIcon className='h-5 w-5 text-gray-500' />
                            ) : (
                              <ChevronDownIcon className='h-5 w-5 text-gray-500' />
                            )}
                          </button>
                          
                          {expandedFAQs[faq.id] && (
                            <div className='px-5 pb-5'>
                              <div className='pt-3 border-t border-gray-200'>
                                <p className='text-gray-600 whitespace-pre-wrap'>{faq.answer}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className='flex justify-center mt-10'>
          <nav className='flex items-center space-x-2'>
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={"page"}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
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
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
