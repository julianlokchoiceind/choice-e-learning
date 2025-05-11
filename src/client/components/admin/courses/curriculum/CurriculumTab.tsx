'use client';

import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Chapter } from '@/shared/types/courses/course';
import ChapterForm from './ChapterForm';
import ChapterList from './ChapterList';

interface CurriculumTabProps {
  initialChapters?: Chapter[];
  onUpdateCurriculum: (chapters: Chapter[], lessons: any[]) => void;
}

const CurriculumTab: React.FC<CurriculumTabProps> = ({ 
  initialChapters = [], 
  onUpdateCurriculum 
}) => {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  
  // Handle adding new chapter
  const handleAddChapter = (chapter: Partial<Chapter>) => {
    const newChapter = {
      id: `temp-${Date.now()}`,
      title: chapter.title || 'New chapter',
      description: chapter.description || '',
      order: chapters.length + 1,
      courseId: '',
      lessons: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...chapter
    };
    
    const updatedChapters = [...chapters, newChapter];
    setChapters(updatedChapters);
    setIsAddingChapter(false);
    
    // Create lessons array for API
    const allLessons = updatedChapters.flatMap(chapter => 
      (chapter.lessons || []).map(lesson => ({
        ...lesson,
        chapterId: chapter.id
      }))
    );
    
    onUpdateCurriculum(updatedChapters, allLessons);
  };
  
  // Handle editing chapter
  const handleEditChapter = (chapterId: string, data: Partial<Chapter>) => {
    const updatedChapters = chapters.map(chapter => 
      chapter.id === chapterId ? { ...chapter, ...data } : chapter
    );
    
    setChapters(updatedChapters);
    setEditingChapterId(null);
    
    // Create lessons array for API
    const allLessons = updatedChapters.flatMap(chapter => 
      (chapter.lessons || []).map(lesson => ({
        ...lesson,
        chapterId: chapter.id
      }))
    );
    
    onUpdateCurriculum(updatedChapters, allLessons);
  };
  
  // Handle deleting chapter
  const handleDeleteChapter = (chapterId: string) => {
    if (confirm('Are you sure you want to delete this chapter and all its lessons?')) {
      const updatedChapters = chapters.filter(chapter => chapter.id !== chapterId);
      
      // Update chapter order
      const reorderedChapters = updatedChapters.map((chapter, index) => ({
        ...chapter,
        order: index + 1
      }));
      
      setChapters(reorderedChapters);
      
      // Create lessons array for API
      const allLessons = reorderedChapters.flatMap(chapter => 
        (chapter.lessons || []).map(lesson => ({
          ...lesson,
          chapterId: chapter.id
        }))
      );
      
      onUpdateCurriculum(reorderedChapters, allLessons);
    }
  };
  
  // Handle adding new lesson to chapter
  const handleAddLesson = (chapterId: string, lesson: any) => {
    const updatedChapters = chapters.map(chapter => {
      if (chapter.id === chapterId) {
        const newLesson = {
          id: `temp-lesson-${Date.now()}`,
          title: lesson.title || 'New lesson',
          content: '',
          videoUrl: 'https://www.youtube.com/watch?v=placeholder',
          order: (chapter.lessons?.length || 0) + 1,
          courseId: '',
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
    
    // Create lessons array for API
    const allLessons = updatedChapters.flatMap(chapter => 
      (chapter.lessons || []).map(lesson => ({
        ...lesson,
        chapterId: chapter.id
      }))
    );
    
    onUpdateCurriculum(updatedChapters, allLessons);
  };
  
  // Handle deleting lesson
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
      
      // Create lessons array for API
      const allLessons = updatedChapters.flatMap(chapter => 
        (chapter.lessons || []).map(lesson => ({
          ...lesson,
          chapterId: chapter.id
        }))
      );
      
      onUpdateCurriculum(updatedChapters, allLessons);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Course Content</h2>
        
        <button
          type="button"
          onClick={() => setIsAddingChapter(true)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
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
};

export default CurriculumTab; 