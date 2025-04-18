# Database Access Layer Refactoring

## Overview

This document outlines the changes made to the database access layer as part of the Choice E-Learning refactoring project. The goal was to streamline the codebase, reduce redundancy, and standardize on a single database access method (Prisma ORM).

## Changes Made

1. Created a unified data access layer with the following components:
   - `DbService`: A generic service for database operations
   - `UserService`: User-specific database operations
   - `CourseService`: Course-specific database operations
   - `LessonService`: Lesson-specific database operations

2. Eliminated direct MongoDB access in favor of Prisma ORM:
   - Moved `mongodb.ts` to the Delete folder
   - Created Prisma-based implementation of AuthService

3. Consolidated database utility functions:
   - Standardized error handling
   - Implemented consistent patterns for CRUD operations
   - Added type safety with Prisma types

4. Removed redundant database client:
   - Kept the singleton Prisma client in `src/lib/db/index.ts`
   - Moved `src/lib/prisma.ts` to the Delete folder

## New Structure

```
src/lib/db/
├── index.ts                  # Prisma client singleton
├── services/                 # Database services
│   ├── index.ts              # Exports all services
│   ├── db-service.ts         # Generic database operations
│   ├── user-service.ts       # User-specific operations
│   ├── course-service.ts     # Course-specific operations
│   └── lesson-service.ts     # Lesson-specific operations
└── README.md                 # This documentation
```

## Usage Examples

### Finding a user by ID

```typescript
import { UserService } from '@/lib/db/services';

const user = await UserService.findById('user-id-here');
```

### Creating a course

```typescript
import { CourseService } from '@/lib/db/services';

const newCourse = await CourseService.create({
  title: 'Course Title',
  description: 'Course Description',
  price: 99.99,
  level: 'beginner',
  topics: ['topic1', 'topic2']
});
```

### Updating a lesson

```typescript
import { LessonService } from '@/lib/db/services';

const updatedLesson = await LessonService.update('lesson-id-here', {
  title: 'Updated Lesson Title',
  content: 'Updated lesson content'
});
```

## Next Steps

1. **Update Auth Service**: Replace the current auth service that uses MongoDB with the new Prisma-based implementation.

2. **Update API Routes**: Modify API routes to use the new database services.

3. **Update Client Components**: Update any client components that directly accessed the database.

4. **Testing**: Ensure all functionality works as expected with the new database layer.

5. **Cleanup**: After thorough testing, remove all files from the Delete folder.

## Best Practices

1. Always use the appropriate service for database operations.
2. Handle errors properly by checking return values.
3. Use types provided by Prisma for type safety.
4. Avoid direct database access outside of the service layer.
