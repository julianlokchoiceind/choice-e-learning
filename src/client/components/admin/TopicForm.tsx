import React, { useState, useEffect } from 'react';

interface TopicFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const TopicForm: React.FC<TopicFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    timeToComplete: initialData?.timeToComplete?.toString() || '',
    isPublished: initialData?.isPublished ? 'true' : 'false'
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        timeToComplete: initialData.timeToComplete?.toString() || '',
        isPublished: initialData.isPublished ? 'true' : 'false'
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (formData.timeToComplete && isNaN(Number(formData.timeToComplete))) {
      errors.timeToComplete = 'Time to complete must be a number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      try {
        await onSubmit({
          ...formData,
          timeToComplete: formData.timeToComplete ? parseInt(formData.timeToComplete) : 0,
          isPublished: formData.isPublished === 'true'
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('Error submitting form:', errorMessage);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          disabled={isLoading}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            formErrors.title ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
        />
        {formErrors.title && <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          disabled={isLoading}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            formErrors.description ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
        ></textarea>
        {formErrors.description && <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>}
      </div>
      
      <div>
        <label htmlFor="timeToComplete" className="block text-sm font-medium text-gray-700">Time to Complete (minutes)</label>
        <input
          type="number"
          id="timeToComplete"
          name="timeToComplete"
          value={formData.timeToComplete}
          onChange={handleChange}
          disabled={isLoading}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            formErrors.timeToComplete ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
        />
        {formErrors.timeToComplete && <p className="mt-1 text-sm text-red-600">{formErrors.timeToComplete}</p>}
      </div>
      
      <div>
        <label htmlFor="isPublished" className="block text-sm font-medium text-gray-700">Published Status</label>
        <select
          id="isPublished"
          name="isPublished"
          value={formData.isPublished}
          onChange={handleChange}
          disabled={isLoading}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>
      </div>
      
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : initialData?.id ? 'Update Topic' : 'Create Topic'}
        </button>
      </div>
    </form>
  );
}; 