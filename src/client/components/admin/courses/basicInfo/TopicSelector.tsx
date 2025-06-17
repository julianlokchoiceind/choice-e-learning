'use client';

import { useState, useEffect } from 'react';
import { useTopicsQuery } from '@/client/hooks/topics';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { LoadingState } from '@/client/components/common';

interface TopicSelectorProps {
  selectedTopics: string[];
  onChange: (topics: string[]) => void;
}

export default function TopicSelector({ selectedTopics, onChange }: TopicSelectorProps) {
  const { useGetTopics } = useTopicsQuery();
  
  // Fetch topics with React Query
  const { 
    data: topicOptions = [], 
    isLoading, 
    error 
  } = useGetTopics({ isActive: true });
  
  // Ensure selectedTopics is always an array
  const safeSelectedTopics = Array.isArray(selectedTopics) ? selectedTopics : [];
  
  // Toggle topic selection
  const toggleTopic = (topicName: string) => {
    if (safeSelectedTopics.includes(topicName)) {
      // Remove topic if already selected
      onChange(safeSelectedTopics.filter(topic => topic !== topicName));
    } else {
      // Add topic if not selected
      onChange([...safeSelectedTopics, topicName]);
    }
  };

  // Remove a topic
  const removeTopic = (topicToRemove: string) => {
    onChange(safeSelectedTopics.filter(topic => topic !== topicToRemove));
  };

  return (
    <div>
      <label className='block text-base font-medium text-gray-700 mb-2'>
        Topics
      </label>
      
      {/* Display selected topics */}
      {safeSelectedTopics.length > 0 && (
        <div className='flex flex-wrap gap-2 mb-3'>
          {safeSelectedTopics.map((topic, index) => (
            <div key={index} className='bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] px-2 py-1 rounded-full flex items-center text-sm'>
              <span>{topic}</span>
              <button
                type='button'
                onClick={() => removeTopic(topic)}
                className='ml-1 text-[var(--color-primary-text)] hover:text-[var(--color-primary-dark)]'
              >
                <XCircleIcon className='h-4 w-4' />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Topic selection area */}
      <div className='border border-gray-200 rounded-md p-3'>
        {isLoading ? (
          <div className='flex items-center justify-center py-3'>
            <LoadingState variant="button" message="Loading topics..." />
          </div>
        ) : (
          <div className='flex flex-wrap gap-y-2'>
            {error ? (
              <p className='text-red-500 text-sm'>
                {error instanceof Error ? error.message : 'Error loading topics'}
              </p>
            ) : topicOptions.length > 0 ? (
              topicOptions.map(topic => (
                <div key={topic.id} className='flex items-center mr-4 mb-2'>
                  <input
                    type='checkbox'
                    id={`topic-${topic.id}`}
                    checked={safeSelectedTopics.includes(topic.name)}
                    onChange={() => toggleTopic(topic.name)}
                    className='w-4 h-4 text-[var(--color-primary-text)] rounded focus:ring-[var(--color-focus-ring)]'
                  />
                  <label 
                    htmlFor={`topic-${topic.id}`} 
                    className='ml-2 text-sm text-gray-700 cursor-pointer'
                  >
                    {topic.name}
                  </label>
                </div>
              ))
            ) : (
              <p className='text-gray-500 text-sm'>No topics available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 