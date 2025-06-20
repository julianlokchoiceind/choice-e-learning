/**
 * Shared file upload workflow hook
 * Based on proven Course pattern with temp files + DB materials management
 * Provides consistent upload behavior across Course and Lesson modules
 */

import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '@/client/hooks/common/useApiRequest';

export interface TempFile {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  url: string;
  isTemp: true;
}

export interface FileUploadWorkflowConfig {
  entityId: string;
  entityType: 'course' | 'lesson';
  apiEndpoints: {
    materials: string;        // e.g., '/api/admin/courses/{id}/materials'
    upload: string;          // e.g., '/api/admin/upload'
    cleanup: string;         // e.g., '/api/admin/files/cleanup'
  };
  queryKey: string[];         // e.g., ['course-materials', courseId]
  uploadParams: {
    type: string;            // e.g., 'course-material' | 'lesson-material'
    idField: string;         // e.g., 'courseId' | 'lessonId'
  };
}

export interface FileUploadWorkflowRef {
  getTempFiles: () => TempFile[];
  getDeletedIds: () => string[];
  reset: () => void;
}

/**
 * Shared file upload workflow hook
 * Based on proven Course ResourceUpload pattern
 */
export function useFileUploadWorkflow(config: FileUploadWorkflowConfig) {
  const { entityId, entityType, apiEndpoints, queryKey, uploadParams } = config;
  const apiRequest = useApiRequest();
  const queryClient = useQueryClient();

  // Core state management (based on Course pattern)
  const [isUploading, setIsUploading] = useState(false);
  const [tempFiles, setTempFiles] = useState<TempFile[]>([]);
  const [deletedMaterialIds, setDeletedMaterialIds] = useState<string[]>([]);
  const [initialMaterialsCount, setInitialMaterialsCount] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  // Refs to avoid stale closure issues (Course proven pattern)
  const tempFilesRef = useRef<TempFile[]>([]);
  const deletedMaterialIdsRef = useRef<string[]>([]);

  // Keep refs in sync with state
  useEffect(() => {
    tempFilesRef.current = tempFiles;
  }, [tempFiles]);

  useEffect(() => {
    deletedMaterialIdsRef.current = deletedMaterialIds;
  }, [deletedMaterialIds]);

  // Data fetching
  const { data: dbMaterials, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await apiRequest.get(apiEndpoints.materials);
      if (response && response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
        const materials = response.data.data;
        return Array.isArray(materials) ? materials : [];
      }
      return [];
    },
    enabled: !!entityId
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest.post(apiEndpoints.materials, data),
    onSuccess: (response) => {
      const newMaterial = response?.data?.data || response?.data || response;
      if (!newMaterial) return;
      
      queryClient.setQueryData(queryKey, (oldData: any[]) => {
        if (!oldData || !Array.isArray(oldData)) return [newMaterial];
        return [...oldData, newMaterial];
      });
      
      queryClient.invalidateQueries({ queryKey: [entityType === 'course' ? 'courses' : 'lessons'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (materialId: string) => apiRequest.delete(`${apiEndpoints.materials}/${materialId}`),
    onSuccess: (_, materialId) => {
      queryClient.setQueryData(queryKey, (oldData: any[]) => {
        if (!oldData) return [];
        return oldData.filter((material: any) => material.id !== materialId);
      });
      
      queryClient.invalidateQueries({ queryKey: [entityType === 'course' ? 'courses' : 'lessons'] });
    },
  });

  // Computed values
  const dbMaterialsArray = Array.isArray(dbMaterials) ? dbMaterials : [];
  const activeMaterials = dbMaterialsArray.filter(m => !deletedMaterialIds.includes(m.id));

  // Change detection (Course proven pattern)
  const hasChanges = 
    tempFiles.length > 0 || 
    deletedMaterialIds.length > 0 || 
    activeMaterials.length !== initialMaterialsCount;

  // Set initial count for change detection
  useEffect(() => {
    if (dbMaterialsArray.length > 0 && initialMaterialsCount === 0) {
      setInitialMaterialsCount(dbMaterialsArray.length);
    }
  }, [dbMaterialsArray.length, initialMaterialsCount]);

  // File upload handler
  const handleFileUpload = async (file: File): Promise<void> => {
    console.log(`🔄 ${entityType}: Starting file upload for:`, file.name);
    
    if (isUploading) {
      console.error(`❌ ${entityType}: Upload blocked - another upload in progress`);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', uploadParams.type);
      formData.append(uploadParams.idField, entityId);
      formData.append('temporary', 'true');

      const uploadResponse = await fetch(apiEndpoints.upload, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed with status ${uploadResponse.status}: ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.success || !uploadResult.data?.url) {
        throw new Error(uploadResult.error || 'Upload failed - no URL returned');
      }

      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const fileType = getFileTypeFromExtension(fileExtension);
      
      const tempFile: TempFile = {
        id: `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        title: file.name,
        fileName: file.name,
        fileSize: file.size,
        fileType,
        mimeType: file.type,
        url: uploadResult.data.url,
        isTemp: true
      };
      
      console.log(`✅ ${entityType}: Temp file created successfully:`, tempFile.fileName);
      setTempFiles(prevTempFiles => [...prevTempFiles, tempFile]);
      console.log(`📦 ${entityType}: Updated temp files count:`, tempFiles.length + 1);
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Delete handler
  const handleDelete = async (material: any): Promise<void> => {
    if ('isTemp' in material) {
      // Remove temp file
      setTempFiles(prevTempFiles => prevTempFiles.filter(f => f.id !== material.id));
      
      // Clean up temp file immediately
      fetch(apiEndpoints.cleanup, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [material.url] })
      });
    } else {
      // Mark DB material for deletion
      if (window.confirm(`Are you sure you want to delete this ${entityType} material?`)) {
        setDeletedMaterialIds([...deletedMaterialIds, material.id]);
      }
    }
  };

  // Imperative interface (Course proven pattern)
  const getImperativeInterface = (): FileUploadWorkflowRef => ({
    getTempFiles: () => {
      console.log(`${entityType}: getTempFiles called, current tempFiles:`, tempFilesRef.current.length);
      return tempFilesRef.current;
    },
    getDeletedIds: () => {
      console.log(`${entityType}: getDeletedIds called, current deletedIds:`, deletedMaterialIdsRef.current.length);
      return deletedMaterialIdsRef.current;
    },
    reset: () => {
      if (isResetting) {
        console.log(`${entityType}: Reset already in progress, skipping...`);
        return;
      }
      
      setIsResetting(true);
      console.log(`${entityType}: Reset called - clearing all temp state`);
      
      setTempFiles([]);
      setDeletedMaterialIds([]);
      tempFilesRef.current = [];
      deletedMaterialIdsRef.current = [];
      
      // Clear file input if it exists
      const inputId = entityType === 'course' ? 'file-upload' : 'lesson-file-upload';
      const input = document.getElementById(inputId) as HTMLInputElement;
      if (input) {
        input.value = '';
      }
      
      setTimeout(() => {
        setInitialMaterialsCount(dbMaterialsArray.length);
        setIsResetting(false);
      }, 150);
    }
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tempFiles.length > 0) {
        fetch(apiEndpoints.cleanup, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls: tempFiles.map(f => f.url) })
        });
      }
    };
  }, [tempFiles, apiEndpoints.cleanup]);

  return {
    // State
    tempFiles,
    deletedMaterialIds,
    activeMaterials,
    dbMaterialsArray,
    isUploading,
    isLoading,
    error,
    hasChanges,
    initialMaterialsCount,

    // Actions
    handleFileUpload,
    handleDelete,

    // Mutations
    createMutation,
    deleteMutation,

    // Imperative interface
    getImperativeInterface,
  };
}

// Helper function (extracted from components)
function getFileTypeFromExtension(extension: string): string {
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
}