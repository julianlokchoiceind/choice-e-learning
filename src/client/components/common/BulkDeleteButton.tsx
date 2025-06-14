'use client';

import React, { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';

interface BulkDeleteButtonProps<T> {
  selectedItems: Set<T>;
  onDelete: (items: T[]) => Promise<void>;
  itemLabel?: string;
  disabled?: boolean;
}

export function BulkDeleteButton<T>({ 
  selectedItems, 
  onDelete, 
  itemLabel = 'item',
  disabled = false 
}: BulkDeleteButtonProps<T>) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (selectedItems.size === 0) return;

    setIsDeleting(true);
    try {
      await onDelete(Array.from(selectedItems));
      setShowConfirm(false);
    } catch (error) {
      console.error('Error during bulk delete:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (selectedItems.size === 0) return null;

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={disabled || isDeleting}
        className="btn-admin-danger inline-flex items-center"
      >
        <TrashIcon className="h-5 w-5 mr-1" />
        Delete ({selectedItems.size})
      </button>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => !isDeleting && setShowConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-lg shadow-xl p-6 max-w-md mx-4"
            >
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Bulk Delete
                </h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {selectedItems.size} {selectedItems.size === 1 ? itemLabel : `${itemLabel}s`}? 
                This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete {selectedItems.size} {selectedItems.size === 1 ? itemLabel : `${itemLabel}s`}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}