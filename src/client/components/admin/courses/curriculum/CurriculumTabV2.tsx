'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { PlusIcon, ChevronDownIcon, ChevronUpIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Chapter } from '@/shared/types/courses/course';
import { useCoursesQuery } from '@/client/hooks/courses';
import { useParams } from 'next/navigation';

interface CurriculumTabProps {
  initialChapters?: Chapter[];
  onUpdateCurriculum: (chapters: any[], lessons: any[]) => Promise<void>;
  onCurriculumChange?: (hasChanges: boolean) => void;
}

export interface CurriculumTabRef {
  saveCurriculum: () => Promise<void>;
}

// Simplified Chapter interface for local state
interface LocalChapter {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: LocalLesson[];
  isEditing?: boolean;
}

interface LocalLesson {
  id: string;
  title: string;
  content: string;
  order: number;
  chapterId: string;
}

const CurriculumTabV2 = forwardRef<CurriculumTabRef, CurriculumTabProps>(({ 
  onUpdateCurriculum,
  onCurriculumChange
}, ref) => {
  const params = useParams();
  const courseId = params.courseId as string;
  const { useGetCourse } = useCoursesQuery(true);
  const { data: courseData } = useGetCourse(courseId);
  
  const [chapters, setChapters] = useState<LocalChapter[]>([]);
  const [originalData, setOriginalData] = useState<string>('');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [addingLessonToChapter, setAddingLessonToChapter] = useState<string | null>(null);

  // Initialize from server data
  useEffect(() => {
    if (courseData?.chapters) {
      const localChapters: LocalChapter[] = courseData.chapters.map((chapter, index) => ({
        id: chapter.id,
        title: chapter.title,
        description: chapter.description || '',
        order: index + 1, // ✅ Always sequential from 1
        lessons: (chapter.lessons || []).map((lesson, lessonIndex) => ({
          id: lesson.id,
          title: lesson.title,
          content: lesson.content || '',
          order: lessonIndex + 1, // ✅ Always sequential from 1
          chapterId: chapter.id
        }))
      }));
      
      setChapters(localChapters);
      setOriginalData(JSON.stringify(localChapters));
      
      // Auto-expand first chapter if any
      if (localChapters.length > 0) {
        setExpandedChapters(new Set([localChapters[0].id]));
      }
    }
  }, [courseData?.chapters]);

  // Track changes
  useEffect(() => {
    const currentData = JSON.stringify(chapters);
    const hasChanges = currentData !== originalData;
    onCurriculumChange?.(hasChanges);
  }, [chapters, originalData, onCurriculumChange]);

  // Helper: Generate sequential orders
  const recalculateChapterOrders = (chapterList: LocalChapter[]): LocalChapter[] => {
    return chapterList.map((chapter, index) => ({
      ...chapter,
      order: index + 1
    }));
  };

  const recalculateLessonOrders = (lessons: LocalLesson[]): LocalLesson[] => {
    return lessons.map((lesson, index) => ({
      ...lesson,
      order: index + 1
    }));
  };

  // Chapter operations
  const addChapter = (title: string, description: string = '') => {
    const newChapter: LocalChapter = {
      id: `temp-${Date.now()}`,
      title,
      description,
      order: chapters.length + 1,
      lessons: []
    };
    
    const updatedChapters = recalculateChapterOrders([...chapters, newChapter]);
    setChapters(updatedChapters);
    
    // Auto-expand new chapter
    setExpandedChapters(prev => new Set([...Array.from(prev), newChapter.id]));
    setIsAddingChapter(false);
  };

  const updateChapter = (chapterId: string, title: string, description: string = '') => {
    const updatedChapters = chapters.map(chapter =>
      chapter.id === chapterId
        ? { ...chapter, title, description, isEditing: false }
        : chapter
    );
    setChapters(updatedChapters);
  };

  const deleteChapter = (chapterId: string) => {
    if (!confirm('Delete this chapter and all its lessons?')) return;
    
    const filteredChapters = chapters.filter(ch => ch.id !== chapterId);
    const reorderedChapters = recalculateChapterOrders(filteredChapters);
    setChapters(reorderedChapters);
  };

  // Lesson operations
  const addLesson = (chapterId: string, title: string) => {
    const updatedChapters = chapters.map(chapter => {
      if (chapter.id === chapterId) {
        const newLesson: LocalLesson = {
          id: `temp-lesson-${Date.now()}`,
          title,
          content: '',
          order: chapter.lessons.length + 1,
          chapterId
        };
        
        const updatedLessons = recalculateLessonOrders([...chapter.lessons, newLesson]);
        return { ...chapter, lessons: updatedLessons };
      }
      return chapter;
    });
    
    setChapters(updatedChapters);
    setAddingLessonToChapter(null);
  };

  const deleteLesson = (chapterId: string, lessonId: string) => {
    if (!confirm('Delete this lesson?')) return;
    
    const updatedChapters = chapters.map(chapter => {
      if (chapter.id === chapterId) {
        const filteredLessons = chapter.lessons.filter(lesson => lesson.id !== lessonId);
        const reorderedLessons = recalculateLessonOrders(filteredLessons);
        return { ...chapter, lessons: reorderedLessons };
      }
      return chapter;
    });
    
    setChapters(updatedChapters);
  };

  // Save to server
  const saveCurriculum = async () => {
    const apiChapters = chapters.map(chapter => ({
      id: chapter.id.startsWith('temp-') ? chapter.id : chapter.id, // Include temp IDs for mapping
      title: chapter.title,
      description: chapter.description,
      order: chapter.order
    }));

    const allLessons = chapters.flatMap(chapter =>
      chapter.lessons.map(lesson => ({
        id: lesson.id.startsWith('temp-lesson-') ? undefined : lesson.id,
        title: lesson.title,
        content: lesson.content,
        order: lesson.order,
        courseId,
        chapterId: chapter.id
      }))
    );

    await onUpdateCurriculum(apiChapters, allLessons);
    setOriginalData(JSON.stringify(chapters));
  };

  useImperativeHandle(ref, () => ({ saveCurriculum }));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Course Content</h2>
        <button
          onClick={() => setIsAddingChapter(true)}
          className="btn-admin-primary"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Chapter
        </button>
      </div>

      {/* Add Chapter Form */}
      {isAddingChapter && (
        <div className="mb-6 border border-blue-200 rounded-lg p-4 bg-blue-50">
          <ChapterForm
            onSubmit={(title, description) => addChapter(title, description)}
            onCancel={() => setIsAddingChapter(false)}
          />
        </div>
      )}

      {/* Chapters List */}
      {chapters.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No chapters yet. Start by adding the first chapter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {chapters.map((chapter) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              isExpanded={expandedChapters.has(chapter.id)}
              onToggle={() => {
                setExpandedChapters(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(chapter.id)) {
                    newSet.delete(chapter.id);
                  } else {
                    newSet.add(chapter.id);
                  }
                  return newSet;
                });
              }}
              onEdit={() => {
                const updatedChapters = chapters.map(ch =>
                  ch.id === chapter.id ? { ...ch, isEditing: true } : ch
                );
                setChapters(updatedChapters);
              }}
              onUpdate={(title, description) => updateChapter(chapter.id, title, description)}
              onDelete={() => deleteChapter(chapter.id)}
              onAddLesson={() => setAddingLessonToChapter(chapter.id)}
              onDeleteLesson={(lessonId) => deleteLesson(chapter.id, lessonId)}
              isAddingLesson={addingLessonToChapter === chapter.id}
              onLessonAdd={(title) => addLesson(chapter.id, title)}
              onCancelAddLesson={() => setAddingLessonToChapter(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// Inline Chapter Form Component
const ChapterForm: React.FC<{
  initialTitle?: string;
  initialDescription?: string;
  onSubmit: (title: string, description: string) => void;
  onCancel: () => void;
}> = ({ initialTitle = '', initialDescription = '', onSubmit, onCancel }) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Chapter title is required');
      return;
    }
    onSubmit(title.trim(), description.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-base font-medium text-gray-700 mb-2">
          Chapter Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter chapter title"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-0 focus:border-blue-500"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-base font-medium text-gray-700 mb-2">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-0 focus:border-blue-500"
        />
      </div>
      <div className="flex space-x-3">
        <button type="submit" className="btn-admin-primary">
          {initialTitle ? 'Update' : 'Add'} Chapter
        </button>
        <button type="button" onClick={onCancel} className="btn-admin-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
};

// Inline Chapter Card Component
const ChapterCard: React.FC<{
  chapter: LocalChapter;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onUpdate: (title: string, description: string) => void;
  onDelete: () => void;
  onAddLesson: () => void;
  onDeleteLesson: (lessonId: string) => void;
  isAddingLesson: boolean;
  onLessonAdd: (title: string) => void;
  onCancelAddLesson: () => void;
}> = ({
  chapter,
  isExpanded,
  onToggle,
  onEdit,
  onUpdate,
  onDelete,
  onAddLesson,
  onDeleteLesson,
  isAddingLesson,
  onLessonAdd,
  onCancelAddLesson
}) => {
  const [lessonTitle, setLessonTitle] = useState('');

  const handleAddLesson = () => {
    if (!lessonTitle.trim()) {
      alert('Lesson title is required');
      return;
    }
    onLessonAdd(lessonTitle.trim());
    setLessonTitle('');
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Chapter Header */}
      <div className="flex items-center justify-between p-4 bg-gray-100">
        <div className="flex items-center">
          <button onClick={onToggle} className="mr-3 text-gray-500 hover:text-gray-700">
            {isExpanded ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
          </button>
          
          {chapter.isEditing ? (
            <div className="flex-1">
              <ChapterForm
                initialTitle={chapter.title}
                initialDescription={chapter.description}
                onSubmit={onUpdate}
                onCancel={() => onUpdate(chapter.title, chapter.description)} // Cancel editing
              />
            </div>
          ) : (
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Chapter {chapter.order}: {chapter.title}
              </h3>
              {chapter.description && (
                <p className="text-sm text-gray-500 mt-1">{chapter.description}</p>
              )}
            </div>
          )}
        </div>
        
        {!chapter.isEditing && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {chapter.lessons.length} lessons
            </span>
            <button onClick={onAddLesson} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md">
              <PlusIcon className="h-5 w-5" />
            </button>
            <button onClick={onEdit} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md">
              <PencilIcon className="h-5 w-5" />
            </button>
            <button onClick={onDelete} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md">
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Chapter Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          {/* Add Lesson Form */}
          {isAddingLesson && (
            <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-3">Add New Lesson</h4>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="Enter lesson title"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-0 focus:border-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddLesson()}
                  autoFocus
                />
                <button onClick={handleAddLesson} className="btn-admin-primary">
                  Add
                </button>
                <button onClick={onCancelAddLesson} className="btn-admin-secondary">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Lessons List */}
          {chapter.lessons.length > 0 ? (
            <div className="space-y-2">
              {chapter.lessons.map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-gray-900">
                    {lesson.order}. {lesson.title}
                  </span>
                  <div className="flex space-x-2">
                    <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteLesson(lesson.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No lessons in this chapter yet
            </div>
          )}

          {!isAddingLesson && (
            <button
              onClick={onAddLesson}
              className="mt-3 flex items-center text-sm text-blue-500 hover:text-blue-700 font-medium"
            >
              <PlusIcon className="h-4 w-4 mr-1" /> Add Lesson
            </button>
          )}
        </div>
      )}
    </div>
  );
};

CurriculumTabV2.displayName = 'CurriculumTabV2';

export default CurriculumTabV2;