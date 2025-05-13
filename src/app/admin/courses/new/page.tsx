'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { TopicSelector, CourseFormTabs, DraftStatusBadge, CurriculumTab, BasicInfoTab } from '@/client/components/admin/courses';
import FileUpload from '@/client/components/ui/file/FileUpload';
import { Chapter } from '@/shared/types/courses/course';

interface FormValues {
  title: string;
  description: string;
  price: string;
  level: string;
  topics: string[];
  imageUrl: string;
}

export default function NewCoursePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basicInfo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(new Date());
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
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
    setLastSaved(new Date());
  };
  
  // Handle image upload
  const handleImageUpload = (url: string) => {
    setValues(prev => ({ ...prev, imageUrl: url }));
    setLastSaved(new Date());
  };
  
  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  // Handle topics change
  const handleTopicsChange = (topics: string[]) => {
    setValues({ ...values, topics });
    setLastSaved(new Date());
  };
  
  // Handle curriculum updates
  const handleUpdateCurriculum = (updatedChapters: Chapter[], updatedLessons: any[]) => {
    setChapters(updatedChapters);
    setLessons(updatedLessons);
    setLastSaved(new Date());
  };
  
  // Handle form submission (publish)
  const handlePublish = async () => {
    setIsSubmitting(true);
    
    try {
      // Enhanced validation
      if (!values.title || !values.description) {
        alert('Please fill in required fields: title and description');
        setIsSubmitting(false);
        return;
      }
      
      // Validate description length
      if (values.description.length < 10) {
        alert('Description must be at least 10 characters');
        setIsSubmitting(false);
        return;
      }
      
      // Validate chapters and lessons for published courses
      if (chapters.length === 0) {
        alert('At least one chapter is required for publishing');
        setIsSubmitting(false);
        setActiveTab('curriculum');
        return;
      }
      
      if (lessons.length === 0) {
        alert('At least one lesson is required for publishing');
        setIsSubmitting(false);
        setActiveTab('curriculum');
        return;
      }
      
      // Prepare data for API
      const courseData = {
        title: values.title,
        description: values.description,
        price: parseFloat(values.price) || 0,
        level: values.level,
        topics: values.topics,
        imageUrl: values.imageUrl || '/images/placeholder-course.jpg',
        status: 'published',
        chapters: chapters.map(chapter => ({
          title: chapter.title,
          description: chapter.description || '',
          order: chapter.order
        })),
        lessons: lessons.map(lesson => ({
          title: lesson.title,
          description: lesson.content || '',
          videoUrl: lesson.videoUrl || 'https://www.youtube.com/watch?v=placeholder',
          order: lesson.order,
          chapterId: lesson.chapterId,
          resources: lesson.resources || []
        }))
      };
      
      console.log('Publishing course with data:', JSON.stringify(courseData, null, 2));
      
      // Send data to API
      const apiClient = (await import('@/client/utils/http/api-client')).default;
      try {
        const response = await apiClient.post('/api/admin/courses', courseData);
        
        if (response.data.success) {
          router.push('/admin/courses');
        } else {
          throw new Error(response.data.error || 'Failed to create course');
        }
      } catch (apiError: any) {
        console.error('API Error:', apiError);
        
        // Handle validation errors from the server
        if (apiError.response && apiError.response.data) {
          const errorData = apiError.response.data;
          if (errorData.details) {
            alert(`Validation error: ${errorData.message || JSON.stringify(errorData.details)}`);
          } else {
            alert(`Server error: ${errorData.message || errorData.error || 'Unknown error'}`);
          }
        } else {
          throw apiError;
        }
      }
    } catch (error: any) {
      console.error('Error creating course:', error);
      alert('Error creating course: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle save draft
  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare data for API
      const courseData = {
        title: values.title || 'Untitled Course',
        description: values.description || 'No description',
        price: parseFloat(values.price) || 0,
        level: values.level,
        topics: values.topics,
        imageUrl: values.imageUrl || '/images/placeholder-course.jpg',
        status: 'draft',
        chapters: chapters.map(chapter => ({
          title: chapter.title,
          description: chapter.description || '',
          order: chapter.order
        })),
        lessons: lessons.length > 0 ? lessons.map(lesson => ({
          title: lesson.title,
          description: lesson.content || '',
          videoUrl: lesson.videoUrl || 'https://www.youtube.com/watch?v=placeholder',
          order: lesson.order,
          chapterId: lesson.chapterId,
          resources: lesson.resources || []
        })) : [
          {
            title: 'Introduction',
            order: 1,
            videoUrl: 'https://www.youtube.com/watch?v=placeholder',
            description: '',
            resources: []
          }
        ]
      };
      
      console.log('Saving draft with data:', JSON.stringify(courseData, null, 2));
      
      // Send data to API
      const apiClient = (await import('@/client/utils/http/api-client')).default;
      try {
        const response = await apiClient.post('/api/admin/courses', courseData);
        
        if (response.data.success) {
          setLastSaved(new Date());
          alert('Draft saved successfully');
        } else {
          throw new Error(response.data.error || 'Failed to save draft');
        }
      } catch (apiError: any) {
        console.error('API Error:', apiError);
        
        // Handle validation errors from the server
        if (apiError.response && apiError.response.data) {
          const errorData = apiError.response.data;
          if (errorData.details) {
            alert(`Validation error: ${errorData.message || JSON.stringify(errorData.details)}`);
          } else {
            alert(`Server error: ${errorData.message || errorData.error || 'Unknown error'}`);
          }
        } else {
          throw apiError;
        }
      }
    } catch (error: any) {
      console.error('Error saving draft:', error);
      alert('Error saving draft: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render curriculum tab
  const renderCurriculumTab = () => (
    <CurriculumTab
      initialChapters={chapters}
      onUpdateCurriculum={handleUpdateCurriculum}
    />
  );
  
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
            <DraftStatusBadge />
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Save Draft
            </button>
            
            <button
              type="button"
              onClick={handlePublish}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-70"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Course'}
            </button>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div className="mb-6">
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
                  Last saved: Just now
                </span>
              )}
            </div>
            
            <div className="flex space-x-4">
              <Link
                href="/admin/courses"
                className="flex items-center text-gray-600 hover:text-gray-800 py-2.5 px-6 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back
              </Link>
              
              <button
                type="button"
                onClick={() => handleTabChange('curriculum')}
                className="flex items-center bg-blue-500 hover:bg-blue-600 text-white py-2.5 px-8 rounded-md transition-colors"
              >
                Next
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}