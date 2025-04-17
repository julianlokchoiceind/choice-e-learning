"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  CheckCircleIcon, 
  PlayCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  ClockIcon,
  DocumentTextIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  content?: string;
  completed: boolean;
}

interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CourseProgress {
  currentLesson: string;
  completedLessons: string[];
  progress: number;
}

export default function CourseLearnPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState<{
    title: string;
    description: string;
    modules: CourseModule[];
  } | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [currentModule, setCurrentModule] = useState<number>(0);
  const [currentLesson, setCurrentLesson] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Check if user is enrolled in this course
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!session?.user) {
        router.push(`/login?callbackUrl=/courses/${courseId}/learn`);
        return;
      }
      
      try {
        // Fetch enrollment status
        const response = await fetch(`/api/users/me/courses`);
        const data = await response.json();
        
        if (!data.success || !data.courses.some((c: any) => c.id === courseId)) {
          // If not enrolled, redirect to course detail page
          router.push(`/courses/${courseId}`);
          return;
        }
        
        // Fetch course data and progress
        await fetchCourseData();
        await fetchProgress();
      } catch (err) {
        setError('Failed to check enrollment status');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    checkEnrollment();
  }, [courseId, session, router]);
  
  // Fetch course data
  const fetchCourseData = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/content`);
      const data = await response.json();
      
      if (data.success) {
        setCourseData(data.course);
      } else {
        setError(data.error || 'Failed to fetch course content');
      }
    } catch (err) {
      setError('An error occurred while fetching course data');
      console.error(err);
    }
  };
  
  // Fetch user progress
  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/progress`);
      const data = await response.json();
      
      if (data.success) {
        setProgress(data.progress);
        
        // Find current module and lesson indices
        if (data.progress.currentLesson) {
          let foundModule = -1;
          let foundLesson = -1;
          
          for (let i = 0; i < (courseData?.modules?.length || 0); i++) {
            const lessonIndex = courseData?.modules[i].lessons.findIndex(l => l.id === data.progress.currentLesson);
            if (lessonIndex !== undefined && lessonIndex !== -1) {
              foundModule = i;
              foundLesson = lessonIndex;
              break;
            }
          }
          
          if (foundModule !== -1 && foundLesson !== -1) {
            setCurrentModule(foundModule);
            setCurrentLesson(foundLesson);
          }
        }
      } else {
        console.error(data.error || 'Failed to fetch progress');
      }
    } catch (err) {
      console.error('An error occurred while fetching progress', err);
    }
  };
  
  // Mark lesson as completed
  const markLessonAsCompleted = async () => {
    if (!courseData) return;
    
    const currentLessonId = courseData.modules[currentModule].lessons[currentLesson].id;
    
    try {
      const response = await fetch(`/api/courses/${courseId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: currentLessonId, completed: true })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local progress state
        const updatedModules = [...courseData.modules];
        updatedModules[currentModule].lessons[currentLesson].completed = true;
        setCourseData({ ...courseData, modules: updatedModules });
        
        // Update progress
        await fetchProgress();
      }
    } catch (err) {
      console.error('Failed to mark lesson as completed', err);
    }
  };
  
  // Navigate to next lesson
  const goToNextLesson = () => {
    if (!courseData) return;
    
    // First try to go to the next lesson in the current module
    if (currentLesson < courseData.modules[currentModule].lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
    } 
    // Otherwise go to the first lesson of the next module
    else if (currentModule < courseData.modules.length - 1) {
      setCurrentModule(currentModule + 1);
      setCurrentLesson(0);
    }
    
    // Auto scroll to top
    window.scrollTo(0, 0);
  };
  
  // Navigate to previous lesson
  const goToPreviousLesson = () => {
    if (!courseData) return;
    
    // First try to go to the previous lesson in the current module
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1);
    } 
    // Otherwise go to the last lesson of the previous module
    else if (currentModule > 0) {
      setCurrentModule(currentModule - 1);
      setCurrentLesson(courseData.modules[currentModule - 1].lessons.length - 1);
    }
    
    // Auto scroll to top
    window.scrollTo(0, 0);
  };
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };
  
  // Navigate to specific lesson
  const navigateToLesson = (moduleIndex: number, lessonIndex: number) => {
    setCurrentModule(moduleIndex);
    setCurrentLesson(lessonIndex);
    // On mobile, collapse sidebar after selecting
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
    // Auto scroll to top
    window.scrollTo(0, 0);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Error state
  if (error || !courseData) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || 'Failed to load course content'}</p>
          <Link href={`/courses/${courseId}`} className="mt-4 inline-block text-blue-600 hover:underline">
            ← Back to Course Overview
          </Link>
        </div>
      </div>
    );
  }
  
  // Get current lesson data
  const currentLessonData = courseData.modules[currentModule].lessons[currentLesson];
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top navigation bar */}
      <header className="bg-white shadow-sm border-b border-gray-200 py-4 px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <Link href={`/courses/${courseId}`} className="text-gray-500 hover:text-gray-700 mr-4">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold truncate max-w-[200px] sm:max-w-md">
            {courseData.title}
          </h1>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 hidden sm:inline-block mr-4">
            {progress ? `${progress.progress}% Complete` : '0% Complete'}
          </span>
          <div className="bg-gray-200 rounded-full h-2 w-24 sm:w-40">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${progress?.progress || 0}%` }}
            ></div>
          </div>
        </div>
      </header>
      
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (curriculum) */}
        <div 
          className={`bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto transition-all duration-300 ${
            isSidebarCollapsed ? 'w-0' : 'w-full sm:w-80'
          }`}
        >
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Course Content</h2>
            
            {/* Modules and lessons */}
            <div className="space-y-4">
              {courseData.modules.map((module, moduleIndex) => (
                <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <h3 className="font-medium">
                      Module {moduleIndex + 1}: {module.title}
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <button
                        key={lesson.id}
                        onClick={() => navigateToLesson(moduleIndex, lessonIndex)}
                        className={`w-full text-left p-4 flex items-start hover:bg-gray-50 ${
                          moduleIndex === currentModule && lessonIndex === currentLesson
                            ? 'bg-blue-50'
                            : ''
                        }`}
                      >
                        <div className="flex-shrink-0 mt-0.5 mr-3">
                          {lesson.completed ? (
                            <CheckCircleSolid className="h-5 w-5 text-green-500" />
                          ) : moduleIndex === currentModule && lessonIndex === currentLesson ? (
                            <PlayCircleIcon className="h-5 w-5 text-blue-500" />
                          ) : (
                            <PlayCircleIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className={`text-sm ${
                            moduleIndex === currentModule && lessonIndex === currentLesson
                              ? 'font-medium text-blue-600'
                              : 'text-gray-700'
                          }`}>
                            {lesson.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
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
        
        {/* Toggle sidebar button (mobile) */}
        <button 
          onClick={toggleSidebar}
          className="fixed bottom-6 left-6 z-20 sm:hidden bg-blue-600 text-white p-3 rounded-full shadow-lg"
        >
          {isSidebarCollapsed ? (
            <BookOpenIcon className="h-6 w-6" />
          ) : (
            <ArrowLeftIcon className="h-6 w-6" />
          )}
        </button>
        
        {/* Lesson content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-24">
            {/* Lesson header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                {currentLessonData.title}
              </h2>
              <div className="flex items-center text-sm text-gray-500 mb-6">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>{currentLessonData.duration}</span>
              </div>
              
              {/* Video placeholder */}
              {currentLessonData.videoUrl && (
                <div className="aspect-video bg-gray-900 rounded-xl mb-8 overflow-hidden">
                  <iframe 
                    src={currentLessonData.videoUrl}
                    className="w-full h-full" 
                    title={currentLessonData.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
            
            {/* Lesson content */}
            <div className="prose max-w-none mb-16">
              {/* This would be the lesson content, coming from an API or CMS */}
              <p>
                {currentLessonData.content || 'Lesson content will be displayed here. This content can include text, images, code examples, and other interactive elements.'}
              </p>
              
              {/* Example content */}
              <h3>Learning Objectives</h3>
              <ul>
                <li>Understand core concepts related to this lesson</li>
                <li>Apply practical skills in real-world scenarios</li>
                <li>Complete exercises to reinforce learning</li>
              </ul>
              
              <h3>Key Points</h3>
              <p>
                This section would contain the main educational content for the lesson,
                with detailed explanations, examples, and illustrations.
              </p>
              
              <div className="bg-gray-100 p-4 rounded-lg my-6">
                <h4 className="font-medium text-gray-900">Note</h4>
                <p className="text-gray-700">
                  Important information or tips would be highlighted in blocks like this.
                </p>
              </div>
            </div>
            
            {/* Lesson navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
              <div className="max-w-3xl mx-auto flex items-center justify-between">
                <button
                  onClick={goToPreviousLesson}
                  disabled={currentModule === 0 && currentLesson === 0}
                  className={`flex items-center ${
                    currentModule === 0 && currentLesson === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Previous
                </button>
                
                <button 
                  onClick={markLessonAsCompleted}
                  className={`px-6 py-2 rounded-md ${
                    currentLessonData.completed 
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  disabled={currentLessonData.completed}
                >
                  {currentLessonData.completed ? (
                    <span className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Completed
                    </span>
                  ) : (
                    'Mark as Completed'
                  )}
                </button>
                
                <button
                  onClick={goToNextLesson}
                  disabled={currentModule === courseData.modules.length - 1 && 
                    currentLesson === courseData.modules[currentModule].lessons.length - 1}
                  className={`flex items-center ${
                    currentModule === courseData.modules.length - 1 && 
                    currentLesson === courseData.modules[currentModule].lessons.length - 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Next
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}