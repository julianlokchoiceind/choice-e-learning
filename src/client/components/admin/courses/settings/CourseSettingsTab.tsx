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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-xl font-semibold mb-8 text-gray-800">Course Settings</h2>

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