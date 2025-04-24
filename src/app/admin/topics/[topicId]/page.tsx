"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTopics } from "@/client/hooks/topics";
import { 
  ArrowLeftIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  ExclamationCircleIcon,
  DocumentTextIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusCircleIcon
} from "@heroicons/react/24/outline";

export default function TopicDetailPage({ params }: { params: { topicId: string } }) {
  const router = useRouter();
  const { fetchTopicById, deleteTopic, loading, error } = useTopics(true);
  
  const [topic, setTopic] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  
  useEffect(() => {
    const loadTopic = async () => {
      try {
        const topicData = await fetchTopicById(params.topicId);
        if (topicData) {
          setTopic(topicData);
        }
      } catch (err) {
        console.error("Error loading topic:", err);
        setServerError("Failed to load topic details");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTopic();
  }, [params.topicId, fetchTopicById]);
  
  const handleDeleteClick = () => {
    setConfirmDelete(true);
  };
  
  const handleDeleteConfirm = async () => {
    setDeleteInProgress(true);
    try {
      await deleteTopic(params.topicId);
      router.push("/admin/topics");
    } catch (err: any) {
      console.error("Error deleting topic:", err);
      setServerError(err.response?.data?.error || "Failed to delete topic. Please try again.");
      setConfirmDelete(false);
    } finally {
      setDeleteInProgress(false);
    }
  };
  
  const handleDeleteCancel = () => {
    setConfirmDelete(false);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-4 text-gray-600">Loading topic...</p>
      </div>
    );
  }
  
  if (!topic) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Topic Not Found</h1>
        <p className="text-gray-600 mb-6">The requested topic could not be found.</p>
        <Link 
          href="/admin/topics" 
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to Topics
        </Link>
      </div>
    );
  }
  
  const courseCount = topic._count?.courses || 0;
  const hasAssociatedCourses = courseCount > 0;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Link 
            href="/admin/topics" 
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Topic Details</h1>
        </div>
        
        <div className="flex space-x-3">
          <Link
            href={`/admin/topics/${params.topicId}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white rounded-md text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <PencilSquareIcon className="h-4 w-4 mr-2" />
            Edit
          </Link>
          
          {!hasAssociatedCourses && !confirmDelete && (
            <button
              onClick={handleDeleteClick}
              className="inline-flex items-center px-4 py-2 border border-red-300 bg-white rounded-md text-red-700 shadow-sm hover:bg-red-50"
              disabled={hasAssociatedCourses}
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </button>
          )}
          
          {confirmDelete && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteInProgress}
                className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                {deleteInProgress ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Confirm
                  </>
                )}
              </button>
              <button
                onClick={handleDeleteCancel}
                disabled={deleteInProgress}
                className="inline-flex items-center px-3 py-2 border border-gray-300 bg-white rounded-md text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <XCircleIcon className="h-4 w-4 mr-1" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Error message */}
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {serverError}
        </div>
      )}
      
      {/* Topic details */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-5 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">Topic Information</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Name</h3>
              <p className="text-lg font-medium text-gray-900">{topic.name}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
              <div>
                {topic.isActive ? (
                  <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                    Inactive
                  </span>
                )}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
              <p className="text-gray-700">{topic.description || 'No description provided.'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Created At</h3>
              <p className="text-gray-700">{new Date(topic.createdAt).toLocaleString()}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
              <p className="text-gray-700">{new Date(topic.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Associated Courses */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-5 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Associated Courses</h2>
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
            {courseCount} Course{courseCount !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="p-6">
          {hasAssociatedCourses ? (
            <div className="space-y-4">
              {topic.courses && topic.courses.map((course: any) => (
                <div key={course.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {course.imageUrl ? (
                        <img 
                          src={course.imageUrl} 
                          alt={course.title} 
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center">
                          <DocumentTextIcon className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-medium text-gray-900">{course.title}</h3>
                      <div className="flex items-center mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                          course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          ${course.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/admin/courses/${course.id}/edit`}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </Link>
                </div>
              ))}
              
              {/* If we didn't get course details, show a link to view all */}
              {(!topic.courses || topic.courses.length === 0) && courseCount > 0 && (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">
                    This topic is associated with {courseCount} course{courseCount !== 1 ? 's' : ''}.
                  </p>
                  <Link
                    href={`/admin/courses?topic=${topic.id}`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white rounded-md text-indigo-600 hover:bg-gray-50"
                  >
                    View Associated Courses
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <TagIcon className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">
                This topic is not associated with any courses yet.
              </p>
              <div className="mt-4">
                <Link
                  href="/admin/courses/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusCircleIcon className="h-4 w-4 mr-2" />
                  Create Course with this Topic
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
