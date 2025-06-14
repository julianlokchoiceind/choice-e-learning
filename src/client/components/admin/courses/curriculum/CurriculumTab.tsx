'use client';

import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Chapter } from '@/shared/types/courses/course';
import ChapterForm from './ChapterForm';
import ChapterList from './ChapterList';
import { useCoursesQuery } from '@/client/hooks/courses';
import { useParams } from 'next/navigation';

interface CurriculumTabProps {
  initialChapters?: Chapter[];
  onUpdateCurriculum: (chapters: any[], lessons: any[]) => Promise<void>;
}

const CurriculumTab: React.FC<CurriculumTabProps> = ({ 
  initialChapters = [], 
  onUpdateCurriculum 
}) => {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const params = useParams();
  const courseId = params.courseId as string;
  const { useGetCourse } = useCoursesQuery(true);
  const { data: courseData } = useGetCourse(courseId);
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  
  // Update chapters when course data is refreshed
  useEffect(() => {
    if (courseData?.chapters) {
      setChapters(courseData.chapters);
    }
  }, [courseData?.chapters]);
  
  // Handle adding new chapter
  const handleAddChapter = async (chapter: Partial<Chapter>) => {
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
    
    // Prepare data for API
    const apiChapters = updatedChapters.map(chapter => {
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
    const allLessons = updatedChapters
      .flatMap(chapter => 
        (chapter.lessons || [])
          .filter(lesson => !lesson.id.startsWith('temp-'))
          .map(lesson => ({
            ...lesson,
            chapterId: chapter.id
          }))
      );
    
    // Call the API and wait for the response
    await onUpdateCurriculum(apiChapters, allLessons);
    // The useEffect will update the chapters with real IDs when courseData is refreshed
  };
  
  // Handle editing chapter
  const handleEditChapter = async (chapterId: string, data: Partial<Chapter>) => {
    const updatedChapters = chapters.map(chapter => 
      chapter.id === chapterId ? { ...chapter, ...data } : chapter
    );
    
    setChapters(updatedChapters);
    setEditingChapterId(null);
    
    // Prepare data for API - clean data and handle temporary IDs
    const apiChapters = updatedChapters.map(chapter => {
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
    
    // Create lessons array for API (exclude lessons from temp chapters)
    const allLessons = updatedChapters
      .filter(chapter => !chapter.id.startsWith('temp-'))
      .flatMap(chapter => 
        (chapter.lessons || []).map(lesson => ({
          ...lesson,
          chapterId: chapter.id
        }))
      );
    
    await onUpdateCurriculum(apiChapters, allLessons);
  };
  
  // Handle deleting chapter
  const handleDeleteChapter = async (chapterId: string) => {
    if (confirm('Are you sure you want to delete this chapter and all its lessons?')) {
      const updatedChapters = chapters.filter(chapter => chapter.id !== chapterId);
      
      // Update chapter order
      const reorderedChapters = updatedChapters.map((chapter, index) => ({
        ...chapter,
        order: index + 1
      }));
      
      setChapters(reorderedChapters);
      
      // Prepare data for API
      const apiChapters = reorderedChapters.map(chapter => {
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
      
      // Create lessons array for API (exclude lessons from temp chapters and temp lessons)
      const allLessons = reorderedChapters
        .filter(chapter => !chapter.id.startsWith('temp-'))
        .flatMap(chapter => 
          (chapter.lessons || [])
            .filter(lesson => !lesson.id.startsWith('temp-'))
            .map(lesson => ({
              ...lesson,
              chapterId: chapter.id
            }))
        );
      
      await onUpdateCurriculum(apiChapters, allLessons);
    }
  };
  
  // Handle adding new lesson to chapter
  const handleAddLesson = async (chapterId: string, lesson: any) => {
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
    
    // Prepare data for API - only send lessons from non-temp chapters
    const apiChapters = updatedChapters.map(chapter => {
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
    const allLessons = updatedChapters
      .flatMap(chapter => {
        // Skip lessons from temp chapters
        if (chapter.id.startsWith('temp-')) {
          return [];
        }
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
    
    // Save immediately
    await onUpdateCurriculum(apiChapters, allLessons);
  };
  
  // Handle deleting lesson
  const handleDeleteLesson = async (chapterId: string, lessonId: string) => {
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
      
      // Prepare API data
      const apiChapters = updatedChapters.map(chapter => {
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
      
      await onUpdateCurriculum(apiChapters, allLessons);
    }
  };
  
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
};

export default CurriculumTab; 