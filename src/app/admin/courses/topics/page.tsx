"use client";

import { useState, useEffect } from "react";
import { useTopics } from "@/client/hooks/topics";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

export default function TopicsPage() {
  const router = useRouter();
  const { 
    topics, 
    loading, 
    error, 
    pagination, 
    fetchTopics, 
    deleteTopic 
  } = useTopics(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [showActive, setShowActive] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    // Fetch topics on initial load
    fetchTopics({
      page: currentPage,
      limit: 10,
      sortBy: "name",
      sortOrder: "asc",
      isActive: showActive
    });
  }, [fetchTopics, currentPage, showActive]);

  // Auto-hide status messages after 3 seconds
  useEffect(() => {
    if (actionStatus) {
      const timer = setTimeout(() => {
        setActionStatus(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [actionStatus]);

  const handleSearch = () => {
    fetchTopics({
      search: searchQuery,
      isActive: showActive,
      page: 1,
      limit: 10,
    });
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    if (status === "all") {
      setShowActive(undefined);
    } else if (status === "active") {
      setShowActive(true);
    } else {
      setShowActive(false);
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchTopics({
      search: searchQuery,
      isActive: showActive,
      page,
      limit: 10,
    });
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      await deleteTopic(id);
      // Refresh the list after deletion
      fetchTopics({
        search: searchQuery,
        isActive: showActive,
        page: currentPage,
        limit: 10,
      });
      setConfirmDelete(null);
      
      setActionStatus({
        message: "Topic deleted successfully",
        type: "success"
      });
    } catch (err: any) {
      console.error("Error deleting topic:", err);
      
      setActionStatus({
        message: err.response?.data?.error || "Failed to delete topic",
        type: "error"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-6">Topics Management</h1>
        <Link
          href="/admin/courses/topics/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Topic
        </Link>
      </div>

      {/* Status message */}
      {actionStatus && (
        <div 
          className={`mb-4 px-4 py-3 rounded-md flex justify-between items-center ${
            actionStatus.type === 'success' 
              ? 'bg-green-50 border border-green-300 text-green-700' 
              : 'bg-red-50 border border-red-300 text-red-700'
          }`}
        >
          <span>{actionStatus.message}</span>
          <button 
            onClick={() => setActionStatus(null)}
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Filter controls */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-2 pl-10 pr-4 block w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/4">
            <select
              value={showActive === undefined ? "all" : showActive ? "active" : "inactive"}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="py-2 px-3 block w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
          
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Topics list */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 text-left font-medium text-indigo-700 uppercase tracking-wider text-sm">Name</th>
                <th className="py-4 px-6 text-left font-medium text-indigo-700 uppercase tracking-wider text-sm">Description</th>
                <th className="py-4 px-6 text-left font-medium text-indigo-700 uppercase tracking-wider text-sm">Status</th>
                <th className="py-4 px-6 text-left font-medium text-indigo-700 uppercase tracking-wider text-sm">Courses</th>
                <th className="py-4 px-6 text-right font-medium text-indigo-700 uppercase tracking-wider text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading topics...</p>
                  </td>
                </tr>
              ) : topics.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">
                    <p>No topics found.</p>
                    <p className="text-sm mt-1">Create a new topic or try with a different search term.</p>
                  </td>
                </tr>
              ) : (
                topics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">
                      {topic.name}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 max-w-xs truncate">
                      {topic.description || '-'}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm">
                      {topic.isActive ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-600">
                      {topic._count?.courses || '0'}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/admin/courses/topics/${topic.id}/edit`}
                          className="p-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors duration-150"
                          aria-label="Edit topic"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </Link>
                        
                        {confirmDelete === topic.id ? (
                          <div className="flex items-center space-x-2 bg-red-50 rounded-md p-1">
                            <button
                              onClick={() => handleDeleteConfirm(topic.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              aria-label="Confirm delete"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="p-1 text-gray-600 hover:text-gray-800"
                              aria-label="Cancel delete"
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(topic.id)}
                            className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-150"
                            aria-label="Delete topic"
                            disabled={topic._count?.courses > 0}
                            title={topic._count?.courses > 0 ? "Cannot delete topic that is used by courses" : "Delete topic"}
                          >
                            {topic._count?.courses > 0 ? (
                              <ExclamationCircleIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <TrashIcon className="h-5 w-5" />
                            )}
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
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {topics.length} of {pagination.totalItems} topics
            </div>
            <div className="flex space-x-1">
              <button 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 rounded'}`}
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
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button 
                onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
                disabled={currentPage === pagination.totalPages}
                className={`p-2 ${currentPage === pagination.totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 rounded'}`}
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
