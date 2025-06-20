'use client';

import { FC, useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import CourseResourceUpload, { CourseResourceUploadRef } from './CourseResourceUpload';
import CourseReferenceLinks from './CourseReferenceLinks';

interface CourseResourcesTabProps {
  courseId: string;
  onChangesDetected?: (hasChanges: boolean) => void;
}

export interface CourseResourcesTabRef {
  getResourceUploadRef: () => CourseResourceUploadRef | null;
}

const CourseResourcesTab = forwardRef<CourseResourcesTabRef, CourseResourcesTabProps>(({ courseId, onChangesDetected }, ref) => {
  const resourceUploadRef = useRef<CourseResourceUploadRef>(null);
  
  // Track changes from both components
  const [uploadChanges, setUploadChanges] = useState(false);
  const [linkChanges, setLinkChanges] = useState(false);
  
  useEffect(() => {
    if (onChangesDetected) {
      onChangesDetected(uploadChanges || linkChanges);
    }
  }, [uploadChanges, linkChanges, onChangesDetected]);
  
  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    getResourceUploadRef: () => resourceUploadRef.current
  }), []);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-xl font-semibold mb-8 text-gray-800">Resources</h2>

      <div className="space-y-8">
        <CourseResourceUpload 
          ref={resourceUploadRef}
          courseId={courseId} 
          onChangesDetected={setUploadChanges}
        />
        
        <div className="border-t border-gray-100 pt-8">
          <CourseReferenceLinks 
            courseId={courseId} 
            onChangesDetected={setLinkChanges}
          />
        </div>
      </div>
    </div>
  );
});

CourseResourcesTab.displayName = 'CourseResourcesTab';

export default CourseResourcesTab;