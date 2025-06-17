/**
 * React Query hooks for lesson materials management
 * Provides CRUD operations for lesson materials with caching and optimistic updates
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '@/client/hooks/common/useApiRequest';
import { LessonMaterial, CreateLessonMaterialData, UpdateLessonMaterialData } from '@/shared/types/lessons/lesson-material';

/**
 * Lesson materials query hook factory
 * @param lessonId Lesson ID to manage materials for
 * @returns Object containing all lesson materials query hooks
 */
export function useLessonMaterialsQuery(lessonId: string) {
  const apiRequest = useApiRequest();
  const queryClient = useQueryClient();
  
  const queryKey = ['lesson-materials', lessonId];
  
  /**
   * Hook to get lesson materials
   */
  const useGetLessonMaterials = () => {
    return useQuery({
      queryKey,
      queryFn: () => apiRequest.get<LessonMaterial[]>(`/api/admin/lessons/${lessonId}/materials`),
      enabled: !!lessonId
    });
  };
  
  /**
   * Hook to create a new lesson material
   */
  const useCreateLessonMaterial = () => {
    return useMutation({
      mutationFn: (data: CreateLessonMaterialData) => 
        apiRequest.post<LessonMaterial>(`/api/admin/lessons/${lessonId}/materials`, data),
      onSuccess: (newMaterial) => {
        // Update the cache with the new material
        queryClient.setQueryData<LessonMaterial[]>(queryKey, (oldData) => {
          if (!oldData) return [newMaterial];
          return [...oldData, newMaterial];
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['lessons'] });
      },
      meta: {
        successToast: 'Lesson material uploaded successfully',
        errorToast: 'Failed to upload lesson material'
      }
    });
  };
  
  /**
   * Hook to update a lesson material
   */
  const useUpdateLessonMaterial = () => {
    return useMutation({
      mutationFn: ({ materialId, data }: { materialId: string; data: UpdateLessonMaterialData }) =>
        apiRequest.put<LessonMaterial>(`/api/admin/lessons/${lessonId}/materials/${materialId}`, data),
      onSuccess: (updatedMaterial) => {
        // Update the cache with the updated material
        queryClient.setQueryData<LessonMaterial[]>(queryKey, (oldData) => {
          if (!oldData) return [updatedMaterial];
          return oldData.map(material => 
            material.id === updatedMaterial.id ? updatedMaterial : material
          );
        });
      },
      meta: {
        successToast: 'Lesson material updated successfully',
        errorToast: 'Failed to update lesson material'
      }
    });
  };
  
  /**
   * Hook to delete a lesson material
   */
  const useDeleteLessonMaterial = () => {
    return useMutation({
      mutationFn: (materialId: string) =>
        apiRequest.delete(`/api/admin/lessons/${lessonId}/materials/${materialId}`),
      onSuccess: (_, materialId) => {
        // Remove the material from cache
        queryClient.setQueryData<LessonMaterial[]>(queryKey, (oldData) => {
          if (!oldData) return [];
          return oldData.filter(material => material.id !== materialId);
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['lessons'] });
      },
      meta: {
        successToast: 'Lesson material deleted successfully',
        errorToast: 'Failed to delete lesson material'
      }
    });
  };
  
  return {
    useGetLessonMaterials,
    useCreateLessonMaterial,
    useUpdateLessonMaterial,
    useDeleteLessonMaterial
  };
}

/**
 * Helper hook to get lesson materials for a specific lesson
 * @param lessonId Lesson ID
 * @returns Query result for lesson materials
 */
export function useLessonMaterials(lessonId: string) {
  const { useGetLessonMaterials } = useLessonMaterialsQuery(lessonId);
  return useGetLessonMaterials();
}