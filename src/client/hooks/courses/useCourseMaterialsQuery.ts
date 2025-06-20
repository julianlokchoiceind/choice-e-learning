/**
 * React Query hooks for course materials management
 * Provides CRUD operations for course materials with caching and optimistic updates
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '@/client/hooks/common/useApiRequest';
import { CourseMaterial, CreateCourseMaterialData, UpdateCourseMaterialData } from '@/shared/types/courses/course-material';

/**
 * Course materials query hook factory
 * @param courseId Course ID to manage materials for
 * @returns Object containing all course materials query hooks
 */
export function useCourseMaterialsQuery(courseId: string) {
  const apiRequest = useApiRequest();
  const queryClient = useQueryClient();
  
  const queryKey = ['course-materials', courseId];
  
  /**
   * Hook to get course materials
   */
  const useGetCourseMaterials = () => {
    return useQuery({
      queryKey,
      queryFn: async (): Promise<CourseMaterial[]> => {
        const response = await apiRequest.get(`/api/admin/courses/${courseId}/materials`);
        
        // The useApiRequest hook returns the full Axios response
        // response.data contains our API response: { success: true, data: CourseMaterial[] }
        if (response && response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
          const materials = response.data.data;
          return Array.isArray(materials) ? materials : [];
        }
        
        // Fallback
        return [];
      },
      enabled: !!courseId
    });
  };
  
  /**
   * Hook to create a new course material
   */
  const useCreateCourseMaterial = () => {
    return useMutation({
      mutationFn: async (data: CreateCourseMaterialData) => {
        const response = await apiRequest.post(
          `/api/admin/courses/${courseId}/materials`, 
          data
        );
        
        if (!response || !response.data) {
          throw new Error('Failed to create course material');
        }
        
        // The useApiRequest hook returns the full Axios response
        // response.data contains our API response: { success: boolean, data: CourseMaterial }
        if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
          const material = response.data.data;
          return material as CourseMaterial;
        }
        
        // Fallback
        throw new Error('Unexpected response format');
      },
      // Remove toasts - only use for update/publish/unpublish as requested
      onSuccess: (newMaterial) => {
        // Update the cache with the new material
        queryClient.setQueryData<CourseMaterial[]>(queryKey, (oldData) => {
          if (!oldData || !Array.isArray(oldData)) return [newMaterial];
          return [...oldData, newMaterial];
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['courses'] });
      },
    });
  };
  
  /**
   * Hook to update a course material
   */
  const useUpdateCourseMaterial = () => {
    return useMutation({
      mutationFn: async ({ materialId, data }: { materialId: string; data: UpdateCourseMaterialData }) => {
        const response = await apiRequest.put(
          `/api/admin/courses/${courseId}/materials/${materialId}`, 
          data
        );
        
        if (!response || !response.data) {
          throw new Error('Failed to update course material');
        }
        
        // Extract material from API response format
        if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
          return response.data.data as CourseMaterial;
        }
        throw new Error('Unexpected response format');
      },
      meta: {
        successToast: 'Course material updated successfully',
        errorToast: 'Failed to update course material'
      },
      onSuccess: (updatedMaterial) => {
        // Update the cache with the updated material
        queryClient.setQueryData<CourseMaterial[]>(queryKey, (oldData) => {
          if (!oldData || !Array.isArray(oldData)) return [updatedMaterial];
          return oldData.map(material => 
            material.id === updatedMaterial.id ? updatedMaterial : material
          );
        });
      },
    });
  };
  
  /**
   * Hook to delete a course material
   */
  const useDeleteCourseMaterial = () => {
    return useMutation({
      mutationFn: (materialId: string) =>
        apiRequest.delete(`/api/admin/courses/${courseId}/materials/${materialId}`),
      // Remove toasts - only use for update/publish/unpublish as requested
      onSuccess: (_, materialId) => {
        // Remove the material from cache
        queryClient.setQueryData<CourseMaterial[]>(queryKey, (oldData) => {
          if (!oldData || !Array.isArray(oldData)) return [];
          return oldData.filter(material => material.id !== materialId);
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['courses'] });
      },
    });
  };
  
  return {
    useGetCourseMaterials,
    useCreateCourseMaterial,
    useUpdateCourseMaterial,
    useDeleteCourseMaterial
  };
}

/**
 * Helper hook to get course materials for a specific course
 * @param courseId Course ID
 * @returns Query result for course materials
 */
export function useCourseMaterials(courseId: string) {
  const { useGetCourseMaterials } = useCourseMaterialsQuery(courseId);
  return useGetCourseMaterials();
}