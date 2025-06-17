'use client';

import { FC, useState } from 'react';
import { 
  DocumentIcon, 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  DocumentArrowDownIcon 
} from '@heroicons/react/24/outline';
import { CourseMaterial } from '@/shared/types/courses/course-material';
import { useCourseMaterialsQuery } from '@/client/hooks/courses/useCourseMaterialsQuery';
import { LoadingState } from '@/client/components/common/LoadingState';

interface ResourceUploadProps {
  courseId: string;
  onChangesDetected?: (hasChanges: boolean) => void;
}

const ResourceUpload: FC<ResourceUploadProps> = ({ courseId, onChangesDetected }) => {
  const [isUploading, setIsUploading] = useState(false);
  
  // Use React Query hooks for data management
  const {
    useGetCourseMaterials,
    useCreateCourseMaterial,
    useDeleteCourseMaterial
  } = useCourseMaterialsQuery(courseId);
  
  const { data: materialsData, isLoading, error } = useGetCourseMaterials();
  const createMutation = useCreateCourseMaterial();
  const deleteMutation = useDeleteCourseMaterial();
  
  // Ensure materials is always an array
  const materials = Array.isArray(materialsData) ? materialsData : [];

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
      // First upload the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'course-material');
      formData.append('courseId', courseId);

      const uploadResponse = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');

      const uploadResult = await uploadResponse.json();
      
      // Get file extension for type
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const fileType = getFileTypeFromExtension(fileExtension);
      
      // Create filename with choice prefix
      const choiceFileName = `choice-${file.name}`;
      
      // Create course material record in database
      await createMutation.mutateAsync({
        title: choiceFileName,
        fileName: choiceFileName,
        fileSize: file.size,
        fileType,
        mimeType: file.type,
        description: getDefaultDescription(fileType),
        url: uploadResult.data.url
      });

      // Notify parent of successful upload (this counts as a "change")
      if (onChangesDetected) {
        onChangesDetected(false); // Reset after successful save
      }

      // Reset input
      const input = document.getElementById('file-upload') as HTMLInputElement;
      if (input) input.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this course material?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const getFileTypeFromExtension = (extension: string): string => {
    const typeMap: { [key: string]: string } = {
      pdf: 'pdf',
      doc: 'doc',
      docx: 'doc',
      xls: 'xls',
      xlsx: 'xls',
      ppt: 'ppt',
      pptx: 'ppt',
      zip: 'zip',
      txt: 'txt',
      csv: 'csv'
    };
    return typeMap[extension] || 'doc';
  };

  const getDefaultDescription = (fileType: string): string => {
    const descMap: { [key: string]: string } = {
      pdf: 'Study Guide',
      doc: 'Document',
      xls: 'Practice Exercises',
      ppt: 'Presentation',
      zip: 'Source Code',
      txt: 'Text File',
      csv: 'Data File'
    };
    return descMap[fileType] || 'Course Material';
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
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
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
                Add Course Material
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Materials List */}
      {materials.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Uploaded Materials ({materials.length})
          </h4>
          <div className="space-y-2">
            {materials.map((material) => (
              <div
                key={material.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getFileTypeIcon(material.fileType)}
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-gray-900 truncate">
                      {material.title}
                    </h5>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatFileSize(material.fileSize)}</span>
                      <span>•</span>
                      <span>{material.description}</span>
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
                    onClick={() => handleDelete(material.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-white"
                    title="Delete"
                    disabled={deleteMutation.isPending}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        !isUploading && !createMutation.isPending && (
          <div className="text-center py-8 text-gray-500">
            <DocumentIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No course materials uploaded yet</p>
            <p className="text-sm">Upload PDF, ZIP, DOC, XLS, PPT files for students</p>
          </div>
        )
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
};

export default ResourceUpload;