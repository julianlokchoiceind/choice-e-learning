'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface LastSavedIndicatorProps {
  lastSaved: Date | null;
}

export function LastSavedIndicator({ lastSaved }: LastSavedIndicatorProps) {
  // Force re-render every second to update the time display
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(tick => tick + 1);
    }, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, []);

  if (lastSaved) {
    const timeAgo = getTimeAgo(lastSaved);
    return (
      <div className="flex items-center text-gray-500 text-sm">
        <CheckCircleIcon className="h-4 w-4 mr-1" />
        <span>Last saved {timeAgo}</span>
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