'use client';

import { useState } from 'react';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { LoadingState } from '@/client/components/common';
import { useQuizQuery } from '@/client/hooks/quiz';
import { Quiz } from '@/shared/types/quiz';

interface QuizListProps {
  courseId?: string;
  onCreateQuiz?: () => void;
  onEditQuiz?: (quiz: Quiz) => void;
}

export const QuizList: React.FC<QuizListProps> = ({
  courseId,
  onCreateQuiz,
  onEditQuiz
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuizzes, setSelectedQuizzes] = useState<string[]>([]);
  
  const { useGetQuizzes, useDeleteQuiz, useBulkDeleteQuizzes } = useQuizQuery();
  const { data: quizzes = [], isLoading, error } = useGetQuizzes(courseId ? { courseId } : undefined);
  const deleteQuiz = useDeleteQuiz();
  const bulkDeleteQuizzes = useBulkDeleteQuizzes();
  
  // Ensure quizzes is always an array and filter based on search term
  const quizzesArray = Array.isArray(quizzes) ? quizzes : [];
  const filteredQuizzes = quizzesArray.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSelectQuiz = (quizId: string) => {
    setSelectedQuizzes(prev => 
      prev.includes(quizId) 
        ? prev.filter(id => id !== quizId)
        : [...prev, quizId]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedQuizzes.length === filteredQuizzes.length) {
      setSelectedQuizzes([]);
    } else {
      setSelectedQuizzes(filteredQuizzes.map(quiz => quiz.id));
    }
  };
  
  const handleDelete = async (quizId: string) => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        await deleteQuiz.mutateAsync(quizId);
        setSelectedQuizzes(prev => prev.filter(id => id !== quizId));
      } catch (error) {
        console.error('Error deleting quiz:', error);
      }
    }
  };
  
  const handleBulkDelete = async () => {
    if (selectedQuizzes.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedQuizzes.length} quiz(es)? This action cannot be undone.`)) {
      try {
        await bulkDeleteQuizzes.mutateAsync(selectedQuizzes);
        setSelectedQuizzes([]);
      } catch (error) {
        console.error('Error bulk deleting quizzes:', error);
      }
    }
  };
  
  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'No time limit';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (isLoading) {
    return <LoadingState variant="section" message="Loading quizzes..." />;
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
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {courseId ? 'Course Quizzes' : 'All Quizzes'}
            </h2>
            <p className="text-gray-600">
              Manage quiz assessments and track student performance
            </p>
          </div>
          {onCreateQuiz && (
            <button
              onClick={onCreateQuiz}
              className="btn-admin-primary"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Quiz
            </button>
          )}
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AcademicCapIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">Total Quizzes</p>
                <p className="text-lg font-bold text-blue-600">{quizzesArray.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">✓</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">Active</p>
                <p className="text-lg font-bold text-green-600">
                  {quizzesArray.filter(q => q.isActive).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <QuestionMarkCircleIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-900">Total Questions</p>
                <p className="text-lg font-bold text-orange-600">
                  {quizzesArray.reduce((total, quiz) => total + (quiz._count?.questions || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-900">Avg. Time Limit</p>
                <p className="text-lg font-bold text-purple-600">
                  {quizzesArray.length > 0 
                    ? formatDuration(Math.round(
                        quizzesArray
                          .filter(q => q.timeLimit)
                          .reduce((sum, q) => sum + (q.timeLimit || 0), 0) / 
                        Math.max(quizzesArray.filter(q => q.timeLimit).length, 1)
                      ))
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-0 focus:border-blue-500"
          />
        </div>
        
        {selectedQuizzes.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {selectedQuizzes.length} quiz(es) selected
            </span>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteQuizzes.isPending}
              className="btn-admin-danger-sm"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Quiz List */}
      {filteredQuizzes.length === 0 ? (
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
          {!searchTerm && onCreateQuiz && (
            <button onClick={onCreateQuiz} className="btn-admin-primary">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Quiz
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                <input
                  type="checkbox"
                  checked={selectedQuizzes.length === filteredQuizzes.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-0 border-gray-300 rounded"
                />
              </div>
              <div className="grid grid-cols-12 gap-4 flex-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-1">STT</div>
                <div className="col-span-4">Quiz Title</div>
                <div className="col-span-2">Course</div>
                <div className="col-span-1">Questions</div>
                <div className="col-span-1">Time Limit</div>
                <div className="col-span-1">Pass Score</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {filteredQuizzes.map((quiz, index) => (
              <div key={quiz.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="flex items-center mr-4">
                    <input
                      type="checkbox"
                      checked={selectedQuizzes.includes(quiz.id)}
                      onChange={() => handleSelectQuiz(quiz.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-0 border-gray-300 rounded"
                    />
                  </div>
                  <div className="grid grid-cols-12 gap-4 flex-1 items-center">
                    {/* STT */}
                    <div className="col-span-1">
                      <span className="text-sm font-medium text-gray-900">
                        {index + 1}
                      </span>
                    </div>

                    {/* Quiz Title */}
                    <div className="col-span-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <AcademicCapIcon className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {quiz.title}
                          </p>
                          {quiz.description && (
                            <p className="text-sm text-gray-500 truncate">
                              {quiz.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Course */}
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">
                        {quiz.course?.title || 'No course'}
                      </span>
                    </div>

                    {/* Questions Count */}
                    <div className="col-span-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <QuestionMarkCircleIcon className="h-4 w-4 mr-1" />
                        {quiz._count?.questions || 0}
                      </div>
                    </div>

                    {/* Time Limit */}
                    <div className="col-span-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {formatDuration(quiz.timeLimit)}
                      </div>
                    </div>

                    {/* Pass Score */}
                    <div className="col-span-1">
                      <span className="text-sm text-gray-900">
                        {quiz.passingScore}%
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        quiz.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {quiz.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1">
                      <div className="flex items-center space-x-2">
                        {onEditQuiz && (
                          <button
                            onClick={() => onEditQuiz(quiz)}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                            title="Edit quiz"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(quiz.id)}
                          disabled={deleteQuiz.isPending}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                          title="Delete quiz"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizList;