'use client';

import { FC } from 'react';
import { 
  PlayIcon,
  DocumentIcon,
  AcademicCapIcon,
  ClockIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { Course } from '@/shared/types/courses';
import { useLessonsQuery } from '@/client/hooks/lessons';
import { useQuizQuery } from '@/client/hooks/quiz';
import { useCourseMaterialsQuery } from '@/client/hooks/courses/useCourseMaterialsQuery';
import { LoadingState } from '@/client/components/common';

interface CoursePreviewTabProps {
  course: Course;
}

const CoursePreviewTab: FC<CoursePreviewTabProps> = ({ course }) => {
  
  // Get course content for preview
  const { useGetLessons } = useLessonsQuery();
  const { useGetQuizzes } = useQuizQuery();
  const { useGetCourseMaterials } = useCourseMaterialsQuery(course.id);
  
  const { data: lessons = [], isLoading: lessonsLoading } = useGetLessons(course.id);
  const { data: quizzes = [], isLoading: quizzesLoading } = useGetQuizzes({ courseId: course.id });
  const { data: materialsData, isLoading: materialsLoading } = useGetCourseMaterials();
  
  // Safely extract materials array
  const materials = Array.isArray(materialsData) ? materialsData : [];
  
  const isLoading = lessonsLoading || quizzesLoading || materialsLoading;
  
  if (isLoading) {
    return <LoadingState variant="section" message="Loading course preview..." />;
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'No limit';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const renderAdminReview = () => (
    <div className="space-y-6">
      {/* Course Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Course Information Summary</h3>
        
        {/* Basic Info */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">Basic Information</h4>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Title:</span>
                <p className="text-sm text-gray-900">{course.title || 'Not set'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Level:</span>
                <p className="text-sm text-gray-900 capitalize">{course.level || 'Not set'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Price:</span>
                <p className="text-sm text-gray-900">${course.price || 0}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <p className="text-sm text-gray-900 capitalize">{course.status || 'draft'}</p>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Description:</span>
              <p className="text-sm text-gray-900 mt-1">{course.description || 'No description'}</p>
            </div>
            {course.topics && course.topics.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-600">Topics:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {course.topics.map((topic, index) => (
                    <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Statistics */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">Content Statistics</h4>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <PlayIcon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-blue-600">{lessons.length}</p>
              <p className="text-xs text-blue-900">Lessons</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <AcademicCapIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-green-600">{quizzes.length}</p>
              <p className="text-xs text-green-900">Quizzes</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <DocumentIcon className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-orange-600">{materials.length}</p>
              <p className="text-xs text-orange-900">Materials</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <ClockIcon className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-purple-600">
                {formatDuration(
                  Array.isArray(lessons) 
                    ? lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0)
                    : 0
                )}
              </p>
              <p className="text-xs text-purple-900">Duration</p>
            </div>
          </div>
        </div>

        {/* Publishing Readiness */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">Publishing Readiness</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Course title and description</span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  course.title && course.description ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {course.title && course.description ? '✓' : '✗'}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">At least one lesson created</span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  lessons.length > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {lessons.length > 0 ? '✓' : '✗'}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Pricing configured</span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  course.price !== undefined ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {course.price !== undefined ? '✓' : '!'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lessons List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Lessons ({lessons.length})</h4>
          {lessons.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {lessons.map((lesson, index) => (
                <div key={lesson.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700 truncate">{lesson.title}</span>
                  </div>
                  <span className="text-xs text-gray-500">{formatDuration(lesson.duration)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No lessons created yet</p>
          )}
        </div>

        {/* Materials & Quizzes List */}
        <div className="space-y-6">
          {/* Quizzes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Quizzes ({quizzes.length})</h4>
            {quizzes.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700 truncate">{quiz.title}</span>
                    <span className="text-xs text-gray-500">{quiz._count?.questions || 0}q</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">No quizzes created yet</p>
            )}
          </div>

          {/* Materials */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Materials ({materials.length})</h4>
            {materials.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {materials.map((material) => (
                  <div key={material.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <DocumentIcon className="h-4 w-4 text-orange-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{material.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">No materials uploaded yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Course Review</h2>
          <p className="text-gray-600">
            Review all course content and settings before publishing
          </p>
        </div>
      </div>

      {/* Admin Review Content */}
      {renderAdminReview()}
    </div>
  );
};

export default CoursePreviewTab;