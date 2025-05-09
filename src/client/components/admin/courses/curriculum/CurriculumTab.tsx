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
  
  // Xử lý thêm chapter mới
  const handleAddChapter = (chapter: Partial<Chapter>) => {
    const newChapter = {
      id: `temp-${Date.now()}`,
      title: chapter.title || 'Chương mới',
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
    
    // Tạo mảng lessons cho API
    const allLessons = updatedChapters.flatMap(chapter => 
      (chapter.lessons || []).map(lesson => ({
        ...lesson,
        chapterId: chapter.id
      }))
    );
    
    onUpdateCurriculum(updatedChapters, allLessons);
  };
  
  // Xử lý chỉnh sửa chapter
  const handleEditChapter = (chapterId: string, data: Partial<Chapter>) => {
    const updatedChapters = chapters.map(chapter => 
      chapter.id === chapterId ? { ...chapter, ...data } : chapter
    );
    
    setChapters(updatedChapters);
    setEditingChapterId(null);
    
    // Tạo mảng lessons cho API
    const allLessons = updatedChapters.flatMap(chapter => 
      (chapter.lessons || []).map(lesson => ({
        ...lesson,
        chapterId: chapter.id
      }))
    );
    
    onUpdateCurriculum(updatedChapters, allLessons);
  };
  
  // Xử lý xóa chapter
  const handleDeleteChapter = (chapterId: string) => {
    if (confirm('Bạn có chắc muốn xóa chương này và tất cả bài học trong đó?')) {
      const updatedChapters = chapters.filter(chapter => chapter.id !== chapterId);
      
      // Cập nhật lại thứ tự các chapter
      const reorderedChapters = updatedChapters.map((chapter, index) => ({
        ...chapter,
        order: index + 1
      }));
      
      setChapters(reorderedChapters);
      
      // Tạo mảng lessons cho API
      const allLessons = reorderedChapters.flatMap(chapter => 
        (chapter.lessons || []).map(lesson => ({
          ...lesson,
          chapterId: chapter.id
        }))
      );
      
      onUpdateCurriculum(reorderedChapters, allLessons);
    }
  };
  
  // Xử lý thêm bài học mới cho chapter
  const handleAddLesson = (chapterId: string, lesson: any) => {
    const updatedChapters = chapters.map(chapter => {
      if (chapter.id === chapterId) {
        const newLesson = {
          id: `temp-lesson-${Date.now()}`,
          title: lesson.title || 'Bài học mới',
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
    
    // Tạo mảng lessons cho API
    const allLessons = updatedChapters.flatMap(chapter => 
      (chapter.lessons || []).map(lesson => ({
        ...lesson,
        chapterId: chapter.id
      }))
    );
    
    onUpdateCurriculum(updatedChapters, allLessons);
  };
  
  // Xử lý xóa bài học
  const handleDeleteLesson = (chapterId: string, lessonId: string) => {
    if (confirm('Bạn có chắc muốn xóa bài học này?')) {
      const updatedChapters = chapters.map(chapter => {
        if (chapter.id === chapterId) {
          const filteredLessons = (chapter.lessons || []).filter(lesson => lesson.id !== lessonId);
          
          // Cập nhật lại thứ tự các bài học
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
      
      // Tạo mảng lessons cho API
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
        <h2 className="text-xl font-semibold text-gray-800">Nội dung khóa học</h2>
        
        <button
          type="button"
          onClick={() => setIsAddingChapter(true)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Thêm chương
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
          <p className="text-gray-500">Chưa có chương nào. Bắt đầu bằng cách thêm chương đầu tiên.</p>
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