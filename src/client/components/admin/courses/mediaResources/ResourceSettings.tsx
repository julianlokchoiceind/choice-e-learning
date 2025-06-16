'use client';

import { FC, useState } from 'react';
import { 
  PlayIcon, 
  ShieldCheckIcon, 
  ChartBarIcon,
  DocumentArrowDownIcon,
  InformationCircleIcon,
  ClockIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

interface ResourceSettingsProps {
  courseId: string;
}

const ResourceSettings: FC<ResourceSettingsProps> = ({ courseId }) => {
  const [settings, setSettings] = useState({
    videoControl: {
      completionPercentage: 80,
      preventSeeking: true,
      hideControls: false,
      trackWatchTime: true,
      pauseOnTabSwitch: true
    },
    contentProtection: {
      disableRightClick: true,
      disablePrint: false,
      preventScreenRecord: false,
      addWatermark: false
    },
    progressRequirements: {
      sequentialLearning: true,
      minimumTimePerLesson: 5, // minutes
      retryLimit: 3
    },
    downloadPermissions: {
      allowDownload: true,
      downloadLimit: 3,
      offlineAccess: false
    }
  });

  const handleToggle = (section: string, key: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [key]: !(prev as any)[section][key]
      }
    }));
  };

  const handleNumberChange = (section: string, key: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [key]: value
      }
    }));
  };

  const ToggleSwitch: FC<{ 
    enabled: boolean; 
    onChange: () => void; 
    disabled?: boolean;
  }> = ({ enabled, onChange, disabled = false }) => (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const NumberInput: FC<{
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    suffix?: string;
  }> = ({ value, onChange, min = 0, max = 100, suffix = '' }) => (
    <div className="flex items-center space-x-2">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">Resource Settings</h3>
        <p className="text-sm text-gray-600">
          Configure video controls, content protection, and learning requirements
        </p>
      </div>

      {/* Video Control Settings */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <PlayIcon className="h-6 w-6 text-blue-600" />
          <div>
            <h4 className="text-base font-medium text-gray-900">Video Control Settings</h4>
            <p className="text-sm text-gray-600">Control how students interact with video content</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Video Completion Requirement</p>
              <p className="text-xs text-gray-500">Minimum percentage students must watch</p>
            </div>
            <NumberInput
              value={settings.videoControl.completionPercentage}
              onChange={(value) => handleNumberChange('videoControl', 'completionPercentage', value)}
              min={50}
              max={100}
              suffix="%"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Prevent Video Seeking</p>
              <p className="text-xs text-gray-500">Disable forward seeking to prevent skipping</p>
            </div>
            <ToggleSwitch
              enabled={settings.videoControl.preventSeeking}
              onChange={() => handleToggle('videoControl', 'preventSeeking')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Hide Video Controls</p>
              <p className="text-xs text-gray-500">Remove scrub bar and time controls</p>
            </div>
            <ToggleSwitch
              enabled={settings.videoControl.hideControls}
              onChange={() => handleToggle('videoControl', 'hideControls')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Track Watch Time</p>
              <p className="text-xs text-gray-500">Monitor actual viewing time vs video duration</p>
            </div>
            <ToggleSwitch
              enabled={settings.videoControl.trackWatchTime}
              onChange={() => handleToggle('videoControl', 'trackWatchTime')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Pause on Tab Switch</p>
              <p className="text-xs text-gray-500">Auto-pause when student leaves browser tab</p>
            </div>
            <ToggleSwitch
              enabled={settings.videoControl.pauseOnTabSwitch}
              onChange={() => handleToggle('videoControl', 'pauseOnTabSwitch')}
            />
          </div>
        </div>
      </div>

      {/* Content Protection */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <ShieldCheckIcon className="h-6 w-6 text-green-600" />
          <div>
            <h4 className="text-base font-medium text-gray-900">Content Protection</h4>
            <p className="text-sm text-gray-600">Protect course materials from unauthorized access</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Disable Right-Click</p>
              <p className="text-xs text-gray-500">Prevent copying content via context menu</p>
            </div>
            <ToggleSwitch
              enabled={settings.contentProtection.disableRightClick}
              onChange={() => handleToggle('contentProtection', 'disableRightClick')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Disable Printing</p>
              <p className="text-xs text-gray-500">Prevent printing of course content</p>
            </div>
            <ToggleSwitch
              enabled={settings.contentProtection.disablePrint}
              onChange={() => handleToggle('contentProtection', 'disablePrint')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Screen Recording Detection</p>
              <p className="text-xs text-gray-500">Block screen capture attempts</p>
            </div>
            <ToggleSwitch
              enabled={settings.contentProtection.preventScreenRecord}
              onChange={() => handleToggle('contentProtection', 'preventScreenRecord')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">User Watermark</p>
              <p className="text-xs text-gray-500">Add student info overlay on videos</p>
            </div>
            <ToggleSwitch
              enabled={settings.contentProtection.addWatermark}
              onChange={() => handleToggle('contentProtection', 'addWatermark')}
            />
          </div>
        </div>
      </div>

      {/* Progress Requirements */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <ChartBarIcon className="h-6 w-6 text-purple-600" />
          <div>
            <h4 className="text-base font-medium text-gray-900">Progress Requirements</h4>
            <p className="text-sm text-gray-600">Set learning completion requirements</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Sequential Learning</p>
              <p className="text-xs text-gray-500">Students must complete lessons in order</p>
            </div>
            <ToggleSwitch
              enabled={settings.progressRequirements.sequentialLearning}
              onChange={() => handleToggle('progressRequirements', 'sequentialLearning')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Minimum Time per Lesson</p>
              <p className="text-xs text-gray-500">Required study time before completion</p>
            </div>
            <NumberInput
              value={settings.progressRequirements.minimumTimePerLesson}
              onChange={(value) => handleNumberChange('progressRequirements', 'minimumTimePerLesson', value)}
              min={1}
              max={60}
              suffix="minutes"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Quiz Retry Limit</p>
              <p className="text-xs text-gray-500">Maximum attempts for quizzes and assessments</p>
            </div>
            <NumberInput
              value={settings.progressRequirements.retryLimit}
              onChange={(value) => handleNumberChange('progressRequirements', 'retryLimit', value)}
              min={1}
              max={10}
              suffix="attempts"
            />
          </div>
        </div>
      </div>

      {/* Download Permissions */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <DocumentArrowDownIcon className="h-6 w-6 text-orange-600" />
          <div>
            <h4 className="text-base font-medium text-gray-900">Download Permissions</h4>
            <p className="text-sm text-gray-600">Control access to downloadable resources</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Allow Downloads</p>
              <p className="text-xs text-gray-500">Enable downloading of course materials</p>
            </div>
            <ToggleSwitch
              enabled={settings.downloadPermissions.allowDownload}
              onChange={() => handleToggle('downloadPermissions', 'allowDownload')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Download Limit per Student</p>
              <p className="text-xs text-gray-500">Maximum downloads per student</p>
            </div>
            <NumberInput
              value={settings.downloadPermissions.downloadLimit}
              onChange={(value) => handleNumberChange('downloadPermissions', 'downloadLimit', value)}
              min={1}
              max={20}
              suffix="files"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Offline Access</p>
              <p className="text-xs text-gray-500">Allow offline viewing of downloaded content</p>
            </div>
            <ToggleSwitch
              enabled={settings.downloadPermissions.offlineAccess}
              onChange={() => handleToggle('downloadPermissions', 'offlineAccess')}
            />
          </div>
        </div>
      </div>

      {/* Information Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-medium text-blue-900">Settings Impact</h5>
            <p className="text-sm text-blue-800 mt-1">
              These settings apply to all lessons and resources in this course. Changes take effect 
              immediately for new student sessions. Existing active sessions may need to be refreshed.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <button
          type="button"
          className="btn-admin-primary"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default ResourceSettings;