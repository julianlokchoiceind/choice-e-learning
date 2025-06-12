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

interface LessonEditFormProps {
  lesson: Lesson;
  isNew?: boolean;
}

interface Chapter {
  id: string;
  title: string;
  order: number;
}

export const LessonEditForm: React.FC<LessonEditFormProps> = ({ 
  lesson, 
  isNew = false 
}) => {
  const router = useRouter();
  const { useGetCourses } = useCoursesQuery(true);
  const { useUpdateLesson, useCreateLesson } = useLessonsQuery();
  
  const [formData, setFormData] = useState({
    title: lesson?.title || '',
    courseId: lesson?.courseId || '',
    chapterId: lesson?.chapterId || '',
    chapterName: 'Chapter 2: Components', // Mock data
    videoUrl: lesson?.videoUrl || '',
    duration: lesson?.duration || 0,
    order: lesson?.order || 1,
    status: lesson?.status || 'Draft',
    content: lesson?.content || ''
  });

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
  const createMutation = useCreateLesson();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveDraft = async () => {
    try {
      const dataToSave = {
        ...formData,
        status: 'Draft' as const,
        duration: parseInt(formData.duration.toString()),
        order: parseInt(formData.order.toString())
      };

      if (isNew) {
        await createMutation.mutateAsync(dataToSave);
      } else {
        await updateMutation.mutateAsync({
          id: lesson.id,
          data: dataToSave
        });
      }
      
      router.push('/admin/lessons');
    } catch (error) {
      console.error('Error saving lesson:', error);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const dataToSave = {
        ...formData,
        status: 'Published' as const,
        duration: parseInt(formData.duration.toString()),
        order: parseInt(formData.order.toString())
      };

      if (isNew) {
        await createMutation.mutateAsync(dataToSave);
      } else {
        await updateMutation.mutateAsync({
          id: lesson.id,
          data: dataToSave
        });
      }
      
      router.push('/admin/lessons');
    } catch (error) {
      console.error('Error publishing lesson:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const isLoading = updateMutation.isPending || createMutation.isPending;

  if (coursesLoading) {
    return <LoadingState variant="section" message="Loading form data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header with status and action buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'Create New Lesson' : 'Edit Lesson'}
          </h1>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            formData.status === 'Published'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {formData.status}
          </span>
          {!isNew && lesson?.updatedAt && (
            <span className="text-sm text-gray-500">
              Last saved: {new Date(lesson.updatedAt).toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
          )}
        </div>
        
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isLoading}
            className="btn-admin-secondary-lg"
          >
            {isLoading && !isPublishing ? 'Saving...' : 'Update Draft'}
          </button>
          
          <button
            type="button"
            onClick={handlePublish}
            disabled={isLoading}
            className="btn-admin-primary-lg"
          >
            {isPublishing ? 'Publishing...' : 'Publish Lesson'}
          </button>
        </div>
      </div>

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
                  className="appearance-none block w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-0 focus:border-[var(--color-primary)] text-sm cursor-pointer"
                  required
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
                <span className="text-xs text-gray-500 ml-2">
                  (Optional - Select a course first)
                </span>
              </label>
              <div className="relative">
                <select
                  id="chapterId"
                  name="chapterId"
                  value={formData.chapterId}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-0 focus:border-[var(--color-primary)] text-sm cursor-pointer"
                  disabled={!formData.courseId}
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
                  (Sequence in learning path)
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
                title="Determines the sequence of this lesson within the chapter or course"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
                <span className="text-xs text-gray-500 ml-2">
                  (Controls visibility to students)
                </span>
              </label>
              <div className="relative">
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-0 focus:border-[var(--color-primary)] text-sm cursor-pointer"
                  title="Draft: Only visible to admins | Published: Visible to enrolled students"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
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