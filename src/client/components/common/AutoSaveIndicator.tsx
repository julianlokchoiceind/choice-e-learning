'use client';

import React from 'react';
import { CheckCircleIcon, CloudArrowUpIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
}

export function AutoSaveIndicator({ isSaving, lastSaved, error }: AutoSaveIndicatorProps) {
  if (error) {
    return (
      <div className="flex items-center text-red-600 text-sm">
        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
        <span>Save failed</span>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="flex items-center text-gray-600 text-sm">
        <CloudArrowUpIcon className="h-4 w-4 mr-1 animate-pulse" />
        <span>Saving...</span>
      </div>
    );
  }

  if (lastSaved) {
    const timeAgo = getTimeAgo(lastSaved);
    return (
      <div className="flex items-center text-gray-500 text-sm">
        <CheckCircleIcon className="h-4 w-4 mr-1" />
        <span>Saved {timeAgo}</span>
      </div>
    );
  }

  return null;
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}