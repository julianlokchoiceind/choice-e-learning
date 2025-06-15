'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UseNavigationGuardProps {
  hasUnsavedChanges: boolean;
  message?: string;
}

export function useNavigationGuard({ 
  hasUnsavedChanges, 
  message = 'You have unsaved changes. Are you sure you want to leave?' 
}: UseNavigationGuardProps) {
  const router = useRouter();
  
  useEffect(() => {
    // Handle browser navigation (back/forward buttons, closing tab)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };
    
    // Handle popstate (browser back/forward)
    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        const confirmed = window.confirm(message);
        if (!confirmed) {
          // Push current state back to history to prevent navigation
          window.history.pushState(null, '', window.location.href);
        }
      }
    };
    
    // Handle visibility change (tab switching, window blur)
    const handleVisibilityChange = () => {
      if (document.hidden && hasUnsavedChanges) {
        // User switched away from tab with unsaved changes
        // We can't prevent this but can show a title indicator
        if (document.title && !document.title.includes('•')) {
          document.title = '• ' + document.title;
        }
      } else if (!document.hidden && document.title.includes('•')) {
        // User returned to tab, remove indicator
        document.title = document.title.replace('• ', '');
      }
    };
    
    // Handle custom navigation check event from sidebar
    const handleNavigationCheck = (e: CustomEvent) => {
      if (hasUnsavedChanges) {
        const confirmed = window.confirm(message);
        e.detail.callback(confirmed);
      } else {
        e.detail.callback(true);
      }
    };
    
    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Add indicator to title when there are unsaved changes
      if (document.title && !document.title.includes('•')) {
        document.title = '• ' + document.title;
      }
    }
    
    // Always listen for navigation check events
    window.addEventListener('checkUnsavedChanges', handleNavigationCheck as EventListener);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('checkUnsavedChanges', handleNavigationCheck as EventListener);
      
      // Clean up title indicator
      if (document.title.includes('•')) {
        document.title = document.title.replace('• ', '');
      }
    };
  }, [hasUnsavedChanges, message]);
  
  // Function to navigate with confirmation
  const navigateWithConfirmation = useCallback((url: string) => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(message);
      if (confirmed) {
        router.push(url);
      }
    } else {
      router.push(url);
    }
  }, [hasUnsavedChanges, message, router]);
  
  return { navigateWithConfirmation };
}

export default useNavigationGuard;