# Choice E-Learning Project Structure Rules

Organize by domain (courses, lessons, auth). Use Server Actions to replace API Routes. Use React Query for data fetching. Prioritize TypeScript for type safety.

## Structure Principles:
1. **Domain Organization**: Organize code by business domains (courses, lessons, auth, etc.)
2. **Server Actions**: Use Server Actions to replace API Routes gradually
3. **Data Fetching**: Use React Query for all data fetching operations
4. **Type Safety**: Prioritize TypeScript for comprehensive type safety

## Domain Examples:
- `courses/` - Course management and browsing
- `lessons/` - Lesson content and learning
- `auth/` - Authentication and authorization
- `admin/` - Administrative functions
- `dashboard/` - User dashboard features
- `faq/` - FAQ management
- `topics/` - Topic organization
- `students/` - Student management

## Architecture Goals:
- Clear separation of concerns
- Maintainable and scalable code structure
- Consistent patterns across domains
- Easy navigation and development workflow 