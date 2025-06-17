'use client';

import React, { useState, useEffect } from 'react';
import { 
  AcademicCapIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Quiz, CreateQuizData, UpdateQuizData } from '@/shared/types/quiz';
import { LoadingState } from '@/client/components/common';
import { useCoursesQuery } from '@/client/hooks/courses';
import { isFormDirty } from '@/client/utils/form-utils';

interface QuizFormProps {
  quiz?: Quiz;
  isNew?: boolean;
  onFormChange?: (data: any, isDirty?: boolean) => void;
  onSubmit?: (data: any) => Promise<void>; // Use any for flexibility in different contexts
  isLoading?: boolean;
}

export const QuizForm: React.FC<QuizFormProps> = ({ 
  quiz, 
  isNew = false,
  onFormChange,
  onSubmit,
  isLoading: isSubmitting = false
}) => {
  // Initialize form data
  const initialFormData = {
    title: quiz?.title || '',
    description: quiz?.description || '',
    courseId: quiz?.courseId || '',
    timeLimit: quiz?.timeLimit || 0,
    passingScore: quiz?.passingScore || 70,
    maxAttempts: quiz?.maxAttempts || 3,
    order: quiz?.order || 1,
    isActive: quiz?.isActive ?? true
  };
  
  const [formData, setFormData] = useState(initialFormData);
  const [initialFormDataRef, setInitialFormDataRef] = useState(initialFormData);
  // Get courses data
  const { useGetCourses } = useCoursesQuery(true);
  const { data: coursesData, isLoading: coursesLoading } = useGetCourses();
  const courses = coursesData?.data || [];
  
  // Update form data when quiz prop changes
  useEffect(() => {
    if (quiz) {
      const newFormData = {
        title: quiz.title || '',
        description: quiz.description || '',
        courseId: quiz.courseId || '',
        timeLimit: quiz.timeLimit || 0,
        passingScore: quiz.passingScore || 70,
        maxAttempts: quiz.maxAttempts || 3,
        order: quiz.order || 1,
        isActive: quiz.isActive ?? true
      };
      setFormData(newFormData);
      setInitialFormDataRef(newFormData);
    }
  }, [quiz]);
  

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    const newFormData = {
      ...formData,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : newValue
    };
    setFormData(newFormData);
    
    // Check if form is dirty
    const isDirty = isFormDirty(newFormData, initialFormDataRef);
    
    // Notify parent of changes
    if (onFormChange) {
      onFormChange(newFormData, isDirty);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;
    
    const dataToSubmit = {
      title: formData.title,
      description: formData.description || undefined,
      courseId: formData.courseId,
      timeLimit: formData.timeLimit > 0 ? formData.timeLimit : undefined,
      passingScore: formData.passingScore,
      maxAttempts: formData.maxAttempts,
      order: formData.order,
      ...(isNew ? {} : { isActive: formData.isActive })
    };
    
    await onSubmit(dataToSubmit);
  };

  if (coursesLoading) {
    return <LoadingState variant="section" message="Loading form data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quiz Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title *
              </label>
              <div className="relative">
                <AcademicCapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="pl-10 block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:border-blue-500"
                  placeholder="Enter quiz title"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:border-blue-500"
                placeholder="Brief description of the quiz content and objectives"
              />
            </div>

            {/* Course and Lesson Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-2">
                  Course *
                </label>
                <div className="relative">
                  <select
                    id="courseId"
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-0 focus:border-blue-500 cursor-pointer"
                    required
                  >
                    <option value="">Select course</option>
                    {courses.map((course: any) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

            </div>

            {/* Quiz Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit (minutes)
                </label>
                <div className="relative">
                  <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    id="timeLimit"
                    name="timeLimit"
                    value={formData.timeLimit}
                    onChange={handleInputChange}
                    className="pl-10 block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:border-blue-500"
                    placeholder="0 = No limit"
                    min="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">0 = No time limit</p>
              </div>

              <div>
                <label htmlFor="passingScore" className="block text-sm font-medium text-gray-700 mb-2">
                  Passing Score (%)
                </label>
                <div className="relative">
                  <ChartBarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    id="passingScore"
                    name="passingScore"
                    value={formData.passingScore}
                    onChange={handleInputChange}
                    className="pl-10 block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:border-blue-500"
                    placeholder="70"
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="maxAttempts" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Attempts
                </label>
                <div className="relative">
                  <ArrowPathIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    id="maxAttempts"
                    name="maxAttempts"
                    value={formData.maxAttempts}
                    onChange={handleInputChange}
                    className="pl-10 block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:border-blue-500"
                    placeholder="3"
                    min="1"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Order and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  id="order"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:border-blue-500"
                  placeholder="1"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">Display order in course</p>
              </div>

              {!isNew && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-0 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Only active quizzes are visible to students
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button (only when onFormChange is not provided) */}
            {!onFormChange && (
              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-admin-primary-lg"
                >
                  {isSubmitting ? 'Saving...' : isNew ? 'Create Quiz' : 'Update Quiz'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuizForm;