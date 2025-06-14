'use client';

import { useState, useCallback } from 'react';

interface UseSelectionReturn<T = string> {
  selectedItems: Set<T>;
  isSelected: (item: T) => boolean;
  toggleSelection: (item: T) => void;
  toggleSelectItem: (item: T) => void;
  selectAll: (items: T[]) => void;
  clearSelection: () => void;
  selectedCount: number;
}

export function useSelection<T = string>(): UseSelectionReturn<T> {
  const [selectedItems, setSelectedItems] = useState<Set<T>>(new Set());

  const isSelected = useCallback(
    (item: T) => selectedItems.has(item),
    [selectedItems]
  );

  const toggleSelection = useCallback((item: T) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  }, []);

  const toggleSelectItem = toggleSelection; // Alias for compatibility

  const selectAll = useCallback((items: T[]) => {
    setSelectedItems(new Set(items));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  return {
    selectedItems,
    isSelected,
    toggleSelection,
    toggleSelectItem,
    selectAll,
    clearSelection,
    selectedCount: selectedItems.size
  };
}