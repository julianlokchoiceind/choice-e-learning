'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Chapter } from '@/shared/types/courses/course';

interface ChapterFormProps {
  initialData?: Partial<Chapter>;
  onSubmit: (data: Partial<Chapter>) => void;
  onCancel: () => void;
}

const ChapterForm: React.FC<ChapterFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    order: initialData?.order?.toString() || '1'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when field is edited
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Chapter name cannot be empty';
    }
    
    if (!formData.order.trim() || isNaN(parseInt(formData.order))) {
      newErrors.order = 'Order must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        title: formData.title,
        description: formData.description,
        order: parseInt(formData.order)
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-semibold text-gray-800">
          {initialData?.id ? 'Edit Chapter' : 'Add New Chapter'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      
      <div>
        <label htmlFor="title" className="block text-base font-medium text-gray-700 mb-2">
          Chapter Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter chapter title"
          className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-base font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Brief description of this chapter (optional)"
          rows={3}
          className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
        />
      </div>
      
      <div className="flex space-x-4">
        <button
          type="submit"
          className="btn-admin-primary"
        >
          {initialData?.id ? 'Update' : 'Add Chapter'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-admin-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ChapterForm; 