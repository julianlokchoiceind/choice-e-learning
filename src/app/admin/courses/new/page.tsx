'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { TopicSelector } from '@/client/components/admin/courses';
import FileUpload from '@/client/components/ui/file/FileUpload';
import { CourseFormTabs, DraftStatusBadge } from '@/client/components/courses';

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
  const [activeTab, setActiveTab] = useState('basic-info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(new Date());
  
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
  
  // Handle form submission (publish)
  const handlePublish = async () => {
    setIsSubmitting(true);
    
    try {
      // Validation
      if (!values.title || !values.description) {
        alert('Please fill in required fields');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare data for API
      const courseData = {
        title: values.title,
        description: values.description,
        price: parseFloat(values.price) || 0,
        level: values.level,
        topics: values.topics,
        imageUrl: values.imageUrl || 'https://via.placeholder.com/800x400',
        status: 'published',
        // Add minimal required lesson for API
        lessons: [
          {
            title: 'Introduction',
            order: 1,
            videoUrl: 'https://www.youtube.com/watch?v=placeholder',
      description: '',
      resources: []
          }
        ]
      };
      
      // Send data to API
      const apiClient = (await import('@/client/utils/http/api-client')).default;
      const response = await apiClient.post('/api/courses', courseData);
      
      if (response.data.success) {
        router.push('/admin/courses');
    } else {
        throw new Error(response.data.error || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Error creating course: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
        imageUrl: values.imageUrl || 'https://via.placeholder.com/800x400',
        status: 'draft',
        // Add minimal required lesson for API
        lessons: [
          {
          title: 'Introduction',
          order: 1,
          videoUrl: 'https://www.youtube.com/watch?v=placeholder',
          description: '',
          resources: []
          }
        ]
      };
      
      // Send data to API
      const apiClient = (await import('@/client/utils/http/api-client')).default;
      const response = await apiClient.post('/api/courses', courseData);
      
      if (response.data.success) {
        setLastSaved(new Date());
        alert('Draft saved successfully');
      } else {
        throw new Error(response.data.error || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Error saving draft: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render basic info tab content
  const renderBasicInfoTab = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Course Information</h2>
      
      <div className="space-y-6">
        {/* Title and Description - Full width */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Course Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={values.title}
            onChange={handleChange}
            placeholder="e.g., Introduction to Web Development"
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={values.description}
            onChange={handleChange}
            placeholder="Write a short overview of what this course covers..."
            rows={4}
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Two-column layout with improved spacing and alignment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Image
              </label>
              <FileUpload 
                onImageUpload={handleImageUpload}
                type="course-cover"
                className="h-48"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={values.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <select
                  id="level"
                  name="level"
                  value={values.level}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="all">All Levels</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Right Column - Topics aligned with Course Image */}
          <div>
            <div className="h-full">
              <TopicSelector 
                selectedTopics={values.topics}
                onChange={handleTopicsChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
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
          {activeTab === 'basic-info' && renderBasicInfoTab()}
          
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