'use client';

import { useState, useEffect } from 'react';
import { isFormDirty, extractComparableData } from '@/client/utils/form-utils';

interface FAQFormProps {
  faq?: any;
  faqId?: string;
  initialData?: {
    question: string;
    answer: string;
    category: string;
    isActive?: boolean;
  };
  categories?: string[];
  onSubmit?: (data) => Promise<void>;
  isLoading?: boolean;
  onFormChange?: (data: any, isDirty?: boolean) => void;
}

export const FAQForm = ({
  faq,
  faqId,
  initialData,
  categories = [],
  onSubmit,
  isLoading = false,
  onFormChange
}: FAQFormProps) => {
  const [formData, setFormData] = useState({
    question: faq?.question || initialData?.question || '',
    answer: faq?.answer || initialData?.answer || '',
    category: faq?.category || initialData?.category || '',
    newCategory: '',
    isActive: faq?.isActive ?? initialData?.isActive ?? true
  });
  
  const [initialFormData, setInitialFormData] = useState(formData);
  const [useNewCategory, setUseNewCategory] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  
  // Update form data only on initial load
  useEffect(() => {
    const data = faq || initialData;
    if (data) {
      const newFormData = {
        question: data.question || '',
        answer: data.answer || '',
        category: data.category || '',
        newCategory: '',
        isActive: data.isActive ?? true
      };
      
      setFormData(newFormData);
      setInitialFormData(newFormData);
      
      // Check if category exists in the list
      if (data.category && !categories.includes(data.category)) {
        setUseNewCategory(true);
        setFormData(prev => ({
          ...prev,
          newCategory: data.category
        }));
      }
    }
  }, [faq?.id, initialData]); // Only depend on ID to avoid re-runs
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    };
    
    setFormData(newFormData);
    
    // Check if form is dirty with smart detection
    const categoryToUse = useNewCategory ? newFormData.newCategory : newFormData.category;
    const currentData = {
      question: newFormData.question,
      answer: newFormData.answer,
      category: categoryToUse,
      isActive: newFormData.isActive
    };
    
    const initialCategoryToUse = useNewCategory ? initialFormData.newCategory : initialFormData.category;
    const initialDataForComparison = {
      question: initialFormData.question,
      answer: initialFormData.answer,
      category: initialCategoryToUse,
      isActive: initialFormData.isActive
    };
    
    const isDirty = isFormDirty(currentData, initialDataForComparison);
    
    // Notify parent of changes
    if (onFormChange) {
      onFormChange(currentData, isDirty);
    }
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear server error on any change
    if (serverError) {
      setServerError(null);
    }
  };
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.question.trim()) {
      errors.question = 'Question is required';
    }
    
    if (!formData.answer.trim()) {
      errors.answer = 'Answer is required';
    }
    
    if (useNewCategory) {
      if (!formData.newCategory.trim()) {
        errors.newCategory = 'Category name is required';
      }
    } else if (!formData.category) {
      errors.category = 'Please select a category';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setServerError(null);
    
    try {
      // Use either existing category or new category
      const categoryToUse = useNewCategory ? formData.newCategory : formData.category;
      
      await onSubmit({
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        category: categoryToUse.trim(),
        isActive: formData.isActive
      });
    } catch (err: unknown) {
      console.error('Error submitting FAQ:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit FAQ. Please try again.';
      setServerError(errorMessage);
    }
  };
  
  return (
    <div className='bg-white rounded-lg shadow-md border border-gray-100 p-6'>
      {/* Server error message */}
      {serverError && (
        <div className='mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
          {serverError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <label htmlFor='question' className='block text-sm font-medium text-gray-700 mb-1'>
            Question <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            id='question'
            name='question'
            value={formData.question}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              formErrors.question ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:ring-0 focus:border-[var(--color-primary)]`}
            placeholder='Enter the question'
            disabled={isLoading}
          />
          {formErrors.question && (
            <p className='mt-1 text-sm text-red-600'>{formErrors.question}</p>
          )}
        </div>
        
        <div>
          <label htmlFor='answer' className='block text-sm font-medium text-gray-700 mb-1'>
            Answer <span className='text-red-500'>*</span>
          </label>
          <textarea
            id='answer'
            name='answer'
            value={formData.answer}
            onChange={handleChange}
            rows={6}
            className={`w-full px-3 py-2 border ${
              formErrors.answer ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:ring-0 focus:border-[var(--color-primary)]`}
            placeholder='Enter the answer'
            disabled={isLoading}
          />
          {formErrors.answer && (
            <p className='mt-1 text-sm text-red-600'>{formErrors.answer}</p>
          )}
        </div>
        
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Category <span className='text-red-500'>*</span>
          </label>
          <div className='flex items-center mb-3'>
            <input
              type='checkbox'
              id='useNewCategory'
              checked={useNewCategory}
              onChange={() => {
                const newUseNewCategory = !useNewCategory;
                setUseNewCategory(newUseNewCategory);
                
                // Notify parent of changes when checkbox is toggled
                if (onFormChange) {
                  const categoryToUse = newUseNewCategory ? formData.newCategory : formData.category;
                  const currentData = {
                    question: formData.question,
                    answer: formData.answer,
                    category: categoryToUse,
                    isActive: formData.isActive
                  };
                  
                  const initialCategoryToUse = newUseNewCategory ? initialFormData.newCategory : initialFormData.category;
                  const initialDataForComparison = {
                    question: initialFormData.question,
                    answer: initialFormData.answer,
                    category: initialCategoryToUse,
                    isActive: initialFormData.isActive
                  };
                  
                  const isDirty = isFormDirty(currentData, initialDataForComparison);
                  onFormChange(currentData, isDirty);
                }
              }}
              className='mr-2'
              disabled={isLoading}
            />
            <label htmlFor='useNewCategory' className='text-sm text-gray-600'>
              Create new category
            </label>
          </div>
          
          {useNewCategory ? (
            <div>
              <input
                type='text'
                id='newCategory'
                name='newCategory'
                value={formData.newCategory}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  formErrors.newCategory ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:ring-0 focus:border-[var(--color-primary)]`}
                placeholder='Enter new category name'
                disabled={isLoading}
              />
              {formErrors.newCategory && (
                <p className='mt-1 text-sm text-red-600'>{formErrors.newCategory}</p>
              )}
            </div>
          ) : (
            <div>
              <select
                id='category'
                name='category'
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  formErrors.category ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:ring-0 focus:border-[var(--color-primary)]`}
                disabled={isLoading}
              >
                <option value=''>Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {formErrors.category && (
                <p className='mt-1 text-sm text-red-600'>{formErrors.category}</p>
              )}
            </div>
          )}
        </div>
        
        <div className='flex items-center'>
          <input
            type='checkbox'
            id='isActive'
            name='isActive'
            checked={formData.isActive}
            onChange={handleChange}
            className='h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-[var(--color-primary)]'
            disabled={isLoading}
          />
          <label htmlFor='isActive' className='ml-2 block text-sm text-gray-700'>
            Active
          </label>
        </div>
        
        {onSubmit && (
          <div className='flex justify-end space-x-4 pt-4'>
            <button
              type='submit'
              disabled={isLoading}
              className='btn-admin-primary'
            >
              {isLoading ? (faqId ? 'Saving...' : 'Creating...') : (faqId ? 'Save Changes' : 'Create FAQ')}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default FAQForm;