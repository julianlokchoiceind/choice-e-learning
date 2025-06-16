# Lesson Display Issue Analysis

## Problem Statement
After adding lessons to chapters and saving via "Update Draft", the lessons don't appear in the UI and the lesson count shows "0 lessons" instead of the actual count.

## Data Flow Analysis

### 1. Adding Lessons to Chapters

**Location: CurriculumTab.tsx - handleAddLesson (line 104-130)**
```typescript
const handleAddLesson = (chapterId: string, lesson: any) => {
  const updatedChapters = chapters.map(chapter => {
    if (chapter.id === chapterId) {
      const newLesson = {
        id: `temp-lesson-${Date.now()}`, // ✅ Creates temp ID
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
        lessons: [...(chapter.lessons || []), newLesson] // ✅ Updates local state
      };
    }
    return chapter;
  });
  
  setChapters(updatedChapters); // ✅ Updates local state correctly
};
```

**Finding:** This works correctly - lessons are added to local state with temp IDs.

### 2. Curriculum Save Operation

**Location: CurriculumTab.tsx - prepareCurriculumData (line 159-205)**
```typescript
const prepareCurriculumData = () => {
  // ...
  const allLessons = chapters
    .flatMap(chapter => {
      // 🚨 POTENTIAL ISSUE: Skip lessons from temp chapters during API call
      if (chapter.id.startsWith('temp-')) {
        return []; // This skips ALL lessons from temp chapters!
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
              chapterId: chapter.id // Uses existing chapter ID
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
```

**Finding:** Logic for handling lessons from temp vs existing chapters is correct.

### 3. API Curriculum Update

**Location: /api/admin/courses/[courseId]/curriculum/route.ts (line 106-154)**
The API correctly processes lessons:
- Maps temp chapter IDs to real IDs
- Creates new lessons with proper relationships
- Updates existing lessons

### 4. Post-Save Data Refresh

**Location: CurriculumTab.tsx - useEffect (line 36-47)**
```typescript
useEffect(() => {
  if (courseData?.chapters) {
    // Always update from server data, but only if we don't have unsaved changes
    const hasChanges = JSON.stringify(chapters) !== JSON.stringify(originalChapters);
    
    if (!hasChanges || chapters.length === 0) {
      // Safe to update - either no changes or initial load
      setChapters(courseData.chapters); // ✅ Should update with fresh data
      setOriginalChapters(courseData.chapters);
    }
  }
}, [courseData?.chapters, originalChapters]);
```

**Finding:** This should work, but let's check if courseData includes chapters with lessons.

### 5. API Response Structure

**Location: /api/admin/courses/[courseId]/route.ts (line 86-107)**
```typescript
chapters: course.chapters ? course.chapters.map(chapter => ({
  id: chapter.id,
  title: chapter.title,
  description: chapter.description || '',
  order: chapter.order,
  courseId: chapter.courseId,
  createdAt: chapter.createdAt,
  updatedAt: chapter.updatedAt,
  lessons: chapter.lessons ? chapter.lessons.map(lesson => ({
    id: lesson.id,
    title: lesson.title,
    content: lesson.content || '',
    videoUrl: lesson.videoUrl || '',
    order: lesson.order,
    chapterId: lesson.chapterId,
    courseId: lesson.courseId,
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt,
    resources: lesson.resourcesData ? JSON.parse(lesson.resourcesData) : []
  })) : []
})) : []
```

**Finding:** API correctly returns chapters with nested lessons.

### 6. Lesson Count Display

**Location: ChapterItem.tsx (line 49-51)**
```typescript
<span className="text-sm text-gray-500">
  {chapter.lessons?.length || 0} lessons
</span>
```

**Finding:** Display logic is correct - uses optional chaining and fallback to 0.

## Root Cause Analysis

### PRIMARY ISSUE: Parent Component Blocks Curriculum Updates

**Location: edit/page.tsx (line 110-116)**
```typescript
// Only update chapters/lessons if curriculum doesn't have changes
if (courseData.chapters && !hasCurriculumChanges) {
  setChapters(courseData.chapters);
}

if (courseData.lessons && !hasCurriculumChanges) {
  setLessons(courseData.lessons);
}
```

