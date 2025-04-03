import React from 'react';
import Link from 'next/link';
import { 
  UsersIcon, 
  BookOpenIcon, 
  AcademicCapIcon, 
  CreditCardIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Admin Dashboard | Choice E-Learning',
  description: 'Manage courses, users, and content on the Choice E-Learning platform',
};

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { 
            title: 'Total Users', 
            count: '5,234', 
            icon: <UsersIcon className="h-8 w-8 text-white" />, 
            change: '+12%',
            isUp: true,
            bgColor: 'bg-blue-600'
          },
          { 
            title: 'Total Courses', 
            count: '48', 
            icon: <BookOpenIcon className="h-8 w-8 text-white" />, 
            change: '+5%',
            isUp: true,
            bgColor: 'bg-indigo-600'
          },
          { 
            title: 'Active Students', 
            count: '3,721', 
            icon: <AcademicCapIcon className="h-8 w-8 text-white" />, 
            change: '+18%',
            isUp: true,
            bgColor: 'bg-green-600'
          },
          { 
            title: 'Revenue (Monthly)', 
            count: '$45,289', 
            icon: <CreditCardIcon className="h-8 w-8 text-white" />, 
            change: '-2%',
            isUp: false,
            bgColor: 'bg-purple-600'
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className={`p-4 ${stat.bgColor}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white text-sm font-medium">{stat.title}</p>
                  <h3 className="text-white text-2xl font-bold">{stat.count}</h3>
                </div>
                <div className="p-2 rounded-full bg-white/20">
                  {stat.icon}
                </div>
              </div>
            </div>
            <div className="px-4 py-2 bg-gray-50">
              <div className="flex items-center">
                {stat.isUp ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change} since last month
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            href="/admin/courses/create" 
            className="flex items-center justify-center p-4 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            <span className="font-medium">Add New Course</span>
          </Link>
          <Link 
            href="/admin/users" 
            className="flex items-center justify-center p-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <UsersIcon className="h-5 w-5 mr-2" />
            <span className="font-medium">Manage Users</span>
          </Link>
          <Link 
            href="/admin/reviews" 
            className="flex items-center justify-center p-4 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <AcademicCapIcon className="h-5 w-5 mr-2" />
            <span className="font-medium">Review Approvals</span>
          </Link>
          <Link 
            href="/admin/analytics" 
            className="flex items-center justify-center p-4 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <CreditCardIcon className="h-5 w-5 mr-2" />
            <span className="font-medium">Sales Analytics</span>
          </Link>
        </div>
      </div>
      
      {/* Recent Courses */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Recent Courses</h2>
          <Link 
            href="/admin/courses" 
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            View All Courses
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3">Course Name</th>
                <th scope="col" className="px-4 py-3">Instructor</th>
                <th scope="col" className="px-4 py-3">Students</th>
                <th scope="col" className="px-4 py-3">Price</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentCourses.map((course) => (
                <tr key={course.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{course.title}</td>
                  <td className="px-4 py-3">{course.instructor}</td>
                  <td className="px-4 py-3">{course.students}</td>
                  <td className="px-4 py-3">${course.price}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      course.status === 'Published' 
                        ? 'bg-green-100 text-green-800' 
                        : course.status === 'Draft' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button 
                        className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
                        title="Edit"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button 
                        className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Latest Activities */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4">Latest Activities</h2>
        <div className="space-y-4">
          {activities.map((activity, i) => (
            <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0">
              <div className={`p-2 rounded-full ${activity.bgColor}`}>
                {activity.icon}
              </div>
              <div>
                <p className="font-medium">{activity.title}</p>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Mock data for admin dashboard
const recentCourses = [
  {
    id: 'react-masterclass',
    title: 'React Masterclass',
    instructor: 'Michael Johnson',
    students: 856,
    price: 89.99,
    status: 'Published'
  },
  {
    id: 'node-backend',
    title: 'Node.js Backend Development',
    instructor: 'Sarah Wilson',
    students: 734,
    price: 99.99,
    status: 'Published'
  },
  {
    id: 'typescript-fundamentals',
    title: 'TypeScript Fundamentals',
    instructor: 'David Chen',
    students: 521,
    price: 59.99,
    status: 'Published'
  },
  {
    id: 'vue-complete-guide',
    title: 'Vue.js Complete Guide',
    instructor: 'Emily Taylor',
    students: 0,
    price: 79.99,
    status: 'Draft'
  },
  {
    id: 'python-data-science',
    title: 'Python for Data Science',
    instructor: 'Robert Kim',
    students: 0,
    price: 0,
    status: 'In Review'
  },
];

const activities = [
  {
    title: 'New Course Created',
    description: 'Michael Johnson created a new course: "Advanced React Patterns"',
    timestamp: '2 hours ago',
    icon: <BookOpenIcon className="h-5 w-5 text-white" />,
    bgColor: 'bg-indigo-500'
  },
  {
    title: 'New User Registration',
    description: '15 new users registered on the platform',
    timestamp: '5 hours ago',
    icon: <UsersIcon className="h-5 w-5 text-white" />,
    bgColor: 'bg-blue-500'
  },
  {
    title: 'Course Update',
    description: 'Sarah Wilson updated "Node.js Backend Development" course',
    timestamp: '8 hours ago',
    icon: <BookOpenIcon className="h-5 w-5 text-white" />,
    bgColor: 'bg-indigo-500'
  },
  {
    title: 'Payment Received',
    description: '$1,245.00 in payments received today',
    timestamp: '12 hours ago',
    icon: <CreditCardIcon className="h-5 w-5 text-white" />,
    bgColor: 'bg-purple-500'
  },
]; 