'use client';

import { FC, forwardRef, useImperativeHandle, useEffect } from 'react';
import { 
  DocumentIcon, 
  PlusIcon, 
  TrashIcon, 
  DocumentArrowDownIcon 
} from '@heroicons/react/24/outline';
import { CourseMaterial } from '@/shared/types/courses/course-material';
import { LoadingState } from '@/client/components/common/LoadingState';
import { useFileUploadWorkflow, TempFile, FileUploadWorkflowRef } from '@/client/hooks/common/useFileUploadWorkflow';

interface CourseResourceUploadProps {
  courseId: string;
  onChangesDetected?: (hasChanges: boolean) => void;
}

export interface CourseResourceUploadRef {
  getTempFiles: () => TempFile[];
  getDeletedIds: () => string[];
  reset: () => void;
}

const CourseResourceUpload = forwardRef<CourseResourceUploadRef, CourseResourceUploadProps>(({ courseId, onChangesDetected }, ref) => {
  // Use shared upload workflow hook
  const workflow = useFileUploadWorkflow({
    entityId: courseId,
    entityType: 'course',
    apiEndpoints: {
      materials: `/api/admin/courses/${courseId}/materials`,
      upload: '/api/admin/upload',
      cleanup: '/api/admin/files/cleanup'
    },
    queryKey: ['course-materials', courseId],
    uploadParams: {
      type: 'course-material',
      idField: 'courseId'
    }
  });

  const {
    tempFiles,
    activeMaterials,
    isUploading,
    isLoading,
    error,
    hasChanges,
    handleFileUpload,
    handleDelete,
    createMutation,
    deleteMutation,
    getImperativeInterface
  } = workflow;

  // Change detection
  useEffect(() => {
    if (onChangesDetected) {
      onChangesDetected(hasChanges);
    }
  }, [hasChanges, onChangesDetected]);
  
  // Expose imperative interface to parent
  useImperativeHandle(ref, () => getImperativeInterface(), [getImperativeInterface]);

  const formatFileSize = (bytes: number | string | undefined): string => {
    // Handle undefined, null, or invalid data
    if (bytes === undefined || bytes === null || bytes === '') {
      return '0 B';
    }
    
    // Convert to number if it's a string
    const numBytes = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    
    // Check if conversion resulted in NaN
    if (isNaN(numBytes) || numBytes < 0) {
      return '0 B';
    }
    
    if (numBytes < 1024) return numBytes + ' B';
    if (numBytes < 1024 * 1024) return (numBytes / 1024).toFixed(1) + ' KB';
    return (numBytes / (1024 * 1024)).toFixed(1) + ' MB';
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

  // Loading state
  if (isLoading) {
    return <LoadingState message="Loading course materials..." />;
  }
  
  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Failed to load course materials</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-admin-primary"
        >
          Retry
        </button>
      </div>
    );
  }

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
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 transition-colors">
        <div className="text-center">
          <DocumentArrowDownIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900">Add Course Material</h4>
            <p className="text-sm text-gray-600 mt-1">
              Upload PDFs, documents, or other learning resources
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
                Upload File
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Materials List - Show temp files and DB materials separately */}
      {(tempFiles.length > 0 || activeMaterials.length > 0) && (
        <div className="space-y-3">
          {/* Temp Files */}
          {tempFiles.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-700 px-1">New Files (Unsaved)</h5>
              {tempFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200 hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getFileTypeIcon(file.fileType)}
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-gray-900 truncate">
                        {file.fileName}
                      </h5>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatFileSize(file.fileSize)}
                      </span>
                      <span className="text-xs text-yellow-600 font-medium">Unsaved</span>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <button
                      onClick={() => handleDelete(file)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-50"
                      title="Remove"
                      disabled={deleteMutation.isPending}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* DB Materials */}
          {activeMaterials.length > 0 && (
            <div className="space-y-2">
              {tempFiles.length > 0 && (
                <h5 className="text-sm font-medium text-gray-700 px-1">Existing Files</h5>
              )}
              {activeMaterials.map((material) => (
                <div key={material.id} className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getFileTypeIcon(material.fileType)}
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-gray-900 truncate">
                        {material.fileName}
                      </h5>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatFileSize(material.fileSize)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <button
                      onClick={() => handleDelete(material)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-50"
                      title="Remove"
                      disabled={deleteMutation.isPending}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {(isUploading || createMutation.isPending) && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">
              {isUploading ? 'Uploading file...' : 'Saving course material...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

CourseResourceUpload.displayName = 'CourseResourceUpload';

export default CourseResourceUpload;