'use client';

import { useState, useEffect, ReactNode } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { LoadingState, LastSavedIndicator, StatusBadge } from '@/client/components/common';
import { useNavigationGuard } from '@/client/hooks/common/useNavigationGuard';

interface GuardedFormPageProps {
  // Navigation
  backHref: string;
  backText: string;
  
  // Header
  title: string;
  status?: 'active' | 'inactive' | 'draft' | 'published';
  
  // Loading & Error
  isLoading: boolean;
  error?: any;
  notFoundTitle: string;
  notFoundMessage: string;
  
  // Data
  data?: any;
  
  // Form callbacks
  onFormChange: (data: any, isDirty: boolean) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  
  // Children
  children: ReactNode | ((handleFormChange: (data: any, isDirty: boolean) => void) => ReactNode);
}

export const GuardedFormPage = ({
  backHref,
  backText,
  title,
  status = 'active',
  isLoading,
  error,
  notFoundTitle,
  notFoundMessage,
  data,
  onFormChange,
  onSave,
  isSaving,
  children
}: GuardedFormPageProps) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>(status);
  
  // Navigation guard
  const { navigateWithConfirmation } = useNavigationGuard({
    hasUnsavedChanges,
    message: 'Bạn có thay đổi chưa được lưu. Bạn có chắc muốn rời khỏi trang này?'
  });
  
  // Track changes for navigation guard
  
  // Set initial last saved time and status when data is loaded
  useEffect(() => {
    if (data?.updatedAt && !lastSaved) {
      setLastSaved(new Date(data.updatedAt));
    }
    if (data) {
      setCurrentStatus(data.isActive ? 'active' : 'inactive');
    }
  }, [data, lastSaved]);
  
  // Handle form changes
  const handleFormChange = (formData: any, isDirty: boolean) => {
    if (formData.isActive !== undefined) {
      setCurrentStatus(formData.isActive ? 'active' : 'inactive');
    }
    setHasUnsavedChanges(isDirty);
    onFormChange(formData, isDirty);
  };
  
  // Handle save
  const handleSave = async () => {
    try {
      await onSave();
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      // Error handled by parent
    }
  };

  if (isLoading) {
    return <LoadingState variant="page" message={`Loading ${title.toLowerCase()}...`} />;
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {notFoundTitle}
          </h1>
          <p className="text-gray-600 mb-4">
            {notFoundMessage}
          </p>
          <button
            onClick={() => navigateWithConfirmation(backHref)}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 no-transform"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            {backText}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigateWithConfirmation(backHref)}
        className="back-to-link no-transform"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        {backText}
      </button>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <StatusBadge status={currentStatus as any} size="sm" />
          <LastSavedIndicator lastSaved={lastSaved} />
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600 font-medium">
              • Unsaved changes
            </span>
          )}
        </div>
        <button
          type="button"
          className="btn-admin-primary-lg"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Form Content */}
      <div>
        {typeof children === 'function' 
          ? (children as any)(handleFormChange)
          : children
        }
      </div>
    </div>
  );
};

export default GuardedFormPage;