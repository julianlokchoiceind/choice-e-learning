"use client";

import { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  TrashIcon, 
  PlusCircleIcon,
  XCircleIcon,
  CheckCircleIcon,
  VideoCameraIcon 
} from '@heroicons/react/24/outline';
import { TopicSelector } from '@/components/admin/courses';
import FileUpload from '@/components/ui/file/FileUpload';

// Interface for basic form values
interface FormValues {
  title: string;
  description: string;
  price: string;
  level: string;
  topics: string[];
  imageUrl: string;
}

// Interface for chapters
interface Chapter {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

// Interface for lessons (modules)
interface Lesson {
  id: string;
  title: string;
  order: number;
  videoUrl: string;
  duration: string;
  description: string;
  chapterId?: string;
  resources: {
    id: string;
    title: string;
    url: string;
    type: string;
  }[];
}

export default function NewCoursePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Form values
  const [values, setValues] = useState<FormValues>({
    title: '',
    description: '',
    price: '0',
    level: 'beginner',
    topics: [],
    imageUrl: ''
  });
  
  // Chapters
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: Date.now().toString(),
      title: 'Chapter 1: Introduction',
      order: 1,
      lessons: [
        {
          id: `${Date.now()}-1`,
          title: 'Introduction',
          order: 1,
          videoUrl: '',
          duration: '',
          description: '',
          chapterId: Date.now().toString(),
          resources: []
        }
      ]
    }
  ]);
  
  // Uncategorized lessons (not belonging to any chapter)
  const [uncategorizedLessons, setUncategorizedLessons] = useState<Lesson[]>([]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };
  
  // Add a new chapter
  const addChapter = () => {
    const newChapterId = Date.now().toString();
    const newChapter: Chapter = {
      id: newChapterId,
      title: `Chapter ${chapters.length + 1}`,
      order: chapters.length + 1,
      lessons: []
    };
    
    setChapters([...chapters, newChapter]);
  };
  
  // Remove a chapter
  const removeChapter = (chapterId: string) => {
    // Get all lessons of the chapter to be removed
    const lessonsToMove = chapters.find(chapter => chapter.id === chapterId)?.lessons || [];
    
    // Move the lessons to uncategorized if needed
    if (lessonsToMove.length > 0) {
      // Remove chapter reference
      const updatedLessons = lessonsToMove.map(lesson => ({
        ...lesson,
        chapterId: undefined
      }));
      
      setUncategorizedLessons([...uncategorizedLessons, ...updatedLessons]);
    }
    
    // Remove the chapter
    const updatedChapters = chapters.filter(chapter => chapter.id !== chapterId);
    
    // Reorder the remaining chapters
    const reorderedChapters = updatedChapters.map((chapter, index) => ({
      ...chapter,
      order: index + 1,
      title: chapter.title.startsWith('Chapter ') 
        ? `Chapter ${index + 1}${chapter.title.includes(':') ? chapter.title.substring(chapter.title.indexOf(':')) : ''}` 
        : chapter.title
    }));
    
    setChapters(reorderedChapters);
  };
  
  // Update chapter properties
  const updateChapter = (chapterId: string, field: string, value: string) => {
    const updatedChapters = chapters.map(chapter => {
      if (chapter.id === chapterId) {
        return { ...chapter, [field]: value };
      }
      return chapter;
    });
    
    setChapters(updatedChapters);
  };
  
  // Add a new lesson to a chapter
  const addLessonToChapter = (chapterId: string) => {
    const targetChapter = chapters.find(chapter => chapter.id === chapterId);
    if (!targetChapter) return;
    
    const lessonCount = targetChapter.lessons.length;
    
    const newLesson: Lesson = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: `Lesson ${lessonCount + 1}`,
      order: lessonCount + 1,
      videoUrl: '',
      duration: '',
      description: '',
      chapterId: chapterId,
      resources: []
    };
    
    const updatedChapters = chapters.map(chapter => {
      if (chapter.id === chapterId) {
        return {
          ...chapter,
          lessons: [...chapter.lessons, newLesson]
        };
      }
      return chapter;
    });
    
    setChapters(updatedChapters);
  };
  
  // Add a new uncategorized lesson
  const addUncategorizedLesson = () => {
    const newLesson: Lesson = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: `Lesson ${uncategorizedLessons.length + 1}`,
      order: uncategorizedLessons.length + 1,
      videoUrl: '',
      duration: '',
      description: '',
      resources: []
    };
    
    setUncategorizedLessons([...uncategorizedLessons, newLesson]);
  };
  
  // Remove a lesson from a chapter
  const removeLessonFromChapter = (chapterId: string, lessonId: string) => {
    const updatedChapters = chapters.map(chapter => {
      if (chapter.id === chapterId) {
        // Filter out the lesson to remove
        const updatedLessons = chapter.lessons.filter(lesson => lesson.id !== lessonId);
        
        // Reorder the remaining lessons
        const reorderedLessons = updatedLessons.map((lesson, index) => ({
          ...lesson,
          order: index + 1,
          title: lesson.title.startsWith('Lesson ') ? `Lesson ${index + 1}` : lesson.title
        }));
        
        return {
          ...chapter,
          lessons: reorderedLessons
        };
      }
      return chapter;
    });
    
    setChapters(updatedChapters);
  };
  
  // Remove an uncategorized lesson
  const removeUncategorizedLesson = (lessonId: string) => {
    // Filter out the lesson to remove
    const updatedLessons = uncategorizedLessons.filter(lesson => lesson.id !== lessonId);
    
    // Reorder the remaining lessons
    const reorderedLessons = updatedLessons.map((lesson, index) => ({
      ...lesson,
      order: index + 1,
      title: lesson.title.startsWith('Lesson ') ? `Lesson ${index + 1}` : lesson.title
    }));
    
    setUncategorizedLessons(reorderedLessons);
  };
  
  // Update lesson properties in a chapter
  const updateLessonInChapter = (chapterId: string, lessonId: string, field: string, value: string) => {
    const updatedChapters = chapters.map(chapter => {
      if (chapter.id === chapterId) {
        const updatedLessons = chapter.lessons.map(lesson => {
          if (lesson.id === lessonId) {
            return { ...lesson, [field]: value };
          }
          return lesson;
        });
        
        return {
          ...chapter,
          lessons: updatedLessons
        };
      }
      return chapter;
    });
    
    setChapters(updatedChapters);
  };
  
  // Update uncategorized lesson properties
  const updateUncategorizedLesson = (lessonId: string, field: string, value: string) => {
    const updatedLessons = uncategorizedLessons.map(lesson => {
      if (lesson.id === lessonId) {
        return { ...lesson, [field]: value };
      }
      return lesson;
    });
    
    setUncategorizedLessons(updatedLessons);
  };
  
  // Add a resource to a lesson
  const addResource = (lessonId: string, isInChapter: boolean, chapterId?: string) => {
    const newResource = {
      id: Date.now().toString(),
      title: 'New Resource',
      url: '',
      type: 'link'
    };
    
    if (isInChapter && chapterId) {
      // Add resource to a lesson in a chapter
      const updatedChapters = chapters.map(chapter => {
        if (chapter.id === chapterId) {
          const updatedLessons = chapter.lessons.map(lesson => {
            if (lesson.id === lessonId) {
              return {
                ...lesson,
                resources: [...lesson.resources, newResource]
              };
            }
            return lesson;
          });
          
          return {
            ...chapter,
            lessons: updatedLessons
          };
        }
        return chapter;
      });
      
      setChapters(updatedChapters);
    } else {
      // Add resource to an uncategorized lesson
      const updatedLessons = uncategorizedLessons.map(lesson => {
        if (lesson.id === lessonId) {
          return {
            ...lesson,
            resources: [...lesson.resources, newResource]
          };
        }
        return lesson;
      });
      
      setUncategorizedLessons(updatedLessons);
    }
  };
  
  // Remove a resource from a lesson
  const removeResource = (lessonId: string, resourceId: string, isInChapter: boolean, chapterId?: string) => {
    if (isInChapter && chapterId) {
      // Remove resource from a lesson in a chapter
      const updatedChapters = chapters.map(chapter => {
        if (chapter.id === chapterId) {
          const updatedLessons = chapter.lessons.map(lesson => {
            if (lesson.id === lessonId) {
              return {
                ...lesson,
                resources: lesson.resources.filter(resource => resource.id !== resourceId)
              };
            }
            return lesson;
          });
          
          return {
            ...chapter,
            lessons: updatedLessons
          };
        }
        return chapter;
      });
      
      setChapters(updatedChapters);
    } else {
      // Remove resource from an uncategorized lesson
      const updatedLessons = uncategorizedLessons.map(lesson => {
        if (lesson.id === lessonId) {
          return {
            ...lesson,
            resources: lesson.resources.filter(resource => resource.id !== resourceId)
          };
        }
        return lesson;
      });
      
      setUncategorizedLessons(updatedLessons);
    }
  };
  
  // Update resource properties
  const updateResource = (lessonId: string, resourceId: string, field: string, value: string, isInChapter: boolean, chapterId?: string) => {
    if (isInChapter && chapterId) {
      // Update resource in a lesson in a chapter
      const updatedChapters = chapters.map(chapter => {
        if (chapter.id === chapterId) {
          const updatedLessons = chapter.lessons.map(lesson => {
            if (lesson.id === lessonId) {
              const updatedResources = lesson.resources.map(resource => {
                if (resource.id === resourceId) {
                  return { ...resource, [field]: value };
                }
                return resource;
              });
              
              return {
                ...lesson,
                resources: updatedResources
              };
            }
            return lesson;
          });
          
          return {
            ...chapter,
            lessons: updatedLessons
          };
        }
        return chapter;
      });
      
      setChapters(updatedChapters);
    } else {
      // Update resource in an uncategorized lesson
      const updatedLessons = uncategorizedLessons.map(lesson => {
        if (lesson.id === lessonId) {
          const updatedResources = lesson.resources.map(resource => {
            if (resource.id === resourceId) {
              return { ...resource, [field]: value };
            }
            return resource;
          });
          
          return {
            ...lesson,
            resources: updatedResources
          };
        }
        return lesson;
      });
      
      setUncategorizedLessons(updatedLessons);
    }
  };
  
  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    const { source, destination, type } = result;
    
    // If dropped outside the list
    if (!destination) return;
    
    // If dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    // Reordering chapters
    if (type === 'chapter') {
      const reorderedChapters = Array.from(chapters);
      const [removed] = reorderedChapters.splice(source.index, 1);
      reorderedChapters.splice(destination.index, 0, removed);
      
      // Update order property
      const updatedChapters = reorderedChapters.map((chapter, index) => ({
        ...chapter,
        order: index + 1
      }));
      
      setChapters(updatedChapters);
      return;
    }
    
    // Reordering lessons
    if (type === 'lesson') {
      // Moving within the same chapter or uncategorized section
      if (source.droppableId === destination.droppableId) {
        if (source.droppableId === 'uncategorized') {
          // Reordering uncategorized lessons
          const reorderedLessons = Array.from(uncategorizedLessons);
          const [removed] = reorderedLessons.splice(source.index, 1);
          reorderedLessons.splice(destination.index, 0, removed);
          
          // Update order property
          const updatedLessons = reorderedLessons.map((lesson, index) => ({
            ...lesson,
            order: index + 1
          }));
          
          setUncategorizedLessons(updatedLessons);
        } else {
          // Reordering lessons within a chapter
          const updatedChapters = chapters.map(chapter => {
            if (chapter.id === source.droppableId) {
              const reorderedLessons = Array.from(chapter.lessons);
              const [removed] = reorderedLessons.splice(source.index, 1);
              reorderedLessons.splice(destination.index, 0, removed);
              
              // Update order property
              const updatedLessons = reorderedLessons.map((lesson, index) => ({
                ...lesson,
                order: index + 1
              }));
              
              return { ...chapter, lessons: updatedLessons };
            }
            return chapter;
          });
          
          setChapters(updatedChapters);
        }
      } else {
        // Moving between different chapters or between chapter and uncategorized
        let sourceItems: Lesson[] = [];
        let destItems: Lesson[] = [];
        let movedItem: Lesson | null = null;
        
        // Get the source items and the moved item
        if (source.droppableId === 'uncategorized') {
          sourceItems = [...uncategorizedLessons];
          movedItem = sourceItems[source.index];
          sourceItems.splice(source.index, 1);
        } else {
          const sourceChapter = chapters.find(ch => ch.id === source.droppableId);
          if (sourceChapter) {
            sourceItems = [...sourceChapter.lessons];
            movedItem = sourceItems[source.index];
            sourceItems.splice(source.index, 1);
          }
        }
        
        // Update the moved item with the new chapter ID
        if (movedItem) {
          if (destination.droppableId === 'uncategorized') {
            movedItem = { ...movedItem, chapterId: undefined };
          } else {
            movedItem = { ...movedItem, chapterId: destination.droppableId };
          }
        }
        
        // Get the destination items and add the moved item
        if (destination.droppableId === 'uncategorized') {
          destItems = [...uncategorizedLessons];
          if (movedItem) {
            destItems.splice(destination.index, 0, movedItem);
          }
          
          // Update order property
          const updatedUncategorizedLessons = destItems.map((lesson, index) => ({
            ...lesson,
            order: index + 1
          }));
          
          setUncategorizedLessons(updatedUncategorizedLessons);
        } else {
          // Update both source and destination chapters
          const updatedChapters = chapters.map(chapter => {
            if (chapter.id === source.droppableId) {
              // Update source chapter by removing the item
              const updatedSourceLessons = sourceItems.map((lesson, index) => ({
                ...lesson,
                order: index + 1
              }));
              
              return { ...chapter, lessons: updatedSourceLessons };
            } else if (chapter.id === destination.droppableId) {
              // Update destination chapter by adding the item
              const destItems = [...chapter.lessons];
              if (movedItem) {
                destItems.splice(destination.index, 0, movedItem);
              }
              
              // Update order property
              const updatedDestLessons = destItems.map((lesson, index) => ({
                ...lesson,
                order: index + 1
              }));
              
              return { ...chapter, lessons: updatedDestLessons };
            }
            return chapter;
          });
          
          setChapters(updatedChapters);
        }
        
        // Also update uncategorized lessons if the source was uncategorized
        if (source.droppableId === 'uncategorized') {
          // Update order property of source
          const updatedSourceLessons = sourceItems.map((lesson, index) => ({
            ...lesson,
            order: index + 1
          }));
          
          setUncategorizedLessons(updatedSourceLessons);
        }
      }
    }
  };
  
  // Proceed to the next step without validation
  const nextStep = () => {
    setStep(step + 1);
  };
  
  // Go back to the previous step
  const prevStep = () => {
    setStep(step - 1);
  };
  
  // Handle image upload
  const handleImageUpload = (url: string) => {
    setValues(prev => ({ ...prev, imageUrl: url }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Collect all lessons from chapters and uncategorized
      const allLessons: any[] = [];
      
      // Make sure we have at least one lesson with a valid video URL
      let hasValidLesson = false;
      
      // Add lessons from chapters
      chapters.forEach(chapter => {
        chapter.lessons.forEach(lesson => {
          // Add a default placeholder if video URL is empty
          const videoUrl = lesson.videoUrl || 'https://www.youtube.com/watch?v=placeholder';
          
          if (videoUrl && lesson.title) {
            hasValidLesson = true;
          }
          
          allLessons.push({
            title: lesson.title || 'Untitled Lesson',
            order: lesson.order,
            videoUrl: videoUrl,
            description: lesson.description || '',
            chapterId: chapter.id, // Keep reference to chapter
            resources: lesson.resources.map(resource => ({
              title: resource.title || 'Untitled Resource',
              url: resource.url || 'https://example.com/placeholder',
              type: resource.type
            }))
          });
        });
      });
      
      // Add uncategorized lessons
      uncategorizedLessons.forEach(lesson => {
        // Add a default placeholder if video URL is empty
        const videoUrl = lesson.videoUrl || 'https://www.youtube.com/watch?v=placeholder';
        
        if (videoUrl && lesson.title) {
          hasValidLesson = true;
        }
        
        allLessons.push({
          title: lesson.title || 'Untitled Lesson',
          order: lesson.order,
          videoUrl: videoUrl,
          description: lesson.description || '',
          resources: lesson.resources.map(resource => ({
            title: resource.title || 'Untitled Resource',
            url: resource.url || 'https://example.com/placeholder',
            type: resource.type
          }))
        });
      });
      
      // Make sure we have at least one valid lesson
      if (allLessons.length === 0) {
        allLessons.push({
          title: 'Introduction',
          order: 1,
          videoUrl: 'https://www.youtube.com/watch?v=placeholder',
          description: '',
          resources: []
        });
      }
      
      // Ensure we have a valid title and description
      const courseTitle = values.title || 'Untitled Course';
      const courseDescription = values.description || 'No description provided';
      
      // Prepare the data
      const courseData = {
        title: courseTitle,
        description: courseDescription,
        price: parseFloat(values.price) || 0, // Ensure we have a number
        level: values.level,
        topics: values.topics.length > 0 ? values.topics : ['general'],
        imageUrl: values.imageUrl || 'https://via.placeholder.com/800x400', // Use uploaded image or default
        lessons: allLessons
      };
      
      // Send data to API
      console.log('Sending course data:', courseData);
      
      const apiClient = (await import('@/lib/axios/apiClient')).default;
      const response = await apiClient.post('/api/courses', courseData);
      const data = response.data;
      
      if (data.success) {
        // Redirect to courses page after successful creation
        router.push('/admin/courses');
      } else {
        console.error('API Error:', data);
        let errorMessage = 'Failed to create course';
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting course:', error);
      alert('Error creating course: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render step 1: Basic Course Information
  const renderBasicInfo = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Basic Course Information</h2>
      
      <div className="space-y-4">
            <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
            name="title"
            value={values.title}
            onChange={handleChange}
            placeholder="Enter course title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Course Description <span className="text-red-500">*</span>
              </label>
          <textarea
            id="description"
            name="description"
            value={values.description}
            onChange={handleChange}
            placeholder="Enter course description"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
                </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price ($) <span className="text-red-500">*</span>
            </label>
                <input
                  type="number"
                  id="price"
              name="price"
              value={values.price}
              onChange={handleChange}
                  min="0"
                  step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
                />
            </div>
            
            <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                Level <span className="text-red-500">*</span>
              </label>
              <select
                id="level"
              name="level"
              value={values.level}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="all">All Levels</option>
              </select>
          </div>
            </div>
            
            <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Image <span className="text-red-500">*</span>
              </label>
          <FileUpload 
            onImageUpload={handleImageUpload}
            type="course-cover"
          />
            </div>
            
        <div>
          <TopicSelector
            selectedTopics={values.topics}
            onChange={(topics) => setValues({...values, topics})}
          />
        </div>
      </div>
    </div>
  );
  
  // Render step 2: Course Content (Chapters & Lessons)
  const renderCourseContent = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Course Content</h2>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Chapters section */}
        <Droppable droppableId="chapters" type="chapter">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="space-y-6"
            >
              {chapters.map((chapter, chapterIndex) => (
                <Draggable 
                  key={chapter.id} 
                  draggableId={chapter.id} 
                  index={chapterIndex}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`border border-gray-200 rounded-lg p-4 ${snapshot.isDragging ? 'bg-blue-50' : 'bg-gray-50'}`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                          <div 
                            {...provided.dragHandleProps}
                            className="mr-2 p-1 rounded hover:bg-gray-200 cursor-grab active:cursor-grabbing"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-800">
                            {chapter.order}. {chapter.title}
                          </h3>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => addLessonToChapter(chapter.id)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Add lesson to this chapter"
                          >
                            <PlusCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeChapter(chapter.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            disabled={chapters.length === 1 && chapter.lessons.length > 0}
                            title={chapters.length === 1 && chapter.lessons.length > 0 ? "Cannot remove chapter with lessons" : "Remove chapter"}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor={`chapter-${chapter.id}-title`} className="block text-sm font-medium text-gray-700 mb-1">
                          Chapter Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id={`chapter-${chapter.id}-title`}
                          value={chapter.title}
                          onChange={(e) => updateChapter(chapter.id, 'title', e.target.value)}
                          placeholder="Enter chapter title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
                      {/* Chapter description field removed as requested */}
                      
                      {/* Lessons in this chapter */}
                      <div className="mt-4 pl-4 border-l-2 border-gray-200">
                        <h4 className="font-medium text-gray-700 mb-2">Lessons in this Chapter</h4>
                        
                        <Droppable droppableId={chapter.id} type="lesson">
                          {(provided) => (
                            <div 
                              {...provided.droppableProps} 
                              ref={provided.innerRef}
                              className="space-y-4"
                            >
                              {chapter.lessons.length > 0 ? (
                                chapter.lessons.map((lesson, lessonIndex) => (
                                  <Draggable 
                                    key={lesson.id} 
                                    draggableId={lesson.id} 
                                    index={lessonIndex}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`border border-gray-200 rounded-lg p-3 ${snapshot.isDragging ? 'bg-blue-50' : 'bg-white'}`}
                                      >
                                        <div className="flex justify-between items-center mb-3">
                                          <div className="flex items-center">
                                            <div 
                                              {...provided.dragHandleProps}
                                              className="mr-2 p-1 rounded hover:bg-gray-200 cursor-grab active:cursor-grabbing"
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                              </svg>
                                            </div>
                                            <h5 className="font-medium text-gray-800">
                                              {lesson.order}. {lesson.title}
                                            </h5>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => removeLessonFromChapter(chapter.id, lesson.id)}
                                            className="text-red-600 hover:text-red-800"
                                            title="Remove lesson"
                                          >
                                            <TrashIcon className="h-4 w-4" />
                                          </button>
                                        </div>
                                        
                                        <div className="mb-3">
                                          <label htmlFor={`lesson-${lesson.id}-title`} className="block text-sm font-medium text-gray-700 mb-1">
                                            Lesson Title <span className="text-red-500">*</span>
              </label>
                                          <input
                                            type="text"
                                            id={`lesson-${lesson.id}-title`}
                                            value={lesson.title}
                                            onChange={(e) => updateLessonInChapter(chapter.id, lesson.id, 'title', e.target.value)}
                                            placeholder="Enter lesson title"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                                          />
            </div>
            
                                        <div className="mb-3">
                                          <label htmlFor={`lesson-${lesson.id}-video`} className="block text-sm font-medium text-gray-700 mb-1">
                                            Video URL <span className="text-red-500">*</span>
              </label>
                                          <div className="flex">
                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                              <VideoCameraIcon className="h-5 w-5" />
                                            </span>
                                            <input
                                              type="url"
                                              id={`lesson-${lesson.id}-video`}
                                              value={lesson.videoUrl}
                                              onChange={(e) => updateLessonInChapter(chapter.id, lesson.id, 'videoUrl', e.target.value)}
                                              placeholder="https://www.youtube.com/watch?v=..."
                                              className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                                            />
                                          </div>
                                          <p className="mt-1 text-xs text-gray-500">
                                            Enter YouTube, Vimeo, or other video platform URL
                                          </p>
            </div>
            
                                        <div className="mb-3">
                                          <label htmlFor={`lesson-${lesson.id}-description`} className="block text-sm font-medium text-gray-700 mb-1">
                                            Lesson Description
              </label>
                                          <textarea
                                            id={`lesson-${lesson.id}-description`}
                                            value={lesson.description}
                                            onChange={(e) => updateLessonInChapter(chapter.id, lesson.id, 'description', e.target.value)}
                                            placeholder="Enter lesson description"
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          />
                                        </div>
                                        
                                        {/* Resources Section */}
                                        <div className="mt-3">
                                          <div className="flex justify-between items-center mb-2">
                                            <h6 className="text-sm font-medium text-gray-700">Additional Resources</h6>
                                            <button
                                              type="button"
                                              onClick={() => addResource(lesson.id, true, chapter.id)}
                                              className="text-blue-600 hover:text-blue-800 flex items-center text-xs"
                                            >
                                              <PlusCircleIcon className="h-3 w-3 mr-1" />
                                              Add Resource
                                            </button>
                                          </div>
                                          
                                          {lesson.resources.length > 0 ? (
                                            <div className="space-y-2">
                                              {lesson.resources.map((resource) => (
                                                <div key={resource.id} className="flex items-center space-x-2">
                                                  <input
                                                    type="text"
                                                    value={resource.title}
                                                    onChange={(e) => updateResource(lesson.id, resource.id, 'title', e.target.value, true, chapter.id)}
                                                    placeholder="Resource title"
                                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                  />
                                                  <input
                                                    type="url"
                                                    value={resource.url}
                                                    onChange={(e) => updateResource(lesson.id, resource.id, 'url', e.target.value, true, chapter.id)}
                                                    placeholder="https://..."
                                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                  />
              <select
                                                    value={resource.type}
                                                    onChange={(e) => updateResource(lesson.id, resource.id, 'type', e.target.value, true, chapter.id)}
                                                    className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                  >
                                                    <option value="link">Link</option>
                                                    <option value="pdf">PDF</option>
                                                    <option value="document">Document</option>
                                                    <option value="code">Code</option>
              </select>
                                                  <button
                                                    type="button"
                                                    onClick={() => removeResource(lesson.id, resource.id, true, chapter.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                  >
                                                    <XCircleIcon className="h-4 w-4" />
                                                  </button>
            </div>
                                              ))}
                  </div>
                                          ) : (
                                            <p className="text-xs text-gray-500 italic">No resources added yet</p>
                                          )}
                </div>
              </div>
                                    )}
                                  </Draggable>
                                ))
                              ) : (
                                <p className="text-sm text-gray-500 italic py-2">No lessons in this chapter yet</p>
                              )}
                              {provided.placeholder}
            </div>
                          )}
                        </Droppable>
                        
                        <button
                          type="button"
                          onClick={() => addLessonToChapter(chapter.id)}
                          className="mt-3 w-full py-1.5 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-600 hover:text-blue-600 hover:border-blue-500 transition-colors"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add Lesson to this Chapter
                        </button>
          </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        
        <div className="flex space-x-4 mt-6">
                <button
                  type="button"
            onClick={addChapter}
            className="flex-1 py-2 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-500 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Add New Chapter
          </button>
          
          <button
            type="button"
            onClick={addUncategorizedLesson}
            className="flex-1 py-2 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-500 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Add Lesson without Chapter
                </button>
              </div>
        
        {/* Uncategorized lessons section */}
        {uncategorizedLessons.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Uncategorized Lessons</h3>
            
            <Droppable droppableId="uncategorized" type="lesson">
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {uncategorizedLessons.map((lesson, index) => (
                    <Draggable 
                      key={lesson.id} 
                      draggableId={lesson.id} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`border border-gray-200 rounded-lg p-4 ${snapshot.isDragging ? 'bg-blue-50' : 'bg-white'}`}
                        >
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                              <div 
                                {...provided.dragHandleProps}
                                className="mr-2 p-1 rounded hover:bg-gray-200 cursor-grab active:cursor-grabbing"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                </svg>
                              </div>
                              <h4 className="font-medium text-gray-800">
                                {lesson.order}. {lesson.title}
                              </h4>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeUncategorizedLesson(lesson.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Remove lesson"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                          
                          <div className="mb-4">
                            <label htmlFor={`uncategorized-lesson-${lesson.id}-title`} className="block text-sm font-medium text-gray-700 mb-1">
                              Lesson Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                              id={`uncategorized-lesson-${lesson.id}-title`}
                              value={lesson.title}
                              onChange={(e) => updateUncategorizedLesson(lesson.id, 'title', e.target.value)}
                              placeholder="Enter lesson title"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                  />
                </div>
                          
                          <div className="mb-4">
                            <label htmlFor={`uncategorized-lesson-${lesson.id}-video`} className="block text-sm font-medium text-gray-700 mb-1">
                              Video URL <span className="text-red-500">*</span>
                            </label>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                <VideoCameraIcon className="h-5 w-5" />
                              </span>
                      <input
                                type="url"
                                id={`uncategorized-lesson-${lesson.id}-video`}
                                value={lesson.videoUrl}
                                onChange={(e) => updateUncategorizedLesson(lesson.id, 'videoUrl', e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              Enter YouTube, Vimeo, or other video platform URL
                            </p>
                          </div>
                          
                          <div className="mb-4">
                            <label htmlFor={`uncategorized-lesson-${lesson.id}-description`} className="block text-sm font-medium text-gray-700 mb-1">
                              Lesson Description
                            </label>
                            <textarea
                              id={`uncategorized-lesson-${lesson.id}-description`}
                              value={lesson.description}
                              onChange={(e) => updateUncategorizedLesson(lesson.id, 'description', e.target.value)}
                              placeholder="Enter lesson description"
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          
                          {/* Resources Section */}
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium text-gray-700">Additional Resources</h4>
                      <button
                        type="button"
                                onClick={() => addResource(lesson.id, false)}
                                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                      >
                                <PlusCircleIcon className="h-4 w-4 mr-1" />
                                Add Resource
                      </button>
                    </div>
                            
                            {lesson.resources.length > 0 ? (
                              <div className="space-y-3">
                                {lesson.resources.map((resource) => (
                                  <div key={resource.id} className="flex items-center space-x-2">
                      <input
                        type="text"
                                      value={resource.title}
                                      onChange={(e) => updateResource(lesson.id, resource.id, 'title', e.target.value, false)}
                                      placeholder="Resource title"
                                      className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <input
                                      type="url"
                                      value={resource.url}
                                      onChange={(e) => updateResource(lesson.id, resource.id, 'url', e.target.value, false)}
                                      placeholder="https://..."
                                      className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <select
                                      value={resource.type}
                                      onChange={(e) => updateResource(lesson.id, resource.id, 'type', e.target.value, false)}
                                      className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                      <option value="link">Link</option>
                                      <option value="pdf">PDF</option>
                                      <option value="document">Document</option>
                                      <option value="code">Code</option>
                                    </select>
                      <button
                        type="button"
                                      onClick={() => removeResource(lesson.id, resource.id, false)}
                                      className="text-red-600 hover:text-red-800"
                      >
                                      <XCircleIcon className="h-5 w-5" />
                      </button>
                    </div>
                                ))}
                  </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic">No resources added yet</p>
                            )}
                </div>
              </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
            </div>
              )}
            </Droppable>
          </div>
        )}
      </DragDropContext>
    </div>
  );
  
  // Render step 3: Review and Publish
  const renderReviewAndPublish = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Review and Publish</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2 text-gray-800">Course Information</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Title</p>
              <p className="font-medium">{values.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-medium">${Number(values.price).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Level</p>
              <p className="font-medium capitalize">{values.level}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Topics</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {values.topics.length > 0 ? (
                  values.topics.map((topic, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                      {topic}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm italic">No topics added</p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Description</p>
            <p className="text-sm mt-1">{values.description}</p>
          </div>
          {/* Add image preview here if available */}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2 text-gray-800">Course Structure</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500 mb-2">
            {chapters.length} Chapter{chapters.length !== 1 ? 's' : ''}, 
            {chapters.reduce((total, chapter) => total + chapter.lessons.length, 0) + uncategorizedLessons.length} Lesson{(chapters.reduce((total, chapter) => total + chapter.lessons.length, 0) + uncategorizedLessons.length) !== 1 ? 's' : ''}
          </p>
          
          <div className="space-y-4">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="pb-2">
                <p className="font-medium text-blue-800">
                  Chapter {chapter.order}: {chapter.title}
                </p>
                
                <div className="ml-4 mt-2 space-y-2">
                  {chapter.lessons.map((lesson) => (
                    <div key={lesson.id} className="border-b border-gray-200 pb-2 last:border-b-0">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">
                          {lesson.order}. {lesson.title}
                        </p>
                      </div>
                      <p className="text-sm truncate">{lesson.videoUrl || 'No video URL'}</p>
                      {lesson.resources.length > 0 && (
                        <div className="mt-1">
                          <p className="text-xs text-gray-500">Resources: {lesson.resources.length}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {uncategorizedLessons.length > 0 && (
              <div className="pt-2 border-t border-gray-300">
                <p className="font-medium text-gray-700 mb-2">Uncategorized Lessons</p>
                <div className="space-y-2">
                  {uncategorizedLessons.map((lesson) => (
                    <div key={lesson.id} className="border-b border-gray-200 pb-2 last:border-b-0">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">
                          {lesson.order}. {lesson.title}
                        </p>
                      </div>
                      <p className="text-sm truncate">{lesson.videoUrl || 'No video URL'}</p>
                      {lesson.resources.length > 0 && (
                        <div className="mt-1">
                          <p className="text-xs text-gray-500">Resources: {lesson.resources.length}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-800 flex items-center">
          <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Important Notice
        </h3>
        <p className="mt-1 text-sm text-yellow-700">
          Once published, your course will be available to students. You can still edit the course after publication.
        </p>
      </div>
    </div>
  );
  
  // Render navigation buttons based on current step
  const renderStepButtons = () => (
    <div className="flex justify-between items-center mt-6">
      {step > 1 ? (
            <button
              type="button"
          onClick={prevStep}
          className="flex items-center text-gray-600 hover:text-gray-800 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Previous Step
            </button>
      ) : (
            <Link
              href="/admin/courses"
          className="flex items-center text-gray-600 hover:text-gray-800 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Cancel
            </Link>
      )}
      
      {step < 3 ? (
        <button
          type="button"
          onClick={nextStep}
          className="flex items-center bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-2 px-4 rounded-md transition-colors"
        >
          Next Step
          <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-2 px-6 rounded-md transition-colors disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Publishing...
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-5 w-5 mr-1" />
              Publish Course
            </>
          )}
        </button>
      )}
          </div>
  );
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create New Course</h1>
        <p className="text-gray-600 mt-1">Fill in the details to create a new video course</p>
      </div>
      
      {/* Step progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between">
          <div className="flex flex-col items-center w-full">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <p className="text-sm mt-1">Basic Info</p>
          </div>
          <div className="flex-1 h-0.5 self-center bg-gray-200">
            <div className={`h-full bg-blue-600 transition-all duration-300 ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
          </div>
          <div className="flex flex-col items-center w-full">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
            <p className="text-sm mt-1">Content</p>
          </div>
          <div className="flex-1 h-0.5 self-center bg-gray-200">
            <div className={`h-full bg-blue-600 transition-all duration-300 ${step >= 3 ? 'w-full' : 'w-0'}`}></div>
          </div>
          <div className="flex flex-col items-center w-full">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
            <p className="text-sm mt-1">Review</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {step === 1 && renderBasicInfo()}
        {step === 2 && renderCourseContent()}
        {step === 3 && renderReviewAndPublish()}
        
        {renderStepButtons()}
      </form>
    </div>
  );
}