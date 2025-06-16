'use client';

import { FC, useState } from 'react';
import { 
  DocumentIcon, 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  DocumentArrowDownIcon 
} from '@heroicons/react/24/outline';
// Removed FileUpload import as we're using native input

interface CourseResource {
  id: string;
  type: 'pdf' | 'zip' | 'xls' | 'doc' | 'ppt' | 'video' | 'audio' | 'image';
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  url: string;
  createdAt: Date;
}

interface ResourceUploadProps {
  courseId: string;
}

const ResourceUpload: FC<ResourceUploadProps> = ({ courseId }) => {
  const [resources, setResources] = useState<CourseResource[]>([
    {
      id: '1',
      type: 'pdf',
      title: 'React Fundamentals Cheat Sheet.pdf',
      description: 'Study Guide',
      fileName: 'React Fundamentals Cheat Sheet.pdf',
      fileSize: 2400000,
      url: '/uploads/course-materials/react-cheat-sheet.pdf',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      type: 'zip',
      title: 'Project Starter Code.zip',
      description: 'Source Code',
      fileName: 'Project Starter Code.zip',
      fileSize: 8300000,
      url: '/uploads/course-materials/starter-code.zip',
      createdAt: new Date('2024-01-14')
    },
    {
      id: '3',
      type: 'xls',
      title: 'Exercise Worksheet.xlsx',
      description: 'Practice Exercises',
      fileName: 'Exercise Worksheet.xlsx',
      fileSize: 1200000,
      url: '/uploads/course-materials/exercises.xlsx',
      createdAt: new Date('2024-01-13')
    }
  ]);

  const [isUploading, setIsUploading] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <div className="w-8 h-8 bg-red-100 text-red-600 rounded flex items-center justify-center text-xs font-bold">PDF</div>;
      case 'zip':
        return <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded flex items-center justify-center text-xs font-bold">ZIP</div>;
      case 'xls':
        return <div className="w-8 h-8 bg-green-100 text-green-600 rounded flex items-center justify-center text-xs font-bold">XLS</div>;
      default:
        return <DocumentIcon className="w-8 h-8 text-gray-400" />;
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newResource: CourseResource = {
        id: Date.now().toString(),
        type: file.name.split('.').pop()?.toLowerCase() as any || 'doc',
        title: file.name,
        fileName: file.name,
        fileSize: file.size,
        url: `/uploads/course-materials/${file.name}`,
        createdAt: new Date()
      };
      
      setResources(prev => [newResource, ...prev]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    setResources(prev => prev.filter(resource => resource.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Course Materials</h3>
          <p className="text-sm text-gray-600">
            Downloadable files and study materials for students
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
        <div className="text-center">
          <DocumentArrowDownIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900">Add Course Material</h4>
            <p className="text-sm text-gray-600 mt-1">
              Upload PDFs, documents, videos, or other learning resources
            </p>
          </div>
          <div className="mt-4">
            <div>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.mp4,.mp3,.png,.jpg,.jpeg"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    await handleFileUpload(file);
                  }
                }}
              />
              <label
                htmlFor="file-upload"
                className="btn-admin-primary cursor-pointer inline-flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Course Material
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Resources List */}
      {resources.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Uploaded Materials ({resources.length})
          </h4>
          <div className="space-y-2">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getFileTypeIcon(resource.type)}
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-gray-900 truncate">
                      {resource.title}
                    </h5>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatFileSize(resource.fileSize)}</span>
                      <span>•</span>
                      <span>{resource.description}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-white"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(resource.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-white"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isUploading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Uploading file...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceUpload;