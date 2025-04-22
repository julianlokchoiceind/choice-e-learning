"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useFAQs } from "@/client/hooks/faq/useFAQs";
import { 
  PlusCircleIcon, 
  MagnifyingGlassIcon as SearchIcon, 
  TrashIcon, 
  PencilIcon 
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
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage FAQs</h1>
        <Link 
          href="/admin/faqs/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center"
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          Add New FAQ
        </Link>
      </div>

      {/* Filter and search controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search FAQs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg pl-10"
            />
            <SearchIcon className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
        </div>
        
        <div className="w-full md:w-1/3">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
        >
          Search
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {/* FAQ list */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading FAQs...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-3 px-6 text-left text-gray-600 font-semibold">Question</th>
                <th className="py-3 px-6 text-left text-gray-600 font-semibold">Category</th>
                <th className="py-3 px-6 text-left text-gray-600 font-semibold">Created</th>
                <th className="py-3 px-6 text-center text-gray-600 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {faqs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    No FAQs found
                  </td>
                </tr>
              ) : (
                faqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-gray-50">
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
                    <td className="py-4 px-6">
                      <div className="flex justify-center space-x-2">
                        <Link
                          href={`/admin/faqs/${faq.id}/edit`}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        
                        {confirmDelete === faq.id ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDeleteConfirm(faq.id)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(faq.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <TrashIcon className="w-5 h-5" />
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
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
