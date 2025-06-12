'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  CreditCardIcon,
  BanknotesIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { LoadingState } from '@/client/components/common';
import { useStudentsQuery } from '@/client/hooks/students';
import { FormattedStudent } from '@/shared/types/students/student';

// These interfaces should be moved to shared types in a real implementation
interface Course {
  id: string;
  title: string;
  price: number;
  level: string;
  progress?: number;
  status: 'completed' | 'in_progress' | 'not_started';
  enrolledAt: string | Date;
}

interface Payment {
  id: string;
  date: string | Date;
  course: string;
  courseId: string;
  method: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
}

interface StudentDetailProps {
  studentId: string;
}

export const StudentDetail = ({ studentId }: StudentDetailProps) => {
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  // Get hooks from useStudentsQuery
  const { 
    useGetStudentById,
    useDeleteStudent
  } = useStudentsQuery();
  
  // Use React Query to fetch student by ID
  const { 
    data: student, 
    isLoading, 
    error: studentError 
  } = useGetStudentById(studentId);
  
  // Use React Query mutation for delete
  const deleteStudentMutation = useDeleteStudent();
  
  useEffect(() => {
    // Simulate enrolled courses data for demo
    // In production, this would come from API
    const mockCourses: Course[] = [
      {
        id: '1',
        title: 'React Fundamentals',
        price: 99.00,
        level: 'intermediate',
        progress: 65,
        status: 'in_progress',
        enrolledAt: new Date('2025-04-20')
      },
      {
        id: '2',
        title: 'HTML Course',
        price: 20.00,
        level: 'beginner',
        progress: 100,
        status: 'completed',
        enrolledAt: new Date('2025-04-18')
      }
    ];
    setEnrolledCourses(mockCourses);
    
    // Simulate payment history for demo
    // In production, this would come from API
    const mockPayments: Payment[] = [
      {
        id: 'pay1',
        date: new Date('2025-04-20'),
        course: 'React Fundamentals',
        courseId: '1',
        method: 'Credit Card',
        amount: 99.00,
        status: 'completed'
      },
      {
        id: 'pay2',
        date: new Date('2025-04-18'),
        course: 'HTML Course',
        courseId: '2',
        method: 'PayPal',
        amount: 20.00,
        status: 'completed'
      }
    ];
    setPayments(mockPayments);
  }, []);
  
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteStudentMutation.mutateAsync(studentId);
        // If deletion is successful, navigate back to students list
        router.push('/admin/students');
      } catch (error: unknown) {
        console.error('Error deleting student:', error);
        // Error handling is done by the mutation
      }
    }
  };
  
  const getInitials = (name: string | undefined) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <LoadingState variant="page" message="Loading student details..." />
      </div>
    );
  }
  
  // Show error state
  if (studentError || !student) {
    const errorMessage = studentError instanceof Error 
      ? studentError.message 
      : 'Failed to fetch student data';
    
    return (
      <div className='text-center py-10'>
        <h1 className='text-2xl font-bold text-red-600 mb-4'>Error</h1>
        <p className='text-gray-600 mb-6'>{errorMessage || 'Student not found'}</p>
        <Link 
          href='/admin/students' 
          className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700'
        >
          Back to All Students
        </Link>
      </div>
    );
  }
  
  // Format dates for display
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <Link 
          href='/admin/students' 
          className='inline-flex items-center px-4 py-2 border border-gray-300 bg-white rounded-md text-gray-700 shadow-sm hover:bg-gray-50'
        >
          <ArrowLeftIcon className='h-4 w-4 mr-2' />
          Back to Students
        </Link>
        
        <div className='flex gap-2'>
          <Link
            href={`/admin/students/${studentId}/edit`}
            className='inline-flex items-center px-4 py-2 border border-gray-300 bg-white rounded-md text-gray-700 shadow-sm hover:bg-gray-50'
          >
            <PencilSquareIcon className='h-4 w-4 mr-2' />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className='inline-flex items-center px-4 py-2 border border-red-300 bg-white rounded-md text-red-700 shadow-sm hover:bg-red-50'
            disabled={deleteStudentMutation.isPending}
          >
            {deleteStudentMutation.isPending ? (
              <LoadingState variant="button" message="Deleting..." />
            ) : (
              <>
                <TrashIcon className='h-4 w-4 mr-2' />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Main Content - Two Columns */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Left Column: Student Profile */}
        <div className='bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200'>
          <div className='p-6'>
            <h2 className='text-xl font-bold text-gray-800 mb-6'>Profile</h2>
            
            {/* Avatar and Name */}
            <div className='flex flex-col items-center mb-8'>
              <div className='w-36 h-36 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center mb-4'>
                {student.imageUrl ? (
                  <Image src={student.imageUrl} alt={student.name || 'Student'} className='h-full w-full rounded-full object-cover' width={500} height={300} />
                ) : (
                  <span className='text-indigo-600 text-5xl font-bold'>
                    {getInitials(student.name)}
                  </span>
                )}
              </div>
              <h3 className='text-2xl font-bold text-gray-800 mt-2'>{student.name || 'Unnamed Student'}</h3>
              <div className='h-1 w-36 bg-indigo-600 rounded-full mt-1 mb-3'></div>
              {student.grade && (
                <div className='flex items-center gap-1 text-gray-500'>
                  <AcademicCapIcon className='h-4 w-4' />
                  <span>Grade: {student.grade}</span>
                </div>
              )}
            </div>
            
            {/* Contact Information */}
            <div className='space-y-4'>
              <h4 className='text-lg font-semibold text-gray-700 mb-2'>Contact Information</h4>
              
              <div className='flex items-start'>
                <EnvelopeIcon className='h-5 w-5 text-indigo-600 mt-0.5 mr-3' />
                <div>
                  <p className='text-sm text-gray-500'>Email</p>
                  <p className='text-gray-800'>{student.email}</p>
                </div>
              </div>
              
              {student.phone && (
                <div className='flex items-start'>
                  <PhoneIcon className='h-5 w-5 text-indigo-600 mt-0.5 mr-3' />
                  <div>
                    <p className='text-sm text-gray-500'>Phone</p>
                    <p className='text-gray-800'>{student.phone}</p>
                  </div>
                </div>
              )}
              
              {(student.address || student.city) && (
                <div className='flex items-start'>
                  <MapPinIcon className='h-5 w-5 text-indigo-600 mt-0.5 mr-3' />
                  <div>
                    <p className='text-sm text-gray-500'>Address</p>
                    <p className='text-gray-800'>
                      {student.address}{student.address && student.city ? ', ' : ''}{student.city}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Account Information */}
            <div className='mt-8 space-y-4'>
              <h4 className='text-lg font-semibold text-gray-700 mb-2'>Account Information</h4>
              
              <div className='flex items-start'>
                <CalendarIcon className='h-5 w-5 text-indigo-600 mt-0.5 mr-3' />
                <div>
                  <p className='text-sm text-gray-500'>Registered</p>
                  <p className='text-gray-800'>{formatDate(student.createdAt)}</p>
                </div>
              </div>
              
              <div className='flex items-start'>
                <UserIcon className='h-5 w-5 text-indigo-600 mt-0.5 mr-3' />
                <div>
                  <p className='text-sm text-gray-500'>Role</p>
                  <p className='text-gray-800'>{student.role || 'Student'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column: Courses and Payments */}
        <div className='space-y-6'>
          {/* Enrolled Courses */}
          <div className='bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200'>
            <div className='p-6'>
              <h2 className='text-xl font-bold text-gray-800 mb-4'>Enrolled Courses</h2>
              
              {enrolledCourses.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                  <AcademicCapIcon className='h-12 w-12 mx-auto text-gray-300 mb-2' />
                  <p>No courses enrolled yet</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {enrolledCourses.map((course) => (
                    <div key={course.id} className='border rounded-lg p-4 hover:bg-gray-50 transition-colors'>
                      <div className='flex justify-between items-start mb-2'>
                        <h3 className='font-medium text-indigo-700'>{course.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          course.status === 'completed' ? 'bg-green-100 text-green-800' :
                          course.status === 'in_progress' ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {course.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                      
                      <div className='flex justify-between text-sm text-gray-600'>
                        <span>Level: {course.level.charAt(0).toUpperCase() + course.level.slice(1)}</span>
                        <span>${course.price.toFixed(2)}</span>
                      </div>
                      
                      {course.progress !== undefined && (
                        <div className='mt-2'>
                          <div className='flex justify-between text-xs mb-1'>
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
                            <div 
                              className='h-full bg-indigo-600 rounded-full' 
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <div className='mt-2 text-xs text-gray-500'>
                        Enrolled on {formatDate(course.enrolledAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Payment History */}
          <div className='bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200'>
            <div className='p-6'>
              <h2 className='text-xl font-bold text-gray-800 mb-4'>Payment History</h2>
              
              {payments.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                  <BanknotesIcon className='h-12 w-12 mx-auto text-gray-300 mb-2' />
                  <p>No payment records found</p>
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='min-w-full'>
                    <thead>
                      <tr className='border-b'>
                        <th className='text-left py-2 text-sm font-medium text-gray-600'>Date</th>
                        <th className='text-left py-2 text-sm font-medium text-gray-600'>Course</th>
                        <th className='text-left py-2 text-sm font-medium text-gray-600'>Method</th>
                        <th className='text-right py-2 text-sm font-medium text-gray-600'>Amount</th>
                        <th className='text-right py-2 text-sm font-medium text-gray-600'>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className='border-b last:border-b-0 hover:bg-gray-50 transition-colors'>
                          <td className='py-3 text-sm'>{formatDate(payment.date)}</td>
                          <td className='py-3 text-sm font-medium text-indigo-700'>{payment.course}</td>
                          <td className='py-3 text-sm'>{payment.method}</td>
                          <td className='py-3 text-sm text-right'>${payment.amount.toFixed(2)}</td>
                          <td className='py-3 text-right'>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
