'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { CourseFormTabs, DraftStatusBadge, CurriculumTab, BasicInfoTab } from '@/client/components/admin/courses';
import { LoadingState, AutoSaveIndicator } from '@/client/components/common';
import { useCoursesQuery } from '@/client/hooks/courses';
import { useAutoSave } from '@/client/hooks/common';
import { Chapter, CourseStatus } from '@/shared/types/courses/course';

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
  
  // Use React Query hooks
  const { useGetCourse, useUpdateCourse, useUpdateCourseSilent, useUpdateCurriculum } = useCoursesQuery(true); // isAdmin = true
  const { data: courseData, isLoading, error } = useGetCourse(params.courseId);
  const updateCourseMutation = useUpdateCourse();
  const updateCourseSilentMutation = useUpdateCourseSilent();
  const updateCurriculumMutation = useUpdateCurriculum();
  
  const [activeTab, setActiveTab] = useState('basicInfo');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Form values
  const [values, setValues] = useState<FormValues>({
    title: '',
    description: '',
    price: '0.00',
    level: 'beginner',
    topics: [],
    imageUrl: ''
  });
  
  // Auto-save configuration
  const { triggerSave, isSaving, lastSaved: autoSaveLastSaved, error: autoSaveError } = useAutoSave({
    onSave: async (data) => {
      const formData = {
        title: data.title || 'Untitled Course',
        description: data.description || '',
        price: parseFloat(data.price) || 0,
        level: data.level,
        topics: data.topics,
        imageUrl: data.imageUrl || ''
      };
      
      await updateCourseSilentMutation.mutateAsync({
        id: params.courseId,
        data: formData
      });
      
      setHasChanges(false);
    },
    delay: 2000, // 2 seconds
    enabled: hasChanges,
    onError: (error) => {
      console.error('Auto-save failed:', error);
      toast.error('Failed to auto-save changes');
    }
  });
  
  // Trigger auto-save when form values change
  useEffect(() => {
    if (hasChanges) {
      triggerSave(values);
    }
  }, [values, hasChanges, triggerSave]);
  
  // Fix for cursor flickering only
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .tab-container button {
        cursor: pointer !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Update form values when course data is loaded
  useEffect(() => {
    if (courseData) {
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
      
      if (courseData.updatedAt) {
        setLastSaved(new Date(courseData.updatedAt));
      }
    }
  }, [courseData]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
    setHasChanges(true);
  };
  
  // Handle image upload
  const handleImageUpload = (url: string) => {
    setValues(prev => ({ ...prev, imageUrl: url }));
    setHasChanges(true);
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
  const handleUpdateCurriculum = async (apiChapters: any[], apiLessons: any[]) => {
    try {
      // Save to database with cleaned API data
      await updateCurriculumMutation.mutateAsync({
        courseId: params.courseId,
        chapters: apiChapters,
        lessons: apiLessons
      });
      
      // Update last saved timestamp
      setLastSaved(new Date());
      
      // Refresh course data to get updated chapters with real IDs
      // This will update the local state with actual data from the server
    } catch (error: any) {
      // Error handling is done by the mutation meta
    }
  };
  
  // Handle update draft
  const handleUpdateDraft = async () => {
    try {
      // Prepare data for API - only basic course fields
      const courseData = {
        title: values.title.trim(),
        description: values.description.trim(),
        price: parseFloat(values.price) || 0,
        level: values.level,
        topics: values.topics,
        imageUrl: values.imageUrl,
        status: CourseStatus.DRAFT,
      };
      
      await updateCourseMutation.mutateAsync({
        id: params.courseId,
        data: courseData
      });
      
      setLastSaved(new Date());
      
      // Remove manual toast - QueryProvider will handle it via mutation meta
    } catch (error: any) {
      // Error is handled by the mutation meta in useCoursesQuery
    }
  };
  
  // Handle form submission (publish)
  const handlePublish = async () => {
    try {
      // Enhanced validation
      if (!values.title || !values.description) {
        toast.error('Please fill in required fields: title and description');
        return;
      }
      
      // Validate description length
      if (values.description.length < 10) {
        toast.error('Description must be at least 10 characters');
        return;
      }
      
      // Validate chapters and lessons for published courses
      if (chapters.length === 0) {
        toast.error('At least one chapter is required for publishing');
        setActiveTab('curriculum');
        return;
      }
      
      if (lessons.length === 0) {
        toast.error('At least one lesson is required for publishing');
        setActiveTab('curriculum');
        return;
      }
      
      // Prepare data for API - only basic course fields  
      const courseData = {
        title: values.title,
        description: values.description,
        price: parseFloat(values.price) || 0,
        level: values.level,
        topics: values.topics,
        imageUrl: values.imageUrl,
        status: CourseStatus.PUBLISHED,
      };
      
      await updateCourseMutation.mutateAsync({
        id: params.courseId,
        data: courseData
      });
      
      router.push('/admin/courses');
    } catch (error: any) {
      // Error is handled by the mutation meta in useCoursesQuery
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
    return <LoadingState variant="page" message="Loading course data..." />;
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading course data. Please try again.
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
          <DraftStatusBadge />
          <AutoSaveIndicator 
            isSaving={isSaving} 
            lastSaved={autoSaveLastSaved || lastSaved} 
            error={autoSaveError} 
          />
        </div>
        
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleUpdateDraft}
            disabled={updateCourseMutation.isPending}
            className="btn-admin-secondary-lg"
          >
            {updateCourseMutation.isPending ? (
              <LoadingState variant="button" message="Updating..." />
            ) : (
              'Update Draft'
            )}
          </button>
          
          <button
            type="button"
            onClick={handlePublish}
            disabled={updateCourseMutation.isPending}
            className="btn-admin-primary-lg"
          >
            {updateCourseMutation.isPending ? (
              <LoadingState variant="button" message="Publishing..." />
            ) : (
              'Publish Course'
            )}
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
        <div className="flex justify-end items-center mt-6">
          
          <div className="flex space-x-4">
            <Link
              href="/admin/courses"
              className="flex items-center text-gray-600 hover:text-gray-800 py-2.5 px-6 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Back
            </Link>
            {activeTab === 'basicInfo' && (
              <button
                type="button"
                onClick={() => handleTabChange('curriculum')}
                className="btn-admin-primary-lg"
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