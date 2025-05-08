'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  TrashIcon,
  PencilIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

import { TopicSelector } from '@/client/components/admin/courses';
import FileUpload from '@/client/components/ui/file/FileUpload';

interface CourseFormData {
  title: string;
  description: string;
  price: string;
  level: string;
  topics: string[];
  imageUrl: string;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl: string | null;
  order: number;
  duration?: string;
  resourcesData?: string;
  chapterId?: string | null;
}

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' or 'lessons'

  // Form state
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    price: '0',
    level: 'beginner',
    topics: [],
    imageUrl: ''
  });

  // Lesson state
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);

  // Lesson form state
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    content: '',
    videoUrl: '',
    duration: '',
    resourcesData: '',
  });
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [isLessonFormVisible, setIsLessonFormVisible] = useState(false);

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`Fetching course with ID: ${courseId}`);
        const apiClient = (await import('@/client/utils/http/api-client')).default;
        const response = await apiClient.get(`/api/courses/${courseId}`);
        const data = response.data;
        console.log('Course data response:', data);
        
        if (data.success && data.data) {
          const course = data.data;
          
          // Thêm timestamp vào URL ảnh để tránh cache
          const imageUrl = course.imageUrl || course.image || '';
          const imageUrlWithTimestamp = imageUrl ? `${imageUrl}?t=${Date.now()}` : '';
          
          setFormData({
            title: course.title || '',
            description: course.description || '',
            price: course.price?.toString() || '0',
            level: course.level || 'beginner',
            topics: Array.isArray(course.topics) ? course.topics : course.learningPoints || [],
            imageUrl: imageUrlWithTimestamp
          });
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err: unknown) {
        console.error('Error fetching course:', err);
        setError('Failed to load course data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  // Fetch lessons for the course
  const fetchLessons = async () => {
    try {
      setIsLoadingLessons(true);
      setLessonError(null);
      
      const apiClient = (await import('@/client/utils/http/api-client')).default;
      const response = await apiClient.get(`/api/courses/${courseId}/lessons`);
      const data = response.data;
      
      if (data.success && data.data) {
        setLessons(data.data);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: unknown) {
      console.error('Error fetching lessons:', err);
      setLessonError('Failed to load lessons. Please try again.');
    } finally {
      setIsLoadingLessons(false);
    }
  };

  // Load lessons when component mounts or tab changes to lessons
  useEffect(() => {
    if (courseId && activeTab === 'lessons') {
      fetchLessons();
    }
  }, [courseId, activeTab]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    try {
      // Convert price to number
      const data = {
        ...formData,
        price: parseFloat(formData.price) || 0
      };
      
      console.log(`Updating course ${courseId} with data:`, data);
      const apiClient = (await import('@/client/utils/http/api-client')).default;
      
      const response = await apiClient.put(`/api/courses/${courseId}`, data);
      console.log(`Update course response status: ${response.status}`);
      
      // Read the response data
      const responseData = response.data;
      console.log('Update course response data:', responseData);
      
      if (responseData.success) {
        // Success - redirect back to courses page
        console.log('Course updated successfully, redirecting...');
        
        // Use router.replace to ensure page cache is refreshed
        router.replace('/admin/courses');
      } else {
        console.error('Update failed with success=false:', responseData);
        throw new Error(responseData.error || 'Failed to update course');
      }
      
    } catch (err: unknown) {
      console.error('Error updating course:', err);
      setError((err as Error).message || 'Failed to update course. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle lesson form submission
  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setLessonError(null);
      
      // Add order if creating a new lesson
      const lessonDataToSend = {
        ...lessonFormData,
        order: editingLessonId ? undefined : (lessons.length + 1)
      };
      
      const apiClient = (await import('@/client/utils/http/api-client')).default;
      
      let response;
      if (editingLessonId) {
        response = await apiClient.put(
          `/api/courses/${courseId}/lessons/${editingLessonId}`,
          lessonDataToSend
        );
      } else {
        response = await apiClient.post(
          `/api/courses/${courseId}/lessons`,
          lessonDataToSend
        );
      }
      
      const data = response.data;
      if (!data.success) {
        throw new Error(data.error || `Failed to ${editingLessonId ? 'update' : 'create'} lesson`);
      }
      
      // Reset form and reload lessons
      setLessonFormData({
        title: '',
        content: '',
        videoUrl: '',
        duration: '',
        resourcesData: '',
      });
      setEditingLessonId(null);
      setIsLessonFormVisible(false);
      fetchLessons();
      
    } catch (err: unknown) {
      console.error(`Error ${editingLessonId ? 'updating' : 'creating'} lesson:`, err);
      setLessonError((err as Error).message || `Failed to ${editingLessonId ? 'update' : 'create'} lesson. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle editing a lesson
  const handleEditLesson = (lesson: Lesson) => {
    setLessonFormData({
      title: lesson.title || '',
      content: lesson.content || '',
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration || '',
      resourcesData: lesson.resourcesData || '',
    });
    setEditingLessonId(lesson.id);
    setIsLessonFormVisible(true);
  };

  // Handle deleting a lesson
  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }
    
    try {
      setIsSaving(true);
      setLessonError(null);
      
      const apiClient = (await import('@/client/utils/http/api-client')).default;
      const response = await apiClient.delete(`/api/courses/${courseId}/lessons/${lessonId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete lesson');
      }
      
      // Reload lessons
      fetchLessons();
      
    } catch (err: unknown) {
      console.error('Error deleting lesson:', err);
      setLessonError((err as Error).message || 'Failed to delete lesson. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <div className='animate-pulse text-gray-500'>Loading course data...</div>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-6'>
        <Link 
          href='/admin/courses' 
          className='inline-flex items-center text-gray-600 hover:text-gray-800'
        >
          <ArrowLeftIcon className='h-4 w-4 mr-1' />
          Back to Courses
        </Link>
        <h1 className='text-2xl font-bold text-gray-800 mt-2'>Edit Course</h1>
      </div>
      
      {error && (
        <div className='mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md'>
          {error}
        </div>
      )}
      
      <div className='mb-6 border-b border-gray-200'>
        <ul className='flex flex-wrap -mb-px text-sm font-medium text-center'>
          <li className='mr-2'>
            <button 
              className={`inline-block p-4 border-b-2 ${activeTab === 'basic' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setActiveTab('basic')}
            >
              Basic Information
            </button>
          </li>
          <li className='mr-2'>
            <button 
              className={`inline-block p-4 border-b-2 ${activeTab === 'lessons' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setActiveTab('lessons')}
            >
              Lessons
            </button>
          </li>
        </ul>
      </div>
      
      {activeTab === 'basic' && (
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='space-y-4'>
              <div>
                <label htmlFor='title' className='block text-sm font-medium text-gray-700 mb-1'>
                  Course Title <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  id='title'
                  name='title'
                  value={formData.title}
                  onChange={handleChange}
                  placeholder='Enter course title'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              
              <div>
                <label htmlFor='description' className='block text-sm font-medium text-gray-700 mb-1'>
                  Description <span className='text-red-500'>*</span>
                </label>
                <textarea
                  id='description'
                  name='description'
                  value={formData.description}
                  onChange={handleChange}
                  placeholder='Enter course description'
                  rows={4}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label htmlFor='price' className='block text-sm font-medium text-gray-700 mb-1'>
                    Price ($) <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='number'
                    id='price'
                    name='price'
                    value={formData.price}
                    onChange={handleChange}
                    min='0'
                    step='0.01'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor='level' className='block text-sm font-medium text-gray-700 mb-1'>
                    Level <span className='text-red-500'>*</span>
                  </label>
                  <select
                    id='level'
                    name='level'
                    value={formData.level}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  >
                    <option value='beginner'>Beginner</option>
                    <option value='intermediate'>Intermediate</option>
                    <option value='advanced'>Advanced</option>
                    <option value='all'>All Levels</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Course Image
                </label>
                <FileUpload 
                  currentImageUrl={formData.imageUrl}
                  onImageUpload={(url) => setFormData({...formData, imageUrl: url})}
                  type='course-cover'
                  entityId={courseId}
                />
                <p className='mt-1 text-xs text-gray-500'>
                  Upload a new image or keep the existing one
                </p>
              </div>
              
              <div>
                <TopicSelector
                  selectedTopics={formData.topics}
                  onChange={(topics) => setFormData({...formData, topics})}
                />
              </div>
            </div>
          </div>
          
          <div className='flex justify-end'>
            <Link
              href='/admin/courses'
              className='mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors'
            >
              Cancel
            </Link>
            <button
              type='submit'
              disabled={isSaving}
              className='px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-md flex items-center transition-colors disabled:opacity-70'
            >
              {isSaving ? (
                <>
                  <svg className='animate-spin -ml-1 mr-2 h-4 w-4 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircleIcon className='h-5 w-5 mr-1' />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'lessons' && (
        <div className='space-y-6'>
          {lessonError && (
            <div className='mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md'>
              {lessonError}
            </div>
          )}
          
          {/* Lesson List */}
          <div className='bg-white rounded-lg shadow mb-4'>
            <div className='p-4 border-b flex justify-between items-center'>
              <h3 className='font-medium'>Lessons</h3>
              <button
                type='button'
                onClick={() => {
                  setLessonFormData({
                    title: '',
                    content: '',
                    videoUrl: '',
                    duration: '',
                    resourcesData: '',
                  });
                  setEditingLessonId(null);
                  setIsLessonFormVisible(true);
                }}
                className='px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center'
              >
                <PlusIcon className='h-4 w-4 mr-1' />
                Add Lesson
              </button>
            </div>
            
            {isLoadingLessons ? (
              <div className='p-4 text-center text-gray-500'>Loading lessons...</div>
            ) : lessons.length === 0 ? (
              <div className='p-4 text-center text-gray-500'>No lessons available for this course.</div>
            ) : (
              <ul className='divide-y'>
                {lessons.map((lesson, index) => (
                  <li key={lesson.id} className='p-4 flex justify-between items-center'>
                    <div>
                      <div className='font-medium'>{index + 1}. {lesson.title}</div>
                      <div className='text-sm text-gray-500'>
                        {lesson.duration && `Duration: ${lesson.duration}`}
                      </div>
                    </div>
                    <div className='flex space-x-2'>
                      <button
                        type='button'
                        onClick={() => handleEditLesson(lesson)}
                        className='px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center'
                      >
                        <PencilIcon className='h-3 w-3 mr-1' />
                        Edit
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className='px-3 py-1 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 flex items-center'
                      >
                        <TrashIcon className='h-3 w-3 mr-1' />
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Lesson Form */}
          {isLessonFormVisible && (
            <div className='bg-white rounded-lg shadow p-4'>
              <h3 className='font-medium mb-4'>
                {editingLessonId ? 'Edit Lesson' : 'Add New Lesson'}
              </h3>
              
              <form onSubmit={handleLessonSubmit} className='space-y-4'>
                <div>
                  <label htmlFor='lessonTitle' className='block text-sm font-medium text-gray-700 mb-1'>
                    Lesson Title <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    id='lessonTitle'
                    name='lessonTitle'
                    value={lessonFormData.title}
                    onChange={(e) => setLessonFormData({...lessonFormData, title: e.target.value})}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor='lessonContent' className='block text-sm font-medium text-gray-700 mb-1'>
                    Content <span className='text-red-500'>*</span>
                  </label>
                  <textarea
                    id='lessonContent'
                    name='lessonContent'
                    value={lessonFormData.content}
                    onChange={(e) => setLessonFormData({...lessonFormData, content: e.target.value})}
                    rows={6}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor='videoUrl' className='block text-sm font-medium text-gray-700 mb-1'>
                    Video URL
                  </label>
                  <input
                    type='url'
                    id='videoUrl'
                    name='videoUrl'
                    value={lessonFormData.videoUrl}
                    onChange={(e) => setLessonFormData({...lessonFormData, videoUrl: e.target.value})}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  <p className='mt-1 text-xs text-gray-500'>
                    Enter a YouTube or Vimeo URL
                  </p>
                </div>
                
                <div>
                  <label htmlFor='duration' className='block text-sm font-medium text-gray-700 mb-1'>
                    Duration
                  </label>
                  <input
                    type='text'
                    id='duration'
                    name='duration'
                    value={lessonFormData.duration}
                    onChange={(e) => setLessonFormData({...lessonFormData, duration: e.target.value})}
                    placeholder='e.g., 10 min'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                
                <div>
                  <label htmlFor='resourcesData' className='block text-sm font-medium text-gray-700 mb-1'>
                    Resources (JSON format)
                  </label>
                  <textarea
                    id='resourcesData'
                    name='resourcesData'
                    value={lessonFormData.resourcesData}
                    onChange={(e) => setLessonFormData({...lessonFormData, resourcesData: e.target.value})}
                    rows={3}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='[{"title": "Resource Title", "url": "https://example.com"}]'
                  />
                  <p className='mt-1 text-xs text-gray-500'>
                    Enter resources in JSON format
                  </p>
                </div>
                
                <div className='flex justify-end space-x-3'>
                  <button
                    type='button'
                    onClick={() => setIsLessonFormVisible(false)}
                    className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={isSaving}
                    className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70'
                  >
                    {isSaving ? 'Saving...' : editingLessonId ? 'Update Lesson' : 'Add Lesson'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}