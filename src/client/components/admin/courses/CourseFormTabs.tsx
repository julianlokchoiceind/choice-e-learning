'use client';

import { FC } from 'react';

interface CourseFormTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const CourseFormTabs: FC<CourseFormTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'basicInfo', label: 'Basic Info' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'media-resources', label: 'Media & Resources' },
    { id: 'quizzes', label: 'Quizzes' },
    { id: 'settings-pricing', label: 'Setting' },
    { id: 'preview', label: 'Preview' },
  ];

  return (
    <div className="flex rounded-lg bg-white border border-gray-200 overflow-hidden relative z-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`no-transform py-4 px-6 text-center flex-1 relative z-10 cursor-pointer ${
            activeTab === tab.id
              ? 'bg-blue-50 text-blue-500 font-medium border-b-2 border-blue-500'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default CourseFormTabs; 