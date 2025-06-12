'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  PencilSquareIcon, 
  TrashIcon, 
  PlusIcon, 
  BookOpenIcon,
  ArrowLeftIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { CourseStatus } from '@/shared/types/courses/course';
import { useCoursesQuery } from '@/client/hooks/courses';
import { LoadingState } from '@/client/components/common';
import { CourseImage } from '@/client/components/courses';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  level: string;
  topics: string[];
  studentCount: number;
  videoUrl?: string;
  imageUrl?: string;
  status?: CourseStatus;
  isPublished?: boolean;
}

interface CourseFormData {
  title: string;
  description: string;
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  topics: string;
  videoUrl: string;
  imageUrl?: string;
  status: CourseStatus;
}

// Main component for Course Management
export default function CourseManager() {
  // States for view management
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit'>('list');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    price: 0,
    level: 'beginner',
    topics: '',
    videoUrl: '',
    imageUrl: '',
    status: CourseStatus.DRAFT
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Get hooks from useCoursesQuery
  const { 
    useGetCourses, 
    useCreateCourse, 
    useUpdateCourse, 
    useDeleteCourse 
  } = useCoursesQuery();
  
  // Use React Query to fetch courses
  const { 
    data: courses = [], 
    isLoading: loading, 
    error: queryError,
    refetch: refetchCourses
  } = useGetCourses();
  
  // Use React Query mutations
  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();
  const deleteCourseMutation = useDeleteCourse();
  
  // Format error message
  const error = queryError ? 
    (queryError instanceof Error ? queryError.message : 'Failed to fetch courses') : 
    null;
    
  // Function to handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Function to validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    if (formData.price < 0) {
      errors.price = 'Price must be a positive number';
    }
    
    if (!formData.level) {
      errors.level = 'Level is required';
    }
    
    if (!formData.status) {
      errors.status = 'Status is required';
    }
    
    if (!formData.topics.trim()) {
      errors.topics = 'At least one topic is required';
    }
    
    if (!formData.videoUrl.trim()) {
      errors.videoUrl = 'Video URL is required';
    } else if (!/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(formData.videoUrl)) {
      errors.videoUrl = 'Enter a valid YouTube URL';
    }
    
    if (formData.imageUrl && !/^(https?:\/\/)?.+\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(formData.imageUrl)) {
      errors.imageUrl = 'Enter a valid image URL';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    
    // Validate form
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Parse topics from comma-separated string to array
      const topicsArray = formData.topics.split(',').map(topic => topic.trim());
      
      if (currentView === 'edit' && selectedCourse) {
        // Update existing course
        await updateCourseMutation.mutateAsync({
          id: selectedCourse.id,
          data: {
            title: formData.title,
            description: formData.description,
            price: formData.price,
            level: formData.level,
            topics: topicsArray,
            imageUrl: formData.imageUrl,
            status: formData.status
          }
        });
      } else {
        // Create new course
        await createCourseMutation.mutateAsync({
          title: formData.title,
          description: formData.description,
          price: formData.price,
          level: formData.level,
          topics: topicsArray,
          imageUrl: formData.imageUrl,
          status: formData.status
        });
      }
      
      // Reset form and show success message
      setSubmitSuccess(true);
      
      // Reset form and back to list after short delay
      setTimeout(() => {
        handleBackToList();
      }, 1500);
    } catch (err: unknown) {
      console.error('Error submitting course form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to delete a course
  const deleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await deleteCourseMutation.mutateAsync(id);
    } catch (err: unknown) {
      console.error('Error deleting course:', err);
    }
  };
  
  // Function to handle edit course
  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      price: course.price,
      level: course.level as 'beginner' | 'intermediate' | 'advanced',
      topics: Array.isArray(course.topics) ? course.topics.join(', ') : '',
      videoUrl: course.videoUrl || '',
      imageUrl: course.imageUrl || '',
      status: course.status || CourseStatus.DRAFT
    });
    setCurrentView('edit');
  };
  
  // Function to handle add course
  const handleAddCourse = () => {
    setSelectedCourse(null);
    setFormData({
      title: '',
      description: '',
      price: 0,
      level: 'beginner',
      topics: '',
      videoUrl: '',
      imageUrl: '',
      status: CourseStatus.DRAFT
    });
    setFormErrors({});
    setCurrentView('add');
  };
  
  // Function to handle back to list
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedCourse(null);
    refetchCourses();
  };
  
  // Function to get status badge class
  const getStatusBadgeClass = (status?: CourseStatus, isPublished?: boolean) => {
    if (isPublished) return 'bg-green-100 text-green-800';
    switch (status) {
      case CourseStatus.DRAFT: return 'bg-gray-100 text-gray-800';
      case CourseStatus.PUBLISHED: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Function to format status
  const formatStatus = (status?: CourseStatus, isPublished?: boolean): string => {
    if (isPublished) return 'Published';
    switch (status) {
      case CourseStatus.DRAFT: return 'Draft';
      case CourseStatus.PUBLISHED: return 'Published';
      default: return 'Draft';
    }
  };

  // Render course list
  const renderCourseList = () => (
    <div className='bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden'>
      <div className='p-4 border-b border-gray-200 flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-indigo-600'>All Courses</h2>
        <button
          onClick={handleAddCourse}
          className='btn-admin-primary'
        >
          <PlusIcon className='h-5 w-5 mr-1' />
          Add New Course
        </button>
      </div>
      
      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4'>
          {error}
        </div>
      )}
      
      {loading ? (
        <div className='text-center py-12'>
          <LoadingState variant="section" message="Loading courses..." />
        </div>
      ) : courses.length === 0 ? (
        <div className='text-center py-12 text-gray-500'>
          <p className='text-lg font-medium'>No courses found</p>
          <p className='mt-2'>Click the "Add New Course" button to create your first course.</p>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Course</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Topics</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Level</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Price</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Students</th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {courses.map((course) => (
                <tr key={course.id} className='hover:bg-gray-50 transition-colors'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 h-12 w-20 relative'>
                        <CourseImage 
                          course={course}
                          size="small"
                          className="h-12 w-20"
                        />
                      </div>
                      <div className='ml-4'>
                        <div className='text-sm font-medium text-gray-900 mb-1'>{course.title}</div>
                        <div className='text-xs text-gray-500 line-clamp-2 max-w-xs'>{course.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex flex-wrap gap-1'>
                      {Array.isArray(course.topics) && course.topics.slice(0, 2).map((topic, index) => (
                        <span key={index} className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800'>
                          {topic}
                        </span>
                      ))}
                      {Array.isArray(course.topics) && course.topics.length > 2 && (
                        <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                          +{course.topics.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className='text-sm text-gray-900'>
                      {typeof course.level === 'string' ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : 'Unknown'}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className='text-sm font-medium text-gray-900'>${course.price.toFixed(2)}</span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusBadgeClass(course.status, course.isPublished)}`}>
                      {formatStatus(course.status, course.isPublished)}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {course.studentCount || 0}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <div className='flex justify-end space-x-2'>
                      <button
                        onClick={() => window.open(`/courses/${course.id}`, '_blank')}
                        className='p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors'
                        title='View course'
                      >
                        <EyeIcon className='h-5 w-5' />
                      </button>
                      <button
                        onClick={() => handleEditCourse(course)}
                        className='p-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors'
                        title='Edit course'
                      >
                        <PencilSquareIcon className='h-5 w-5' />
                      </button>
                      <button
                        onClick={() => deleteCourse(course.id)}
                        className='p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors'
                        disabled={deleteCourseMutation.isPending}
                        title='Delete course'
                      >
                        <TrashIcon className='h-5 w-5' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Render course form
  const renderCourseForm = () => (
    <div className='bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden'>
      <div className='p-4 border-b border-gray-200 flex justify-between items-center'>
        <div className='flex items-center'>
          <button
            onClick={handleBackToList}
            className='mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors'
          >
            <ArrowLeftIcon className='h-5 w-5 text-gray-500' />
          </button>
          <h2 className='text-xl font-semibold text-indigo-600'>
            {currentView === 'edit' ? 'Edit Course' : 'Add New Course'}
          </h2>
        </div>
      </div>
      
      {submitSuccess && (
        <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative m-4'>
          Course {currentView === 'edit' ? 'updated' : 'created'} successfully!
        </div>
      )}
      
      <div className='p-6'>
        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
            <div>
              <label htmlFor='title' className='block text-sm font-medium text-gray-700 mb-1'>
                Title <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                id='title'
                name='title'
                value={formData.title}
                onChange={handleInputChange}
                className='w-full p-2 border border-gray-300 rounded-md focus:ring-0 focus:border-[var(--color-primary)]'
                placeholder='Course Title'
              />
              {formErrors.title && (
                <p className='mt-1 text-sm text-red-600'>{formErrors.title}</p>
              )}
            </div>
            
            <div>
              <label htmlFor='level' className='block text-sm font-medium text-gray-700 mb-1'>
                Level <span className='text-red-500'>*</span>
              </label>
              <select
                id='level'
                name='level'
                value={formData.level}
                onChange={handleInputChange}
                className='w-full p-2 border border-gray-300 rounded-md focus:ring-0 focus:border-[var(--color-primary)]'
              >
                <option value='beginner'>Beginner</option>
                <option value='intermediate'>Intermediate</option>
                <option value='advanced'>Advanced</option>
              </select>
              {formErrors.level && (
                <p className='mt-1 text-sm text-red-600'>{formErrors.level}</p>
              )}
            </div>
            
            <div>
              <label htmlFor='price' className='block text-sm font-medium text-gray-700 mb-1'>
                Price <span className='text-red-500'>*</span>
              </label>
              <input
                type='number'
                id='price'
                name='price'
                value={formData.price}
                onChange={handleInputChange}
                step='0.01'
                min='0'
                className='w-full p-2 border border-gray-300 rounded-md focus:ring-0 focus:border-[var(--color-primary)]'
                placeholder='0.00'
              />
              {formErrors.price && (
                <p className='mt-1 text-sm text-red-600'>{formErrors.price}</p>
              )}
            </div>
            
            <div>
              <label htmlFor='status' className='block text-sm font-medium text-gray-700 mb-1'>
                Status <span className='text-red-500'>*</span>
              </label>
              <select
                id='status'
                name='status'
                value={formData.status}
                onChange={handleInputChange}
                className='w-full p-2 border border-gray-300 rounded-md focus:ring-0 focus:border-[var(--color-primary)]'
              >
                <option value={CourseStatus.DRAFT}>Draft</option>
                <option value={CourseStatus.PUBLISHED}>Published</option>
              </select>
              {formErrors.status && (
                <p className='mt-1 text-sm text-red-600'>{formErrors.status}</p>
              )}
            </div>
            
            <div className='md:col-span-2'>
              <label htmlFor='description' className='block text-sm font-medium text-gray-700 mb-1'>
                Description <span className='text-red-500'>*</span>
              </label>
              <textarea
                id='description'
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className='w-full p-2 border border-gray-300 rounded-md focus:ring-0 focus:border-[var(--color-primary)]'
                placeholder='Course description'
              ></textarea>
              {formErrors.description && (
                <p className='mt-1 text-sm text-red-600'>{formErrors.description}</p>
              )}
            </div>
            
            <div>
              <label htmlFor='topics' className='block text-sm font-medium text-gray-700 mb-1'>
                Topics <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                id='topics'
                name='topics'
                value={formData.topics}
                onChange={handleInputChange}
                className='w-full p-2 border border-gray-300 rounded-md focus:ring-0 focus:border-[var(--color-primary)]'
                placeholder='JavaScript, React, Web Development'
              />
              <p className='mt-1 text-xs text-gray-500'>Enter topics separated by commas</p>
              {formErrors.topics && (
                <p className='mt-1 text-sm text-red-600'>{formErrors.topics}</p>
              )}
            </div>
            
            <div>
              <label htmlFor='videoUrl' className='block text-sm font-medium text-gray-700 mb-1'>
                Video URL <span className='text-red-500'>*</span>
              </label>
              <input
                type='url'
                id='videoUrl'
                name='videoUrl'
                value={formData.videoUrl}
                onChange={handleInputChange}
                className='w-full p-2 border border-gray-300 rounded-md focus:ring-0 focus:border-[var(--color-primary)]'
                placeholder='https://youtube.com/watch?v=...'
              />
              {formErrors.videoUrl && (
                <p className='mt-1 text-sm text-red-600'>{formErrors.videoUrl}</p>
              )}
            </div>
            
            <div>
              <label htmlFor='imageUrl' className='block text-sm font-medium text-gray-700 mb-1'>
                Image URL
              </label>
              <input
                type='url'
                id='imageUrl'
                name='imageUrl'
                value={formData.imageUrl}
                onChange={handleInputChange}
                className='w-full p-2 border border-gray-300 rounded-md focus:ring-0 focus:border-[var(--color-primary)]'
                placeholder='https://example.com/image.jpg'
              />
              {formErrors.imageUrl && (
                <p className='mt-1 text-sm text-red-600'>{formErrors.imageUrl}</p>
              )}
            </div>
          </div>
          
          <div className='flex justify-end space-x-3'>
            <button
              type='button'
              onClick={handleBackToList}
              className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:ring-0 focus:border-[var(--color-primary)] focus:ring-offset-2'
            >
              {isSubmitting ? (
                <LoadingState variant="button" message="Saving..." />
              ) : (
                currentView === 'edit' ? 'Update Course' : 'Create Course'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
  return (
    <div className='space-y-6'>
      {currentView === 'list' ? renderCourseList() : renderCourseForm()}
    </div>
  );
}