"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Student } from "@prisma/client";
import { 
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  AcademicCapIcon
} from "@heroicons/react/24/outline";

interface StudentDetailProps {
  studentId: string;
}

export const StudentDetail = ({ studentId }: StudentDetailProps) => {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axios.get<Student>(`/api/admin/students/${studentId}`);
        setStudent(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching student:", error);
        setError("Failed to fetch student details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudent();
  }, [studentId]);
  
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        await axios.delete(`/api/admin/students/${studentId}`);
        router.push("/admin/students");
      } catch (error) {
        console.error("Error deleting student:", error);
        setError("Failed to delete student. Please try again.");
      }
    }
  };
  
  const getInitials = (name: string) => {
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
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Students
        </Link>
        
        <div className="flex gap-2">
          <Link
            href={`/admin/students/${studentId}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <PencilSquareIcon className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-red-700 bg-white hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
            <div className="h-32 w-32 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-4xl mb-4">
              {student.imageUrl ? (
                <img src={student.imageUrl} alt={student.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                getInitials(student.name)
              )}
            </div>
            <h2 className="text-2xl font-bold mb-1">{student.name}</h2>
            {student.grade && (
              <div className="flex items-center gap-1 text-gray-500 mb-4">
                <AcademicCapIcon className="h-4 w-4" />
                <span>Grade: {student.grade}</span>
              </div>
            )}
            
            <div className="w-full space-y-4 mt-4">
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <div className="text-left">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-700">{student.email}</p>
                </div>
              </div>
              
              {student.phone && (
                <div className="flex items-center gap-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <div className="text-left">
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-700">{student.phone}</p>
                  </div>
                </div>
              )}
              
              {(student.address || student.city) && (
                <div className="flex items-center gap-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                  <div className="text-left">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-gray-700">
                      {student.address}
                      {student.address && student.city && ", "}
                      {student.city}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="md:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Student Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ID</p>
                <p className="text-gray-700">{student.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="text-gray-700">{new Date(student.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-gray-700">{new Date(student.updatedAt).toLocaleDateString()}</p>
              </div>
              {/* Additional fields can be displayed here */}
            </div>
            
            {/* Here you would add more sections like enrolled courses if needed */}
          </div>
        </div>
      </div>
    </div>
  );
};
