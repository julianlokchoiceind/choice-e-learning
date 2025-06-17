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
      queryFn: () => apiRequest.get<CourseMaterial[]>(`/api/admin/courses/${courseId}/materials`),
      enabled: !!courseId
    });
  };
  
  /**
   * Hook to create a new course material
   */
  const useCreateCourseMaterial = () => {
    return useMutation({
      mutationFn: (data: CreateCourseMaterialData) => 
        apiRequest.post<CourseMaterial>(`/api/admin/courses/${courseId}/materials`, data),
      onSuccess: (newMaterial) => {
        // Update the cache with the new material
        queryClient.setQueryData<CourseMaterial[]>(queryKey, (oldData) => {
          if (!oldData) return [newMaterial];
          return [...oldData, newMaterial];
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['courses'] });
      },
      meta: {
        successToast: 'Course material uploaded successfully',
        errorToast: 'Failed to upload course material'
      }
    });
  };
  
  /**
   * Hook to update a course material
   */
  const useUpdateCourseMaterial = () => {
    return useMutation({
      mutationFn: ({ materialId, data }: { materialId: string; data: UpdateCourseMaterialData }) =>
        apiRequest.put<CourseMaterial>(`/api/admin/courses/${courseId}/materials/${materialId}`, data),
      onSuccess: (updatedMaterial) => {
        // Update the cache with the updated material
        queryClient.setQueryData<CourseMaterial[]>(queryKey, (oldData) => {
          if (!oldData) return [updatedMaterial];
          return oldData.map(material => 
            material.id === updatedMaterial.id ? updatedMaterial : material
          );
        });
      },
      meta: {
        successToast: 'Course material updated successfully',
        errorToast: 'Failed to update course material'
      }
    });
  };
  
  /**
   * Hook to delete a course material
   */
  const useDeleteCourseMaterial = () => {
    return useMutation({
      mutationFn: (materialId: string) =>
        apiRequest.delete(`/api/admin/courses/${courseId}/materials/${materialId}`),
      onSuccess: (_, materialId) => {
        // Remove the material from cache
        queryClient.setQueryData<CourseMaterial[]>(queryKey, (oldData) => {
          if (!oldData) return [];
          return oldData.filter(material => material.id !== materialId);
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['courses'] });
      },
      meta: {
        successToast: 'Course material deleted successfully',
        errorToast: 'Failed to delete course material'
      }
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