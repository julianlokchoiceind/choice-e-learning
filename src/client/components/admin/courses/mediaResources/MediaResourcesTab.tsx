'use client';

import { FC, useState } from 'react';
import { 
  DocumentIcon, 
  LinkIcon, 
  CogIcon,
  PlusIcon 
} from '@heroicons/react/24/outline';
import ResourceUpload from './ResourceUpload';
import ReferenceLinks from './ReferenceLinks';
import ResourceSettings from './ResourceSettings';

interface MediaResourcesTabProps {
  courseId: string;
}

const MediaResourcesTab: FC<MediaResourcesTabProps> = ({ courseId }) => {
  const [activeSection, setActiveSection] = useState<'materials' | 'links' | 'settings'>('materials');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Media & Resources</h2>
        <p className="text-gray-600">
          Manage course materials, reference links, assignments, and resource settings
        </p>
      </div>

      {/* Section Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveSection('materials')}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'materials'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <DocumentIcon className="h-4 w-4 mr-2" />
          Course Materials
        </button>
        <button
          onClick={() => setActiveSection('links')}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'links'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          Reference Links
        </button>
        <button
          onClick={() => setActiveSection('settings')}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'settings'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <CogIcon className="h-4 w-4 mr-2" />
          Resource Settings
        </button>
      </div>

      {/* Section Content */}
      <div className="min-h-[400px]">
        {activeSection === 'materials' && (
          <ResourceUpload courseId={courseId} />
        )}
        {activeSection === 'links' && (
          <ReferenceLinks courseId={courseId} />
        )}
        {activeSection === 'settings' && (
          <ResourceSettings courseId={courseId} />
        )}
      </div>
    </div>
  );
};

export default MediaResourcesTab;