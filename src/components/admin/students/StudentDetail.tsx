"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
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
} from "@heroicons/react/24/outline";

interface Student {
  id: string;
  name?: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  grade?: string | null;
  imageUrl?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  role?: string;
}

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
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await axios.get(`/api/admin/students/${studentId}`);
        if (response.data && response.data.success && response.data.data) {
          setStudent(response.data.data);
          setError(null);
          
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
          
        } else {
          throw new Error("Invalid API response format");
        }
      } catch (error) {
        console.error("Error fetching student:", error);
        setError("Failed to fetch student details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, [studentId]);
  
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        const response = await axios.delete(`/api/admin/students/${studentId}`);
        if (response.data && response.data.success) {
          // Nếu xóa thành công, quay về trang danh sách
          router.push("/admin/students");
        } else {
          throw new Error(response.data?.error || "Unknown error");
        }
      } catch (error: any) {
        console.error("Error deleting student:", error);
        setError(error.response?.data?.error || error.message || "Failed to delete student. Please try again.");
      }
    }
  };
  
  const getInitials = (name: string | undefined) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error || !student) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600 mb-6">{error || 'Student not found'}</p>
        <Link 
          href="/admin/students" 
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to All Students
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link 
          href="/admin/students" 
          className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white rounded-md text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Students
        </Link>
        
        <div className="flex gap-2">
          <Link
            href={`/admin/students/${studentId}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white rounded-md text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <PencilSquareIcon className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-red-300 bg-white rounded-md text-red-700 shadow-sm hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>
      
      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Student Profile */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Profile</h2>
            
            {/* Avatar and Name */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-36 h-36 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center mb-4">
                {student.imageUrl ? (
                  <img src={student.imageUrl} alt={student.name || 'Student'} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <span className="text-indigo-600 text-5xl font-bold">
                    {getInitials(student.name)}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mt-2">{student.name || 'Unnamed Student'}</h3>
              <div className="h-1 w-36 bg-indigo-600 rounded-full mt-1 mb-3"></div>
              {student.grade && (
                <div className="flex items-center gap-1 text-gray-500">
                  <AcademicCapIcon className="h-4 w-4" />
                  <span>Grade: {student.grade}</span>
                </div>
              )}
            </div>
            
            {/* Contact Information */}
            <div className="space-y-3 mb-8">
              <div className="p-4 bg-gray-50 rounded-lg flex items-start">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                  <EnvelopeIcon className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="text-base text-gray-800">{student.email}</div>
                </div>
              </div>
              
              {student.phone && (
                <div className="p-4 bg-gray-50 rounded-lg flex items-start">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <PhoneIcon className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="text-base text-gray-800">{student.phone}</div>
                  </div>
                </div>
              )}
              
              {(student.address || student.city) && (
                <div className="p-4 bg-gray-50 rounded-lg flex items-start">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <MapPinIcon className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Address</div>
                    <div className="text-base text-gray-800">
                      {student.address}
                      {student.address && student.city && ", "}
                      {student.city}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Activity Section */}
            <h3 className="text-lg font-bold text-gray-800 mb-4">Activity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Last Login</div>
                <div className="text-base font-semibold text-gray-800">24/4/2025 - 14:30</div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Completion Rate</div>
                <div className="flex flex-col">
                  <div className="text-base font-semibold text-gray-800 mb-1">70%</div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="w-[70%] h-2 bg-indigo-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column: Details and Courses */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Account Information</h2>
            
            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">ID</div>
                <div className="text-sm font-mono text-gray-800 break-all">{student.id}</div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Created At</div>
                <div className="text-base text-gray-800">{new Date(student.createdAt).toLocaleDateString()}</div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Last Updated</div>
                <div className="text-base text-gray-800">{new Date(student.updatedAt).toLocaleDateString()}</div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Status</div>
                <div className="mt-1">
                  <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>
            
            {/* Enrolled Courses Section */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">Enrolled Courses</h2>
            
            <div className="space-y-4">
              {enrolledCourses.map(course => (
                <div key={course.id} className={`p-4 rounded-lg relative border-2 ${course.status === 'completed' ? 
                  'bg-blue-50/50 border-blue-500/30' : 'bg-indigo-50/50 border-indigo-500/30'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">{course.title}</h4>
                      <div className="text-sm text-gray-500 mt-1">
                        Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}
                      </div>
                      <div className="mt-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${course.status === 'completed' ? 
                          'text-green-800 bg-green-100' : 'text-indigo-800 bg-indigo-100'}`}>
                          {course.status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress Circle */}
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="2"></circle>
                        <circle 
                          cx="18" cy="18" r="16" 
                          fill="none" 
                          stroke={course.status === 'completed' ? '#16a34a' : '#4f46e5'} 
                          strokeWidth="2" 
                          strokeDasharray="100" 
                          strokeDashoffset={100 - (course.progress || 0)} 
                          transform="rotate(-90 18 18)"
                        ></circle>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-semibold">{course.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment History Section (Single Column) */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Payment History</h2>
          
          {/* Payment History Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {payment.course}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {payment.method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                        {payment.status === 'completed' ? 'Completed' : payment.status === 'pending' ? 'Pending' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {payments.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                No payment records found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
