'use client';

import { FC, useState, useEffect } from 'react';
import { 
  LinkIcon, 
  PlusIcon, 
  TrashIcon, 
  ArrowTopRightOnSquareIcon 
} from '@heroicons/react/24/outline';
import { LessonResources, LessonResourceLink } from '@/shared/types/lessons';

interface LessonReferenceLinksProps {
  lessonId: string;
  courseId: string;
  initialResources?: LessonResources;
  onResourcesChange?: (resources: LessonResources) => void;
  onChangesDetected?: (hasChanges: boolean) => void;
}

const LessonReferenceLinks: FC<LessonReferenceLinksProps> = ({ 
  lessonId, 
  courseId,
  initialResources,
  onResourcesChange,
  onChangesDetected 
}) => {
  // Links-related state (non-file uploads)
  const [resources, setResources] = useState<LessonResources>({
    files: [],
    links: []
  });
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  // Initialize resources from props (only once)
  useEffect(() => {
    if (initialResources && Object.keys(initialResources).length > 0) {
      setResources({
        files: initialResources.files || [],
        links: initialResources.links || []
      });
    }
  }, []); // Only run on mount

  // Notify parent of changes (debounced)
  useEffect(() => {
    if (onResourcesChange && resources !== initialResources) {
      const timeoutId = setTimeout(() => {
        onResourcesChange(resources);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [resources]); // Remove onResourcesChange from deps to prevent infinite re-renders

  // Detect unsaved changes
  useEffect(() => {
    if (onChangesDetected) {
      const hasChanges = 
        hasLocalChanges || // Link changes
        JSON.stringify(resources.links) !== JSON.stringify(initialResources?.links || []);
      
      console.log('🔍 LessonReferenceLinks: Change detection:', {
        hasLocalChanges,
        linksChanged: JSON.stringify(resources.links) !== JSON.stringify(initialResources?.links || []),
        finalHasChanges: hasChanges
      });
      
      onChangesDetected(hasChanges);
    }
  }, [hasLocalChanges, resources.links, initialResources, onChangesDetected]);

  const handleAddLink = () => {
    const newLink: LessonResourceLink = {
      id: `link_${Date.now()}`,
      title: '',
      url: '',
      description: '',
      order: resources.links.length + 1
    };
    setResources(prev => ({
      ...prev,
      links: [...prev.links, newLink]
    }));
    setHasLocalChanges(true);
  };

  const handleUpdateLink = (id: string, updates: Partial<LessonResourceLink>) => {
    setResources(prev => ({
      ...prev,
      links: prev.links.map(link => 
        link.id === id ? { ...link, ...updates } : link
      )
    }));
    setHasLocalChanges(true);
  };

  const handleDeleteLink = (id: string) => {
    setResources(prev => ({
      ...prev,
      links: prev.links.filter(link => link.id !== id)
    }));
    setHasLocalChanges(true);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Reference Links</h3>
          <p className="text-sm text-gray-600">
            Add documentation links, tutorials, or external resources
          </p>
        </div>
        {resources.links.length > 0 && (
          <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
            {resources.links.length}
          </span>
        )}
      </div>

      {/* Upload Area Style for Add Link */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 transition-colors">
        <div className="text-center">
          <LinkIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900">Add Reference Links</h4>
            <p className="text-sm text-gray-600 mt-1">
              Add documentation links, tutorials, or external resources
            </p>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={handleAddLink}
              className="btn-admin-primary inline-flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Link
            </button>
          </div>
        </div>
      </div>

      {/* Links List */}
      {resources.links.length > 0 && (
        <div className="space-y-3">
          {resources.links.map((link) => (
            <div key={link.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => handleUpdateLink(link.id, { title: e.target.value })}
                    placeholder="Link title"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-0 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteLink(link.id)}
                    className="ml-3 p-2 text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => handleUpdateLink(link.id, { url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-0 focus:border-blue-500"
                />
                <textarea
                  value={link.description || ''}
                  onChange={(e) => handleUpdateLink(link.id, { description: e.target.value })}
                  placeholder="Optional description"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-0 focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonReferenceLinks;