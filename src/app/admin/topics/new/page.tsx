"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTopics } from "@/client/hooks/topics";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function NewTopicPage() {
  const router = useRouter();
  const { createTopic, loading, error } = useTopics(true);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    description?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }));
    
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
      description?: string;
    } = {};
    
    if (!formData.name.trim()) {
      errors.name = "Topic name is required";
    } else if (formData.name.length > 100) {
      errors.name = "Topic name must be less than 100 characters";
    }
    
    if (formData.description && formData.description.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null); // Clear previous errors
    
    if (!validateForm()) {
      return;
    }
    
    // Ensure name is not just whitespace
    if (!formData.name.trim()) {
      setFormErrors(prev => ({
        ...prev,
        name: "Topic name cannot be empty"
      }));
      return;
    }
    
    try {
      console.log("Submitting topic form with data:", formData);
      
      // Prepare the data to send to API
      const topicData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive
      };
      
      console.log("Calling createTopic with:", topicData);
      
      // createTopic function from useTopics will handle setting loading state
      const newTopic = await createTopic(topicData);
      
      if (newTopic) {
        console.log("Topic created successfully:", newTopic);
        // Thêm delay ngắn trước khi chuyển trang
        setTimeout(() => {
          router.push("/admin/topics");
        }, 500);
      } else {
        console.error("Failed to create topic: returned null");
        setServerError("Failed to create topic. Please try again.");
      }
    } catch (err: any) {
      console.error("Error creating topic:", err);
      
      // Show detailed error information
      const errorResponse = err.response?.data;
      console.error("Error response:", errorResponse);
      
      // Extract error message from response or use a default
      let errorMessage = "Failed to create topic. Please try again.";
      
      if (errorResponse?.error) {
        errorMessage = errorResponse.error;
      } else if (err?.message) {
        // Only use error.message if it's helpful (not generic)
        if (err.message !== "Request failed with status code 500" &&
            !err.message.includes("Network Error")) {
          errorMessage = err.message;
        }
      }
      
      setServerError(errorMessage);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Link 
          href="/admin/topics" 
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Add New Topic</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
        {/* Server error message */}
        {serverError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {serverError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Topic Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                formErrors.name ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              disabled={loading}
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-3 py-2 border ${
                formErrors.description ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              disabled={loading}
            ></textarea>
            {formErrors.description && (
              <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
            )}
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, isActive: e.target.checked }))
              }
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              disabled={loading}
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active
            </label>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <Link 
              href="/admin/topics"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Topic"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
