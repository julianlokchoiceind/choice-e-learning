'use client';

import { useState, useEffect } from 'react';
import { isFormDirty } from '@/client/utils/form-utils';

interface StudentFormProps {
  student?: any;
  studentId?: string;
  initialData?: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    grade?: string;
    imageUrl?: string;
    isActive: boolean;
  };
  onSubmit?: (data: any) => Promise<void>;
  isLoading?: boolean;
  onFormChange?: (data: any, isDirty?: boolean) => void;
}

export const StudentForm = ({
  student,
  studentId,
  initialData,
  onSubmit,
  isLoading = false,
  onFormChange
}: StudentFormProps) => {
  const [formData, setFormData] = useState({
    name: student?.name || initialData?.name || '',
    email: student?.email || initialData?.email || '',
    phone: student?.phone || initialData?.phone || '',
    address: student?.address || initialData?.address || '',
    city: student?.city || initialData?.city || '',
    grade: student?.grade || initialData?.grade || '',
    imageUrl: student?.imageUrl || initialData?.imageUrl || '',
    isActive: student?.isActive ?? initialData?.isActive ?? true
  });
  
  const [initialFormData, setInitialFormData] = useState(formData);
  
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    grade?: string;
    imageUrl?: string;
  }>({});
  
  const [serverError, setServerError] = useState<string | null>(null);
  
  // Update form data only on initial load
  useEffect(() => {
    const newFormData = student ? {
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      address: student.address || '',
      city: student.city || '',
      grade: student.grade || '',
      imageUrl: student.imageUrl || '',
      isActive: student.isActive ?? true
    } : initialData ? {
      name: initialData.name || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      address: initialData.address || '',
      city: initialData.city || '',
      grade: initialData.grade || '',
      imageUrl: initialData.imageUrl || '',
      isActive: initialData.isActive ?? true
    } : formData;
    
    setFormData(newFormData);
    setInitialFormData(newFormData);
  }, [student?.id, initialData]); // Only depend on ID to avoid re-runs
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    };
    
    setFormData(newFormData);
    
    // Check if form is dirty with smart detection
    const isDirty = isFormDirty(newFormData, initialFormData);
    
    // Notify parent of changes
    if (onFormChange) {
      onFormChange(newFormData, isDirty);
    }
    
    // Clear error for this field when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    // Clear server error on any change
    if (serverError) {
      setServerError(null);
    }
  };
  
  const validateForm = () => {
    const errors: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      city?: string;
      grade?: string;
      imageUrl?: string;
    } = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (onSubmit) {
        await onSubmit({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          address: formData.address.trim() || undefined,
          city: formData.city.trim() || undefined,
          grade: formData.grade.trim() || undefined,
          imageUrl: formData.imageUrl.trim() || undefined,
          isActive: formData.isActive
        });
      }
    } catch (err: unknown) {
      console.error('Error submitting student:', err);
      const errorMessage = typeof err === 'object' && err !== null && 'response' in err && 
        typeof err.response === 'object' && err.response !== null && 'data' in err.response && 
        typeof err.response.data === 'object' && err.response.data !== null && 'error' in err.response.data ? 
        String(err.response.data.error) : 
        'Failed to submit student. Please try again.';
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
      
      <form id="student-form" onSubmit={handleSubmit} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-1'>
              Name <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              id='name'
              name='name'
              value={formData.name}
              onChange={handleChange}
              placeholder='Enter student name'
              autoComplete='name'
              className={`w-full px-3 py-2 border ${
                formErrors.name ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:ring-0 focus:border-[var(--color-primary)]`}
              disabled={isLoading}
              onFocus={(e) => e.target.select()}
            />
            {formErrors.name && (
              <p className='mt-1 text-sm text-red-600'>{formErrors.name}</p>
            )}
          </div>
          
          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
              Email <span className='text-red-500'>*</span>
            </label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              placeholder='Enter email address'
              autoComplete='email'
              className={`w-full px-3 py-2 border ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:ring-0 focus:border-[var(--color-primary)]`}
              disabled={isLoading}
              onFocus={(e) => e.target.select()}
            />
            {formErrors.email && (
              <p className='mt-1 text-sm text-red-600'>{formErrors.email}</p>
            )}
          </div>
          
          <div>
            <label htmlFor='phone' className='block text-sm font-medium text-gray-700 mb-1'>
              Phone
            </label>
            <input
              type='text'
              id='phone'
              name='phone'
              value={formData.phone}
              onChange={handleChange}
              placeholder='Enter phone number'
              autoComplete='tel'
              className={`w-full px-3 py-2 border ${
                formErrors.phone ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:ring-0 focus:border-[var(--color-primary)]`}
              disabled={isLoading}
              onFocus={(e) => e.target.select()}
            />
            {formErrors.phone && (
              <p className='mt-1 text-sm text-red-600'>{formErrors.phone}</p>
            )}
          </div>
          
          <div>
            <label htmlFor='address' className='block text-sm font-medium text-gray-700 mb-1'>
              Address
            </label>
            <input
              type='text'
              id='address'
              name='address'
              value={formData.address}
              onChange={handleChange}
              placeholder='Enter address'
              autoComplete='street-address'
              className={`w-full px-3 py-2 border ${
                formErrors.address ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:ring-0 focus:border-[var(--color-primary)]`}
              disabled={isLoading}
              onFocus={(e) => e.target.select()}
            />
            {formErrors.address && (
              <p className='mt-1 text-sm text-red-600'>{formErrors.address}</p>
            )}
          </div>
          
          <div>
            <label htmlFor='city' className='block text-sm font-medium text-gray-700 mb-1'>
              City
            </label>
            <input
              type='text'
              id='city'
              name='city'
              value={formData.city}
              onChange={handleChange}
              placeholder='Enter city'
              autoComplete='address-level2'
              className={`w-full px-3 py-2 border ${
                formErrors.city ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:ring-0 focus:border-[var(--color-primary)]`}
              disabled={isLoading}
              onFocus={(e) => e.target.select()}
            />
            {formErrors.city && (
              <p className='mt-1 text-sm text-red-600'>{formErrors.city}</p>
            )}
          </div>
          
          <div>
            <label htmlFor='grade' className='block text-sm font-medium text-gray-700 mb-1'>
              Grade
            </label>
            <input
              type='text'
              id='grade'
              name='grade'
              value={formData.grade}
              onChange={handleChange}
              placeholder='Enter grade'
              className={`w-full px-3 py-2 border ${
                formErrors.grade ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:ring-0 focus:border-[var(--color-primary)]`}
              disabled={isLoading}
              onFocus={(e) => e.target.select()}
            />
            {formErrors.grade && (
              <p className='mt-1 text-sm text-red-600'>{formErrors.grade}</p>
            )}
          </div>
          
          <div>
            <label htmlFor='imageUrl' className='block text-sm font-medium text-gray-700 mb-1'>
              Image URL
            </label>
            <input
              type='text'
              id='imageUrl'
              name='imageUrl'
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder='Enter image URL'
              className={`w-full px-3 py-2 border ${
                formErrors.imageUrl ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:ring-0 focus:border-[var(--color-primary)]`}
              disabled={isLoading}
              onFocus={(e) => e.target.select()}
            />
            {formErrors.imageUrl && (
              <p className='mt-1 text-sm text-red-600'>{formErrors.imageUrl}</p>
            )}
          </div>
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
              {isLoading ? (studentId ? 'Saving...' : 'Creating...') : (studentId ? 'Save Changes' : 'Create Student')}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default StudentForm;