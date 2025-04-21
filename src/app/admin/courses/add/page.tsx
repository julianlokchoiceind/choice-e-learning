"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { isAdmin } from '@/lib/auth/roles';
import { BookOpenIcon, ArrowLeftIcon, InformationCircleIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const levels = ['beginner', 'intermediate', 'advanced'];

export default function AddCoursePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [level, setLevel] = useState(levels[0]);
  const [topics, setTopics] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Auth check
  useEffect(() => {
    if (status === 'authenticated' && !isAdmin(session.user)) {
      setError('You do not have permission to add courses. Only administrators can perform this action.');
    }
  }, [session, status]);

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (status !== 'authenticated') {
      setError('You must be logged in to add a course.');
      return;
    }
    
    if (!isAdmin(session.user)) {
      setError('Only administrators can add courses.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const topicsArray = topics.split(',').map(topic => topic.trim()).filter(Boolean);
      
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          price: parseFloat(price),
          level,
          topics: topicsArray,
          videoUrl: videoUrl || undefined,
          imageUrl: imageUrl || undefined,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        // Reset form
        setTitle('');
        setDescription('');
        setPrice('');
        setLevel(levels[0]);
        setTopics('');
        setVideoUrl('');
        setImageUrl('');
        
        // Redirect to courses list
        setTimeout(() => {
          router.push('/admin/courses');
        }, 2000);
      } else {
        setError(data.error || 'Failed to add course. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while adding the course. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Render login prompt if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg mb-6">
          <div className="flex items-start mb-2">
            <XCircleIcon className="h-6 w-6 mr-2 flex-shrink-0 text-red-500" />
            <h3 className="text-lg font-semibold text-red-700">Unauthorized. Please login.</h3>
          </div>
          <p className="ml-8 text-red-600">You need to be logged in as an administrator to add courses.</p>
        </div>
        <Link 
          href="/api/auth/signin" 
          className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Login to Admin Dashboard
        </Link>
      </div>
    );
  }
  
  // Render unauthorized message if not admin
  if (status === 'authenticated' && !isAdmin(session.user)) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
          <div className="flex items-start mb-2">
            <XCircleIcon className="h-6 w-6 mr-2 flex-shrink-0 text-red-500" />
            <h3 className="text-lg font-semibold text-red-700">Access Denied</h3>
          </div>
          <p className="ml-8 text-red-600">You do not have permission to add courses. This feature is restricted to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50">
      {/* Header with navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center text-gray-800">
            <BookOpenIcon className="h-7 w-7 mr-3 text-indigo-600" />
            Add New Course
          </h1>
          <Link
            href="/admin/courses"
            className="inline-flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 shadow-sm"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Courses
          </Link>
        </div>
        <p className="text-gray-600 mt-2 ml-10">Create a new course with details, pricing, and content information.</p>
      </div>
      
      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6 shadow-sm">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md mb-6 shadow-sm">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span className="text-green-700 font-medium">Course added successfully! Redirecting to courses list...</span>
          </div>
        </div>
      )}
      
      {/* Main Form Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Course Information</h2>
          <p className="text-sm text-gray-600 mt-1">Required fields are marked with an asterisk (*)</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Course Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Course Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              placeholder="e.g., Introduction to Web Development"
            />
            <p className="text-xs text-gray-500 mt-1">Choose a clear, descriptive title that accurately represents your course content.</p>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              placeholder="Provide a detailed description of your course..."
            />
            <p className="text-xs text-gray-500 mt-1">Explain what students will learn, the course structure, and its benefits.</p>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Course Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Price */}
              <div className="space-y-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price ($) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="e.g., 29.99"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Set a fair price based on content value and market rates.</p>
              </div>
              
              {/* Level */}
              <div className="space-y-2">
                <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                  Level <span className="text-red-500">*</span>
                </label>
                <select
                  id="level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                >
                  {levels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Choose the difficulty level appropriate for your target audience.</p>
              </div>
            </div>
            
            {/* Topics */}
            <div className="mt-8 space-y-2">
              <label htmlFor="topics" className="block text-sm font-medium text-gray-700">
                Topics (comma-separated) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="topics"
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                placeholder="e.g., JavaScript, React, Web Development"
              />
              <p className="text-xs text-gray-500 mt-1">Enter topics covered in your course, separated by commas.</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Media Resources</h3>
            
            {/* Video URL */}
            <div className="space-y-2 mb-8">
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">
                Video URL
              </label>
              <input
                type="url"
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                placeholder="e.g., https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-gray-500 mt-1">Provide a URL to a video introduction or course preview (YouTube or Vimeo recommended).</p>
            </div>
            
            {/* Image URL */}
            <div className="space-y-2">
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                placeholder="e.g., https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">Add an image URL for the course thumbnail (recommended size: 1280x720px).</p>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="border-t border-gray-200 pt-6 flex items-center justify-end space-x-4">
            <Link
              href="/admin/courses"
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 shadow-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-150 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 