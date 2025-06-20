'use client';

import { forwardRef, useRef, useImperativeHandle } from 'react';
import { CogIcon } from '@heroicons/react/24/outline';
import CourseResourceSettings, { CourseResourceSettingsRef } from './CourseResourceSettings';

interface CourseSettingsTabProps {
  courseId: string;
  onChangesDetected?: (hasChanges: boolean) => void;
}

export interface CourseSettingsTabRef {
  getResourceSettingsRef: () => CourseResourceSettingsRef | null;
}

const CourseSettingsTab = forwardRef<CourseSettingsTabRef, CourseSettingsTabProps>(({ courseId, onChangesDetected }, ref) => {
  const resourceSettingsRef = useRef<CourseResourceSettingsRef>(null);
  
  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    getResourceSettingsRef: () => resourceSettingsRef.current
  }), []);
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-xl font-semibold mb-8 text-gray-800">Course Settings</h2>

      <div>
        <CourseResourceSettings 
          ref={resourceSettingsRef}
          courseId={courseId} 
          onChangesDetected={onChangesDetected}
        />
      </div>
    </div>
  );
});

CourseSettingsTab.displayName = 'CourseSettingsTab';

export default CourseSettingsTab;