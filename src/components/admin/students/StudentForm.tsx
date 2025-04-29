"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormattedStudent } from "@/types/student";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
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
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!studentId);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      grade: "",
      imageUrl: "",
    },
  });
  
  useEffect(() => {
    const fetchStudent = async () => {
      if (!studentId) return;
      setInitialLoading(true);
      setError(null);
      
      try {
        // Add retry logic with exponential backoff
        let attempts = 0;
        const maxAttempts = 3;
        let success = false;
        let lastError: any;
        
        while (attempts < maxAttempts && !success) {
          try {
            console.log(`Attempting to fetch student (attempt ${attempts + 1})`);
            const response = await axios.get(`/api/admin/students/${studentId}`);
            
            if (response.data && response.data.success && response.data.data) {
              const student = response.data.data as FormattedStudent;
              
              reset({
                name: student.name,
                email: student.email,
                phone: student.phone || "",
                address: student.address || "",
                city: student.city || "",
                grade: student.grade || "",
                imageUrl: student.imageUrl || "",
              });
              
              success = true;
            } else {
              throw new Error("Invalid response format");
            }
          } catch (err: any) {
            lastError = err;
            console.error(`Fetch student attempt ${attempts + 1} failed:`, err);
            attempts++;
            
            if (attempts < maxAttempts) {
              // Wait with exponential backoff before retrying
              await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
            }
          }
        }
        
        if (!success) {
          throw lastError;
        }
      } catch (error: any) {
        console.error("Error fetching student after all retries:", error);
        const errorMessage = error.response?.data?.error || error.message || "Failed to fetch student data. Please try again.";
        setError(errorMessage);
        
        // Provide a way to recover by returning to the list page
        setTimeout(() => {
          const confirmReturn = window.confirm("Unable to load student data. Would you like to return to the student list?");
          if (confirmReturn) {
            router.push("/admin/students");
          }
        }, 1000);
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchStudent();
  }, [studentId, reset, router]);
  
  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (studentId) {
        // Update existing student with retry logic
        let attempts = 0;
        const maxAttempts = 3;
        let success = false;
        let lastError: any;
        
        while (attempts < maxAttempts && !success) {
          try {
            console.log(`Attempting to update student (attempt ${attempts + 1})`);
            const response = await axios.patch(`/api/admin/students/${studentId}`, data, {
              timeout: 10000, // 10 second timeout
            });
            
            if (response.data && response.data.success) {
              success = true;
              setSuccess("Student updated successfully");
            } else {
              throw new Error(response.data.error || "Failed to update student");
            }
          } catch (err: any) {
            lastError = err;
            console.error(`Update student attempt ${attempts + 1} failed:`, err);
            attempts++;
            
            if (attempts < maxAttempts) {
              // Wait with exponential backoff before retrying
              await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
            }
          }
        }
        
        if (!success) {
          throw lastError;
        }
      } else {
        // Create new student
        console.log("Creating new student with data:", data);
        const response = await axios.post("/api/admin/students", data, {
          timeout: 10000, // 10 second timeout
        });
        
        if (response.data && response.data.success) {
          console.log("Create student response:", response.data);
          setSuccess("Student created successfully");
        } else {
          throw new Error(response.data.error || "Failed to create student");
        }
      }
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push("/admin/students");
      }, 1500);
    } catch (error: any) {
      console.error("Error saving student:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to save student. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              {...register("name")}
              placeholder="Enter student name"
              autoComplete="name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onFocus={(e) => e.target.select()}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter email address"
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onFocus={(e) => e.target.select()}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              id="phone"
              {...register("phone")}
              placeholder="Enter phone number"
              autoComplete="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onFocus={(e) => e.target.select()}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              id="address"
              {...register("address")}
              placeholder="Enter address"
              autoComplete="street-address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onFocus={(e) => e.target.select()}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              id="city"
              {...register("city")}
              placeholder="Enter city"
              autoComplete="address-level2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onFocus={(e) => e.target.select()}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
              Grade
            </label>
            <input
              id="grade"
              {...register("grade")}
              placeholder="Enter grade"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onFocus={(e) => e.target.select()}
            />
            {errors.grade && (
              <p className="mt-1 text-sm text-red-600">{errors.grade.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              id="imageUrl"
              {...register("imageUrl")}
              placeholder="Enter image URL"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onFocus={(e) => e.target.select()}
            />
            {errors.imageUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-4 pt-4">
          <Link
            href="/admin/students"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : studentId ? (
              "Update Student"
            ) : (
              "Create Student"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
