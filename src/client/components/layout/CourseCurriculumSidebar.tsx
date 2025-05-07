import React from 'react';

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

export interface CourseCurriculumSidebarProps {
  modules: CourseModule[];
  currentModule: number;
  currentLesson: number;
  onSelectLesson: (moduleIndex: number, lessonIndex: number) => void;
  isCollapsed: boolean;
}

export const CourseCurriculumSidebar: React.FC<CourseCurriculumSidebarProps> = ({
  modules,
  currentModule,
  currentLesson,
  onSelectLesson,
  isCollapsed,
}) => {
  return (
    <div
      className={`bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto transition-all duration-300 ${
        isCollapsed ? 'w-0' : 'w-full sm:w-80'
      }`}
    >
      <div className='p-6'>
        <h2 className='text-xl font-bold mb-4'>Course Content</h2>
        <div className='space-y-4'>
          {modules.map((module, moduleIndex) => (
            <div key={module.id} className='border border-gray-200 rounded-lg overflow-hidden'>
              <div className='bg-gray-50 p-4 border-b border-gray-200'>
                <h3 className='font-medium'>
                  Module {moduleIndex + 1}: {module.title}
                </h3>
              </div>
              <div className='divide-y divide-gray-200'>
                {module.lessons.map((lesson, lessonIndex) => (
                  <button
                    key={lesson.id}
                    onClick={() => onSelectLesson(moduleIndex, lessonIndex)}
                    className={`w-full text-left p-4 flex items-start hover:bg-gray-50 ${
                      moduleIndex === currentModule && lessonIndex === currentLesson
                        ? 'bg-blue-50'
                        : ''
                    }`}
                  >
                    <div className='flex-shrink-0 mt-0.5 mr-3'>
                      {lesson.completed ? (
                        <span className='inline-block w-5 h-5 bg-green-500 rounded-full'></span>
                      ) : moduleIndex === currentModule && lessonIndex === currentLesson ? (
                        <span className='inline-block w-5 h-5 bg-blue-500 rounded-full'></span>
                      ) : (
                        <span className='inline-block w-5 h-5 bg-gray-400 rounded-full'></span>
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-sm ${
                          moduleIndex === currentModule && lessonIndex === currentLesson
                            ? 'font-medium text-blue-600'
                            : 'text-gray-700'
                        }`}
                      >
                        {lesson.title}
                      </p>
                      <p className='text-xs text-gray-500 mt-1 flex items-center'>
                        {lesson.duration}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 