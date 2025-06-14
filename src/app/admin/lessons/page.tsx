'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useLessonsQuery } from '@/client/hooks/lessons';
import { useCoursesQuery } from '@/client/hooks/courses';
import { useSelection } from '@/client/hooks/common/useSelection';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayCircleIcon
} from '@heroicons/react/24/outline';
import { 
  LoadingState, 
  BulkDeleteButton, 
  SelectAllCheckbox 
} from '@/client/components/common';

// Helper functions
const formatLessonTitle = (title: string): string => {
  if (!title) return '';
  return title.length > 40 ? `${title.substring(0, 40)}...` : title;
};

const formatDuration = (duration: number): string => {
  if (!duration) return '0 min';
  return `${duration} min`;
};

const formatStatus = (status: string): string => {
  if (!status) return 'Draft';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getStatusBadgeClass = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'published':
      return 'badge-published';
    case 'draft':
      return 'badge-draft';
    default:
      return 'badge-inactive';
  }
};

const getSortParams = (sortOption: string): { sortBy: string; order: 'asc' | 'desc' } => {
  switch (sortOption) {
    case 'title-asc':
      return { sortBy: 'title', order: 'asc' };
    case 'title-desc':
      return { sortBy: 'title', order: 'desc' };
    case 'duration-asc':
      return { sortBy: 'duration', order: 'asc' };
    case 'duration-desc':
      return { sortBy: 'duration', order: 'desc' };
    case 'order-asc':
      return { sortBy: 'order', order: 'asc' };
    case 'order-desc':
      return { sortBy: 'order', order: 'desc' };
    case 'oldest':
      return { sortBy: 'createdAt', order: 'asc' };
    case 'newest':
    default:
      return { sortBy: 'createdAt', order: 'desc' };
  }
};

