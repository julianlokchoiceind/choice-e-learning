'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  AcademicCapIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { LoadingState, StatusBadge, SelectAllCheckbox, BulkDeleteButton } from '@/client/components/common';
import { useQuizQuery } from '@/client/hooks/quiz';
import { useSelection } from '@/client/hooks/common';
import { Quiz } from '@/shared/types/quiz';

export default function QuizzesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'course'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Build filters object for server-side filtering - consistent with other modules
  const filters = useMemo(() => ({
    search: searchTerm || undefined,
    status: statusFilter,
    page: currentPage,
    limit: 10,
    sortBy: sortBy === 'newest' ? 'createdAt' : sortBy === 'oldest' ? 'createdAt' : sortBy,
    sortOrder: (sortBy === 'newest' ? 'desc' : sortBy === 'oldest' ? 'asc' : 'asc') as 'asc' | 'desc'
  }), [searchTerm, statusFilter, currentPage, sortBy]);
  
  const { useGetQuizzes, useDeleteQuiz, useBulkDeleteQuizzes } = useQuizQuery(true); // isAdmin = true
  const { data: quizzes = [], isLoading, error } = useGetQuizzes(filters);
  const deleteQuiz = useDeleteQuiz();
  const bulkDeleteQuizzes = useBulkDeleteQuizzes();
  
  // Ensure quizzes is always an array
  const quizzesArray = Array.isArray(quizzes) ? quizzes : [];
  
  // No client-side filtering needed - server handles it
  const filteredAndSortedQuizzes = quizzesArray;

  // Selection management
  const { selectedItems, selectAll, toggleSelectItem, clearSelection } = useSelection<string>();

  const handleSelectAll = () => {
    selectAll(filteredAndSortedQuizzes.map(quiz => quiz.id));
  };

  const handleDelete = async (quizId: string) => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        await deleteQuiz.mutateAsync(quizId);
        clearSelection();
      } catch (error) {
        console.error('Error deleting quiz:', error);
      }
    }
  };

  const handleBulkDelete = async (items: string[]) => {
    try {
      await bulkDeleteQuizzes.mutateAsync(items);
      clearSelection();
    } catch (error) {
      console.error('Error bulk deleting quizzes:', error);
      throw error; // Re-throw to let BulkDeleteButton handle the UI
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'No limit';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (isLoading) {
    return <LoadingState variant="table" message="Loading quizzes..." />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Failed to load quizzes</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-admin-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div className='flex items-center mb-6'>
          <AcademicCapIcon className='h-7 w-7 text-indigo-600 mr-3' />
          <h1 className='text-2xl font-bold text-gray-800'>Quizzes Management</h1>
        </div>
        <div className='flex items-center gap-3'>
          {selectedItems.size > 0 && (
            <BulkDeleteButton
              selectedItems={selectedItems}
              onDelete={handleBulkDelete}
              itemLabel="quiz"
            />
          )}
          <Link href='/admin/quizzes/new' className='btn-admin-primary'>
            <PlusIcon className='h-5 w-5 mr-1' />
            Add New Quiz
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden'>
        <div className='p-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4'>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <MagnifyingGlassIcon className='h-5 w-5 text-gray-400' />
            </div>
            <input 
              type='text' 
              placeholder='Search quizzes...' 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='py-2 pl-10 pr-4 block w-full sm:w-80 border border-gray-300 rounded-md focus:ring-0 focus:border-[var(--color-primary)] outline-none'
            />
          </div>
          <div className='flex items-center space-x-2'>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className='px-3 py-2 border border-gray-300 rounded-md focus:ring-0 focus:border-[var(--color-primary)] outline-none'
            >
              <option value='all'>All Status</option>
              <option value='active'>Active</option>
              <option value='inactive'>Inactive</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title' | 'course')}
              className='px-3 py-2 border border-gray-300 rounded-md focus:ring-0 focus:border-[var(--color-primary)] outline-none'
            >
              <option value='newest'>Newest First</option>
              <option value='oldest'>Oldest First</option>
              <option value='title'>Title A-Z</option>
              <option value='course'>Course A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden'>
        {filteredAndSortedQuizzes.length === 0 ? (
          <div className="text-center py-12">
            <AcademicCapIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No quizzes found' : 'No quizzes yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Create your first quiz to assess student knowledge'}
            </p>
            {!searchTerm && (
              <Link href="/admin/quizzes/new" className="btn-admin-primary">
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Quiz
              </Link>
            )}
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left'>
                    <SelectAllCheckbox
                      isAllSelected={selectedItems.size === filteredAndSortedQuizzes.length}
                      isIndeterminate={selectedItems.size > 0 && selectedItems.size < filteredAndSortedQuizzes.length}
                      onToggleAll={handleSelectAll}
                    />
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-[var(--color-primary-dark)] uppercase tracking-wider'>
                    STT
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-[var(--color-primary-dark)] uppercase tracking-wider'>
                    Quiz Title
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-[var(--color-primary-dark)] uppercase tracking-wider'>
                    Course
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-[var(--color-primary-dark)] uppercase tracking-wider'>
                    Questions
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-[var(--color-primary-dark)] uppercase tracking-wider'>
                    Time Limit
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-[var(--color-primary-dark)] uppercase tracking-wider'>
                    Pass Score
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-[var(--color-primary-dark)] uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-[var(--color-primary-dark)] uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredAndSortedQuizzes.map((quiz, index) => (
                  <tr key={quiz.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4'>
                      <input
                        type='checkbox'
                        checked={selectedItems.has(quiz.id)}
                        onChange={() => toggleSelectItem(quiz.id)}
                        className='h-4 w-4 text-indigo-600 focus:ring-0 border-gray-300 rounded'
                      />
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {index + 1}
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-start space-x-3'>
                        <div className='flex-shrink-0'>
                          <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                            <AcademicCapIcon className='h-5 w-5 text-blue-600' />
                          </div>
                        </div>
                        <div className='min-w-0 flex-1'>
                          <p className='text-sm font-medium text-gray-900'>
                            {quiz.title}
                          </p>
                          {quiz.description && (
                            <p className='text-sm text-gray-500 truncate'>
                              {quiz.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {quiz.course?.title || 'No course'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center text-sm text-gray-900'>
                        <QuestionMarkCircleIcon className='h-4 w-4 mr-1 text-gray-400' />
                        {quiz._count?.questions || 0}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center text-sm text-gray-900'>
                        <ClockIcon className='h-4 w-4 mr-1 text-gray-400' />
                        {formatDuration(quiz.timeLimit)}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center text-sm text-gray-900'>
                        <ChartBarIcon className='h-4 w-4 mr-1 text-gray-400' />
                        {quiz.passingScore}%
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <StatusBadge 
                        status={quiz.isActive ? 'active' : 'inactive'} 
                        size='sm' 
                      />
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <div className='flex space-x-2'>
                        <Link
                          href={`/admin/quizzes/${quiz.id}/edit`}
                          className='text-indigo-600 hover:text-indigo-900'
                        >
                          <PencilIcon className='h-4 w-4' />
                        </Link>
                        <button
                          onClick={() => handleDelete(quiz.id)}
                          disabled={deleteQuiz.isPending}
                          className='text-red-600 hover:text-red-900'
                        >
                          <TrashIcon className='h-4 w-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results info */}
      {filteredAndSortedQuizzes.length > 0 && (
        <div className='flex justify-between items-center text-sm text-gray-700'>
          <span>
            Showing {filteredAndSortedQuizzes.length} of {quizzesArray.length} quizzes
          </span>
          {selectedItems.size > 0 && (
            <span>
              {selectedItems.size} quiz(es) selected
            </span>
          )}
        </div>
      )}
    </div>
  );
}