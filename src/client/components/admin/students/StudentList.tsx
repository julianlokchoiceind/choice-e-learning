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
import { useStudentsQuery } from '@/client/hooks/students';
import { 
  LoadingState,
  BulkDeleteButton,
  SelectAllCheckbox,
  StatusBadge
} from '@/client/components/common';
import { useSelection } from '@/client/hooks/common';
import { StudentQuery } from '@/shared/types/students/student';

export default function StudentList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Create React Query hooks from useStudentsQuery
  const { 
    useGetStudents,
    useDeleteStudent,
    useBulkDeleteStudents
  } = useStudentsQuery();
  
  // Get current page from URL or default to 1
  const currentPage = parseInt(searchParams.get('page') || '1');
  const [searchQuery, setSearchQuery] = useState('');
  const [showActive, setShowActive] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Selection state for bulk operations
  const {
    selectedItems,
    toggleSelectItem,
    clearSelection
  } = useSelection<string>();
  
  // Create query parameters object
  const queryParams: StudentQuery = {
    page: currentPage,
    limit: 10,
    search: searchQuery || undefined,
    isActive: showActive,
    sortBy,
    sortOrder,
  };
  
  // Use React Query to fetch students
  const { 
    data: studentsData,
    isLoading,
    error,
    refetch
  } = useGetStudents(queryParams);
  
  // Use delete mutation
  const deleteStudentMutation = useDeleteStudent();
  const bulkDeleteStudents = useBulkDeleteStudents();
  
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
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/admin/students?page=1');
    refetch();
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
    router.push('/admin/students?page=1');
  };
  
  const handlePageChange = (page: number) => {
    console.log('Changing to page:', page);
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
      console.log('Deleting student with ID:', id);
      
      // Set deleting to null first to hide confirm/cancel buttons
      setDeletingId(null);
      
      // Use React Query mutation to delete
      await deleteStudentMutation.mutateAsync(id);
      
    } catch (err: unknown) {
      console.error('Error deleting student:', err);
      // Error is handled by the mutation
    }
  };
  
  // Handle bulk delete
  const handleBulkDelete = async (studentIds: string[]) => {
    try {
      await bulkDeleteStudents.mutateAsync(studentIds);
      clearSelection();
    } catch (error: unknown) {
      console.error('Error deleting students:', error);
    }
  };
  
  // Extract students and pagination from data
  const students = studentsData?.data || [];
  const pagination = studentsData?.meta;
  
  // Clear selection when students data changes
  useEffect(() => {
    clearSelection();
  }, [studentsData, clearSelection]);

  // Calculate selection state based on current students
  const isAllSelected = students.length > 0 && selectedItems.size === students.length;
  const isIndeterminate = selectedItems.size > 0 && selectedItems.size < students.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      clearSelection();
    } else {
      students.forEach(student => {
        if (!selectedItems.has(student.id)) {
          toggleSelectItem(student.id);
        }
      });
    }
  };
  
  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Handle status change
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
    router.push('/admin/students?page=1');
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
    <div className='space-y-6'>
      {/* Removed action status notification */}

      <div className='flex justify-between items-center mb-6'>
        <div className='flex items-center'>
          <UserGroupIcon className='h-7 w-7 text-indigo-600 mr-3' />
          <h1 className='text-2xl font-bold text-gray-800'>Students Management</h1>
        </div>
        <div className='flex items-center gap-3'>
          {selectedItems.size > 0 && (
            <BulkDeleteButton
              selectedItems={selectedItems}
              onDelete={handleBulkDelete}
              itemLabel="student"
            />
          )}
          <Link
            href='/admin/students/new'
            className='btn-admin-primary'
          >
            <PlusIcon className='h-5 w-5 mr-1' />
            Add New Student
          </Link>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden'>
        <div className='p-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4'>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <MagnifyingGlassIcon className='h-5 w-5 text-gray-400' />
            </div>
            <input 
              type='text' 
              placeholder='Search students...' 
              className='py-2 pl-10 pr-4 block w-full sm:w-80 border border-gray-300 rounded-md focus:ring-0 focus:border-[var(--color-primary)] outline-none'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e: any) => {
                if (e.key === 'Enter') {
                  handleSearch(e);
                }
              }}
            />
          </div>
          <div className='flex items-center space-x-2'>
            {/* Status dropdown */}
            <select 
              value={showActive === undefined ? 'all' : showActive ? 'active' : 'inactive'}
              onChange={(e) => handleStatusChange(e.target.value)}
              className='py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm'
            >
              <option value='all'>All Status</option>
              <option value='active'>Active Only</option>
              <option value='inactive'>Inactive Only</option>
            </select>
            {/* Sort dropdown */}
            <select 
              id='sort-filter'
              className='py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm'
              value={getCurrentSort()}
              onChange={(e: any) => {
                handleSortChange(e.target.value);
              }}
            >
              <option value='newest'>Newest</option>
              <option value='oldest'>Oldest</option>
              <option value='nameAsc'>Name (A-Z)</option>
              <option value='nameDesc'>Name (Z-A)</option>
              <option value='emailAsc'>Email (A-Z)</option>
              <option value='emailDesc'>Email (Z-A)</option>
              <option value='gradeAsc'>Grade (Low-High)</option>
              <option value='gradeDesc'>Grade (High-Low)</option>
            </select>
          </div>
        </div>
        
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th scope='col' className='w-10 px-6 py-4'>
                  <SelectAllCheckbox
                    isAllSelected={isAllSelected}
                    isIndeterminate={isIndeterminate}
                    onToggleAll={toggleSelectAll}
                    disabled={students.length === 0}
                  />
                </th>
                <th className='py-4 px-6 text-left font-medium text-[var(--color-primary-dark)] uppercase tracking-wider text-sm'>#</th>
                <th className='py-4 px-6 text-left font-medium text-[var(--color-primary-dark)] uppercase tracking-wider text-sm'>Name</th>
                <th className='py-4 px-6 text-left font-medium text-[var(--color-primary-dark)] uppercase tracking-wider text-sm'>Email</th>
                <th className='py-4 px-6 text-left font-medium text-[var(--color-primary-dark)] uppercase tracking-wider text-sm'>Phone</th>
                <th className='py-4 px-6 text-left font-medium text-[var(--color-primary-dark)] uppercase tracking-wider text-sm'>City</th>
                <th className='py-4 px-6 text-left font-medium text-[var(--color-primary-dark)] uppercase tracking-wider text-sm'>Grade</th>
                <th className='py-4 px-6 text-left font-medium text-[var(--color-primary-dark)] uppercase tracking-wider text-sm'>Status</th>
                <th className='py-4 px-6 text-right font-medium text-[var(--color-primary-dark)] uppercase tracking-wider text-sm'>Actions</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {isLoading || deleteStudentMutation.isPending || bulkDeleteStudents.isPending ? (
                <tr>
                  <td colSpan={9} className='text-center py-10'>
                    <LoadingState 
                      variant="table" 
                      message={bulkDeleteStudents.isPending ? 'Deleting students...' : deleteStudentMutation.isPending ? 'Deleting student...' : 'Loading students...'} 
                      columns={9}
                      rows={6}
                      columnWidths={['5%', '7%', '18%', '16%', '11%', '10%', '9%', '10%', '14%']}
                    />
                  </td>
                </tr>
              ) : students && students.length > 0 ? (
                students.map((student, index) => {
                  return (
                    <tr key={student.id} className='hover:bg-gray-50 transition-colors duration-150'>
                      <td className='w-10 px-6 py-4'>
                        <input
                          type="checkbox"
                          checked={selectedItems.has(student.id)}
                          onChange={() => toggleSelectItem(student.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className='py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {(() => {
                          const page = pagination?.page || 1;
                          const limit = 10;
                          const totalItems = pagination?.total || 0;
                          
                          if (sortOrder === 'asc') {
                            // For ASC: continuous numbering (1, 2, 3...)
                            return (page - 1) * limit + index + 1;
                          } else {
                            // For DESC: reverse continuous numbering 
                            const sttNumber = totalItems - ((page - 1) * limit + index);
                            // Ensure we don't show negative numbers
                            return sttNumber > 0 ? sttNumber : index + 1;
                          }
                        })()}
                      </td>
                      <td className='py-4 px-6'>
                        <div className='flex items-center gap-3'>
                          <div className='h-10 w-10 rounded-full bg-indigo-100 text-[var(--color-primary-dark)] flex items-center justify-center font-medium text-sm'>
                            {student.imageUrl ? (
                              <Image src={student.imageUrl} alt={student.name} className='h-10 w-10 rounded-full object-cover' width={500} height={300} />
                            ) : (
                              getInitials(student.name || 'Unknown')
                            )}
                          </div>
                          <div className='font-medium text-gray-800'>{student.name || 'Unknown'}</div>
                        </div>
                      </td>
                      <td className='py-4 px-6 text-gray-700'>{student.email}</td>
                      <td className='py-4 px-6 text-gray-700'>{student.phone && student.phone !== '-' ? student.phone : '-'}</td>
                      <td className='py-4 px-6 text-gray-700'>{student.city && student.city !== '-' ? student.city : '-'}</td>
                      <td className='py-4 px-6 text-gray-700'>{student.grade && student.grade !== '-' ? student.grade : '-'}</td>
                      <td className='py-4 px-6'>
                        <StatusBadge status={student.isActive ? 'active' : 'inactive'} size='sm' />
                      </td>
                      <td className='py-4 px-6'>
                        <div className='flex justify-end space-x-2'>
                          <Link
                            href={`/admin/students/${student.id}`}
                            className='btn-admin-secondary btn-admin-sm p-1.5 inline-block'
                            aria-label='View student details'
                          >
                            <EyeIcon className='h-5 w-5' />
                          </Link>
                          <Link
                            href={`/admin/students/${student.id}/edit`}
                            className='text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 rounded-md p-1.5 transition-colors duration-150 admin-button inline-block'
                            aria-label='Edit student'
                          >
                            <PencilSquareIcon className='h-5 w-5' />
                          </Link>
                          
                          {deletingId === student.id ? (
                            <div className='flex items-center space-x-2'>
                              <button
                                onClick={() => confirmDelete(student.id)}
                                className='text-red-600 hover:text-red-800 font-medium bg-red-50 px-2 py-1 rounded admin-button'
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className='text-gray-600 hover:text-gray-800 bg-gray-50 px-2 py-1 rounded admin-button'
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => initiateDelete(student.id)}
                              className='text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded-md p-1.5 transition-colors duration-150 admin-button'
                              aria-label='Delete student'
                            >
                              <TrashIcon className='h-5 w-5' />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className='text-center py-10 text-gray-500'>
                    <p>No students found.</p>
                    <p className='text-sm mt-1'>Try adjusting your search criteria or add a new student.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className='flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200'>
            <div className='text-sm text-gray-600'>
              Showing {students?.length || 0} of {pagination.total} students
            </div>
            <div className='flex space-x-1'>
              <button 
                onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
                className={`p-2 ${pagination.page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 rounded'} admin-button`}
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