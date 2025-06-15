'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { CourseFormTabs, CurriculumTab, BasicInfoTab } from '@/client/components/admin/courses';
import { LoadingState, StatusBadge, LastSavedIndicator } from '@/client/components/common';
import { useCoursesQuery } from '@/client/hooks/courses';
import { useNavigationGuard } from '@/client/hooks/common/useNavigationGuard';
import { isFormDirty } from '@/client/utils/form-utils';
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
  const { useGetCourse, useUpdateCourse, useUpdateCurriculum } = useCoursesQuery(true); // isAdmin = true
  const { data: courseData, isLoading, error } = useGetCourse(params.courseId);
  const updateCourseMutation = useUpdateCourse();
  const updateCurriculumMutation = useUpdateCurriculum();
  
  const [activeTab, setActiveTab] = useState('basicInfo');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Navigation guard
  const { navigateWithConfirmation } = useNavigationGuard({
    hasUnsavedChanges,
    message: 'Bạn có thay đổi chưa được lưu. Bạn có chắc muốn rời khỏi trang này?'
  });
  
  // Form values
  const [values, setValues] = useState<FormValues>({
    title: '',
    description: '',
    price: '0.00',
    level: 'beginner',
    topics: [],
    imageUrl: ''
  });
  
  const [initialValues, setInitialValues] = useState<FormValues>({
    title: '',
    description: '',
    price: '0.00',
    level: 'beginner',
    topics: [],
    imageUrl: ''
  });
  
  
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
      const newFormValues = {
        title: isNewCourse ? '' : courseData.title || '',
        description: isNewCourse ? '' : courseData.description || '',
        price: String(courseData.price || 0),
        level: courseData.level || 'beginner',
        topics: courseData.topics || [],
        imageUrl: courseData.imageUrl || ''
      };
      
      setValues(newFormValues);
      setInitialValues(newFormValues);
      
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
    const newValues = { ...values, [name]: value };
    setValues(newValues);
    
    // Check if form is dirty with smart detection
    const isDirty = isFormDirty(newValues, initialValues);
    setHasUnsavedChanges(isDirty);
  };
  
  // Handle image upload
  const handleImageUpload = (url: string) => {
    const newValues = { ...values, imageUrl: url };
    setValues(newValues);
    
    // Check if form is dirty with smart detection
    const isDirty = isFormDirty(newValues, initialValues);
    setHasUnsavedChanges(isDirty);
  };
  
  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  // Handle topics change
  const handleTopicsChange = (topics: string[]) => {
    const newValues = { ...values, topics };
    setValues(newValues);
    
    // Check if form is dirty with smart detection
    const isDirty = isFormDirty(newValues, initialValues);
    setHasUnsavedChanges(isDirty);
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
      
      // Update last saved timestamp and reset dirty state
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
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
      
      // Reset dirty state after successful save
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      setInitialValues(values);
      
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
      <button
        onClick={() => navigateWithConfirmation('/admin/courses')}
        className="back-to-link"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Courses
      </button>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
          <StatusBadge status="draft" size="sm" />
          <LastSavedIndicator lastSaved={lastSaved} />
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600 font-medium">
              • Unsaved changes
            </span>
          )}
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
            <button
              onClick={() => navigateWithConfirmation('/admin/courses')}
              className="flex items-center text-gray-600 hover:text-gray-800 py-2.5 px-6 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
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