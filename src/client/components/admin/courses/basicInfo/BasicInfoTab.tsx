'use client';

import FileUpload from '@/client/components/ui/file/FileUpload';
import { TopicSelector } from '@/client/components/admin/courses';

interface BasicInfoTabProps {
  values: {
    title: string;
    description: string;
    price: string;
    level: string;
    topics: string[];
    imageUrl: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleImageUpload: (url: string) => void;
  handleTopicsChange: (topics: string[]) => void;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  values,
  handleChange,
  handleImageUpload,
  handleTopicsChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Course Information</h2>
      
      <div className="space-y-6">
        {/* Title and Description - Full width */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Course Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={values.title}
            onChange={handleChange}
            placeholder="e.g., Introduction to Web Development"
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={values.description}
            onChange={handleChange}
            placeholder="Write a short overview of what this course covers..."
            rows={4}
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Two-column layout with improved spacing and alignment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Image
              </label>
              <FileUpload 
                onImageUpload={handleImageUpload}
                type="course-cover"
                className="h-48"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={values.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <select
                  id="level"
                  name="level"
                  value={values.level}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="all">All Levels</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Right Column - Topics aligned with Course Image */}
          <div>
            <div className="h-full">
              <TopicSelector 
                selectedTopics={values.topics}
                onChange={handleTopicsChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoTab; 