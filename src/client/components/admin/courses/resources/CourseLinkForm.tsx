'use client';

import { FC, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CourseReferenceLink } from '@/shared/types/courses/course-reference-link';

interface CourseLinkFormProps {
  initialData?: CourseReferenceLink | null;
  onSubmit: (data: Omit<CourseReferenceLink, 'id' | 'createdAt' | 'updatedAt' | 'courseId' | 'order' | 'isActive'>) => void;
  onCancel: () => void;
}

const CourseLinkForm: FC<CourseLinkFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    url: initialData?.url || '',
    description: initialData?.description || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title.trim()) {
      console.error('Title is required');
      return;
    }

    if (!formData.url.trim()) {
      console.error('URL is required');
      return;
    }

    // Auto-add https:// if not present
    let finalUrl = formData.url.trim();
    if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    // Validate URL format
    try {
      new URL(finalUrl);
    } catch {
      console.error('Invalid URL format:', finalUrl);
      return;
    }

    console.log('🔍 CourseLinkForm submitting data:', {
      title: formData.title.trim(),
      url: finalUrl,
      description: formData.description.trim() || undefined
    });

    try {
      await onSubmit({
        title: formData.title.trim(),
        url: finalUrl,
        description: formData.description.trim() || undefined
      });
    } catch (error) {
      console.error('Failed to save link:', error);
    }
  };

  const handleUrlBlur = () => {
    if (formData.url && !formData.url.startsWith('http://') && !formData.url.startsWith('https://')) {
      setFormData(prev => ({ ...prev, url: 'https://' + prev.url }));
    }
  };

  const extractTitle = async () => {
    if (!formData.url || formData.title) return;
    
    try {
      // Extract the domain name as a fallback
      const domain = new URL(formData.url).hostname.replace('www.', '');
      const suggestedTitle = domain.charAt(0).toUpperCase() + domain.slice(1);
      setFormData(prev => ({ ...prev, title: suggestedTitle }));
    } catch (error) {
      console.error('Failed to extract title:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-gray-900">
          {initialData ? 'Edit Reference Link' : 'Add Reference Link'}
        </h4>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* URL Field */}
      <div>
        <label htmlFor="url" className="block text-base font-medium text-gray-700 mb-2">
          URL
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            onBlur={handleUrlBlur}
            placeholder="https://reactjs.org/docs"
            className="flex-1 px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {!formData.title && formData.url && (
            <button
              type="button"
              onClick={extractTitle}
              className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-md hover:bg-blue-50"
            >
              Auto-fill Title
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Enter URL (e.g., https://reactjs.org/docs)
        </p>
      </div>

      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-base font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="React Official Documentation"
          className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-base font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Brief description of this resource (optional)"
          className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Optional description to help students understand the resource
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {initialData ? 'Update Link' : 'Add Link'}
        </button>
      </div>
    </form>
  );
};

export default CourseLinkForm;