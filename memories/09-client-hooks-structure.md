# Client Hooks Structure

Existing client hooks by domain: auth/ (useAuth), common/ (useToast, useApiRequest), courses/ (useCoursePlaceholder), dashboard/, faq/, lessons/ (useLesson), students/, topics/, uploads/, user/ (useUserState). All hooks follow proper React patterns with useState, useEffect, error handling and TypeScript types.

## Hooks by Domain:

### Authentication:
- **useAuth** - Authentication state and methods

### Common:
- **useToast** - Toast notification management
- **useApiRequest** - Generic API request handling

### Courses:
- **useCoursePlaceholder** - Course image placeholder management

### Dashboard:
- **dashboard/** - Dashboard-related hooks (to be expanded)

### FAQ:
- **faq/** - FAQ management hooks

### Lessons:
- **useLesson** - Lesson data and completion tracking

### Students:
- **students/** - Student management hooks

### Topics:
- **topics/** - Topic-related hooks

### Uploads:
- **uploads/** - File upload handling hooks

### User:
- **useUserState** - User state management

## Hook Patterns:
- All hooks follow proper React patterns
- Use `useState` for local state management
- Use `useEffect` for side effects
- Implement comprehensive error handling
- Include TypeScript types for all parameters and return values
- Follow consistent naming conventions (prefix with 'use')

## Standards:
- Error handling with try/catch blocks
- Loading states for async operations
- Proper cleanup in useEffect
- TypeScript interfaces for hook parameters and return types
- Consistent error reporting patterns 