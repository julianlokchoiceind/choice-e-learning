'use client';

import { useState, useEffect } from 'react';
import { 
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Quiz, Question, QuizAnswers } from '@/shared/types/quiz';

interface QuizTakingInterfaceProps {
  quiz: Quiz;
  questions: Question[];
  onSubmit: (answers: QuizAnswers, timeSpent: number) => Promise<void>;
  onSaveProgress?: (answers: QuizAnswers, timeSpent: number) => Promise<void>;
}

export const QuizTakingInterface: React.FC<QuizTakingInterfaceProps> = ({
  quiz,
  questions,
  onSubmit,
  onSaveProgress
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const hasTimeLimit = quiz.timeLimit && quiz.timeLimit > 0;
  const timeRemaining = hasTimeLimit ? (quiz.timeLimit! * 60) - timeSpent : null;

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
      setTimeSpent(elapsed);
      
      // Auto-submit when time runs out
      if (hasTimeLimit && elapsed >= quiz.timeLimit! * 60) {
        handleSubmit();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, quiz.timeLimit, hasTimeLimit]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!onSaveProgress) return;
    
    const autoSave = setInterval(() => {
      onSaveProgress(answers, timeSpent);
    }, 30000);

    return () => clearInterval(autoSave);
  }, [answers, timeSpent, onSaveProgress]);

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    const questionStartTime = Date.now();
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        answer,
        timeSpent: Math.floor((questionStartTime - startTime.getTime()) / 1000)
      }
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(answers, timeSpent);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const renderQuestion = (question: Question) => {
    const userAnswer = answers[question.id]?.answer;

    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label
                key={index}
                className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={userAnswer === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-0 border-gray-300"
                />
                <span className="text-sm text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'true_false':
        return (
          <div className="space-y-3">
            {['True', 'False'].map((option) => (
              <label
                key={option}
                className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={userAnswer === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-0 border-gray-300"
                />
                <span className="text-sm text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'short_answer':
        return (
          <textarea
            value={userAnswer as string || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer here..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-blue-500"
          />
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  if (showConfirmSubmit) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <ExclamationTriangleIcon className="h-8 w-8 text-amber-500" />
          <h2 className="text-xl font-semibold text-gray-900">Submit Quiz?</h2>
        </div>
        
        <div className="space-y-4 mb-6">
          <p className="text-gray-600">
            Are you sure you want to submit your quiz? Once submitted, you cannot make changes.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Questions answered:</span>
              <span className="font-medium">{getAnsweredCount()} of {totalQuestions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Time spent:</span>
              <span className="font-medium">{formatTime(timeSpent)}</span>
            </div>
            {hasTimeLimit && timeRemaining && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Time remaining:</span>
                <span className={`font-medium ${timeRemaining < 300 ? 'text-red-600' : ''}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setShowConfirmSubmit(false)}
            className="flex-1 btn-admin-secondary"
          >
            Continue Quiz
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 btn-admin-primary"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-gray-600 mt-1">{quiz.description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-6">
            {hasTimeLimit && timeRemaining && (
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-5 w-5 text-gray-500" />
                <span className={`font-medium ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
            
            <div className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 rounded-full h-2 transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {currentQuestion.title}
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
              </span>
            </div>
            
            <div className="prose prose-sm max-w-none text-gray-700 mb-6">
              {currentQuestion.content}
            </div>
          </div>
          
          {renderQuestion(currentQuestion)}
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              <span>Previous</span>
            </button>
            
            {!isLastQuestion ? (
              <button
                onClick={handleNextQuestion}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
              >
                <span>Next</span>
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700"
              >
                <CheckCircleIcon className="h-4 w-4" />
                <span>Submit Quiz</span>
              </button>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            {getAnsweredCount()} of {totalQuestions} answered
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTakingInterface;