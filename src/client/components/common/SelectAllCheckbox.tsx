'use client';

import React from 'react';

interface SelectAllCheckboxProps {
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onToggleAll: () => void;
  disabled?: boolean;
}

export function SelectAllCheckbox({ 
  isAllSelected, 
  isIndeterminate, 
  onToggleAll,
  disabled = false 
}: SelectAllCheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={isAllSelected}
      ref={input => {
        if (input) {
          input.indeterminate = isIndeterminate;
        }
      }}
      onChange={onToggleAll}
      disabled={disabled}
      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
      aria-label="Select all items"
    />
  );
}