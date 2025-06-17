'use client';

import { FC, useState } from 'react';
import { 
  LinkIcon, 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  ArrowTopRightOnSquareIcon 
} from '@heroicons/react/24/outline';
import LinkForm from './LinkForm';
import { useReferenceLinksQuery } from '@/client/hooks/courses/useReferenceLinksQuery';
import { ReferenceLink } from '@/shared/types/courses/reference-link';
import { LoadingState } from '@/client/components/common/LoadingState';

interface ReferenceLinksProps {
  courseId: string;
}

const ReferenceLinks: FC<ReferenceLinksProps> = ({ courseId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState<ReferenceLink | null>(null);
  
  // React Query hooks
  const {
    useGetReferenceLinks,
    useCreateReferenceLink,
    useUpdateReferenceLink,
    useDeleteReferenceLink
  } = useReferenceLinksQuery(courseId);
  
  const { data: links = [], isLoading, error } = useGetReferenceLinks();
  const createMutation = useCreateReferenceLink();
  const updateMutation = useUpdateReferenceLink();
  const deleteMutation = useDeleteReferenceLink();

  const handleAddLink = async (linkData: Omit<ReferenceLink, 'id' | 'createdAt' | 'updatedAt' | 'courseId' | 'order' | 'isActive'>) => {
    try {
      await createMutation.mutateAsync({
        ...linkData,
        description: linkData.description || undefined
      });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add link:', error);
    }
  };

  const handleEditLink = async (linkData: Omit<ReferenceLink, 'id' | 'createdAt' | 'updatedAt' | 'courseId' | 'order' | 'isActive'>) => {
    if (!editingLink) return;
    
    try {
      await updateMutation.mutateAsync({
        linkId: editingLink.id,
        data: {
          ...linkData,
          description: linkData.description || undefined
        }
      });
      setEditingLink(null);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to update link:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this reference link?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete link:', error);
      }
    }
  };

  const handleEdit = (link: ReferenceLink) => {
    setEditingLink(link);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingLink(null);
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getFaviconUrl = (url: string): string => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
    } catch {
      return '';
    }
  };

  // Loading state
  if (isLoading) {
    return <LoadingState message="Loading reference links..." />;
  }
  
  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Failed to load reference links</p>
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
          <h3 className="text-lg font-medium text-gray-900">Reference Links</h3>
          <p className="text-sm text-gray-600">
            External resources and documentation
          </p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6 border">
          <LinkForm
            initialData={editingLink}
            onSubmit={editingLink ? handleEditLink : handleAddLink}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Links List */}
      {links.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Reference Links ({links.length})
          </h4>
          <div className="space-y-2">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {isValidUrl(link.url) ? (
                      <img 
                        src={getFaviconUrl(link.url)}
                        alt=""
                        className="w-4 h-4"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h5 className="text-sm font-medium text-gray-900 truncate">
                        {link.title}
                      </h5>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        title="Open in new tab"
                      >
                        <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-blue-600 truncate hover:text-blue-800">
                        {link.url}
                      </p>
                      {link.description && (
                        <p className="text-xs text-gray-500">
                          {link.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(link)}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-gray-50"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-50"
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
        !showForm && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <LinkIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">No reference links</h3>
            <p className="mt-2 text-sm text-gray-600">
              Add external resources and documentation links for your students
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 btn-admin-primary"
              disabled={createMutation.isPending}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Your First Link
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default ReferenceLinks;