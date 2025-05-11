'use client';

import { ChevronDownIcon, ChevronUpIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Chapter } from '@/shared/types/courses/course';

interface ChapterItemProps {
  chapter: Chapter;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddLesson: () => void;
}

const ChapterItem: React.FC<ChapterItemProps> = ({
  chapter,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddLesson
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-100">
      <div className="flex items-center">
        <button 
          type="button"
          onClick={onToggle}
          className="mr-3 text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </button>
        
        <div>
          <h3 className="font-medium text-gray-900">
            Chapter {chapter.order}: {chapter.title}
          </h3>
          {chapter.description && (
            <p className="text-sm text-gray-500 mt-1">{chapter.description}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">
          {chapter.lessons?.length || 0} lessons
        </span>
        
        <button
          type="button"
          onClick={onAddLesson}
          className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
          title="Add lesson"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
        
        <button
          type="button"
          onClick={onEdit}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
          title="Edit chapter"
        >
          <PencilIcon className="h-5 w-5" />
        </button>
        
        <button
          type="button"
          onClick={onDelete}
          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
          title="Delete chapter"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ChapterItem; 