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
  // ✅ Simplified state management - single source of truth
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const params = useParams();
  const courseId = params.courseId as string;
  const { useGetCourse } = useCoursesQuery(true);
  const { data: courseData } = useGetCourse(courseId);
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  
  // ✅ Single effect for initialization - no complex dependencies
  useEffect(() => {
    if (courseData?.chapters && !isInitialized) {
      console.log('🔍 DEBUG: Loading chapters from server:', courseData.chapters);
      
      // ✅ Always normalize order sequentially regardless of server data
      const normalizedChapters = courseData.chapters
        .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || '')) // Sort by creation time
        .map((chapter, index) => {
          const normalizedChapter = {
            ...chapter,
            order: index + 1 // ✅ Force sequential: 1, 2, 3...
          };
          console.log(`🔢 Chapter ${index + 1}: "${chapter.title}" → order: ${normalizedChapter.order}`);
          return normalizedChapter;
        });
      
      console.log('📊 Final normalized chapters:', normalizedChapters);
      setChapters(normalizedChapters);
      setIsInitialized(true);
    }
  }, [courseData?.chapters, isInitialized]);

  // ✅ CRITICAL FIX: Force reload when course data changes (after mutation)
  useEffect(() => {
    if (courseData?.chapters && isInitialized) {
      console.log('🔄 REFRESH: Reloading chapters after data change:', courseData.chapters);
      
      // Re-normalize the updated data from server
      const normalizedChapters = courseData.chapters
        .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
        .map((chapter, index) => ({
          ...chapter,
          order: index + 1
        }));
      
      setChapters(normalizedChapters);
      console.log('✅ REFRESHED: Chapters updated with latest server data');
    }
  }, [courseData?.chapters]);

  // ✅ Simple change detection based on current state
  useEffect(() => {
    const hasChanges = chapters.length > 0 && 
      chapters.some(ch => ch.id.startsWith('temp-') || ch.lessons?.some(l => l.id.startsWith('temp-')));
    onCurriculumChange?.(hasChanges);
  }, [chapters, onCurriculumChange]);
  
  // ✅ Simplified add chapter with guaranteed sequential ordering
  const handleAddChapter = (chapter: Partial<Chapter>) => {
    const tempId = `temp-${Date.now()}`;
    
    const newChapter = {
      id: tempId,
      title: chapter.title || 'New chapter',
      description: chapter.description || '',
      order: chapters.length + 1, // ✅ Simple: always next number
      courseId: courseId,
      lessons: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...chapter
    };
    
    console.log('➕ Adding new chapter:', newChapter);
    
    // ✅ Always recalculate ALL orders to ensure sequential 1,2,3...
    const updatedChapters = [...chapters, newChapter].map((ch, index) => ({
      ...ch,
      order: index + 1
    }));
    
    console.log('📋 Final chapters with sequential orders:', updatedChapters.map(ch => ({id: ch.id, title: ch.title, order: ch.order})));
    
    setChapters(updatedChapters);
    setIsAddingChapter(false);
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
  
  // ✅ Simplified delete with auto-reordering
  const handleDeleteChapter = (chapterId: string) => {
    if (confirm('Are you sure you want to delete this chapter and all its lessons?')) {
      // ✅ Filter and auto-reorder in one step
      const reorderedChapters = chapters
        .filter(chapter => chapter.id !== chapterId)
        .map((chapter, index) => ({
          ...chapter,
          order: index + 1 // ✅ Always sequential
        }));
      
      setChapters(reorderedChapters);
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
          id: chapter.id, // ✅ CRITICAL FIX: Include temp ID for server mapping
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

  // ✅ Simplified save with proper data refresh  
  const saveCurriculum = async () => {
    const { apiChapters, allLessons } = prepareCurriculumData();
    await onUpdateCurriculum(apiChapters, allLessons);
    
    // ✅ CRITICAL FIX: Force refresh from server by resetting state
    // This ensures latest data (including proper IDs) is loaded after save
    setIsInitialized(false);
    
    // ✅ Don't clear chapters immediately - let useEffect reload from server
    // setChapters([]); // Remove this to prevent flicker
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