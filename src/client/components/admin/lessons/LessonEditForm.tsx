'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ListBulletIcon,
  PhotoIcon,
  PlayCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Lesson } from '@/shared/types/lessons/lesson';
import { useCoursesQuery } from '@/client/hooks/courses';
import { useLessonsQuery } from '@/client/hooks/lessons';
import { LoadingState } from '@/client/components/common';
import { isFormDirty } from '@/client/utils/form-utils';
import toast from 'react-hot-toast';

interface LessonEditFormProps {
  lesson: Lesson;
  isNew?: boolean;
  onFormChange?: (data: any, isDirty?: boolean) => void;
  onSubmit?: (data: any) => Promise<void>;
  isLoading?: boolean;
}

interface Chapter {
  id: string;
  title: string;
  order: number;
}

export const LessonEditForm: React.FC<LessonEditFormProps> = ({ 
  lesson, 
  isNew = false,
  onFormChange,
  onSubmit,
  isLoading: isSubmitting = false
}) => {
  const router = useRouter();
  const { useGetCourses } = useCoursesQuery(true);
  const { useUpdateLesson, useUpdateLessonSilent } = useLessonsQuery();
  
  
  // Initialize form data from lesson prop
  const initialFormData = {
    title: lesson?.title || '',
    courseId: lesson?.courseId || '',
    chapterId: lesson?.chapterId || '',
    chapterName: 'Chapter 2: Components', // Mock data
    videoUrl: lesson?.videoUrl || '',
    duration: parseInt(lesson?.duration || '0') || 0,
    order: lesson?.order || 1,
    content: lesson?.content || ''
  };
  
  const [formData, setFormData] = useState(initialFormData);
  const [initialFormDataRef, setInitialFormDataRef] = useState(initialFormData);
  
  // Update form data when lesson prop changes
  React.useEffect(() => {
    if (lesson) {
      const newFormData = {
        title: lesson.title || '',
        courseId: lesson.courseId || '',
        chapterId: lesson.chapterId || '',
        chapterName: 'Chapter 2: Components', // Mock data
        videoUrl: lesson.videoUrl || '',
        duration: parseInt(lesson.duration || '0') || 0,
        order: lesson.order || 1,
        content: lesson.content || ''
      };
      setFormData(newFormData);
      setInitialFormDataRef(newFormData);
    }
  }, [lesson]);

  const [isPublishing, setIsPublishing] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // Get courses data
  const { data: coursesData, isLoading: coursesLoading } = useGetCourses();
  const courses = coursesData?.data || [];

  // Get course details to fetch chapters when courseId changes
  const { useGetCourse } = useCoursesQuery(true);
  const { data: selectedCourse } = useGetCourse(formData.courseId);

  // Update chapters when course changes
  React.useEffect(() => {
    if (selectedCourse?.chapters) {
      const courseChapters = selectedCourse.chapters.map((ch: any) => ({
        id: ch.id,
        title: `Chapter ${ch.order}: ${ch.title}`,
        order: ch.order
      }));
      setChapters(courseChapters);
      
      // Reset chapter selection if it's not in the new course
      if (!courseChapters.find((ch: Chapter) => ch.id === formData.chapterId)) {
        setFormData(prev => ({ ...prev, chapterId: '' }));
      }
    } else {
      setChapters([]);
    }
  }, [selectedCourse, formData.chapterId]);

  const updateMutation = useUpdateLesson();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);
    
    // Check if form is dirty with smart detection
    const isDirty = isFormDirty(newFormData, initialFormDataRef);
    
    // Notify parent of changes
    if (onFormChange) {
      onFormChange(newFormData, isDirty);
    }
  };

  const handleSaveDraft = async () => {
    try {
      // Only send fields that are in the lesson schema
      const dataToSave = {
        title: formData.title,
        content: formData.content,
        videoUrl: formData.videoUrl && formData.videoUrl.trim() !== '' ? formData.videoUrl : null,
        order: parseInt(formData.order.toString()),
        courseId: formData.courseId,
        chapterId: formData.chapterId || null,
        duration: formData.duration ? formData.duration.toString() : null
      };

      if (isNew) {
        // Lessons can only be created through course curriculum
        toast.error('Lessons must be created through course curriculum');
        router.push('/admin/courses');
        return;
      }
      
      await updateMutation.mutateAsync({
        id: lesson.id,
        data: dataToSave
      });
      
      router.push('/admin/lessons');
    } catch (error) {
      console.error('Error saving lesson:', error);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // Only send fields that are in the lesson schema
      const dataToSave = {
        title: formData.title,
        content: formData.content,
        videoUrl: formData.videoUrl && formData.videoUrl.trim() !== '' ? formData.videoUrl : null,
        order: parseInt(formData.order.toString()),
        courseId: formData.courseId,
        chapterId: formData.chapterId || null,
        duration: formData.duration ? formData.duration.toString() : null
      };

      if (isNew) {
        // Lessons can only be created through course curriculum
        toast.error('Lessons must be created through course curriculum');
        router.push('/admin/courses');
        return;
      }
      
      await updateMutation.mutateAsync({
        id: lesson.id,
        data: dataToSave
      });
      
      router.push('/admin/lessons');
    } catch (error) {
      console.error('Error publishing lesson:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const isLoading = updateMutation.isPending;

  if (coursesLoading) {
    return <LoadingState variant="section" message="Loading form data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Action buttons only when onFormChange is not provided */}
      {!onFormChange && (
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isLoading || isSubmitting}
            className="btn-admin-secondary-lg"
            >
              {isLoading && !isPublishing ? 'Saving...' : 'Update Draft'}
            </button>
            
            <button
              type="button"
              onClick={handlePublish}
              disabled={isLoading || isSubmitting}
              className="btn-admin-primary-lg"
            >
              {isPublishing ? 'Publishing...' : 'Publish Lesson'}
            </button>
          </div>
        )}

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          {/* Lesson Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:border-[var(--color-primary)] text-sm"
              placeholder="Enter lesson title"
              required
            />
          </div>

          {/* Course and Chapter Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-2">
                Course *
              </label>
              <div className="relative">
                <select
                  id="courseId"
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-0 focus:border-[var(--color-primary)] text-sm cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                  disabled={!isNew} // Disable course selection when editing existing lesson
                >
                  <option value="">Select course</option>
                  {courses.map((course: any) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="chapterId" className="block text-sm font-medium text-gray-700 mb-2">
                Chapter
              </label>
              <div className="relative">
                <select
                  id="chapterId"
                  name="chapterId"
                  value={formData.chapterId}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-0 focus:border-[var(--color-primary)] text-sm cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={!formData.courseId || !isNew}
                >
                  <option value="">
                    {!formData.courseId 
                      ? "Select a course first" 
                      : chapters.length === 0 
                        ? "No chapters in this course" 
                        : "Select chapter (optional)"}
                  </option>
                  {chapters.map(chapter => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.title}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Video URL */}
          <div>
            <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Video URL
              <span className="text-xs text-gray-500 ml-2">
                (YouTube, Vimeo, or direct video link will be embedded in lesson)
              </span>
            </label>
            <input
              type="url"
              id="videoUrl"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleInputChange}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:border-[var(--color-primary)] text-sm"
              placeholder="https://youtube.com/watch?v=dQw4w9WgXcQ"
            />
          </div>

          {/* Duration, Order, and Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duration
                <span className="text-xs text-gray-500 ml-2">
                  (Estimated time to complete lesson)
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2.5 pr-16 border border-gray-300 rounded-lg focus:ring-0 focus:border-[var(--color-primary)] text-sm"
                  placeholder="0"
                  min="0"
                  title="Enter the estimated time in minutes that students will need to complete this lesson"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-sm text-gray-500">minutes</span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                Order
                <span className="text-xs text-gray-500 ml-2">
                  (Position in chapter/course sequence)
                </span>
              </label>
              <input
                type="number"
                id="order"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:border-[var(--color-primary)] text-sm"
                placeholder="1"
                min="1"
                title="Determines the display order of this lesson within its chapter or course. Lower numbers appear first (e.g., 1 = first lesson, 2 = second lesson)"
              />
            </div>

          </div>

          {/* Lesson Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Content
              <span className="text-xs text-gray-500 ml-2">
                (Rich text content, explanations, and additional resources)
              </span>
            </label>
            {/* Editor Toolbar - Simplified */}
            <div className="border border-gray-300 rounded-t-lg bg-gray-50 px-3 py-2 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Rich Text Editor</span>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <button
                type="button"
                className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                title="Insert Image"
              >
                <PhotoIcon className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={10}
              className="block w-full px-3 py-2.5 border-x border-b border-gray-300 rounded-b-lg focus:ring-0 focus:border-[var(--color-primary)] text-sm"
              placeholder="In this lesson, we will explore how to handle events in React components.

You'll learn about:
• onClick events for button interactions
• onChange events for form inputs
• onSubmit events for form handling
• Best practices for event handling in modern React"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default LessonEditForm;