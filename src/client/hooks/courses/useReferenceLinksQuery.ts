import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '@/client/hooks/common/useApiRequest';
import { 
  ReferenceLink, 
  ReferenceLinkListResponse,
  CreateReferenceLinkRequest,
  UpdateReferenceLinkRequest,
  ReferenceLinkFilter
} from '@/shared/types/courses/reference-link';
import { QueryKeys } from '@/shared/constants/query-keys';

export const useReferenceLinksQuery = (courseId: string, filter: ReferenceLinkFilter = {}) => {
  const apiRequest = useApiRequest();
  const queryClient = useQueryClient();

  // Get reference links
  const useGetReferenceLinks = () => {
    return useQuery({
      queryKey: [QueryKeys.REFERENCE_LINKS, courseId, filter],
      queryFn: async (): Promise<ReferenceLink[]> => {
        const params = new URLSearchParams();
        if (filter.isActive !== undefined) {
          params.append('isActive', String(filter.isActive));
        }
        if (filter.search) {
          params.append('search', filter.search);
        }

        const response = await apiRequest.get<ReferenceLinkListResponse>(
          `/api/admin/courses/${courseId}/reference-links?${params.toString()}`
        );
        return response?.data?.referenceLinks || [];
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get single reference link
  const useGetReferenceLink = (linkId: string) => {
    return useQuery({
      queryKey: [QueryKeys.REFERENCE_LINKS, courseId, linkId],
      queryFn: async (): Promise<ReferenceLink> => {
        const response = await apiRequest.get<ReferenceLink>(
          `/api/admin/courses/${courseId}/reference-links/${linkId}`
        );
        return response?.data as ReferenceLink;
      },
      enabled: !!linkId,
    });
  };

  // Create reference link
  const useCreateReferenceLink = () => {
    return useMutation({
      mutationFn: async (data: CreateReferenceLinkRequest): Promise<ReferenceLink> => {
        const response = await apiRequest.post<ReferenceLink>(
          `/api/admin/courses/${courseId}/reference-links`,
          data
        );
        return response?.data as ReferenceLink;
      },
      onSuccess: () => {
        // Invalidate and refetch reference links
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.REFERENCE_LINKS, courseId]
        });
      },
      meta: {
        successToast: 'Reference link created successfully',
        errorToast: 'Failed to create reference link'
      }
    });
  };

  // Update reference link
  const useUpdateReferenceLink = () => {
    return useMutation({
      mutationFn: async ({ 
        linkId, 
        data 
      }: { 
        linkId: string; 
        data: UpdateReferenceLinkRequest;
      }): Promise<ReferenceLink> => {
        const response = await apiRequest.put<ReferenceLink>(
          `/api/admin/courses/${courseId}/reference-links/${linkId}`,
          data
        );
        return response?.data as ReferenceLink;
      },
      onSuccess: (_, { linkId }) => {
        // Invalidate queries
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.REFERENCE_LINKS, courseId]
        });
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.REFERENCE_LINKS, courseId, linkId]
        });
      },
      meta: {
        successToast: 'Reference link updated successfully',
        errorToast: 'Failed to update reference link'
      }
    });
  };

  // Delete reference link
  const useDeleteReferenceLink = () => {
    return useMutation({
      mutationFn: async (linkId: string): Promise<void> => {
        await apiRequest.delete(
          `/api/admin/courses/${courseId}/reference-links/${linkId}`
        );
      },
      onSuccess: () => {
        // Invalidate and refetch reference links
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.REFERENCE_LINKS, courseId]
        });
      },
      meta: {
        successToast: 'Reference link deleted successfully',
        errorToast: 'Failed to delete reference link'
      }
    });
  };

  // Bulk operations
  const useReorderReferenceLinks = () => {
    return useMutation({
      mutationFn: async (linkOrders: { id: string; order: number }[]) => {
        return await apiRequest.put(
          `/api/admin/courses/${courseId}/reference-links/reorder`,
          { linkOrders }
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.REFERENCE_LINKS, courseId]
        });
      },
      meta: {
        successToast: 'Reference links reordered successfully',
        errorToast: 'Failed to reorder reference links'
      }
    });
  };

  // Toggle active status
  const useToggleReferenceLinkStatus = () => {
    return useMutation({
      mutationFn: async (linkId: string): Promise<ReferenceLink> => {
        const response = await apiRequest.patch<ReferenceLink>(
          `/api/admin/courses/${courseId}/reference-links/${linkId}/toggle`
        );
        return response?.data as ReferenceLink;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.REFERENCE_LINKS, courseId]
        });
      },
      meta: {
        successToast: 'Reference link status updated',
        errorToast: 'Failed to update status'
      }
    });
  };

  return {
    useGetReferenceLinks,
    useGetReferenceLink,
    useCreateReferenceLink,
    useUpdateReferenceLink,
    useDeleteReferenceLink,
    useReorderReferenceLinks,
    useToggleReferenceLinkStatus
  };
};