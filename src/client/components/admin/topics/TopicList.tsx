'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PencilSquareIcon, 
  TrashIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useTopicsQuery } from '@/client/hooks/topics';
import { LoadingState } from '@/client/components/common';
import { Topic } from '@/shared/types/topics/topics';

interface TopicListProps {
  topics: Topic[];
  onRefetch: () => void;
}

export const TopicList = ({ topics, onRefetch }: TopicListProps) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const { useDeleteTopic } = useTopicsQuery();
  const deleteTopicMutation = useDeleteTopic();

  const handleDeleteConfirm = async (id: string) => {
    try {
      await deleteTopicMutation.mutateAsync(id);
      setConfirmDelete(null);
      onRefetch();
    } catch (err: unknown) {
      console.error('Error deleting topic:', err);
      // Error handling is done by the mutation
    }
  };

  if (deleteTopicMutation.isPending) {
    return (
      <div className='text-center py-10'>
        <LoadingState variant="section" message="Deleting topic..." />
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className='text-center py-10 text-gray-500'>
        <p>No topics found.</p>
        <p className='text-sm mt-1'>Create a new topic or try with a different search term.</p>
      </div>
    );
  }

  return (
    <div className='overflow-x-auto'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='py-4 px-6 text-left font-medium text-indigo-700 uppercase tracking-wider text-sm'>Name</th>
            <th className='py-4 px-6 text-left font-medium text-indigo-700 uppercase tracking-wider text-sm'>Description</th>
            <th className='py-4 px-6 text-left font-medium text-indigo-700 uppercase tracking-wider text-sm'>Status</th>
            <th className='py-4 px-6 text-left font-medium text-indigo-700 uppercase tracking-wider text-sm'>Courses</th>
            <th className='py-4 px-6 text-right font-medium text-indigo-700 uppercase tracking-wider text-sm'>Actions</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200'>
          {topics.map((topic) => (
            <tr key={topic.id} className='hover:bg-gray-50 transition-colors duration-150'>
              <td className='py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900'>
                {topic.name}
              </td>
              <td className='py-4 px-6 text-sm text-gray-600 max-w-xs truncate'>
                {topic.description || '-'}
              </td>
              <td className='py-4 px-6 whitespace-nowrap text-sm'>
                {topic.isActive ? (
                  <span className='px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                    Active
                  </span>
                ) : (
                  <span className='px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800'>
                    Inactive
                  </span>
                )}
              </td>
              <td className='py-4 px-6 whitespace-nowrap text-sm text-gray-600'>
                {topic._count?.courses || '0'}
              </td>
              <td className='py-4 px-6 whitespace-nowrap text-right text-sm font-medium'>
                <div className='flex justify-end space-x-2'>
                  <Link
                    href={`/admin/topics/${topic.id}/edit`}
                    className='p-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors duration-150'
                    aria-label='Edit topic'
                  >
                    <PencilSquareIcon className='h-5 w-5' />
                  </Link>
                  
                  {confirmDelete === topic.id ? (
                    <div className='flex items-center space-x-2 bg-red-50 rounded-md p-1'>
                      <button
                        onClick={() => handleDeleteConfirm(topic.id)}
                        className='p-1 text-red-600 hover:text-red-800'
                        aria-label='Confirm delete'
                      >
                        <CheckCircleIcon className='h-5 w-5' />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className='p-1 text-gray-600 hover:text-gray-800'
                        aria-label='Cancel delete'
                      >
                        <XCircleIcon className='h-5 w-5' />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(topic.id)}
                      className='p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-150'
                      aria-label='Delete topic'
                      disabled={topic._count?.courses ? topic._count?.courses > 0 : false}
                      title={topic._count?.courses && topic._count?.courses > 0 ? 'Cannot delete topic that is used by courses' : 'Delete topic'}
                    >
                      {topic._count?.courses && topic._count?.courses > 0 ? (
                        <ExclamationCircleIcon className='h-5 w-5 text-gray-400' />
                      ) : (
                        <TrashIcon className='h-5 w-5' />
                      )}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopicList;
