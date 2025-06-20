'use client';

import { FC, useState, useMemo, useEffect } from 'react';
import { 
  LinkIcon, 
  PlusIcon, 
  TrashIcon, 
  ArrowTopRightOnSquareIcon 
} from '@heroicons/react/24/outline';
import CourseLinkForm from './CourseLinkForm';
import { useCourseReferenceLinksQuery } from '@/client/hooks/courses/useCourseReferenceLinksQuery';
import { CourseReferenceLink } from '@/shared/types/courses/course-reference-link';
import { LoadingState } from '@/client/components/common/LoadingState';

interface CourseReferenceLinksProps {
  courseId: string;
  onChangesDetected?: (hasChanges: boolean) => void;
}

const CourseReferenceLinks: FC<CourseReferenceLinksProps> = ({ courseId, onChangesDetected }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState<CourseReferenceLink | null>(null);
  
  // Track initial count for change detection
  const [initialLinksCount, setInitialLinksCount] = useState(0);
  
  // React Query hooks with stable filter reference
  const filter = useMemo(() => ({}), []); // Stable empty filter object
  const {
    useGetCourseReferenceLinks,
    useCreateCourseReferenceLink,
    useUpdateCourseReferenceLink,
    useDeleteCourseReferenceLink
  } = useCourseReferenceLinksQuery(courseId, filter);
  
  const { data: links = [], isLoading, error } = useGetCourseReferenceLinks();
  const createMutation = useCreateCourseReferenceLink();
  const updateMutation = useUpdateCourseReferenceLink();
  const deleteMutation = useDeleteCourseReferenceLink();
  
  // Set initial count when links are loaded
  useEffect(() => {
    if (links && links.length > 0 && initialLinksCount === 0) {
      setInitialLinksCount(links.length);
    }
  }, [links, initialLinksCount]);
  
  // Detect changes
  useEffect(() => {
    if (onChangesDetected) {
      const hasChanges = links.length !== initialLinksCount || showForm;
      onChangesDetected(hasChanges);
    }
  }, [links.length, initialLinksCount, showForm, onChangesDetected]);


  const handleAddLink = async (linkData: Omit<CourseReferenceLink, 'id' | 'createdAt' | 'updatedAt' | 'courseId' | 'order' | 'isActive'>) => {
    try {
      console.log('🔍 Submitting reference link data:', {
        title: linkData.title,
        url: linkData.url,
        description: linkData.description || undefined
      });
      
      await createMutation.mutateAsync({
        title: linkData.title,
        url: linkData.url,
        description: linkData.description || undefined
      });
      setShowForm(false);
    } catch (error) {
      console.error('❌ Failed to add link:', error);
      // Log the full error for debugging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
    }
  };

  const handleEditLink = async (linkData: Omit<CourseReferenceLink, 'id' | 'createdAt' | 'updatedAt' | 'courseId' | 'order' | 'isActive'>) => {
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
        {!showForm && links.length > 0 && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-admin-primary inline-flex items-center"
            disabled={createMutation.isPending}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Reference Link
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6 border">
          <CourseLinkForm
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
                className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {isValidUrl(link.url) ? (
                      <img 
                        src={getFaviconUrl(link.url)}
                        alt=""
                        className="w-8 h-8 rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          // Show fallback icon when favicon fails
                          const fallback = document.createElement('div');
                          fallback.className = 'w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs font-bold';
                          fallback.textContent = 'URL';
                          (e.target as HTMLImageElement).parentNode?.replaceChild(fallback, e.target as HTMLImageElement);
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs font-bold">
                        URL
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
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
                    {link.description && (
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {link.description}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="ml-4">
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-50"
                    title="Remove"
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
            <h3 className="mt-4 text-sm font-medium text-gray-900">Add reference links</h3>
            <p className="mt-2 text-sm text-gray-600">
              Add external resources and documentation links for your students
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 btn-admin-primary"
              disabled={createMutation.isPending}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Link
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default CourseReferenceLinks;