**The Problem:** 
1. User adds lessons to chapters → `setHasCurriculumChanges(true)`
2. User clicks "Update Draft" → saves curriculum via API
3. API successfully updates database and returns fresh data
4. React Query invalidates and refetches course data with new lessons
5. **BUT** the parent component's useEffect blocks the update because `hasCurriculumChanges` is still `true`
6. Only AFTER the curriculum save completes does `setHasCurriculumChanges(false)` get called
7. By then, the fresh course data has already been ignored

### Secondary Issue: State Management Race Condition

**Location: CurriculumTab.tsx - saveCurriculum (line 207-212)**
```typescript
const saveCurriculum = async () => {
  const { apiChapters, allLessons } = prepareCurriculumData();
  await onUpdateCurriculum(apiChapters, allLessons);
  setOriginalChapters(chapters); // ❌ Sets original to current local state
};
```

**Problem:** This prevents the useEffect from detecting that the data should be refreshed from the server.

### Timing Sequence (Current - Broken)
1. Add lessons → `hasCurriculumChanges = true`
2. Save curriculum → API call starts
3. API succeeds → Query invalidation triggers refetch
4. Fresh course data arrives → **BLOCKED** by `!hasCurriculumChanges` check
5. `setHasCurriculumChanges(false)` called → Too late, data already arrived
6. UI shows stale local state instead of fresh server data

## Solutions

### RECOMMENDED SOLUTION: Fix State Management Sequence

**Fix 1: Update Parent Component State Management**
Modify edit/page.tsx to reset curriculum changes BEFORE the mutation:

```typescript
const handleUpdateDraft = async () => {
  try {
    // Save curriculum if there are changes
    if (hasCurriculumChanges && curriculumRef.current) {
      // ✅ Reset curriculum changes FIRST to allow data refresh
      setHasCurriculumChanges(false);
      await curriculumRef.current.saveCurriculum();
    }
    // ... rest of the function
  } catch (error: any) {
    // ✅ On error, restore the curriculum changes flag
    if (hasCurriculumChanges) {
      setHasCurriculumChanges(true);
    }
    // Error handling
  }
};
```

**Fix 2: Update CurriculumTab State Management**
Modify CurriculumTab.tsx to not prematurely update originalChapters:

```typescript
const saveCurriculum = async () => {
  const { apiChapters, allLessons } = prepareCurriculumData();
  await onUpdateCurriculum(apiChapters, allLessons);
  // ✅ Don't update originalChapters here - let the data refresh handle it
  // setOriginalChapters(chapters); // Remove this line
};
```

**Fix 3: Update Parent useEffect to Handle Fresh Data**
```typescript
useEffect(() => {
  if (courseData) {
    // ... existing form value updates ...
    
    // ✅ Always update chapters/lessons from fresh server data
    // The hasCurriculumChanges flag is managed by save operations
    if (courseData.chapters) {
      setChapters(courseData.chapters);
    }
    
    if (courseData.lessons) {
      setLessons(courseData.lessons);
    }
    
    // Update timestamp
    if (courseData.updatedAt) {
      setLastSaved(new Date(courseData.updatedAt));
    }
  }
}, [courseData, hasUnsavedChanges, values.title]); // Remove hasCurriculumChanges dependency
```

### Alternative Solution: Optimistic Updates
If the above doesn't work due to React Query caching, implement optimistic updates in the curriculum mutation.

## Implementation Plan

### Step 1: Fix Parent Component (HIGH PRIORITY)
Edit `/src/app/admin/courses/[courseId]/edit/page.tsx`:

1. **Remove blocking condition** from useEffect (lines 110-116)
2. **Reset curriculum changes** before save operation in handleUpdateDraft
3. **Add error handling** to restore state on failure

### Step 2: Fix CurriculumTab Component  
Edit `/src/client/components/admin/courses/curriculum/CurriculumTab.tsx`:

1. **Remove premature state update** in saveCurriculum (line 211)
2. **Let server data refresh** handle the originalChapters update

### Step 3: Test and Verify
1. Add lessons to chapters
2. Click "Update Draft"
3. Verify lessons appear immediately
4. Verify lesson count updates correctly
5. Test error scenarios to ensure state rollback works

### Expected Result After Fixes
1. ✅ Add lessons → Shows in local state immediately
2. ✅ Save curriculum → API updates database  
3. ✅ Query refetch → Gets fresh data with real IDs
4. ✅ State update → Shows lessons with proper counts
5. ✅ UI reflects → User sees lessons and correct counts

This will fix the core issue where lesson display doesn't update after save operations.