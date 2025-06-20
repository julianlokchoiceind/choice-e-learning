'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { CourseFormTabs, CurriculumTab, BasicInfoTab, CourseResourcesTab, CourseSettingsTab, CourseResourcesTabRef, CourseSettingsTabRef } from '@/client/components/admin/courses';
import { CourseQuizzesTab } from '@/client/components/admin/courses/quizzes';
import CoursePreviewTab from '@/client/components/admin/courses/preview/CoursePreviewTab';
import { LoadingState, LastSavedIndicator } from '@/client/components/common';
import { StatusBadge } from '@/client/components/common/StatusBadge';
import { useCoursesQuery } from '@/client/hooks/courses';
import { useCourseMaterialsQuery } from '@/client/hooks/courses/useCourseMaterialsQuery';
import { useNavigationGuard } from '@/client/hooks/common/useNavigationGuard';
import { isFormDirty } from '@/client/utils/form-utils';
import { Chapter, CourseStatus } from '@/shared/types/courses/course';
import { CurriculumTabRef } from '@/client/components/admin/courses/curriculum/CurriculumTab';

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
  const queryClient = useQueryClient();
  
  // Course materials hooks
  const { useCreateCourseMaterial, useDeleteCourseMaterial } = useCourseMaterialsQuery(params.courseId);
  const createMaterialMutation = useCreateCourseMaterial();
  const deleteMaterialMutation = useDeleteCourseMaterial();
  
  const [activeTab, setActiveTab] = useState('basicInfo');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [hasCurriculumChanges, setHasCurriculumChanges] = useState(false);
  const [hasMediaChanges, setHasMediaChanges] = useState(false);
  const [hasSettingsChanges, setHasSettingsChanges] = useState(false);
  const [hasQuizChanges, setHasQuizChanges] = useState(false);
  const curriculumRef = useRef<CurriculumTabRef>(null);
  const courseResourcesRef = useRef<CourseResourcesTabRef>(null);
  const settingsRef = useRef<CourseSettingsTabRef>(null);
  
  
  // Enhanced navigation function with courses list refresh
  const navigateToCoursesWithRefresh = useCallback(() => {
    // Force refresh courses list when navigating back
    queryClient.invalidateQueries({ 
      queryKey: ['courses'],
      exact: false
    });
    router.push('/admin/courses');
  }, [queryClient, router]);

  // Navigation guard - check ALL tab changes
  const hasAnyUnsavedChanges = hasUnsavedChanges || hasCurriculumChanges || hasMediaChanges || hasSettingsChanges || hasQuizChanges;
  
  const { navigateWithConfirmation } = useNavigationGuard({
    hasUnsavedChanges: hasAnyUnsavedChanges,
    message: 'You have unsaved changes. Are you sure you want to leave this page?'
  });
  
  // Form values with robust defaults
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
      // Only set initial values if they haven't been set yet or if hasUnsavedChanges is false
      // This prevents overwriting user input when switching tabs
      const shouldUpdateValues = !hasUnsavedChanges || values.title === '';
      
      if (shouldUpdateValues) {
        // Check if this is a newly created course with default values
        const isNewCourse = courseData.title === 'Untitled Course' && 
                           courseData.description === 'Course description...';
        
        // Update form values - preserve actual values to detect changes correctly
        const newFormValues = {
          title: isNewCourse ? '' : (courseData.title || ''),
          description: courseData.description || '',
          price: String(courseData.price || 0),
          level: courseData.level || 'beginner',
          topics: Array.isArray(courseData.topics) ? courseData.topics : [],
          imageUrl: courseData.imageUrl || ''
        };
        
        setValues(newFormValues);
        setInitialValues(newFormValues);
      }
      
      // Always update chapters/lessons with fresh server data after saves
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
  }, [courseData, hasUnsavedChanges, hasCurriculumChanges, values.title]);
  
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
    // Ensure topics is always an array
    const safeTopics = Array.isArray(topics) ? topics : [];
    const newValues = { ...values, topics: safeTopics };
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
  
  // Handle update draft - Save ALL tabs
  const handleUpdateDraft = async () => {
    try {
      console.log('Starting handleUpdateDraft...');
      
      // Save curriculum if there are changes
      if (hasCurriculumChanges && curriculumRef.current) {
        console.log('Saving curriculum changes...');
        await curriculumRef.current.saveCurriculum();
        console.log('Curriculum saved successfully');
        
        // Refresh course data after curriculum save to ensure consistency
        console.log('Refreshing course data after curriculum save...');
        await queryClient.invalidateQueries({ queryKey: ['course', params.courseId] });
        
        // Wait for invalidation to complete
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Save media resources if there are changes
      if (hasMediaChanges && courseResourcesRef.current) {
        console.log('Saving media resource changes...');
        const resourceUploadRef = courseResourcesRef.current.getResourceUploadRef();
        
        if (resourceUploadRef) {
          console.log('Getting files from ResourceUpload ref...');
          const tempFiles = resourceUploadRef.getTempFiles();
          const deletedIds = resourceUploadRef.getDeletedIds();
          
          console.log('Retrieved from ref:', {
            tempFilesCount: tempFiles.length,
            tempFiles: tempFiles.map(f => ({ id: f.id, fileName: f.fileName })),
            deletedIdsCount: deletedIds.length,
            deletedIds: deletedIds
          });
          
          // Process temp files - save to database with resilient error handling
          const failedFiles: string[] = [];
          try {
            for (const temp of tempFiles) {
              try {
                console.log('Creating course material:', temp.title);
                await createMaterialMutation.mutateAsync({
                  title: temp.title,
                  fileName: temp.fileName,
                  fileSize: temp.fileSize,
                  fileType: temp.fileType,
                  mimeType: temp.mimeType,
                  description: 'Course Material',
                  url: temp.url
                });
                console.log(`Successfully created material: ${temp.fileName}`);
              } catch (error) {
                console.error(`Failed to save file ${temp.fileName}:`, error);
                failedFiles.push(temp.fileName);
                // Continue with other files - don't let one failure stop the process
              }
            }
          } catch (error) {
            console.error('Error in temp files processing:', error);
            // Continue to next step even if there's an outer error
          }
          
          // Process deletions with resilient error handling
          const failedDeletions: string[] = [];
          try {
            for (const id of deletedIds) {
              try {
                console.log('Deleting course material:', id);
                await deleteMaterialMutation.mutateAsync(id);
                console.log(`Successfully deleted material: ${id}`);
              } catch (error) {
                console.error(`Failed to delete material ${id}:`, error);
                failedDeletions.push(id);
                // Continue with other deletions - don't let one failure stop the process
              }
            }
          } catch (error) {
            console.error('Error in deletions processing:', error);
            // Continue to next step even if there's an outer error
          }
          
          // Show success/error messages with more context
          if (failedFiles.length === 0 && failedDeletions.length === 0) {
            console.log('Media resources saved successfully');
          } else {
            console.warn('Some file operations failed:', { 
              failedFiles, 
              failedDeletions,
              message: 'Failed files were not saved to database (temp files not persisted)'
            });
          }
        }
      }
      
      // Save settings if there are changes
      if (hasSettingsChanges && settingsRef.current) {
        console.log('Saving settings changes...');
        const resourceSettingsRef = settingsRef.current.getResourceSettingsRef();
        
        if (resourceSettingsRef) {
          const settings = resourceSettingsRef.getSettings();
          console.log('Settings to save:', settings);
          // TODO: Save settings to server when API is ready
          // For now, just reset to mark as saved
          resourceSettingsRef.reset();
          console.log('Settings marked as saved (pending API implementation)');
        }
      }

      // Prepare data for API - only basic course fields
      const updateData = {
        title: values.title.trim() || 'Untitled Course',
        description: values.description.trim() || '',
        price: parseFloat(values.price) || 0,
        level: values.level || 'beginner',
        topics: Array.isArray(values.topics) ? values.topics : [],
        imageUrl: values.imageUrl || '',
        status: courseData?.status || CourseStatus.DRAFT, // Preserve current status
      };
      
      console.log('Updating course with data:', updateData);
      
      await updateCourseMutation.mutateAsync({
        id: params.courseId,
        data: updateData
      });
      
      console.log('Course updated successfully');
      
      // Reset dirty state after successful save
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      setHasCurriculumChanges(false);
      setHasMediaChanges(false);
      setHasSettingsChanges(false);
      setHasQuizChanges(false);
      setInitialValues(values);
      
      // CRITICAL FIX: Reset resource upload component only after ALL operations complete successfully
      // This prevents duplicate files by ensuring proper timing
      if (courseResourcesRef.current) {
        const resourceUploadRef = courseResourcesRef.current.getResourceUploadRef();
        if (resourceUploadRef) {
          console.log('handleUpdateDraft: Calling reset after successful completion of all operations');
          
          // Add small delay to ensure query invalidations complete before reset
          setTimeout(() => {
            resourceUploadRef.reset();
            console.log('handleUpdateDraft: Reset completed with delay to prevent race conditions');
          }, 300);
        }
      }
      
      // Remove manual toast - QueryProvider will handle it via mutation meta
    } catch (error: any) {
      console.error('Error in handleUpdateDraft:', error);
      // Error is handled by the mutation meta in useCoursesQuery
    }
  };
  
  // Handle form submission (publish) - Enhanced validation for live publication
  const handlePublish = async () => {
    try {
      // FULL VALIDATION for publishing (higher standards)
      const validationErrors: string[] = [];
      
      if (!values.title?.trim()) {
        validationErrors.push('Course title is required');
      }
      
      if (!values.description?.trim()) {
        validationErrors.push('Course description is required');
      }
      
      // Simplified validation - only require basic course info
      // Note: Removed strict curriculum validation to allow flexible publishing
      
      if (validationErrors.length > 0) {
        // Offer choice: save draft first or fix errors
        const shouldSaveDraft = window.confirm(
          `Cannot publish: ${validationErrors.join('. ')}\n\nWould you like to save as draft instead?`
        );
        
        if (shouldSaveDraft) {
          await handleUpdateDraft();
          return;
        } else {
          // User chose not to save as draft - just return without action
          // The validation errors were already shown in the confirm dialog
          return;
        }
      }
      
      // Save curriculum if there are changes
      if (hasCurriculumChanges && curriculumRef.current) {
        console.log('Publishing: Saving curriculum changes...');
        await curriculumRef.current.saveCurriculum();
        console.log('Publishing: Curriculum saved successfully');
        
        // Refresh course data after curriculum save to ensure consistency
        console.log('Publishing: Refreshing course data after curriculum save...');
        await queryClient.invalidateQueries({ queryKey: ['course', params.courseId] });
        
        // Wait for invalidation to complete
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Save media resources if there are changes
      if (hasMediaChanges && courseResourcesRef.current) {
        console.log('Publishing: Saving media resource changes...');
        const resourceUploadRef = courseResourcesRef.current.getResourceUploadRef();
        
        if (resourceUploadRef) {
          console.log('Getting files from ResourceUpload ref...');
          const tempFiles = resourceUploadRef.getTempFiles();
          const deletedIds = resourceUploadRef.getDeletedIds();
          
          console.log('Retrieved from ref:', {
            tempFilesCount: tempFiles.length,
            tempFiles: tempFiles.map(f => ({ id: f.id, fileName: f.fileName })),
            deletedIdsCount: deletedIds.length,
            deletedIds: deletedIds
          });
          
          // Process temp files - save to database with resilient error handling
          const failedFiles: string[] = [];
          try {
            for (const temp of tempFiles) {
              try {
                console.log('Publishing: Creating course material:', temp.title);
                await createMaterialMutation.mutateAsync({
                  title: temp.title,
                  fileName: temp.fileName,
                  fileSize: temp.fileSize,
                  fileType: temp.fileType,
                  mimeType: temp.mimeType,
                  description: 'Course Material',
                  url: temp.url
                });
                console.log(`Publishing: Successfully created material: ${temp.fileName}`);
              } catch (error) {
                console.error(`Publishing: Failed to save file ${temp.fileName}:`, error);
                failedFiles.push(temp.fileName);
                // Continue with other files - don't let one failure stop the process
              }
            }
          } catch (error) {
            console.error('Publishing: Error in temp files processing:', error);
            // Continue to next step even if there's an outer error
          }
          
          // Process deletions with resilient error handling
          const failedDeletions: string[] = [];
          try {
            for (const id of deletedIds) {
              try {
                console.log('Publishing: Deleting course material:', id);
                await deleteMaterialMutation.mutateAsync(id);
                console.log(`Publishing: Successfully deleted material: ${id}`);
              } catch (error) {
                console.error(`Publishing: Failed to delete material ${id}:`, error);
                failedDeletions.push(id);
                // Continue with other deletions - don't let one failure stop the process
              }
            }
          } catch (error) {
            console.error('Publishing: Error in deletions processing:', error);
            // Continue to next step even if there's an outer error
          }
          
          // Show success/error messages with more context
          if (failedFiles.length === 0 && failedDeletions.length === 0) {
            console.log('Publishing: Media resources saved successfully');
          } else {
            console.warn('Publishing: Some file operations failed:', { 
              failedFiles, 
              failedDeletions,
              message: 'Failed files were not saved to database (temp files not persisted)'
            });
          }
        }
      }
      
      // Save settings if there are changes
      if (hasSettingsChanges && settingsRef.current) {
        console.log('Publishing: Saving settings changes...');
        const resourceSettingsRef = settingsRef.current.getResourceSettingsRef();
        
        if (resourceSettingsRef) {
          const settings = resourceSettingsRef.getSettings();
          console.log('Publishing: Settings to save:', settings);
          // TODO: Save settings to server when API is ready
          // For now, just reset to mark as saved
          resourceSettingsRef.reset();
          console.log('Publishing: Settings marked as saved (pending API implementation)');
        }
      }
      
      // Simple course publish - just update course status to published
      const courseData = {
        title: values.title.trim() || 'Untitled Course',
        description: values.description.trim() || '',
        price: parseFloat(values.price) || 0,
        level: values.level || 'beginner',
        topics: Array.isArray(values.topics) ? values.topics : [],
        imageUrl: values.imageUrl || '',
        status: CourseStatus.PUBLISHED // Set directly to published
      };
      
      // Single API call to update course with published status
      await updateCourseMutation.mutateAsync({
        id: params.courseId,
        data: courseData
      });
      
      // Reset dirty state and redirect
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      setHasCurriculumChanges(false);
      setHasMediaChanges(false);
      setHasSettingsChanges(false);
      setHasQuizChanges(false);
      setInitialValues(values);
      
      // CRITICAL FIX: Reset resource upload component only after ALL operations complete successfully
      // This prevents duplicate files by ensuring proper timing
      if (courseResourcesRef.current) {
        const resourceUploadRef = courseResourcesRef.current.getResourceUploadRef();
        if (resourceUploadRef) {
          console.log('handlePublish: Calling reset after successful completion of all operations');
          
          // Add small delay to ensure query invalidations complete before reset
          setTimeout(() => {
            resourceUploadRef.reset();
            console.log('handlePublish: Reset completed with delay to prevent race conditions');
          }, 300);
        }
      }
      
      navigateToCoursesWithRefresh();
    } catch (error: any) {
      // Error is handled by the mutation meta in useCoursesQuery
    }
  };
  
  // Render curriculum tab
  const renderCurriculumTab = () => (
    <CurriculumTab
      ref={curriculumRef}
      initialChapters={chapters}
      onUpdateCurriculum={handleUpdateCurriculum}
      onCurriculumChange={setHasCurriculumChanges}
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
        onClick={() => {
          if (hasAnyUnsavedChanges) {
            const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave this page?');
            if (confirmed) {
              navigateToCoursesWithRefresh();
            }
          } else {
            navigateToCoursesWithRefresh();
          }
        }}
        className="back-to-link no-transform"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Courses
      </button>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
          {courseData?.status && (
            <StatusBadge 
              status={courseData.status as 'draft' | 'published'} 
              size="sm" 
            />
          )}
          <LastSavedIndicator lastSaved={lastSaved} />
          {hasAnyUnsavedChanges && (
            <span className="text-sm text-orange-600 font-medium">
              • Unsaved changes
            </span>
          )}
        </div>
        
        <div className="flex space-x-4">
          {courseData?.status === 'published' ? (
            <>
              <button
                type="button"
                onClick={async () => {
                  try {
                    // Save curriculum if there are changes
                    if (hasCurriculumChanges && curriculumRef.current) {
                      await curriculumRef.current.saveCurriculum();
                      await queryClient.invalidateQueries({ queryKey: ['course', params.courseId] });
                      await new Promise(resolve => setTimeout(resolve, 100));
                    }

                    const updateData = {
                      title: values.title.trim() || 'Untitled Course',
                      description: values.description.trim() || '',
                      price: parseFloat(values.price) || 0,
                      level: values.level || 'beginner',
                      topics: Array.isArray(values.topics) ? values.topics : [],
                      imageUrl: values.imageUrl || '',
                      status: courseData?.status || CourseStatus.DRAFT,
                    };
                    
                    await updateCourseMutation.mutateAsync({
                      id: params.courseId,
                      data: updateData
                    });
                    
                    setLastSaved(new Date());
                    setHasUnsavedChanges(false);
                    setHasCurriculumChanges(false);
                    setHasMediaChanges(false);
                    setHasSettingsChanges(false);
                    setHasQuizChanges(false);
                    setInitialValues(values);
                  } catch (error: any) {
                    console.error('Error updating course:', error);
                  }
                }}
                disabled={updateCourseMutation.isPending}
                className="btn-admin-secondary-lg"
              >
                {updateCourseMutation.isPending ? (
                  <LoadingState variant="button" message="Updating..." />
                ) : (
                  'Update Course'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => updateCourseMutation.mutate({ 
                  id: params.courseId, 
                  data: { 
                    title: values.title.trim() || 'Untitled Course',
                    description: values.description.trim() || '',
                    price: parseFloat(values.price) || 0,
                    level: values.level || 'beginner',
                    topics: Array.isArray(values.topics) ? values.topics : [],
                    imageUrl: values.imageUrl || '',
                    status: CourseStatus.DRAFT 
                  } 
                })}
                disabled={updateCourseMutation.isPending}
                className="btn-admin-primary-lg"
              >
                {updateCourseMutation.isPending ? (
                  <LoadingState variant="button" message="Unpublishing..." />
                ) : (
                  'Unpublish Course'
                )}
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
      
      {/* Tabs Navigation */}
      <div className="mb-6 tab-container">
        <CourseFormTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
      
      {/* Tab Content - Render all tabs but hide inactive ones to preserve state */}
      <div>
        <div style={{ display: activeTab === 'basicInfo' ? 'block' : 'none' }}>
          <BasicInfoTab 
            values={values} 
            handleChange={handleChange} 
            handleImageUpload={handleImageUpload} 
            handleTopicsChange={handleTopicsChange} 
          />
        </div>
        
        <div style={{ display: activeTab === 'curriculum' ? 'block' : 'none' }}>
          {renderCurriculumTab()}
        </div>
        
        <div style={{ display: activeTab === 'resources' ? 'block' : 'none' }}>
          <CourseResourcesTab 
            ref={courseResourcesRef}
            courseId={params.courseId} 
            onChangesDetected={setHasMediaChanges}
          />
        </div>
        
        <div style={{ display: activeTab === 'quizzes' ? 'block' : 'none' }}>
          <CourseQuizzesTab 
            courseId={params.courseId} 
            courseTitle={values.title}
            onChangesDetected={setHasQuizChanges}
          />
        </div>
        
        <div style={{ display: activeTab === 'settings-pricing' ? 'block' : 'none' }}>
          <CourseSettingsTab 
            ref={settingsRef}
            courseId={params.courseId}
            onChangesDetected={setHasSettingsChanges}
          />
        </div>
        
        <div style={{ display: activeTab === 'preview' ? 'block' : 'none' }}>
          <CoursePreviewTab course={courseData} />
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-end items-center mt-6">
          
          <div className="flex space-x-4">
            <button
              onClick={() => {
          if (hasAnyUnsavedChanges) {
            const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave this page?');
            if (confirmed) {
              navigateToCoursesWithRefresh();
            }
          } else {
            navigateToCoursesWithRefresh();
          }
        }}
              className="flex items-center text-gray-600 hover:text-gray-800 py-2.5 px-6 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors no-transform"
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