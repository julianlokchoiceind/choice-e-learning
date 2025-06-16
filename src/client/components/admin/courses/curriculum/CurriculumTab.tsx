'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Chapter } from '@/shared/types/courses/course';
import ChapterForm from './ChapterForm';
import ChapterList from './ChapterList';
import { useCoursesQuery } from '@/client/hooks/courses';
import { useParams } from 'next/navigation';

interface CurriculumTabProps {
  initialChapters?: Chapter[];
  onUpdateCurriculum: (chapters: any[], lessons: any[]) => Promise<void>;
  onCurriculumChange?: (hasChanges: boolean) => void; // New prop to notify parent of changes
}

export interface CurriculumTabRef {
  saveCurriculum: () => Promise<void>;
}

const CurriculumTab = forwardRef<CurriculumTabRef, CurriculumTabProps>(({ 
  initialChapters = [], 
  onUpdateCurriculum,
  onCurriculumChange
}, ref) => {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [originalChapters, setOriginalChapters] = useState<Chapter[]>(initialChapters); // Track original state
  const params = useParams();
  const courseId = params.courseId as string;
  const { useGetCourse } = useCoursesQuery(true);
  const { data: courseData } = useGetCourse(courseId);
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  
  // Initialize chapters and update after successful saves
  useEffect(() => {
    if (courseData?.chapters) {
      // Always update from server data, but only if we don't have unsaved changes
      const hasChanges = JSON.stringify(chapters) !== JSON.stringify(originalChapters);
      
      if (!hasChanges || chapters.length === 0) {
        // Safe to update - either no changes or initial load
        setChapters(courseData.chapters);
        setOriginalChapters(courseData.chapters);
      }
    }
  }, [courseData?.chapters, originalChapters]); // Include originalChapters to detect change completion

  // Check for changes and notify parent
  useEffect(() => {
    const hasChanges = JSON.stringify(chapters) !== JSON.stringify(originalChapters);
    onCurriculumChange?.(hasChanges);
  }, [chapters, originalChapters, onCurriculumChange]);
  
  // Handle adding new chapter - NO AUTOSAVE
  const handleAddChapter = (chapter: Partial<Chapter>) => {
    const tempId = `temp-${Date.now()}`;
    const newChapter = {
      id: tempId,
      title: chapter.title || 'New chapter',
      description: chapter.description || '',
      order: chapters.length + 1,
      courseId: courseId,
      lessons: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...chapter
    };
    
    const updatedChapters = [...chapters, newChapter];
    setChapters(updatedChapters);
    setIsAddingChapter(false);
    // No API call - just update local state
  };
  
  // Handle editing chapter - NO AUTOSAVE
  const handleEditChapter = (chapterId: string, data: Partial<Chapter>) => {
    const updatedChapters = chapters.map(chapter => 
      chapter.id === chapterId ? { ...chapter, ...data } : chapter
    );
    
    setChapters(updatedChapters);
    setEditingChapterId(null);
    // No API call - just update local state
  };
  
  // Handle deleting chapter - NO AUTOSAVE
  const handleDeleteChapter = (chapterId: string) => {
    if (confirm('Are you sure you want to delete this chapter and all its lessons?')) {
      const updatedChapters = chapters.filter(chapter => chapter.id !== chapterId);
      
      // Update chapter order
      const reorderedChapters = updatedChapters.map((chapter, index) => ({
        ...chapter,
        order: index + 1
      }));
      
      setChapters(reorderedChapters);
      // No API call - just update local state
    }
  };
  
  // Handle adding new lesson to chapter - NO AUTOSAVE
  const handleAddLesson = (chapterId: string, lesson: any) => {
    const updatedChapters = chapters.map(chapter => {
      if (chapter.id === chapterId) {
        const newLesson = {
          id: `temp-lesson-${Date.now()}`,
          title: lesson.title || 'New lesson',
          content: '',
          videoUrl: '',
          order: (chapter.lessons?.length || 0) + 1,
          courseId: courseId,
          chapterId: chapter.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...lesson
        };
        
        return {
          ...chapter,
          lessons: [...(chapter.lessons || []), newLesson]
        };
      }
      return chapter;
    });
    
    setChapters(updatedChapters);
    // No API call - just update local state
  };
  
  // Handle deleting lesson - NO AUTOSAVE
  const handleDeleteLesson = (chapterId: string, lessonId: string) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      const updatedChapters = chapters.map(chapter => {
        if (chapter.id === chapterId) {
          const filteredLessons = (chapter.lessons || []).filter(lesson => lesson.id !== lessonId);
          
          // Update lesson order
          const reorderedLessons = filteredLessons.map((lesson, index) => ({
            ...lesson,
            order: index + 1
          }));
          
          return {
            ...chapter,
            lessons: reorderedLessons
          };
        }
        return chapter;
      });
      
      setChapters(updatedChapters);
      // No API call - just update local state
    }
  };

  // Add helper function to prepare data for saving
  const prepareCurriculumData = () => {
    // Prepare data for API - clean data and handle temporary IDs
    const apiChapters = chapters.map(chapter => {
      if (chapter.id.startsWith('temp-')) {
        return {
          title: chapter.title,
          description: chapter.description,
          order: chapter.order
        };
      }
      return {
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        order: chapter.order
      };
    });
    
    // Create lessons array for API
    const allLessons = chapters
      .flatMap(chapter => {
        // Include lessons from all chapters (both temp and existing)
        return (chapter.lessons || [])
          .map(lesson => {
            // For temp lessons, don't send the ID
            if (lesson.id.startsWith('temp-')) {
              return {
                title: lesson.title,
                content: lesson.content || '',
                videoUrl: lesson.videoUrl || '',
                order: lesson.order,
                courseId: courseId,
                chapterId: chapter.id
              };
            }
            return {
              ...lesson,
              chapterId: chapter.id
            };
          });
      });
    
    return { apiChapters, allLessons };
  };

  // Expose save function to parent
  const saveCurriculum = async () => {
    const { apiChapters, allLessons } = prepareCurriculumData();
    await onUpdateCurriculum(apiChapters, allLessons);
    setOriginalChapters(chapters); // Update original state after successful save
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    saveCurriculum
  }));
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Course Content</h2>
        
        <button
          type="button"
          onClick={() => setIsAddingChapter(true)}
          className="btn-admin-primary"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Chapter
        </button>
      </div>
      
      {isAddingChapter ? (
        <div className="mb-6 border border-blue-200 rounded-lg p-4 bg-blue-50">
          <ChapterForm 
            onSubmit={handleAddChapter}
            onCancel={() => setIsAddingChapter(false)}
          />
        </div>
      ) : null}
      
      {chapters.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No chapters yet. Start by adding the first chapter.</p>
        </div>
      ) : (
        <ChapterList
          chapters={chapters}
          onEditChapter={(id) => setEditingChapterId(id)}
          onUpdateChapter={handleEditChapter}
          onDeleteChapter={handleDeleteChapter}
          onAddLesson={handleAddLesson}
          onDeleteLesson={handleDeleteLesson}
          editingChapterId={editingChapterId}
        />
      )}
    </div>
  );
});

CurriculumTab.displayName = 'CurriculumTab';

export default CurriculumTab; 