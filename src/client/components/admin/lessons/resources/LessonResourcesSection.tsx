'use client';

import { FC, useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { DocumentIcon, LinkIcon } from '@heroicons/react/24/outline';
import { LessonResources, LessonResourcesSectionProps } from '@/shared/types/lessons';
import { LoadingState } from '@/client/components/common/LoadingState';
import { TempFile } from '@/client/hooks/common/useFileUploadWorkflow';
import LessonResourceUpload, { LessonResourceUploadRef } from './LessonResourceUpload';
import LessonReferenceLinks from './LessonReferenceLinks';

export interface LessonResourcesSectionRef {
  saveChanges: () => Promise<void>;
  getTempFiles: () => TempFile[];
  getDeletedIds: () => string[];
  reset: () => void;
}

const LessonResourcesSection = forwardRef<LessonResourcesSectionRef, LessonResourcesSectionProps>(({ 
  lessonId, 
  courseId, 
  initialResources,
  allowDownload = true,
  onResourcesChange,
  onChangesDetected 
}, ref) => {
  const resourceUploadRef = useRef<LessonResourceUploadRef>(null);
  
  // Track changes from both components
  const [uploadChanges, setUploadChanges] = useState(false);
  const [linkChanges, setLinkChanges] = useState(false);
  
  // Resources state for links management
  const [resources, setResources] = useState<LessonResources>({
    files: [],
    links: []
  });
  
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
        uploadChanges || // File-related changes from upload component
        linkChanges || // Link changes from links component
        JSON.stringify(resources.links) !== JSON.stringify(initialResources?.links || []);
      
      console.log('🔍 LessonResourcesSection: Change detection ENHANCED:', {
        uploadChanges,
        linkChanges,
        linksChanged: JSON.stringify(resources.links) !== JSON.stringify(initialResources?.links || []),
        finalHasChanges: hasChanges
      });
      
      onChangesDetected(hasChanges);
    }
  }, [uploadChanges, linkChanges, resources.links, initialResources, onChangesDetected]);
  
  // Expose methods to parent via ref (maintain backward compatibility)
  useImperativeHandle(ref, () => ({
    saveChanges: async () => {
      console.log('🚀 LessonResourcesSection: saveChanges() CALLED!');
      console.log('🔍 LessonResourcesSection: Delegating to LessonResourceUpload');
      
      if (resourceUploadRef.current) {
        await resourceUploadRef.current.saveChanges();
      }
    },
    getTempFiles: () => {
      console.log('🔍 LessonResourcesSection: getTempFiles() called');
      return resourceUploadRef.current?.getTempFiles() || [];
    },
    getDeletedIds: () => {
      console.log('🔍 LessonResourcesSection: getDeletedIds() called');
      return resourceUploadRef.current?.getDeletedIds() || [];
    },
    reset: () => {
      console.log('🔍 LessonResourcesSection: reset() called');
      if (resourceUploadRef.current) {
        resourceUploadRef.current.reset();
      }
    }
  }), []);

  // Loading state - show loading when we have a lessonId
  if (!lessonId) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-xl font-semibold mb-8 text-gray-800">Lesson Resources</h2>

      <div className="space-y-8">
        {/* Files Section */}
        <div>
          <div className="flex items-center space-x-2 mb-6">
            <DocumentIcon className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-medium text-gray-900">Files</h3>
          </div>
          <LessonResourceUpload 
            ref={resourceUploadRef}
            lessonId={lessonId}
            courseId={courseId}
            allowDownload={allowDownload}
            onChangesDetected={setUploadChanges}
          />
        </div>
        
        {/* Reference Links Section */}
        <div className="border-t border-gray-100 pt-8">
          <div className="flex items-center space-x-2 mb-6">
            <LinkIcon className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-medium text-gray-900">Reference Links</h3>
          </div>
          <LessonReferenceLinks 
            lessonId={lessonId}
            courseId={courseId}
            initialResources={initialResources}
            onResourcesChange={setResources}
            onChangesDetected={setLinkChanges}
          />
        </div>
      </div>
    </div>
  );
});

LessonResourcesSection.displayName = 'LessonResourcesSection';

export default LessonResourcesSection;