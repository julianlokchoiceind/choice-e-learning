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
    { id: 'settings-pricing', label: 'Settings & Pricing' },
    { id: 'preview', label: 'Preview' },
  ];

  return (
    <div className="flex rounded-lg bg-white border border-gray-200 overflow-hidden">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`py-4 px-6 text-center flex-1 transition-colors ${
            activeTab === tab.id
              ? 'bg-blue-50 text-blue-500 font-medium border-b-2 border-blue-500'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default CourseFormTabs; 