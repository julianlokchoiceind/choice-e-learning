'use client';

import { useRouter } from 'next/navigation';
import { QuizForm } from '@/client/components/admin/quiz';
import { useQuizQuery } from '@/client/hooks/quiz';
import { CreateQuizData } from '@/shared/types/quiz';

export default function NewQuizPage() {
  const router = useRouter();
  const { useCreateQuiz } = useQuizQuery();
  const createQuiz = useCreateQuiz();

  const handleSubmit = async (data: CreateQuizData) => {
    try {
      const newQuiz = await createQuiz.mutateAsync(data);
      router.push(`/admin/quizzes/${newQuiz.id}/edit`);
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };

  const handleCancel = () => {
    router.push('/admin/quizzes');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Quiz</h1>
          <p className="text-gray-600">Set up a new assessment for your students</p>
        </div>
        <button
          onClick={handleCancel}
          className="btn-admin-secondary"
        >
          Cancel
        </button>
      </div>
      
      <QuizForm
        isNew
        onSubmit={handleSubmit}
        isLoading={createQuiz.isPending}
      />
    </div>
  );
}