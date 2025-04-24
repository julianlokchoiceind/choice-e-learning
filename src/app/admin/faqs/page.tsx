"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useFAQs } from "@/client/hooks/faq/useFAQs";
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  TrashIcon, 
  PencilSquareIcon 
} from "@heroicons/react/24/outline";

export default function FAQsAdminPage() {
  const {
    loading,
    error,
    faqs,
    pagination,
    categories,
    fetchFAQs,
    fetchCategories,
    deleteFAQ,
  } = useFAQs(true);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

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

  useEffect(() => {
    // Fetch FAQs on initial load
    fetchFAQs({
      page: currentPage,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
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
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchFAQs({
      search,
      category: selectedCategory || undefined,
      page,
      limit: 10,
    });
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      await deleteFAQ(id);
      // Refresh the list after deletion
      fetchFAQs({
        search,
        category: selectedCategory || undefined,
        page: currentPage,
        limit: 10,
      });
      setConfirmDelete(null);
    } catch (err) {
      console.error("Error deleting FAQ:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-6">FAQs Management</h1>
        <Link 
          href="/admin/faqs/new" 
          className="px-4 py-2 rounded-md flex items-center admin-button add-faq-btn"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add New FAQ
        </Link>
      </div>

      {/* Filter and search controls */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search FAQs..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="py-2 pl-10 pr-4 block w-full sm:w-80 border border-gray-300 rounded-md focus:ring-0 focus:border-[var(--color-primary)] outline-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select 
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none sm:text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button
              onClick={handleSearch}
              className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md admin-button"
            >
              Search
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 mx-4 mt-4">
            {error}
          </div>
        )}

        {/* FAQ list */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 text-left font-medium text-indigo-700 uppercase tracking-wider text-sm">Question</th>
                <th className="py-4 px-6 text-left font-medium text-indigo-700 uppercase tracking-wider text-sm">Category</th>
                <th className="py-4 px-6 text-left font-medium text-indigo-700 uppercase tracking-wider text-sm">Created</th>
                <th className="py-4 px-6 text-right font-medium text-indigo-700 uppercase tracking-wider text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading FAQs...</p>
                  </td>
                </tr>
              ) : faqs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">
                    <p>No FAQs found</p>
                    <p className="text-sm mt-1">Try with a different search term or add a new FAQ.</p>
                  </td>
                </tr>
              ) : (
                faqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-4 px-6 text-gray-800">
                      <div className="font-medium truncate max-w-sm">
                        {faq.question}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {faq.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {new Date(faq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/admin/faqs/${faq.id}/edit`}
                          className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 rounded-md p-1.5 transition-colors duration-150 admin-button"
                          title="Edit"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </Link>
                        
                        {confirmDelete === faq.id ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDeleteConfirm(faq.id)}
                              className="text-red-600 hover:text-red-800 font-medium bg-red-50 px-2 py-1 rounded admin-button"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-gray-600 hover:text-gray-800 bg-gray-50 px-2 py-1 rounded admin-button"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(faq.id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded-md p-1.5 transition-colors duration-150 admin-button"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
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
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {faqs.length} of {pagination.total || faqs.length} FAQs
            </div>
            <div className="flex space-x-1">
              <button 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 rounded'} admin-button`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}