export default function LessonsPage() {
  // Use the lessons and courses query hooks
  const lessonsQuery = useLessonsQuery();
  const coursesQuery = useCoursesQuery(true);
  const { useGetLessons, useDeleteLesson, useBulkDeleteLessons } = lessonsQuery;
  const { useGetCourses } = coursesQuery;
  
  // Bulk selection hook
  const { 
    selectedItems,
    toggleSelectItem,
    clearSelection 
  } = useSelection<string>();
  
  // State for filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  // Get courses for the filter dropdown
  const { data: coursesData, refetch: refetchCourses } = useGetCourses();
  const courses = coursesData?.data || [];
  
  // Create filter object from state
  const lessonFilter = useMemo(() => {
    const filter: any = {
      search: searchQuery || undefined,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      page: currentPage,
      limit: 10,
      ...getSortParams(sortOption)
    };
    
    // Only add courseId if a specific course is selected
    if (selectedCourse !== 'all') {
      filter.courseId = selectedCourse;
    }
    
    return filter;
  }, [searchQuery, selectedCourse, selectedStatus, currentPage, sortOption]);
  
  // Use React Query for fetching lessons
  const { 
    data,
    isLoading,
    error,
    refetch
  } = useGetLessons(undefined, lessonFilter);
  
  // Extract lessons and pagination from response
  const lessons = data?.data || data || [];
  const pagination = data?.meta || { 
    page: currentPage,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  };
  
  // Use React Query for delete mutation
  const deleteLessonMutation = useDeleteLesson();
  const bulkDeleteMutation = useBulkDeleteLessons();
  
  // Calculate selection state based on current lessons
  const isAllSelected = lessons.length > 0 && selectedItems.size === lessons.length;
  const isIndeterminate = selectedItems.size > 0 && selectedItems.size < lessons.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      clearSelection();
    } else {
      lessons.forEach((lesson: any) => {
        if (!selectedItems.has(lesson.id)) {
          toggleSelectItem(lesson.id);
        }
      });
    }
  };
  
  // Add CSS for buttons with no transform on hover
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
      
      /* Styling for Add Lesson button */
      .add-lesson-btn {
        background-image: linear-gradient(to right, #3b82f6, #1d4ed8) !important;
        color: white !important;
        transition: none !important;
      }
      
      .add-lesson-btn:hover {
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
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = async (lessonId: string) => {
    try {
      // Find the lesson to get its courseId
      const lesson = lessons.find((l: any) => l.id === lessonId);
      
      await deleteLessonMutation.mutateAsync({ 
        id: lessonId, 
        courseId: lesson?.courseId 
      });
      setConfirmDelete(null);
      // Don't manually refetch - let React Query handle it through cache invalidation
    } catch (error: unknown) {
      console.error('Error deleting lesson:', error);
      // Error is handled by the mutation
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div className='flex items-center mb-6'>
          <PlayCircleIcon className='h-7 w-7 text-indigo-600 mr-3' />
          <h1 className='text-2xl font-bold text-gray-800'>Lessons Management</h1>
        </div>
        <div className='flex items-center gap-3'>
          {selectedItems.size > 0 && (
            <BulkDeleteButton
              selectedItems={selectedItems}
              onDelete={async (ids) => {
                await bulkDeleteMutation.mutateAsync(ids);
                clearSelection();
              }}
              itemLabel="lesson"
            />
          )}
        </div>
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
              placeholder='Search lessons...' 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='py-2 pl-10 pr-4 block w-full sm:w-80 border border-gray-300 rounded-md focus:ring-0 focus:border-[var(--color-primary)] outline-none'
            />
          </div>
          <div className='flex items-center space-x-2'>
            <select 
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setCurrentPage(1);
              }}
              className='py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none sm:text-sm'
            >
              <option value='all'>All Courses</option>
              {courses.map((course: any) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            
            <select 
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className='py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none sm:text-sm'
            >
              <option value='all'>All Status</option>
              <option value='published'>Published</option>
              <option value='draft'>Draft</option>
            </select>
            
            <select 
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
              className='py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none sm:text-sm'
            >
              <option value='newest'>Newest First</option>
              <option value='oldest'>Oldest First</option>
              <option value='title-asc'>Title (A-Z)</option>
              <option value='title-desc'>Title (Z-A)</option>
              <option value='duration-asc'>Duration (Short to Long)</option>
              <option value='duration-desc'>Duration (Long to Short)</option>
              <option value='order-asc'>Order (Low to High)</option>
              <option value='order-desc'>Order (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Lessons list */}
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th scope='col' className='py-4 px-4 text-left'>
                  <SelectAllCheckbox
                    isAllSelected={isAllSelected}
                    isIndeterminate={isIndeterminate}
                    onToggleAll={toggleSelectAll}
                    disabled={lessons.length === 0}
                  />
                </th>
                <th scope='col' className='py-4 px-6 text-left font-medium text-[var(--color-primary-dark)] uppercase tracking-wider text-sm'>
                  #
                </th>
                <th scope='col' className='py-4 px-6 text-left font-medium text-[var(--color-primary-dark)] uppercase tracking-wider text-sm'>
                  Lesson Title
                </th>
                <th scope='col' className='py-4 px-6 text-left font-medium text-[var(--color-primary-dark)] uppercase tracking-wider text-sm'>
                  Course
                </th>
                <th scope='col' className='py-4 px-6 text-left font-medium text-[var(--color-primary-dark)] uppercase tracking-wider text-sm'>
                  Order
                </th>
                <th scope='col' className='py-4 px-6 text-left font-medium text-[var(--color-primary-dark)] uppercase tracking-wider text-sm'>
                  Duration
                </th>
                <th scope='col' className='py-4 px-6 text-left font-medium text-[var(--color-primary-dark)] uppercase tracking-wider text-sm'>
                  Status
                </th>
                <th scope='col' className='py-4 px-6 text-right font-medium text-[var(--color-primary-dark)] uppercase tracking-wider text-sm'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {isLoading || deleteLessonMutation.isPending ? (
                <tr>
                  <td colSpan={8} className='text-center py-10'>
                    <LoadingState 
                      variant="table" 
                      message={deleteLessonMutation.isPending ? 'Deleting lesson...' : 'Loading lessons...'} 
                      columns={8}
                      rows={6}
                      columnWidths={['5%', '8%', '25%', '20%', '8%', '10%', '10%', '14%']}
                    />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className='text-center py-10'>
                    <div className='text-red-600'>
                      <p className='font-medium'>Error loading lessons</p>
                      <p className='text-sm mt-1'>Please try refreshing the page.</p>
                    </div>
                  </td>
                </tr>
              ) : lessons.length === 0 ? (
                <tr>
                  <td colSpan={8} className='text-center py-10 text-gray-500'>
                    <PlayCircleIcon className='mx-auto h-12 w-12 text-gray-400 mb-3' />
                    <p>No lessons found</p>
                    <p className='text-sm mt-1'>Create a new lesson or try with a different search term.</p>
                  </td>
                </tr>
              ) : (
                lessons.map((lesson: any, index: number) => {
                  // Find the course for this lesson
                  const lessonCourse = courses.find((c: any) => c.id === lesson.courseId);
                  
                  return (
                    <tr key={lesson.id} className='hover:bg-gray-50 transition-colors duration-150'>
                      <td className='px-4 py-4 whitespace-nowrap'>
                        <input
                          type="checkbox"
                          checked={selectedItems.has(lesson.id)}
                          onChange={() => toggleSelectItem(lesson.id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {(() => {
                          const page = pagination?.page || 1;
                          const limit = 10;
                          const totalItems = pagination?.totalItems || lessons.length;
                          const { order } = getSortParams(sortOption);
                          
                          if (order === 'asc') {
                            // For ASC: continuous numbering (1, 2, 3...)
                            return (page - 1) * limit + index + 1;
                          } else {
                            // For DESC: reverse continuous numbering 
                            return totalItems - ((page - 1) * limit + index);
                          }
                        })()}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0 h-10 w-10 rounded-md bg-gray-200 overflow-hidden flex items-center justify-center'>
                            <PlayCircleIcon className='h-6 w-6 text-gray-400' />
                          </div>
                          <div className='ml-4'>
                            <div className='text-sm font-medium text-gray-900'>{formatLessonTitle(lesson.title)}</div>
                            <div className='text-sm text-gray-500'>ID: {lesson.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {lessonCourse?.title || 
                           (lesson.courseId ? `Course ID: ${lesson.courseId}` : 'No Course')}
                        </div>
                        {lesson.chapterName && (
                          <div className='text-xs text-gray-500'>{lesson.chapterName}</div>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {lesson.order || 0}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {formatDuration(lesson.duration)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className={getStatusBadgeClass(lesson.status)}>
                          {formatStatus(lesson.status)}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <div className='flex space-x-2 justify-end'>
                          <Link
                            href={`/admin/lessons/${lesson.id}/edit`}
                            className='text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 rounded-md p-1.5 transition-colors duration-150 admin-button'
                            aria-label='Edit lesson'
                          >
                            <PencilSquareIcon className='h-5 w-5' />
                          </Link>
                          
                          {confirmDelete === lesson.id.toString() ? (
                            <div className='flex items-center space-x-2'>
                              <button
                                onClick={() => handleDeleteConfirm(lesson.id.toString())}
                                className='text-red-600 hover:text-red-800 font-medium bg-red-50 px-2 py-1 rounded admin-button'
                                disabled={deleteLessonMutation.isPending}
                              >
                                {deleteLessonMutation.isPending ? 'Deleting...' : 'Confirm'}
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className='text-gray-600 hover:text-gray-800 bg-gray-50 px-2 py-1 rounded admin-button'
                                disabled={deleteLessonMutation.isPending}
                              >
                                Cancel
                              </button>
                            </div>
                          ) :
                            <button 
                              onClick={() => setConfirmDelete(lesson.id.toString())}
                              className='text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded-md p-1.5 transition-colors duration-150 admin-button'
                              aria-label='Delete lesson'
                            >
                              <TrashIcon className='h-5 w-5' />
                            </button>
                          }
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          
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
    </div>
  );
}