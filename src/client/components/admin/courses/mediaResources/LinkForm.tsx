'use client';

import { FC, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ReferenceLink } from '@/shared/types/courses/reference-link';

interface LinkFormProps {
  initialData?: ReferenceLink | null;
  onSubmit: (data: Omit<ReferenceLink, 'id' | 'createdAt' | 'updatedAt' | 'courseId' | 'order' | 'isActive'>) => void;
  onCancel: () => void;
}

const LinkForm: FC<LinkFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    url: initialData?.url || '',
    description: initialData?.description || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsValidating(true);

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else if (!validateUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL (e.g., https://example.com)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsValidating(false);
      return;
    }

    // Auto-add https:// if not present
    let finalUrl = formData.url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    try {
      await onSubmit({
        title: formData.title.trim(),
        url: finalUrl,
        description: formData.description.trim() || undefined
      });
    } catch (error) {
      console.error('Failed to save link:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleUrlBlur = () => {
    if (formData.url && !formData.url.startsWith('http://') && !formData.url.startsWith('https://')) {
      setFormData(prev => ({ ...prev, url: 'https://' + prev.url }));
    }
  };

  const extractTitle = async () => {
    if (!formData.url || !validateUrl(formData.url) || formData.title) return;
    
    try {
      // In a real implementation, you'd make an API call to extract the title
      // For now, we'll just extract the domain name as a fallback
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
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
          URL <span className="text-red-500">*</span>
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
            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.url ? 'border-red-300' : 'border-gray-300'
            }`}
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
        {errors.url && (
          <p className="mt-1 text-sm text-red-600">{errors.url}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Enter URL (e.g., https://reactjs.org/docs)
        </p>
      </div>

      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="React Official Documentation"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Brief description of this resource (optional)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          disabled={isValidating}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isValidating ? 'Saving...' : (initialData ? 'Update Link' : 'Add Link')}
        </button>
      </div>
    </form>
  );
};

export default LinkForm;