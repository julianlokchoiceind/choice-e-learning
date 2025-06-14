'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { debounce } from 'lodash';

interface UseAutoSaveOptions {
  onSave: (data: any) => Promise<void>;
  delay?: number;
  enabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useAutoSave({
  onSave,
  delay = 2000,
  enabled = true,
  onSuccess,
  onError
}: UseAutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const saveRef = useRef<any>(null);

  // Create debounced save function
  const debouncedSave = useCallback(
    debounce(async (data: any) => {
      if (!enabled) return;

      setIsSaving(true);
      setError(null);

      try {
        await onSave(data);
        setLastSaved(new Date());
        onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Save failed');
        setError(error);
        onError?.(error);
      } finally {
        setIsSaving(false);
      }
    }, delay),
    [onSave, delay, enabled, onSuccess, onError]
  );

  // Trigger save
  const triggerSave = useCallback((data: any) => {
    saveRef.current = data;
    debouncedSave(data);
  }, [debouncedSave]);

  // Cancel pending save
  const cancelSave = useCallback(() => {
    debouncedSave.cancel();
  }, [debouncedSave]);

  // Save immediately without debounce
  const saveNow = useCallback(async () => {
    if (saveRef.current) {
      debouncedSave.cancel();
      setIsSaving(true);
      setError(null);

      try {
        await onSave(saveRef.current);
        setLastSaved(new Date());
        onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Save failed');
        setError(error);
        onError?.(error);
      } finally {
        setIsSaving(false);
      }
    }
  }, [onSave, onSuccess, onError, debouncedSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return {
    triggerSave,
    cancelSave,
    saveNow,
    isSaving,
    lastSaved,
    error
  };
}