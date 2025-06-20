import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '@/client/hooks/common/useApiRequest';
import { 
  CourseReferenceLink, 
  CourseReferenceLinkListResponse,
  CreateCourseReferenceLinkRequest,
  UpdateCourseReferenceLinkRequest,
  CourseReferenceLinkFilter
} from '@/shared/types/courses/course-reference-link';
import { QueryKeys } from '@/shared/constants/query-keys';

export const useCourseReferenceLinksQuery = (courseId: string, filter: CourseReferenceLinkFilter = {}) => {
  const apiRequest = useApiRequest();
  const queryClient = useQueryClient();

  // Get course reference links
  const useGetCourseReferenceLinks = () => {
    return useQuery({
      queryKey: [QueryKeys.COURSE_REFERENCE_LINKS, courseId, filter],
      queryFn: async (): Promise<CourseReferenceLink[]> => {
        const params = new URLSearchParams();
        if (filter.isActive !== undefined) {
          params.append('isActive', String(filter.isActive));
        }
        if (filter.search) {
          params.append('search', filter.search);
        }

        const response = await apiRequest.get<CourseReferenceLinkListResponse>(
          `/api/admin/courses/${courseId}/course-reference-links?${params.toString()}`
        );
        
        // The useApiRequest hook returns the full Axios response
        // response.data contains our API response: { success: true, data: { courseReferenceLinks: [], total: number } }
        if (response && response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
          const links = response.data.data?.courseReferenceLinks || response.data.data || [];
          return Array.isArray(links) ? links : [];
        }
        
        // Fallback
        return [];
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get single course reference link
  const useGetCourseReferenceLink = (linkId: string) => {
    return useQuery({
      queryKey: [QueryKeys.COURSE_REFERENCE_LINKS, courseId, linkId],
      queryFn: async (): Promise<CourseReferenceLink> => {
        const response = await apiRequest.get<CourseReferenceLink>(
          `/api/admin/courses/${courseId}/course-reference-links/${linkId}`
        );
        if (!response) {
          throw new Error('Reference link not found');
        }
        // Extract data from API response format
        if (response && response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
          return response.data.data as CourseReferenceLink;
        }
        throw new Error('Invalid response format');
      },
      enabled: !!linkId,
    });
  };

  // Create course reference link
  const useCreateCourseReferenceLink = () => {
    return useMutation({
      mutationFn: async (data: CreateCourseReferenceLinkRequest): Promise<CourseReferenceLink> => {
        const response = await apiRequest.post<CourseReferenceLink>(
          `/api/admin/courses/${courseId}/course-reference-links`,
          data
        );
        
        if (!response || !response.data) {
          throw new Error('Failed to create reference link');
        }
        // Extract data from API response format
        if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
          return response.data.data as CourseReferenceLink;
        }
        throw new Error('Invalid response format');
      },
      onSuccess: (newLink) => {
        // Invalidate all reference link queries for this course using predicate
        queryClient.invalidateQueries({
          predicate: (query) => {
            return query.queryKey[0] === QueryKeys.COURSE_REFERENCE_LINKS && 
                   query.queryKey[1] === courseId;
          }
        });
        
        // For immediate feedback, also update the cache directly for the current filter
        queryClient.setQueryData<CourseReferenceLink[]>(
          [QueryKeys.COURSE_REFERENCE_LINKS, courseId, filter], 
          (oldData) => {
            if (!oldData || !Array.isArray(oldData)) return [newLink];
            return [...oldData, newLink];
          }
        );
      },
    });
  };

  // Update course reference link
  const useUpdateCourseReferenceLink = () => {
    return useMutation({
      mutationFn: async ({ 
        linkId, 
        data 
      }: { 
        linkId: string; 
        data: UpdateCourseReferenceLinkRequest;
      }): Promise<CourseReferenceLink> => {
        const response = await apiRequest.put<CourseReferenceLink>(
          `/api/admin/courses/${courseId}/course-reference-links/${linkId}`,
          data
        );
        if (!response || !response.data) {
          throw new Error('Failed to update reference link');
        }
        // Extract data from API response format
        if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
          return response.data.data as CourseReferenceLink;
        }
        throw new Error('Invalid response format');
      },
      onSuccess: (_, { linkId }) => {
        // Invalidate queries
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.COURSE_REFERENCE_LINKS, courseId]
        });
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.COURSE_REFERENCE_LINKS, courseId, linkId]
        });
      },
    });
  };

  // Delete course reference link
  const useDeleteCourseReferenceLink = () => {
    return useMutation({
      mutationFn: async (linkId: string): Promise<void> => {
        await apiRequest.delete(
          `/api/admin/courses/${courseId}/course-reference-links/${linkId}`
        );
      },
      onSuccess: () => {
        // Invalidate and refetch reference links
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.COURSE_REFERENCE_LINKS, courseId]
        });
      },
    });
  };

  // Bulk operations
  const useReorderCourseReferenceLinks = () => {
    return useMutation({
      mutationFn: async (linkOrders: { id: string; order: number }[]) => {
        return await apiRequest.put(
          `/api/admin/courses/${courseId}/course-reference-links/reorder`,
          { linkOrders }
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.COURSE_REFERENCE_LINKS, courseId]
        });
      },
    });
  };

  // Toggle active status
  const useToggleCourseReferenceLinkStatus = () => {
    return useMutation({
      mutationFn: async (linkId: string): Promise<CourseReferenceLink> => {
        const response = await apiRequest.patch<CourseReferenceLink>(
          `/api/admin/courses/${courseId}/course-reference-links/${linkId}/toggle`
        );
        if (!response || !response.data) {
          throw new Error('Failed to toggle reference link status');
        }
        // Extract data from API response format
        if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
          return response.data.data as CourseReferenceLink;
        }
        throw new Error('Invalid response format');
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.COURSE_REFERENCE_LINKS, courseId]
        });
      },
    });
  };

  return {
    useGetCourseReferenceLinks,
    useGetCourseReferenceLink,
    useCreateCourseReferenceLink,
    useUpdateCourseReferenceLink,
    useDeleteCourseReferenceLink,
    useReorderCourseReferenceLinks,
    useToggleCourseReferenceLinkStatus
  };
};