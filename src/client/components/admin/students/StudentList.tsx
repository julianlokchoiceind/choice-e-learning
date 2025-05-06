'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  PencilSquareIcon, 
  TrashIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  UserGroupIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useStudents } from '@/client/hooks/students';

export default function StudentList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { 
    students: apiStudents, 
    loading, 
    error, 
    pagination, 
    fetchStudents, 
    deleteStudent 
  } = useStudents();
  
  // Create local state to manage students, which will be updated from API
  const [students, setStudents] = useState(apiStudents || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
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
      
      /* Styling for Add Student button */
      .add-btn {
        background-image: linear-gradient(to right, #3b82f6, #1d4ed8) !important;
        color: white !important;
        transition: none !important;
      }
      
      .add-btn:hover {
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
  
  // When API students change, update local state
  useEffect(() => {
    if (apiStudents && apiStudents.length > 0) {
      console.log("Updating local students state from API:", apiStudents.length, "items");
      setStudents(apiStudents);
    }
  }, [apiStudents]);

  // Get current page from URL or default to 1
  const currentPage = parseInt(searchParams.get('page') || '1');
  
  // Debugging effect để theo dõi state
  useEffect(() => {
    console.log('STATE CHANGE: loading =', loading);
    console.log('STATE CHANGE: students =', students?.length || 0, 'items');
    console.log('STATE CHANGE: pagination =', pagination);
    if (students && students.length > 0) {
      console.log('First student:', students[0]);
    }
  }, [loading, students, pagination]);
  
  useEffect(() => {
    // Call fetchStudents with the current parameters when component mounts or page changes
    const fetchData = async () => {
      try {
        console.log('ADMIN UI: Fetching students for page:', currentPage);
        console.log('ADMIN UI: Before fetch - Current students:', students);
        
        const result = await fetchStudents({
          page: currentPage,
          limit: 10,
          search: searchQuery || undefined,
          sortBy,
          sortOrder,
        });
        
        console.log('ADMIN UI: Direct result from fetchStudents:', {
          dataLength: result?.data?.length || 0,
          meta: result?.meta
        });
        
        // Need to access students after state update
        setTimeout(() => {
          console.log('ADMIN UI: After fetch - Current students:', students);
          console.log('ADMIN UI: After fetch - Student count:', students?.length || 0);
          
          // Force re-render if students is empty but we have data in the result
          if ((!students || students.length === 0) && result?.data?.length > 0) {
            console.log('ADMIN UI: Forcing manual state update with', result.data.length, 'students');
            setStudents([...result.data]);
          }
        }, 100);
      } catch (err) {
        console.error('Error in StudentList useEffect:', err);
        // Silent error handling - no UI error display
      }
    };
    
    fetchData();
    // We're intentionally only depending on page changes, search query, and sorting
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, fetchStudents, searchQuery, sortBy, sortOrder]);
  
  // Handle search with better error management
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search submitted with query:', searchQuery);
    
    try {
      fetchStudents({
        page: 1,
        limit: 10,
        search: searchQuery,
        sortBy,
        sortOrder,
      });
      router.push('/admin/students?page=1');
    } catch (err) {
      console.error('Error in search:', err);
      // Silent error handling
    }
  };

  // Handle sort change from dropdown
  const handleSortChange = (sortOption: string) => {
    let newSortBy = 'createdAt';
    let newSortOrder: 'asc' | 'desc' = 'desc';
    
    // Map the dropdown value to sortBy and sortOrder values
    switch (sortOption) {
      case 'newest':
        newSortBy = 'createdAt';
        newSortOrder = 'desc';
        break;
      case 'oldest':
        newSortBy = 'createdAt';
        newSortOrder = 'asc';
        break;
      case 'nameAsc':
        newSortBy = 'name';
        newSortOrder = 'asc';
        break;
      case 'nameDesc':
        newSortBy = 'name';
        newSortOrder = 'desc';
        break;
      case 'emailAsc':
        newSortBy = 'email';
        newSortOrder = 'asc';
        break;
      case 'emailDesc':
        newSortBy = 'email';
        newSortOrder = 'desc';
        break;
      case 'gradeAsc':
        newSortBy = 'grade';
        newSortOrder = 'asc';
        break;
      case 'gradeDesc':
        newSortBy = 'grade';
        newSortOrder = 'desc';
        break;
      default:
        newSortBy = 'createdAt';
        newSortOrder = 'desc';
    }
    
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    
    fetchStudents({
      page: 1,
      limit: 10,
      search: searchQuery || undefined,
      sortBy: newSortBy,
      sortOrder: newSortOrder,
    });
    
    router.push('/admin/students?page=1');
  };
  
  const handlePageChange = (page: number) => {
    console.log("Changing to page:", page);
    router.push(`/admin/students?page=${page}`);
    
    // Cancel any pending delete operation when changing pages
    setDeletingId(null);
  };
  
  // Initiate delete process - show confirmation buttons
  const initiateDelete = (id: string) => {
    setDeletingId(id);
  };
  
  // Cancel delete
  const cancelDelete = () => {
    setDeletingId(null);
  };
  
  // Confirm and execute delete
  const confirmDelete = async (id: string) => {
    try {
      console.log("Deleting student with ID:", id);
      
      // Set deleting to null first to hide confirm/cancel buttons
      setDeletingId(null);
      
      // Hide any visual indicator that deletion is in progress
      // Use simple delete without any UI feedback
      const result = await deleteStudent(id);
      console.log("Delete result:", result);
      
      // Update the local state to remove the deleted student
      setStudents(prevStudents => prevStudents.filter(student => student.id !== id));
      
    } catch (err: any) {
      console.error("Error deleting student:", err);
      // Silently handle error - no notification displayed
    }
  };
  
  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Convert sortBy and sortOrder to a single dropdown value
  const getCurrentSort = () => {
    if (sortBy === 'createdAt' && sortOrder === 'desc') return 'newest';
    if (sortBy === 'createdAt' && sortOrder === 'asc') return 'oldest';
    if (sortBy === 'name' && sortOrder === 'asc') return 'nameAsc';
    if (sortBy === 'name' && sortOrder === 'desc') return 'nameDesc';
    if (sortBy === 'email' && sortOrder === 'asc') return 'emailAsc';
    if (sortBy === 'email' && sortOrder === 'desc') return 'emailDesc';
    if (sortBy === 'grade' && sortOrder === 'asc') return 'gradeAsc';
    if (sortBy === 'grade' && sortOrder === 'desc') return 'gradeDesc';
    return 'newest'; // Default
  };
  
  return (
    <div className="space-y-6">
      {/* Removed action status notification */}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <UserGroupIcon className="h-7 w-7 text-indigo-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">Students Management</h1>
        </div>
        <Link
          href="/admin/students/new"
          className="px-4 py-2 rounded-md flex items-center admin-button add-btn"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add New Student
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search students..." 
              className="py-2 pl-10 pr-4 block w-full sm:w-80 border border-gray-300 rounded-md focus:ring-0 focus:border-[var(--color-primary)] outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e);
                }
              }}
            />
          </div>
          <div className="flex items-center space-x-2">
            {/* Sort dropdown */}
            <select 
              id="sort-filter"
              className="py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              value={getCurrentSort()}
              onChange={(e) => {
                handleSortChange(e.target.value);
              }}
            >
              <option value="newest">Sort By: Newest</option>
              <option value="oldest">Sort By: Oldest</option>
              <option value="nameAsc">Sort By: Name (A-Z)</option>
              <option value="nameDesc">Sort By: Name (Z-A)</option>
              <option value="emailAsc">Sort By: Email (A-Z)</option>
              <option value="emailDesc">Sort By: Email (Z-A)</option>
              <option value="gradeAsc">Sort By: Grade (Low-High)</option>
              <option value="gradeDesc">Sort By: Grade (High-Low)</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base">#</th>
                <th className="py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base">Name</th>
                <th className="py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base">Email</th>
                <th className="py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base">Phone</th>
                <th className="py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base">City</th>
                <th className="py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base">Grade</th>
                <th className="py-4 px-6 text-right font-medium text-indigo-700 capitalize tracking-wider text-base">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading students...</p>
                  </td>
                </tr>
              ) : students && students.length > 0 ? (
                students.map((student, index) => {
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">
                        {((pagination?.page || 1) - 1) * 10 + index + 1}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium text-sm">
                            {student.imageUrl ? (
                              <Image src={student.imageUrl} alt={student.name} className="h-10 w-10 rounded-full object-cover" width={500} height={300} />
                            ) : (
                              getInitials(student.name || 'Unknown')
                            )}
                          </div>
                          <div className="font-medium text-gray-800">{student.name || 'Unknown'}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700">{student.email}</td>
                      <td className="py-4 px-6 text-gray-700">{student.phone && student.phone !== '-' ? student.phone : "-"}</td>
                      <td className="py-4 px-6 text-gray-700">{student.city && student.city !== '-' ? student.city : "-"}</td>
                      <td className="py-4 px-6 text-gray-700">{student.grade && student.grade !== '-' ? student.grade : "-"}</td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => router.push(`/admin/students/${student.id}`)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md p-1.5 transition-colors duration-150 admin-button"
                            aria-label="View student details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/students/${student.id}/edit`)}
                            className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 rounded-md p-1.5 transition-colors duration-150 admin-button"
                            aria-label="Edit student"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          
                          {deletingId === student.id ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => confirmDelete(student.id)}
                                className="text-red-600 hover:text-red-800 font-medium bg-red-50 px-2 py-1 rounded admin-button"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="text-gray-600 hover:text-gray-800 bg-gray-50 px-2 py-1 rounded admin-button"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => initiateDelete(student.id)}
                              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded-md p-1.5 transition-colors duration-150 admin-button"
                              aria-label="Delete student"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    <p>No students found.</p>
                    <p className="text-sm mt-1">Try adjusting your search criteria or add a new student.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination && pagination.totalPages > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {students?.length || 0} of {pagination.total} students
            </div>
            <div className="flex space-x-1">
              <button 
                onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
                className={`p-2 ${pagination.page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 rounded'} admin-button`}
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
                    pagination.page === page 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  } admin-button`}
                >
                  {page}
                </button>
              ))}
              
              <button 
                onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                disabled={pagination.page === pagination.totalPages}
                className={`p-2 ${pagination.page === pagination.totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 rounded'} admin-button`}
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
};