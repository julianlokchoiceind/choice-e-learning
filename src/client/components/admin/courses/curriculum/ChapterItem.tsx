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
  // 🔍 DEBUG: Log chapter data để check order value
  console.log('🏷️ ChapterItem render:', {
    id: chapter.id,
    title: chapter.title,
    order: chapter.order,
    orderType: typeof chapter.order
  });

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
          <h3 className="text-base font-semibold text-gray-900">
            Chapter {chapter.order || '?'}: {chapter.title}
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
          className="p-1.5 text-[var(--color-primary-text)] hover:text-[var(--color-primary-dark)] hover:bg-[var(--color-primary-lighter)] rounded-md transition-colors"
          title="Add lesson"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
        
        <button
          type="button"
          onClick={onEdit}
          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          title="Edit chapter"
        >
          <PencilIcon className="h-5 w-5" />
        </button>
        
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
          title="Delete chapter"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ChapterItem; 