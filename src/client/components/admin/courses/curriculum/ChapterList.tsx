'use client';

import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Chapter } from '@/shared/types/courses/course';
import ChapterItem from './ChapterItem';
import LessonItem from './LessonItem';
import ChapterForm from './ChapterForm';

interface ChapterListProps {
  chapters: Chapter[];
  onEditChapter: (id: string | null) => void;
  onUpdateChapter: (id: string, data: Partial<Chapter>) => void;
  onDeleteChapter: (id: string) => void;
  onAddLesson: (chapterId: string, lesson: any) => void;
  onDeleteLesson: (chapterId: string, lessonId: string) => void;
  editingChapterId: string | null;
}

const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  onEditChapter,
  onUpdateChapter,
  onDeleteChapter,
  onAddLesson,
  onDeleteLesson,
  editingChapterId
}) => {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(chapters.map(c => c.id)));
  const [addingLessonForChapter, setAddingLessonForChapter] = useState<string | null>(null);
  
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };
  
  const handleAddLesson = (chapterId: string, lessonData: any) => {
    onAddLesson(chapterId, lessonData);
    setAddingLessonForChapter(null);
  };
  
  return (
    <div className="space-y-6">
      {chapters.map((chapter) => (
        <div key={chapter.id} className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Chapter Header */}
          {editingChapterId === chapter.id ? (
            <div className="p-4 bg-blue-50">
              <ChapterForm
                initialData={chapter}
                onSubmit={(data) => onUpdateChapter(chapter.id, data)}
                onCancel={() => onEditChapter(null)}
              />
            </div>
          ) : (
            <ChapterItem
              chapter={chapter}
              isExpanded={expandedChapters.has(chapter.id)}
              onToggle={() => toggleChapter(chapter.id)}
              onEdit={() => onEditChapter(chapter.id)}
              onDelete={() => onDeleteChapter(chapter.id)}
              onAddLesson={() => setAddingLessonForChapter(chapter.id)}
            />
          )}
          
          {/* Chapter Content (Lessons) */}
          {expandedChapters.has(chapter.id) && (
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              {/* Add Lesson Form */}
              {addingLessonForChapter === chapter.id && (
                <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Add New Lesson</h4>
                    <button
                      type="button"
                      onClick={() => setAddingLessonForChapter(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      &times;
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lesson Name
                      </label>
                      <input
                        type="text"
                        id="lessonTitle"
                        name="lessonTitle"
                        placeholder="Enter lesson name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-0 focus:border-[var(--color-primary)]"
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => handleAddLesson(chapter.id, { title: (document.getElementById('lessonTitle') as HTMLInputElement)?.value })}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                      >
                        Add Lesson
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddingLessonForChapter(null)}
                        className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Lessons List */}
              {chapter.lessons && chapter.lessons.length > 0 ? (
                <div className="space-y-2">
                  {chapter.lessons.map((lesson) => (
                    <LessonItem
                      key={lesson.id}
                      lesson={lesson}
                      onDelete={() => onDeleteLesson(chapter.id, lesson.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No lessons in this chapter yet
                </div>
              )}
              
              {/* Add Lesson Button */}
              {addingLessonForChapter !== chapter.id && (
                <button
                  type="button"
                  onClick={() => setAddingLessonForChapter(chapter.id)}
                  className="mt-3 flex items-center text-sm text-blue-500 hover:text-blue-700 font-medium"
                >
                  <PlusIcon className="h-4 w-4 mr-1" /> Add Lesson
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChapterList; 