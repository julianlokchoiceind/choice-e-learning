'use client';

import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

interface LessonItemProps {
  lesson: any;
  onDelete: () => void;
}

const LessonItem: React.FC<LessonItemProps> = ({
  lesson,
  onDelete
}) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
      <div className="flex items-center">
        <span className="text-gray-500 text-sm mr-2">{lesson.order}.</span>
        <span>{lesson.title}</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => window.location.href = `/admin/lessons/${lesson.id}/edit`}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
          title="Edit content"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        
        <button
          type="button"
          onClick={onDelete}
          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
          title="Delete lesson"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default LessonItem; 