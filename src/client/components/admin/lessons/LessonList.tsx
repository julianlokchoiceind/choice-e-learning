'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Lesson } from '@/shared/types/lessons/lesson';
import { useLessonsQuery } from '@/client/hooks/lessons';
import { useCoursesQuery } from '@/client/hooks/courses';
import { LoadingState } from '@/client/components/common';

// Define the type for course item
interface Course {
  id: string;
  title: string;
}

// Define the type for response data
interface LessonsResponse {
  data: Lesson[];
  meta?: {
    page: number;
    totalPages: number;
  };
}

export const LessonList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  // Sử dụng React Query thay vì quản lý state thủ công
  const { useGetLessons, useDeleteLesson } = useLessonsQuery();
  const { useGetCourses } = useCoursesQuery(true);
  
  // Lấy dữ liệu khóa học từ React Query
  const { 
    data: coursesData, 
    isLoading: coursesLoading 
  } = useGetCourses();
  
  // Lấy dữ liệu bài học từ React Query
  const { 
    data: lessonsData, 
    isLoading: lessonsLoading, 
    error: lessonsError 
  } = useGetLessons(selectedCourse || undefined);
  
  // Sử dụng mutation từ React Query cho xóa bài học
  const deleteLessonMutation = useDeleteLesson();

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài học này?')) {
      return;
    }
    
    try {
      await deleteLessonMutation.mutateAsync({ id: lessonId, courseId: selectedCourse });
    } catch (err: unknown) {
      console.error('Error deleting lesson:', err);
      alert((err instanceof Error) ? err.message : 'Không thể xóa bài học');
    }
  };

  // Giả định lessonsData có cấu trúc như LessonsResponse
  const responseLessons = lessonsData as unknown as LessonsResponse | undefined;
  
  // Lấy dữ liệu từ React Query hook
  const lessons = responseLessons?.data || [];
  const totalPages = responseLessons?.meta?.totalPages || 1;
  const courses = (coursesData?.data || []) as Course[];
  const isLoading = lessonsLoading || coursesLoading;
  const error = lessonsError;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Bài học</h1>
        <div className="flex items-center space-x-4">
          <div>
            <select
              value={selectedCourse}
              onChange={handleCourseChange}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={coursesLoading}
            >
              <option value="">Tất cả khóa học</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          
          <Link
            href="/admin/lessons/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Thêm bài học
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải dữ liệu'}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <LoadingState variant="section" message="Loading lessons..." />
        </div>
      ) : lessons.length === 0 ? (
        <div className="bg-gray-50 p-6 text-center rounded-md">
          <p className="text-gray-500">Không tìm thấy bài học nào</p>
          <p className="text-sm text-gray-400 mt-1">
            {selectedCourse 
              ? 'Hãy chọn khóa học khác hoặc tạo bài học mới cho khóa học này'
              : 'Tạo bài học mới để bắt đầu'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiêu đề
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khóa học
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thứ tự
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Hành động</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lessons.map(lesson => (
                <tr key={lesson.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{lesson.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {courses.find(c => c.id === lesson.courseId)?.title || 'Khóa học không xác định'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{lesson.order}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(lesson.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/admin/lessons/${lesson.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={deleteLessonMutation.isPending}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{lessons.length}</span> bài học
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Trang trước</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        disabled={isLoading}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          currentPage === i + 1
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } text-sm font-medium`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || isLoading}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Trang sau</span>
                      <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonList;