import React from 'react';
import { 
  BookOpenIcon, 
  ArrowLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
}

interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  modules: CourseModule[];
}

interface CourseProgress {
  currentLesson: string;
  completedLessons: string[];
  progress: number;
}

export interface CourseCurriculumSidebarProps {
  course: Course;
  currentModule: number;
  currentLesson: number;
  progress: CourseProgress | null;
  navigateToLesson: (moduleIndex: number, lessonIndex: number) => void;
}

export const CourseCurriculumSidebar: React.FC<CourseCurriculumSidebarProps> = ({
  course,
  currentModule,
  currentLesson,
  progress,
  navigateToLesson,
}) => {
  const modules = course?.modules || [];
  
  return (
    <div className="h-full overflow-y-auto">
      <div className='p-6'>
        <h2 className='text-xl font-bold mb-6'>Nội dung khóa học</h2>
        
        {/* Progress indicator */}
        {progress && (
          <div className='mb-6'>
            <div className='flex items-center justify-between mb-1'>
              <span className='text-sm text-gray-600'>Tiến độ học tập</span>
              <span className='text-sm font-medium'>{progress.progress}%</span>
            </div>
            <div className='w-full h-2 bg-gray-200 rounded-full overflow-hidden'>
              <div
                className='h-full bg-indigo-600 rounded-full'
                style={{ width: `${progress.progress || 0}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Module list */}
        <div className='space-y-4'>
          {modules.map((module, moduleIndex) => (
            <div key={module.id} className='border border-gray-200 rounded-lg overflow-hidden'>
              <div className={`p-4 ${moduleIndex === currentModule ? 'bg-indigo-50' : 'bg-gray-50'} border-b border-gray-200`}>
                <h3 className={`font-medium ${moduleIndex === currentModule ? 'text-indigo-700' : 'text-gray-700'}`}>
                  Chương {moduleIndex + 1}: {module.title}
                </h3>
              </div>
              <div className='divide-y divide-gray-200'>
                {module.lessons.map((lesson, lessonIndex) => {
                  const isActive = moduleIndex === currentModule && lessonIndex === currentLesson;
                  const isCompleted = progress?.completedLessons?.includes(lesson.id) || lesson.completed;
                  
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => navigateToLesson(moduleIndex, lessonIndex)}
                      className={`w-full text-left p-4 flex items-start hover:bg-gray-50 ${
                        isActive ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className='flex-shrink-0 mt-0.5 mr-3'>
                        {isCompleted ? (
                          <CheckCircleSolid className='w-5 h-5 text-green-500' />
                        ) : isActive ? (
                          <div className='w-5 h-5 rounded-full bg-indigo-500'></div>
                        ) : (
                          <div className='w-5 h-5 rounded-full border-2 border-gray-300'></div>
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm ${
                            isActive ? 'font-medium text-indigo-700' : isCompleted ? 'text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {lesson.title}
                        </p>
                        <p className='text-xs text-gray-500 mt-1 flex items-center'>
                          {lesson.duration}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 