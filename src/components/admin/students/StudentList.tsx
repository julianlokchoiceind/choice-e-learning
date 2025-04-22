"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  PencilSquareIcon, 
  TrashIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import { useStudents } from "@/client/hooks/students";

export const StudentList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { 
    students: apiStudents, 
    loading, 
    error, 
    pagination, 
    fetchStudents, 
    deleteStudent 
  } = useStudents();
  
  // Create local state to manage students, which will be updated from API
  const [students, setStudents] = useState(apiStudents || []);
  const [searchQuery, setSearchQuery] = useState("");
  
  // When API students change, update local state
  useEffect(() => {
    if (apiStudents && apiStudents.length > 0) {
      console.log("Updating local students state from API:", apiStudents.length, "items");
      setStudents(apiStudents);
    }
  }, [apiStudents]);

  // Get current page from URL or default to 1
  const currentPage = parseInt(searchParams.get("page") || "1");
  
  // Debugging effect để theo dõi state
  useEffect(() => {
    console.log("STATE CHANGE: loading =", loading);
    console.log("STATE CHANGE: students =", students?.length || 0, "items");
    console.log("STATE CHANGE: pagination =", pagination);
    if (students && students.length > 0) {
      console.log("First student:", students[0]);
    }
  }, [loading, students, pagination]);
  
  useEffect(() => {
    // Call fetchStudents with the current parameters when component mounts or page changes
    const fetchData = async () => {
      try {
        console.log("ADMIN UI: Fetching students for page:", currentPage);
        console.log("ADMIN UI: Before fetch - Current students:", students);
        
        const result = await fetchStudents({
          page: currentPage,
          limit: 10,
          search: searchQuery || undefined,
        });
        
        console.log("ADMIN UI: Direct result from fetchStudents:", {
          dataLength: result?.data?.length || 0,
          meta: result?.meta
        });
        
        // Need to access students after state update
        setTimeout(() => {
          console.log("ADMIN UI: After fetch - Current students:", students);
          console.log("ADMIN UI: After fetch - Student count:", students?.length || 0);
          
          // Force re-render if students is empty but we have data in the result
          if ((!students || students.length === 0) && result?.data?.length > 0) {
            console.log("ADMIN UI: Forcing manual state update with", result.data.length, "students");
            setStudents([...result.data]);
          }
        }, 100);
      } catch (err) {
        console.error("Error in StudentList useEffect:", err);
        // Silent error handling - no UI error display
      }
    };
    
    fetchData();
    // We're intentionally only depending on page changes and search query
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, fetchStudents, searchQuery]);
  
  // Handle search with better error management
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search submitted with query:", searchQuery);
    
    try {
      fetchStudents({
        page: 1,
        limit: 10,
        search: searchQuery,
      });
      router.push("/admin/students?page=1");
    } catch (err) {
      console.error("Error in search:", err);
      // Silent error handling
    }
  };
  
  const handlePageChange = (page: number) => {
    console.log("Changing to page:", page);
    router.push(`/admin/students?page=${page}`);
  };
  
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteStudent(id);
        await fetchStudents({
          page: currentPage,
          limit: 10,
          search: searchQuery || undefined,
        });
      } catch (err) {
        console.error("Error deleting student:", err);
      }
    }
  };
  
  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <form onSubmit={handleSearch} className="relative w-72">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button type="submit" className="sr-only">Search</button>
        </form>
        <Link
          href="/admin/students/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Student
        </Link>
      </div>
      
      {/* Students list */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-4 px-6 text-left font-medium text-indigo-700 uppercase tracking-wider text-sm">Name</th>
                <th className="py-4 px-6 text-left font-medium text-indigo-700 uppercase tracking-wider text-sm">Email</th>
                <th className="py-4 px-6 text-left font-medium text-indigo-700 uppercase tracking-wider text-sm">Phone</th>
                <th className="py-4 px-6 text-left font-medium text-indigo-700 uppercase tracking-wider text-sm">City</th>
                <th className="py-4 px-6 text-left font-medium text-indigo-700 uppercase tracking-wider text-sm">Grade</th>
                <th className="py-4 px-6 text-right font-medium text-indigo-700 uppercase tracking-wider text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading students...</p>
                  </td>
                </tr>
              ) : students && students.length > 0 ? (
                students.map((student) => {
                  console.log("Rendering student:", student.id, student.email);
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium text-sm">
                            {student.imageUrl ? (
                              <img src={student.imageUrl} alt={student.name} className="h-10 w-10 rounded-full object-cover" />
                            ) : (
                              getInitials(student.name || 'Unknown')
                            )}
                          </div>
                          <div className="font-medium text-gray-800">{student.name || 'Unknown'}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700">{student.email}</td>
                      <td className="py-4 px-6 text-gray-700">{student.phone && student.phone !== '-' ? student.phone : "-"}</td>
                      <td className="py-4 px-6 text-gray-700">{student.city && student.city !== '-' ? student.city : "-"}</td>
                      <td className="py-4 px-6 text-gray-700">{student.grade && student.grade !== '-' ? student.grade : "-"}</td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/admin/students/${student.id}`}
                            className="p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-150"
                            aria-label="View student details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          <Link
                            href={`/admin/students/${student.id}/edit`}
                            className="p-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors duration-150"
                            aria-label="Edit student"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-150"
                            aria-label="Delete student"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    <p>No students found.</p>
                    <p className="text-sm mt-1">Try with a different search term or add a new student.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {students?.length || 0} of {pagination.total} students
            </div>
            <div className="flex space-x-1">
              <button 
                onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
                className={`p-2 ${pagination.page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 rounded'}`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Page numbers */}
              {Array.from({length: pagination.totalPages}, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md ${
                    pagination.page === page 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button 
                onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                disabled={pagination.page === pagination.totalPages}
                className={`p-2 ${pagination.page === pagination.totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 rounded'}`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
