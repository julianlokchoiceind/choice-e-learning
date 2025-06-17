'use client';

import { useParams, useRouter } from 'next/navigation';
import { GuardedFormPage } from '@/client/components/admin';
import { QuizForm } from '@/client/components/admin/quiz';
import { useQuizQuery } from '@/client/hooks/quiz';
import { UpdateQuizData } from '@/shared/types/quiz';
import { useState } from 'react';

export default function EditQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;
  const [currentFormData, setCurrentFormData] = useState<any>(null);
  
  const { useGetQuiz, useUpdateQuiz } = useQuizQuery();
  const { data: quiz, isLoading, error } = useGetQuiz(quizId);
  const updateQuiz = useUpdateQuiz();
  
  const handleSave = async () => {
    if (!quiz) return;
    
    // Extract only the fields that can be updated
    const dataToSave: UpdateQuizData = currentFormData ? {
      title: currentFormData.title,
      description: currentFormData.description || undefined,
      timeLimit: currentFormData.timeLimit > 0 ? currentFormData.timeLimit : undefined,
      passingScore: currentFormData.passingScore,
      maxAttempts: currentFormData.maxAttempts,
      order: currentFormData.order,
      isActive: currentFormData.isActive
    } : {
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
      order: quiz.order,
      isActive: quiz.isActive
    };
    
    await updateQuiz.mutateAsync({
      id: quizId,
      data: dataToSave
    });
  };

  const handleManageQuestions = () => {
    router.push(`/admin/quizzes/${quizId}/questions`);
  };

  return (
    <GuardedFormPage
      backHref="/admin/quizzes"
      backText="Back to Quizzes"
      title="Edit Quiz"
      status={quiz?.isActive ? 'active' : 'inactive'}
      isLoading={isLoading}
      error={error}
      notFoundTitle="Quiz Not Found"
      notFoundMessage="The quiz you're looking for doesn't exist or has been deleted."
      data={quiz}
      onFormChange={(data, isDirty) => {
        setCurrentFormData(data);
      }}
      onSave={handleSave}
      isSaving={updateQuiz.isPending}
    >
      {(handleFormChange: any) => 
        quiz ? (
          <div className="space-y-6">
            <QuizForm 
              quiz={quiz} 
              onFormChange={handleFormChange}
            />
            
            {/* Questions Management Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Quiz Questions</h3>
                  <p className="text-gray-600">
                    Manage questions for this quiz
                  </p>
                </div>
                <button
                  onClick={handleManageQuestions}
                  className="btn-admin-primary"
                >
                  Manage Questions
                </button>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Questions:</span>
                  <span className="font-medium">{quiz._count?.questions || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ) : null
      }
    </GuardedFormPage>
  );
}