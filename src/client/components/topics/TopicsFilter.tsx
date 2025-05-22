'use client';

import { useState, useEffect } from 'react';
import { useTopics } from '@/client/hooks/topics';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { LoadingState } from '@/client/components/common';

interface TopicsFilterProps {
  selectedTopics: string[];
  onChange: (selectedTopics: string[]) => void;
}

export default function TopicsFilter({ selectedTopics, onChange }: TopicsFilterProps) {
  const { loading, error, topics, fetchTopics } = useTopics(false); // false = public view
  const [topicNames, setTopicNames] = useState<string[]>([]);

  useEffect(() => {
    // Fetch topics on mount
    fetchTopics({ isActive: true })
      .catch(err => console.error('Error fetching topics:', err));
  }, [fetchTopics]);

  // Extract topic names from topic objects
  useEffect(() => {
    if (topics && topics.length > 0) {
      const names = topics.map(topic => topic.name);
      setTopicNames(names);
    }
  }, [topics]);
  
  const handleTopicChange = (topicName: string) => {
    const updatedTopics = selectedTopics.includes(topicName)
      ? selectedTopics.filter(t => t !== topicName)
      : [...selectedTopics, topicName];
    
    onChange(updatedTopics);
  };
  
  return (
    <div>
      <label className='block text-sm font-medium text-gray-700 mb-1'>
        Topics ({selectedTopics.length} selected)
      </label>
      <div className='relative'>
        <details className='w-full'>
          <summary className='px-3 py-2 border border-gray-300 rounded-md cursor-pointer input-focus text-gray-700 flex justify-between items-center'>
            <span>
              {selectedTopics.length > 0 
                ? selectedTopics.length > 1 
                  ? `${selectedTopics.length} topics selected` 
                  : selectedTopics[0]
                : 'Select topics'}
            </span>
            <FunnelIcon className='h-4 w-4 text-gray-500' />
          </summary>
          <div className='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg'>
            {loading && topicNames.length === 0 ? (
              <div className='p-4 text-center'>
                <LoadingState variant="button" message="Loading topics..." />
              </div>
            ) : (
              <div className='p-2 max-h-60 overflow-y-auto'>
                {topicNames.length > 0 ? (
                  topicNames.map((topicName) => (
                    <div key={topicName} className='flex items-center p-2 hover:bg-gray-100 rounded'>
                      <input
                        type='checkbox'
                        id={`topic-${topicName}`}
                        checked={selectedTopics.includes(topicName)}
                        onChange={() => handleTopicChange(topicName)}
                        className='mr-2 focus:ring-[var(--color-focus-ring)]'
                      />
                      <label htmlFor={`topic-${topicName}`} className='cursor-pointer text-gray-900 flex-grow'>
                        {topicName}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className='p-4 text-center text-gray-500'>
                    {error ? `Error: ${error}` : 'No topics available'}
                  </div>
                )}
              </div>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}