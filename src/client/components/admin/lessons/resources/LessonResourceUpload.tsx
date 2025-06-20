'use client';

import { FC, forwardRef, useImperativeHandle, useEffect } from 'react';
import { 
  DocumentIcon, 
  PlusIcon, 
  TrashIcon, 
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { LessonMaterial } from '@/shared/types/lessons/lesson-material';
import { LoadingState } from '@/client/components/common/LoadingState';
import { useFileUploadWorkflow, TempFile } from '@/client/hooks/common/useFileUploadWorkflow';
import { useLessonMaterialsQuery } from '@/client/hooks/lessons/useLessonMaterialsQuery';

interface LessonResourceUploadProps {
  lessonId: string;
  courseId: string;
  allowDownload?: boolean;
  onChangesDetected?: (hasChanges: boolean) => void;
}

export interface LessonResourceUploadRef {
  getTempFiles: () => TempFile[];
  getDeletedIds: () => string[];
  reset: () => void;
  saveChanges: () => Promise<void>;
}

const LessonResourceUpload = forwardRef<LessonResourceUploadRef, LessonResourceUploadProps>(({ 
  lessonId, 
  courseId,
  allowDownload = true,
  onChangesDetected 
}, ref) => {
  // Use shared upload workflow hook for files (disable mutations to avoid conflicts)
  const workflow = useFileUploadWorkflow({
    entityId: lessonId || '',
    entityType: 'lesson',
    apiEndpoints: {
      materials: `/api/admin/lessons/${lessonId}/materials`,
      upload: '/api/admin/upload',
      cleanup: '/api/admin/files/cleanup'
    },
    queryKey: ['lesson-materials', lessonId],
    uploadParams: {
      type: 'lesson-material',
      idField: 'lessonId'
    }
  });

  const {
    tempFiles,
    activeMaterials,
    isUploading,
    isLoading,
    error,
    hasChanges: hasFileChanges,
    handleFileUpload,
    handleDelete: handleFileDelete,
    getImperativeInterface
    // DON'T use workflow mutations - use domain-specific ones below
  } = workflow;
  
  // Use proper lesson materials mutations (fix cache sync issue)
  const { useCreateLessonMaterial, useDeleteLessonMaterial } = useLessonMaterialsQuery(lessonId || '');
  const createMutation = useCreateLessonMaterial();
  const deleteMutation = useDeleteLessonMaterial();
  
  console.log('🔧 LessonResourceUpload: Using proper lesson materials mutations for cache sync');
  console.log('🔑 LessonResourceUpload: lessonId for mutations:', lessonId);
  console.log('📊 LessonResourceUpload: tempFiles count:', tempFiles.length);
  console.log('📋 LessonResourceUpload: hasFileChanges:', hasFileChanges);
  
  // Change detection
  useEffect(() => {
    if (onChangesDetected) {
      const hasChanges = hasFileChanges || tempFiles.length > 0;
      onChangesDetected(hasChanges);
    }
  }, [hasFileChanges, tempFiles.length, onChangesDetected]);
  
  // Expose methods to parent (follow exact Course pattern)
  useImperativeHandle(ref, () => {
    const workflowInterface = getImperativeInterface();
    
    return {
      ...workflowInterface,
      saveChanges: async () => {
        console.log('🚀 LessonResourceUpload: saveChanges() CALLED!');
        console.log('🔍 LessonResourceUpload: saveChanges execution context:', {
          lessonIdInSaveChanges: lessonId,
          lessonIdDefined: !!lessonId,
          createMutationExists: !!createMutation,
          createMutationMutateAsync: typeof createMutation?.mutateAsync,
          deleteMutationExists: !!deleteMutation
        });
        
        // Follow exact Course pattern: parent component handles mutations
        const currentTempFiles = workflowInterface.getTempFiles();
        const currentDeletedIds = workflowInterface.getDeletedIds();
        
        console.log(`💾 LessonResourceUpload: Starting saveChanges with ${currentTempFiles.length} temp files and ${currentDeletedIds.length} deletions`);
        console.log('🔧 LessonResourceUpload: Using proper lessonMaterialsQuery mutations for cache sync');
        console.log('📋 LessonResourceUpload: tempFiles data:', currentTempFiles);
        console.log('🗑️ LessonResourceUpload: deletedIds:', currentDeletedIds);
        console.log('🔑 LessonResourceUpload: lessonId:', lessonId);
        
        // Process temp files - save to database (use proper lesson materials mutations)
        for (const tempFile of currentTempFiles) {
          console.log(`📝 LessonResourceUpload: Creating material for temp file:`, tempFile.fileName);
          console.log('📊 LessonResourceUpload: Mutation data:', {
            title: tempFile.title,
            fileName: tempFile.fileName,
            fileSize: tempFile.fileSize,
            fileType: tempFile.fileType,
            mimeType: tempFile.mimeType,
            description: 'Lesson Material',
            url: tempFile.url
          });
          
          try {
            console.log('🔄 LessonResourceUpload: Calling createMutation.mutateAsync...');
            console.log('🔍 LessonResourceUpload: Pre-mutation validation:', {
              mutationFunctionType: typeof createMutation.mutateAsync,
              mutationExists: !!createMutation.mutateAsync,
              lessonIdForAPI: lessonId,
              tempFileData: tempFile
            });
            const result = await createMutation.mutateAsync({
              title: tempFile.title,
              fileName: tempFile.fileName,
              fileSize: tempFile.fileSize,
              fileType: tempFile.fileType,
              mimeType: tempFile.mimeType,
              description: 'Lesson Material',
              url: tempFile.url
            });
            console.log(`✅ LessonResourceUpload: Successfully created material for:`, tempFile.fileName);
            console.log('📋 LessonResourceUpload: API result:', result);
            console.log('🔄 LessonResourceUpload: Cache should be automatically updated by useLessonMaterialsQuery');
          } catch (error) {
            console.error(`❌ LessonResourceUpload: Failed to create material for ${tempFile.fileName}:`, error);
            console.error('🔍 LessonResourceUpload: Full error details:', error);
            throw error;
          }
        }
        
        // Delete materials marked for deletion (use proper lesson materials mutations)
        for (const materialId of currentDeletedIds) {
          try {
            console.log('🗑️ LessonResourceUpload: Deleting material:', materialId);
            await deleteMutation.mutateAsync(materialId);
            console.log(`✅ LessonResourceUpload: Successfully deleted material:`, materialId);
            console.log('🔄 LessonResourceUpload: Cache should be automatically updated by useLessonMaterialsQuery');
          } catch (error) {
            console.error('❌ LessonResourceUpload: Failed to delete material:', error);
            throw error;
          }
        }
        
        console.log('🎯 LessonResourceUpload: All materials processed successfully, resetting workflow...');
        
        // Reset using shared hook's reset (follow Course pattern exactly)
        workflowInterface.reset();
        console.log('✅ LessonResourceUpload: saveChanges completed successfully and workflow reset');
      }
    };
  }, [getImperativeInterface, createMutation, deleteMutation, lessonId]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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

  // Loading state - show loading when we have a lessonId and query is running
  if (isLoading && lessonId) {
    return <LoadingState message="Loading lesson materials..." />;
  }
  
  // Don't render anything if no lessonId yet - wait for lesson to load
  if (!lessonId) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Files</h3>
          <p className="text-sm text-gray-600">
            Downloadable files and study materials for students
          </p>
        </div>
        {(tempFiles.length + activeMaterials.length) > 0 && (
          <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
            {tempFiles.length + activeMaterials.length}
          </span>
        )}
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 transition-colors">
        <div className="text-center">
          <DocumentArrowDownIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900">Add Lesson Material</h4>
            <p className="text-sm text-gray-600 mt-1">
              Upload PDFs, documents, or other learning resources
            </p>
          </div>
          <div className="mt-4">
            <div>
              <input
                type="file"
                id="lesson-file-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    await handleFileUpload(file);
                  }
                }}
                disabled={isUploading}
              />
              <label
                htmlFor="lesson-file-upload"
                className="btn-admin-primary cursor-pointer inline-flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Upload File
              </label>
            </div>
          </div>
        </div>
      </div>

      {!allowDownload && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-medium text-orange-900">Download Disabled</h5>
              <p className="text-sm text-orange-800 mt-1">
                Course settings have disabled file downloads. Students can see files but cannot download them.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Materials List - Show temp files and DB materials */}
      {/* Temp Files - Always show when available */}
      {tempFiles.length > 0 && (
        <div className="space-y-3">
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
                  
                  <button
                    type="button"
                    onClick={() => handleFileDelete(file)}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="Remove"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
      
      {/* DB Materials - Show when available */}
      {activeMaterials.length > 0 && (
        <div className="space-y-3">
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
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {allowDownload ? (
                      <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-blue-600"
                        title="Download"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                    ) : (
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                      Download disabled
                    </span>
                  )}
                    <button
                      type="button"
                      onClick={() => handleFileDelete(material)}
                      className="p-2 text-gray-400 hover:text-red-600"
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
    </div>
  );
});

LessonResourceUpload.displayName = 'LessonResourceUpload';

export default LessonResourceUpload;