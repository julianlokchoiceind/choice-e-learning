'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CourseFormTabs, DraftStatusBadge, CurriculumTab, BasicInfoTab } from '@/client/components/admin/courses';
import { Chapter } from '@/shared/types/courses/course';

interface FormValues {
  title: string;
  description: string;
  price: string;
  level: string;
  topics: string[];
  imageUrl: string;
}

export default function EditCoursePage({ params }: { params: { courseId: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basicInfo');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  
  // Form values
  const [values, setValues] = useState<FormValues>({
    title: '',
    description: '',
    price: '0.00',
    level: 'beginner',
    topics: [],
    imageUrl: ''
  });
  
  // Add CSS for consistent button styling with other admin pages but avoid pointer issues
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .admin-button {
        transition: background-color 0.2s ease-in-out !important;
        position: relative;
        z-index: 5;
      }
      .admin-button:hover {
        box-shadow: none !important;
        background-color: var(--hover-color, inherit);
      }
      /* Fix for cursor flickering */
      .tab-container button {
        cursor: pointer !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Fetch course data on component mount
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const apiClient = (await import('@/client/utils/http/api-client')).default;
        const response = await apiClient.get(`/api/admin/courses/${params.courseId}`);
        
        if (response.data.success) {
          const courseData = response.data.data;
          
          // Check if this is a newly created course with default values
          const isNewCourse = courseData.title === 'Untitled Course' && 
                             courseData.description === 'Course description...';
          
          // Update form values - for new courses, we'll use empty strings to allow placeholders to show
          setValues({
            title: isNewCourse ? '' : courseData.title || '',
            description: isNewCourse ? '' : courseData.description || '',
            price: String(courseData.price || 0),
            level: courseData.level || 'beginner',
            topics: courseData.topics || [],
            imageUrl: courseData.imageUrl || ''
          });
          
          if (courseData.chapters) {
            setChapters(courseData.chapters);
          }
          
          if (courseData.lessons) {
            setLessons(courseData.lessons);
          }
          
          setLastSaved(new Date(courseData.updatedAt));
        } else {
          throw new Error('Failed to fetch course data');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        alert('Error loading course data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourse();
  }, [params.courseId]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };
  
  // Handle image upload
  const handleImageUpload = (url: string) => {
    setValues(prev => ({ ...prev, imageUrl: url }));
  };
  
  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  // Handle topics change
  const handleTopicsChange = (topics: string[]) => {
    setValues({ ...values, topics });
  };
  
  // Handle curriculum updates
  const handleUpdateCurriculum = (updatedChapters: Chapter[], updatedLessons: any[]) => {
    setChapters(updatedChapters);
    setLessons(updatedLessons);
  };
  
  // Handle update draft
  const handleUpdateDraft = async () => {
    setIsUpdating(true);
    
    try {
      // Prepare data for API - let backend handle defaults
      const courseData = {
        title: values.title.trim(),
        description: values.description.trim(),
        price: parseFloat(values.price) || 0,
        level: values.level,
        topics: values.topics,
        imageUrl: values.imageUrl,
        status: 'draft',
        chapters: chapters.map(chapter => ({
          title: chapter.title,
          description: chapter.description || '',
          order: chapter.order
        })),
        lessons: lessons.length > 0 ? lessons.map(lesson => ({
          title: lesson.title,
          description: lesson.content || '',
          videoUrl: lesson.videoUrl,
          order: lesson.order,
          chapterId: lesson.chapterId,
          resources: lesson.resources || []
        })) : []
      };
      
      // Send data to API
      const apiClient = (await import('@/client/utils/http/api-client')).default;
      const response = await apiClient.put(`/api/admin/courses/${params.courseId}`, courseData);
      
      if (response.data.success) {
        setLastSaved(new Date());
        alert('Course updated successfully');
      } else {
        throw new Error(response.data.error || 'Failed to update course');
      }
    } catch (error: any) {
      console.error('Error updating course:', error);
      alert('Error updating course: ' + (error.message || 'Unknown error'));
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle form submission (publish)
  const handlePublish = async () => {
    setIsPublishing(true);
    
    try {
      // Enhanced validation
      if (!values.title || !values.description) {
        alert('Please fill in required fields: title and description');
        setIsPublishing(false);
        return;
      }
      
      // Validate description length
      if (values.description.length < 10) {
        alert('Description must be at least 10 characters');
        setIsPublishing(false);
        return;
      }
      
      // Validate chapters and lessons for published courses
      if (chapters.length === 0) {
        alert('At least one chapter is required for publishing');
        setIsPublishing(false);
        setActiveTab('curriculum');
        return;
      }
      
      if (lessons.length === 0) {
        alert('At least one lesson is required for publishing');
        setIsPublishing(false);
        setActiveTab('curriculum');
        return;
      }
      
      // Prepare data for API - let backend handle defaults
      const courseData = {
        title: values.title,
        description: values.description,
        price: parseFloat(values.price) || 0,
        level: values.level,
        topics: values.topics,
        imageUrl: values.imageUrl,
        status: 'published',
        chapters: chapters.map(chapter => ({
          title: chapter.title,
          description: chapter.description || '',
          order: chapter.order
        })),
        lessons: lessons.map(lesson => ({
          title: lesson.title,
          description: lesson.content || '',
          videoUrl: lesson.videoUrl,
          order: lesson.order,
          chapterId: lesson.chapterId,
          resources: lesson.resources || []
        }))
      };
      
      // Send data to API
      const apiClient = (await import('@/client/utils/http/api-client')).default;
      const response = await apiClient.put(`/api/admin/courses/${params.courseId}`, courseData);
      
      if (response.data.success) {
        router.push('/admin/courses');
      } else {
        throw new Error(response.data.error || 'Failed to update course');
      }
    } catch (error: any) {
      console.error('Error publishing course:', error);
      alert('Error publishing course: ' + (error.message || 'Unknown error'));
    } finally {
      setIsPublishing(false);
    }
  };
  
  // Render curriculum tab
  const renderCurriculumTab = () => (
    <CurriculumTab
      initialChapters={chapters}
      onUpdateCurriculum={handleUpdateCurriculum}
    />
  );
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-4 text-gray-600">Loading course data...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
          <DraftStatusBadge />
        </div>
        
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleUpdateDraft}
            disabled={isUpdating || isPublishing}
            className="px-6 py-2.5 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-70 admin-button"
          >
            {isUpdating ? 'Updating...' : 'Update Draft'}
          </button>
          
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing || isUpdating}
            className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-70 admin-button"
          >
            {isPublishing ? 'Publishing...' : 'Publish Course'}
          </button>
        </div>
      </div>
      
      {/* Tabs Navigation */}
      <div className="mb-6 tab-container">
        <CourseFormTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
      
      {/* Tab Content */}
      <div>
        {activeTab === 'basicInfo' && (
          <BasicInfoTab 
            values={values} 
            handleChange={handleChange} 
            handleImageUpload={handleImageUpload} 
            handleTopicsChange={handleTopicsChange} 
          />
        )}
        {activeTab === 'curriculum' && renderCurriculumTab()}
        
        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6">
          <div>
            {lastSaved && (
              <span className="text-sm text-gray-500">
                Last saved: {lastSaved.toLocaleString()}
              </span>
            )}
          </div>
          
          <div className="flex space-x-4">
            <Link
              href="/admin/courses"
              className="flex items-center text-gray-600 hover:text-gray-800 py-2.5 px-6 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors admin-button"
            >
              Back
            </Link>
            {activeTab === 'basicInfo' && (
              <button
                type="button"
                onClick={() => handleTabChange('curriculum')}
                className="flex items-center bg-blue-500 hover:bg-blue-600 text-white py-2.5 px-8 rounded-md transition-colors admin-button"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}