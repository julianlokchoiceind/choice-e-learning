"use client";

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
}

interface CourseFormData {
  title: string;
  description: string;
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  topics: string;
  videoUrl: string;
  imageUrl?: string;
}

// Main component for Course Management
export default function CourseManager() {
  // States for view management
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit'>('list');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // States for data
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    price: 0,
    level: 'beginner',
    topics: '',
    videoUrl: '',
    imageUrl: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Function to fetch courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/courses');
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.courses);
      } else {
        throw new Error(data.error || 'Failed to fetch courses');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a course
  const deleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete course');
      }
      
      setCourses(courses.filter(course => course.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };
  
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
    setError(null);
    setSubmitSuccess(false);
    
    // Validate form
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Parse topics from comma-separated string to array
      const topicsArray = formData.topics.split(',').map(topic => topic.trim());
      
      const url = currentView === 'edit' && selectedCourse 
        ? `/api/admin/courses/${selectedCourse.id}` 
        : '/api/admin/courses';
      
      const method = currentView === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          topics: topicsArray,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `Failed to ${currentView === 'edit' ? 'update' : 'add'} course`);
      }
      
      setSubmitSuccess(true);
      
      // Refresh courses list and go back to list view
      fetchCourses();
      setTimeout(() => {
        setCurrentView('list');
        setSelectedCourse(null);
        setSubmitSuccess(false);
      }, 1000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to switch to edit mode and load course data
  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      price: course.price,
      level: course.level as 'beginner' | 'intermediate' | 'advanced',
      topics: course.topics.join(', '),
      videoUrl: course.videoUrl || '',
      imageUrl: course.imageUrl || ''
    });
    setCurrentView('edit');
  };
  
  // Function to switch to add mode and reset form
  const handleAddCourse = () => {
    setSelectedCourse(null);
    setFormData({
      title: '',
      description: '',
      price: 0,
      level: 'beginner',
      topics: '',
      videoUrl: '',
      imageUrl: ''
    });
    setFormErrors({});
    setCurrentView('add');
  };
  
  // Function to go back to list view
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedCourse(null);
    setError(null);
  };
  
  // Render the CourseList view
  const renderCourseList = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <BookOpenIcon className="h-8 w-8 text-indigo-600 mr-3" />
          <h1 className="text-2xl font-bold">Course Management</h1>
        </div>
        <button
          onClick={handleAddCourse}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Course
        </button>
      </div>
      
      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white text-sm font-medium">Total Courses</p>
              <h3 className="text-white text-2xl font-bold">{courses.length}</h3>
            </div>
            <div className="p-2 rounded-full bg-white/20">
              <BookOpenIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white text-sm font-medium">Active Students</p>
              <h3 className="text-white text-2xl font-bold">{courses.reduce((sum, course) => sum + course.studentCount, 0)}</h3>
            </div>
            <div className="p-2 rounded-full bg-white/20">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg shadow p-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white text-sm font-medium">Revenue</p>
              <h3 className="text-white text-2xl font-bold">
                ${courses.reduce((sum, course) => sum + (course.price * course.studentCount), 0).toFixed(2)}
              </h3>
            </div>
            <div className="p-2 rounded-full bg-white/20">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Error state */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
      
      {/* No courses state */}
      {!loading && !error && courses.length === 0 && (
        <div className="bg-yellow-50 p-6 rounded-lg text-center">
          <h3 className="text-xl font-bold mb-2">No courses found</h3>
          <p className="mb-4">You haven't added any courses yet. Get started by adding your first course.</p>
          <button
            onClick={handleAddCourse}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-block"
          >
            Add Your First Course
          </button>
        </div>
      )}
      
      {/* Course list */}
      {!loading && !error && courses.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="py-3 px-4 text-left font-medium text-indigo-600 uppercase tracking-wider">Title</th>
                  <th className="py-3 px-4 text-left font-medium text-indigo-600 uppercase tracking-wider">Level</th>
                  <th className="py-3 px-4 text-left font-medium text-indigo-600 uppercase tracking-wider">Price</th>
                  <th className="py-3 px-4 text-left font-medium text-indigo-600 uppercase tracking-wider">Students</th>
                  <th className="py-3 px-4 text-left font-medium text-indigo-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{course.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{course.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs capitalize">
                        {course.level}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">${course.price.toFixed(2)}</td>
                    <td className="py-3 px-4">{course.studentCount}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <a
                          href={`/courses/${course.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </a>
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="p-2 bg-yellow-100 text-yellow-600 rounded-md hover:bg-yellow-200"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deleteCourse(course.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
            <div className="text-sm text-gray-500">
              Showing {courses.length} courses
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  // Render the CourseForm view (for both add and edit)
  const renderCourseForm = () => (
    <div className="p-6">
      <div className="flex items-center mb-8">
        <BookOpenIcon className="h-8 w-8 text-indigo-600 mr-3" />
        <h1 className="text-2xl font-bold">
          {currentView === 'add' ? 'Add New Course' : 'Edit Course'}
        </h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {submitSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Course {currentView === 'add' ? 'added' : 'updated'} successfully!
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Course Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.title ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                  Level *
                </label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.level ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="">Select Level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                {formErrors.level && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.level}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${formErrors.description ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($) *
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.price ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                {formErrors.price && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="topics" className="block text-sm font-medium text-gray-700 mb-1">
                  Topics (comma-separated) *
                </label>
                <input
                  id="topics"
                  name="topics"
                  type="text"
                  placeholder="e.g. JavaScript, React, Web Development"
                  value={formData.topics}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.topics ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                {formErrors.topics && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.topics}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL *
                </label>
                <input
                  id="videoUrl"
                  name="videoUrl"
                  type="text"
                  placeholder="https://youtu.be/example"
                  value={formData.videoUrl}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.videoUrl ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                {formErrors.videoUrl && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.videoUrl}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.imageUrl ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                {formErrors.imageUrl && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.imageUrl}</p>
                )}
              </div>
            </div>
            
            <div className="pt-4 border-t flex justify-end gap-4">
              <button
                type="button"
                onClick={handleBackToList}
                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting 
                  ? currentView === 'add' ? 'Adding Course...' : 'Updating Course...'
                  : currentView === 'add' ? 'Add Course' : 'Update Course'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
  
  // Main render based on current view
  return (
    <div className="w-full">
      {currentView === 'list' && renderCourseList()}
      {(currentView === 'add' || currentView === 'edit') && renderCourseForm()}
    </div>
  );
} 