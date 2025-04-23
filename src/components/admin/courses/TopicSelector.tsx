"use client";

import { useState, useEffect } from 'react';
import { useTopics } from '@/client/hooks/topics';
import { XCircleIcon } from '@heroicons/react/24/outline';

interface TopicSelectorProps {
  selectedTopics: string[];
  onChange: (topics: string[]) => void;
}

export default function TopicSelector({ selectedTopics, onChange }: TopicSelectorProps) {
  const { topics, loading, error, fetchTopics } = useTopics(true); // true = admin view
  const [topicOptions, setTopicOptions] = useState<{id: string, name: string}[]>([]);

  // Fetch topics on component mount
  useEffect(() => {
    fetchTopics({ isActive: true })
      .catch(err => console.error("Failed to fetch topics:", err));
  }, [fetchTopics]);

  // Update topic options when topics change
  useEffect(() => {
    if (topics && Array.isArray(topics)) {
      setTopicOptions(topics);
    }
  }, [topics]);
  
  // Toggle topic selection
  const toggleTopic = (topicName: string) => {
    if (selectedTopics.includes(topicName)) {
      // Remove topic if already selected
      onChange(selectedTopics.filter(topic => topic !== topicName));
    } else {
      // Add topic if not selected
      onChange([...selectedTopics, topicName]);
    }
  };

  // Remove a topic
  const removeTopic = (topicToRemove: string) => {
    onChange(selectedTopics.filter(topic => topic !== topicToRemove));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Topics
      </label>
      
      {/* Display selected topics */}
      {selectedTopics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTopics.map((topic, index) => (
            <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center text-sm">
              <span>{topic}</span>
              <button
                type="button"
                onClick={() => removeTopic(topic)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <XCircleIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Topic selection area */}
      <div className="border border-gray-200 rounded-md p-3">
        {loading ? (
          <div className="flex items-center justify-center py-3">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="flex flex-wrap gap-y-2">
            {error ? (
              <p className="text-red-500 text-sm">Error loading topics: {error}</p>
            ) : topicOptions.length > 0 ? (
              topicOptions.map(topic => (
                <div key={topic.id} className="flex items-center mr-4 mb-2">
                  <input
                    type="checkbox"
                    id={`topic-${topic.id}`}
                    checked={selectedTopics.includes(topic.name)}
                    onChange={() => toggleTopic(topic.name)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label 
                    htmlFor={`topic-${topic.id}`} 
                    className="ml-2 text-sm text-gray-700 cursor-pointer"
                  >
                    {topic.name}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No topics available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
