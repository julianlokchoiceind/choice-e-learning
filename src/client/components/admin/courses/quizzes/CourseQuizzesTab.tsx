'use client';

import { useState } from 'react';
import { 
  AcademicCapIcon,
  PlusIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { LoadingState } from '@/client/components/common';
import { QuizForm } from '@/client/components/admin/quiz';
import { useQuizQuery } from '@/client/hooks/quiz';
import { Quiz, CreateQuizData, UpdateQuizData } from '@/shared/types/quiz';

interface CourseQuizzesTabProps {
  courseId: string;
  courseTitle?: string;
  onChangesDetected?: (hasChanges: boolean) => void;
}

export const CourseQuizzesTab: React.FC<CourseQuizzesTabProps> = ({
  courseId,
  courseTitle,
  onChangesDetected
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  
  const { 
    useGetQuizzes, 
    useCreateQuiz, 
    useUpdateQuiz, 
    useDeleteQuiz 
  } = useQuizQuery(true); // isAdmin = true
  
  const { data: quizzes = [], isLoading, error } = useGetQuizzes({ courseId });
  
  // Ensure quizzes is always an array
  const quizzesArray = Array.isArray(quizzes) ? quizzes : [];
  const createQuiz = useCreateQuiz();
  const updateQuiz = useUpdateQuiz();
  const deleteQuiz = useDeleteQuiz();
  
  const handleCreateQuiz = () => {
    setEditingQuiz(null);
    setShowCreateForm(true);
  };
  
  const handleEditQuiz = (quiz: Quiz) => {
    setShowCreateForm(false);
    setEditingQuiz(quiz);
  };
  
  const handleCloseForm = () => {
    setShowCreateForm(false);
    setEditingQuiz(null);
  };
  
  const handleSubmitCreate = async (data: CreateQuizData) => {
    try {
      await createQuiz.mutateAsync({
        ...data,
        courseId // Ensure courseId is set
      });
      setShowCreateForm(false);
      
      // Notify parent that quiz was created (data saved, no pending changes)
      if (onChangesDetected) {
        onChangesDetected(false);
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };
  
  const handleSubmitUpdate = async (data: UpdateQuizData) => {
    if (!editingQuiz) return;
    
    try {
      await updateQuiz.mutateAsync({
        id: editingQuiz.id,
        data
      });
      setEditingQuiz(null);
      
      // Notify parent that quiz was updated (data saved, no pending changes)
      if (onChangesDetected) {
        onChangesDetected(false);
      }
    } catch (error) {
      console.error('Error updating quiz:', error);
    }
  };
  
  const handleDelete = async (quizId: string) => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        await deleteQuiz.mutateAsync(quizId);
        
        // Notify parent that quiz was deleted (data saved, no pending changes)
        if (onChangesDetected) {
          onChangesDetected(false);
        }
      } catch (error) {
        console.error('Error deleting quiz:', error);
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

  if (showCreateForm) {
    return (
      <div>
        {/* Tab Header */}
        <div className="pb-4 mb-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Quiz</h2>
              <p className="text-gray-600 mt-1">
                Create a new assessment for {courseTitle}
              </p>
            </div>
            <button
              onClick={handleCloseForm}
              className="btn-admin-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div>
          <QuizForm
            isNew
            onSubmit={handleSubmitCreate}
            isLoading={createQuiz.isPending}
          />
        </div>
      </div>
    );
  }

  if (editingQuiz) {
    return (
      <div>
        {/* Tab Header */}
        <div className="pb-4 mb-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Quiz</h2>
              <p className="text-gray-600 mt-1">
                Modify quiz settings for {editingQuiz.title}
              </p>
            </div>
            <button
              onClick={handleCloseForm}
              className="btn-admin-secondary"
            >
              Back to List
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div>
          <QuizForm
            quiz={editingQuiz}
            onSubmit={handleSubmitUpdate}
            isLoading={updateQuiz.isPending}
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState variant="section" message="Loading course quizzes..." />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Failed to load course quizzes</p>
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
    <div>
      {/* Tab Header */}
      <div className="pb-4 mb-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Course Quizzes</h2>
            <p className="text-gray-600 mt-1">
              Manage assessments for this course
            </p>
          </div>
          <button
            onClick={handleCreateQuiz}
            className="btn-admin-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add New Quiz
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Quick Stats */}
        {quizzesArray.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <AcademicCapIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-900">Total Quizzes</p>
                  <p className="text-lg font-bold text-blue-600">{quizzesArray.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">✓</span>
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
                <QuestionMarkCircleIcon className="h-8 w-8 text-orange-600" />
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
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-900">Avg. Pass Score</p>
                  <p className="text-lg font-bold text-purple-600">
                    {quizzesArray.length > 0 
                      ? Math.round(quizzesArray.reduce((sum, q) => sum + q.passingScore, 0) / quizzesArray.length)
                      : 0
                    }%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {quizzesArray.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <AcademicCapIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No quizzes yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first quiz to assess student knowledge for this course
            </p>
            <p className="text-sm text-gray-500">
              Use the "Add New Quiz" button above to get started
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-1">STT</div>
                <div className="col-span-4">Quiz Title</div>
                <div className="col-span-1">Questions</div>
                <div className="col-span-2">Time Limit</div>
                <div className="col-span-2">Pass Score</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {quizzesArray.map((quiz, index) => (
                <div key={quiz.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="grid grid-cols-12 gap-4 items-center">
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
                          <p className="text-sm font-medium text-gray-900">
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

                    {/* Questions Count */}
                    <div className="col-span-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <QuestionMarkCircleIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {quiz._count?.questions || 0}
                      </div>
                    </div>

                    {/* Time Limit */}
                    <div className="col-span-2">
                      <div className="flex items-center text-sm text-gray-900">
                        <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {formatDuration(quiz.timeLimit)}
                      </div>
                    </div>

                    {/* Pass Score */}
                    <div className="col-span-2">
                      <div className="flex items-center text-sm text-gray-900">
                        <ChartBarIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {quiz.passingScore}%
                      </div>
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
                        <button
                          onClick={() => handleEditQuiz(quiz)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          title="Edit quiz"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
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
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseQuizzesTab;