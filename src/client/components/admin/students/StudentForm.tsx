'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormattedStudent } from '@/shared/types/students/student';
import { LoadingState } from '@/client/components/common';
import { useStudentsQuery } from '@/client/hooks/students';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  grade: z.string().optional(),
  imageUrl: z.string().optional(),
  provider: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface StudentFormProps {
  studentId?: string;
}

export const StudentForm = ({ studentId }: StudentFormProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Get hooks from useStudentsQuery
  const { 
    useGetStudentById, 
    useCreateStudent, 
    useUpdateStudent 
  } = useStudentsQuery();
  
  // Use React Query to fetch student by ID
  const { 
    data: student, 
    isLoading: isLoadingStudent,
    error: studentError
  } = useGetStudentById(studentId || '');
  
  // Use React Query mutations
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();
  
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      grade: '',
      imageUrl: '',
    },
  });
  
  // Reset form when student data is loaded
  useEffect(() => {
    if (student) {
      reset({
        name: student.name,
        email: student.email,
        phone: student.phone || '',
        address: student.address || '',
        city: student.city || '',
        grade: student.grade || '',
        imageUrl: student.imageUrl || '',
      });
    }
  }, [student, reset]);
  
  // Display error from React Query
  useEffect(() => {
    if (studentError) {
      setError(studentError instanceof Error ? studentError.message : 'Failed to fetch student data');
    }
  }, [studentError]);
  
  const onSubmit = async (data: FormValues) => {
    setError(null);
    setSuccess(null);
    
    try {
      if (studentId) {
        // Update existing student
        await updateStudentMutation.mutateAsync({ 
          id: studentId, 
          data 
        });
        setSuccess('Student updated successfully');
      } else {
        // Create new student
        await createStudentMutation.mutateAsync(data);
        setSuccess('Student created successfully');
      }
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push('/admin/students');
      }, 1500);
    } catch (error: unknown) {
      console.error('Error saving student:', error);
      setError(error instanceof Error ? error.message : 'Failed to save student');
    }
  };
  
  if (studentId && isLoadingStudent) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <LoadingState variant="section" message="Loading student data..." />
      </div>
    );
  }
  
  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      {error && (
        <div className='mb-6 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md'>
          {error}
        </div>
      )}
      
      {success && (
        <div className='mb-6 bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-md'>
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-1'>
              Name <span className='text-red-500'>*</span>
            </label>
            <input
              id='name'
              {...register('name')}
              placeholder='Enter student name'
              autoComplete='name'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
              onFocus={(e) => e.target.select()}
            />
            {errors.name && (
              <p className='mt-1 text-sm text-red-600'>{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
              Email <span className='text-red-500'>*</span>
            </label>
            <input
              id='email'
              type='email'
              {...register('email')}
              placeholder='Enter email address'
              autoComplete='email'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
              onFocus={(e) => e.target.select()}
            />
            {errors.email && (
              <p className='mt-1 text-sm text-red-600'>{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor='phone' className='block text-sm font-medium text-gray-700 mb-1'>
              Phone
            </label>
            <input
              id='phone'
              {...register('phone')}
              placeholder='Enter phone number'
              autoComplete='tel'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
              onFocus={(e) => e.target.select()}
            />
            {errors.phone && (
              <p className='mt-1 text-sm text-red-600'>{errors.phone.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor='address' className='block text-sm font-medium text-gray-700 mb-1'>
              Address
            </label>
            <input
              id='address'
              {...register('address')}
              placeholder='Enter address'
              autoComplete='street-address'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
              onFocus={(e) => e.target.select()}
            />
            {errors.address && (
              <p className='mt-1 text-sm text-red-600'>{errors.address.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor='city' className='block text-sm font-medium text-gray-700 mb-1'>
              City
            </label>
            <input
              id='city'
              {...register('city')}
              placeholder='Enter city'
              autoComplete='address-level2'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
              onFocus={(e) => e.target.select()}
            />
            {errors.city && (
              <p className='mt-1 text-sm text-red-600'>{errors.city.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor='grade' className='block text-sm font-medium text-gray-700 mb-1'>
              Grade
            </label>
            <input
              id='grade'
              {...register('grade')}
              placeholder='Enter grade'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
              onFocus={(e) => e.target.select()}
            />
            {errors.grade && (
              <p className='mt-1 text-sm text-red-600'>{errors.grade.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor='imageUrl' className='block text-sm font-medium text-gray-700 mb-1'>
              Image URL
            </label>
            <input
              id='imageUrl'
              {...register('imageUrl')}
              placeholder='Enter image URL'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
              onFocus={(e) => e.target.select()}
            />
            {errors.imageUrl && (
              <p className='mt-1 text-sm text-red-600'>{errors.imageUrl.message}</p>
            )}
          </div>
        </div>
        
        <div className='flex justify-end space-x-3'>
          <Link
            href='/admin/students'
            className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
          >
            Cancel
          </Link>
          <button
            type='submit'
            className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
            disabled={createStudentMutation.isPending || updateStudentMutation.isPending}
          >
            {(createStudentMutation.isPending || updateStudentMutation.isPending) ? (
              <LoadingState variant="button" message="Saving..." />
            ) : (
              studentId ? 'Update Student' : 'Create Student'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
