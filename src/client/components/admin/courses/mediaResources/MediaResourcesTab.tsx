'use client';

import { FC } from 'react';
import ResourceUpload from './ResourceUpload';
import ReferenceLinks from './ReferenceLinks';

interface MediaResourcesTabProps {
  courseId: string;
  onChangesDetected?: (hasChanges: boolean) => void;
}

const MediaResourcesTab: FC<MediaResourcesTabProps> = ({ courseId, onChangesDetected }) => {
  return (
    <div>
      {/* Tab Header */}
      <div className="pb-4 mb-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Media & Resources</h2>
        <p className="text-gray-600 mt-1">
          Manage course materials and reference links for students
        </p>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        <ResourceUpload 
          courseId={courseId} 
          onChangesDetected={onChangesDetected}
        />
        
        <ReferenceLinks courseId={courseId} />
      </div>
    </div>
  );
};

export default MediaResourcesTab;