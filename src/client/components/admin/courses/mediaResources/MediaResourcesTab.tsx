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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-xl font-semibold mb-8 text-gray-800">Media & Resources</h2>

      <div className="space-y-8">
        <ResourceUpload 
          courseId={courseId} 
          onChangesDetected={onChangesDetected}
        />
        
        <div className="border-t border-gray-100 pt-8">
          <ReferenceLinks courseId={courseId} />
        </div>
      </div>
    </div>
  );
};

export default MediaResourcesTab;