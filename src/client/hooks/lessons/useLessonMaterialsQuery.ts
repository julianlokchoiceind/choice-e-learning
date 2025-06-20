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
      queryFn: async (): Promise<LessonMaterial[]> => {
        const response = await apiRequest.get(`/api/admin/lessons/${lessonId}/materials`);
        
        // The useApiRequest hook returns the full Axios response
        // response.data contains our API response: { success: true, data: LessonMaterial[] }
        if (response && response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
          const materials = response.data.data;
          return Array.isArray(materials) ? materials : [];
        }
        
        // Fallback
        return [];
      },
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
      onSuccess: (response) => {
        // Extract material from API response: { success: true, data: material }
        const newMaterial = response?.data?.data || response?.data || response;
        if (!newMaterial) return;
        
        // Update the cache with the new material
        queryClient.setQueryData<LessonMaterial[]>(queryKey, (oldData) => {
          if (!oldData || !Array.isArray(oldData)) return [newMaterial];
          return [...oldData, newMaterial];
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['lessons'] });
      },
    });
  };
  
  /**
   * Hook to update a lesson material
   */
  const useUpdateLessonMaterial = () => {
    return useMutation({
      mutationFn: ({ materialId, data }: { materialId: string; data: UpdateLessonMaterialData }) =>
        apiRequest.put<LessonMaterial>(`/api/admin/lessons/${lessonId}/materials/${materialId}`, data),
      onSuccess: (response) => {
        // Extract material from API response: { success: true, data: material }
        const updatedMaterial = response?.data?.data || response?.data || response;
        if (!updatedMaterial) return;
        
        // Update the cache with the updated material
        queryClient.setQueryData<LessonMaterial[]>(queryKey, (oldData) => {
          if (!oldData || !Array.isArray(oldData)) return [updatedMaterial];
          return oldData.map(material => 
            material.id === updatedMaterial.id ? updatedMaterial : material
          );
        });
      },
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