'use client';

import { FC } from 'react';
import { CogIcon } from '@heroicons/react/24/outline';
import ResourceSettings from '../mediaResources/ResourceSettings';

interface CourseSettingsTabProps {
  courseId: string;
  onChangesDetected?: (hasChanges: boolean) => void;
}

const CourseSettingsTab: FC<CourseSettingsTabProps> = ({ courseId, onChangesDetected }) => {
  return (
    <div>
      {/* Tab Header */}
      <div className="pb-4 mb-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Course Settings</h2>
        <p className="text-gray-600 mt-1">
          Configure resource permissions, video controls, and content protection settings
        </p>
      </div>

      {/* Tab Content */}
      <div>
        <ResourceSettings 
          courseId={courseId} 
          onChangesDetected={onChangesDetected}
        />
      </div>
    </div>
  );
};

export default CourseSettingsTab;