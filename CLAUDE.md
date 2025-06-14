# Claude Development Guidelines for Choice E-Learning

## CRITICAL RULE - MUST READ FIRST
**ALWAYS read and follow ALL rules in memory (both global CLAUDE.md and project CLAUDE.md) BEFORE handling any errors or developing any features. This is the HIGHEST PRIORITY rule.**

## Project Overview

This is a **Choice E-Learning Platform** - a comprehensive Next.js-based education platform with course management, student tracking, and admin functionality.

## Architecture & Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **UI Components**: Heroicons, custom components
- **Deployment**: Vercel

## Development Standards

### Code Quality & Patterns

1. **TypeScript First**
   - All new files must be TypeScript (.ts/.tsx)
   - Use strict typing, avoid `any` unless absolutely necessary
   - Define interfaces for all data structures

2. **Component Architecture**
   - Use functional components with hooks
   - Implement proper separation of concerns
   - Follow the established folder structure under `/src/client/components/`

3. **API Routes**
   - Use Next.js App Router API routes (`/src/app/api/`)
   - Implement proper error handling with standardized responses
   - Use Prisma for database operations
   - Follow RESTful conventions

### File Structure & Organization

```
src/
├── app/                    # Next.js App Router pages
├── client/                 # Client-side code
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── providers/         # Context providers
│   └── utils/             # Client utilities
├── server/                 # Server-side code
│   ├── api/               # API utilities
│   ├── auth/              # Authentication logic
│   ├── db/                # Database services
│   └── services/          # Business logic services
└── shared/                 # Shared utilities and types
    ├── types/             # TypeScript interfaces
    ├── schemas/           # Zod validation schemas
    ├── constants/         # Application constants
    └── utils/             # Shared utilities
```

### Naming Conventions

| Item Type | Convention | Example |
|-----------|------------|---------|
| Route directories in app/ | kebab-case | `forgot-password/` |
| Route group directories | (camelCase) | `(auth)/` |
| Dynamic route directories | [camelCase] | `[userId]/` |
| Source code directories | camelCase | `components/` |
| Domain directories | camelCase | `courses/` |
| Component files | PascalCase | `Button.tsx` |
| API route files | route.ts | `route.ts` |
| Page files | page.tsx | `page.tsx` |
| Hook files | camelCase (prefix use) | `useAuth.ts` |
| Type files | camelCase | `user.ts` |
| Schema files | kebab-case | `login-schema.ts` |
| Service files | kebab-case | `course-service.ts` |
| Utility files | kebab-case | `date-formatter.ts` |
| Index files | index.ts | `index.ts` |
| Constant files | kebab-case | `api-paths.ts` |
| Server Action files | camelCase | `login.ts` |
| Variables/Functions | camelCase | `handleSubmit` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_PATH` |
| Types/Interfaces | PascalCase | `CourseListItem` |

### React Query Usage

- Use custom hooks for API operations (e.g., `useCoursesQuery`)
- Implement proper caching strategies with query keys
- Use mutations for data modifications with optimistic updates
- Include toast notifications via mutation `meta` properties

### Database & API Guidelines

1. **Prisma Operations**
   - Use transactions for complex operations
   - Implement proper error handling
   - Use the established service layer pattern

2. **API Responses**
   - Follow standardized response format:
     ```typescript
     {
       success: boolean;
       data?: any;
       error?: string;
       meta?: PaginationMeta;
     }
     ```

3. **Validation**
   - Use Zod schemas for input validation
   - Validate on both client and server sides

### UI/UX Standards

1. **Design System**
   - Use global CSS classes in `globals.css` for consistency
   - Follow established color scheme (blue gradients)
   - Use standardized button classes (`btn-admin-primary`, etc.)

2. **Admin Interface**
   - Maintain consistent table layouts with STT columns
   - Use LoadingState component for loading states
   - Implement proper pagination with dynamic numbering

3. **Responsive Design**
   - Mobile-first approach
   - Use Tailwind responsive utilities
   - Test on multiple screen sizes

### Security Guidelines

1. **Authentication**
   - Use NextAuth.js for session management
   - Implement role-based access control (RBAC)
   - Protect admin routes with middleware

2. **Data Validation**
   - Never trust client input
   - Sanitize data before database operations
   - Use parameterized queries (Prisma handles this)

## Feature Development Process

### 1. Domain-Driven Development

#### 1.1. Identify Domain
- Determine which domain the feature belongs to (courses, lessons, auth, etc.)
- Check existing domain structure for consistency
- Follow established patterns within that domain

#### 1.2. Development Steps (Follow this order)

**Step 1: Define Types**
- Create types in `shared/types/[domain]/[name].ts`
- Create index.ts in subdirectory to export types
- Use proper TypeScript interfaces and types

**Step 2: Create Schemas (if needed)**
- Create validation schemas in `shared/schemas/[domain]/[name]-schema.ts`
- Use Zod for robust validation
- Include both client and server validation

**Step 3: Backend Implementation**
- **Service Layer**: Create in `server/services/[domain]/[name]-service.ts`
  - Follow separation of concerns principle
  - Each service file should have one clear responsibility
- **Database Access**: Update/create in `server/db/services/[name]-service.ts` if needed
- **API Routes**: Create in `app/api/[domain]/route.ts` or `app/api/[domain]/[id]/route.ts`
- **Server Actions**: Create in `server/actions/[domain]/[name].ts` if using Server Actions

**Step 4: Frontend Implementation**
- **Components**: Create in `client/components/[domain]/[ComponentName].tsx`
- **Hooks**: Create in `client/hooks/[domain]/use[Name].ts`
- **Pages/Routes**: Create in appropriate route group:
  - `(marketing)`: Public pages, landing pages, pricing, etc.
  - `(dashboard)`: Pages requiring login, learning-related pages
  - `(auth)`: Authentication-related pages
  - `admin`: Administrative pages

**Step 5: Export and Index**
- Create or update `index.ts` files in each subdirectory
- Use named exports instead of default exports when possible
- Always use alias imports (`@/client/...`, `@/server/...`, `@/shared/...`)

### 2. Domain Organization Principles

```
src/
├── client/components/{domain}/          # React components for domain
├── client/hooks/{domain}/               # Custom hooks for domain  
├── server/services/{domain}/            # Business logic
├── shared/types/{domain}/               # TypeScript types
├── shared/schemas/{domain}/             # Validation schemas
└── app/api/{domain}/                    # API endpoints
```

### 3. Quality Assurance Rules

- **TypeScript**: Run `npm run type-check` to ensure no type errors
- **ESLint**: Run `npm run lint` for code style and error checking
- **Components**: Must have PropTypes, clear type declarations, default values
- **Hooks**: Use try/catch and error handling, return error states
- **Services**: Follow separation of concerns, single responsibility
- **Pages**: Use Suspense and Error Boundary components

### 4. Import/Export Guidelines

- **Priority**: Always use alias imports (`@/client/`, `@/server/`, `@/shared/`)
- **Exports**: Prefer named exports over default exports
- **Index Files**: Use for exporting from directories, avoid complex logic
- **Module Resolution**: Check tsconfig for correct alias configuration

### 5. Domain-Driven Design (DDD) Principles

- Limit deeply nested folder structures (max 3-4 levels)
- Organize by domain/feature, not technical layers
- Each file should have single, clear responsibility
- Group related files in same domain directory
- Keep index.ts files simple for exports only

## Development Workflow

### Testing Commands
```bash
npm run lint          # ESLint check
npm run typecheck     # TypeScript check
npm run build         # Production build
npm run dev           # Development server
```

### Database Commands
```bash
npx prisma migrate dev     # Run migrations
npx prisma generate        # Generate client
npx prisma studio          # Database GUI
```

### Git Workflow
- Use conventional commits
- Include `🤖 Generated with Claude Code` in commit messages when appropriate
- Co-Author credit: `Co-Authored-By: Claude <noreply@anthropic.com>`

## Common Patterns

### API Hook Pattern
```typescript
const useEntityQuery = () => {
  const apiRequest = useApiRequest();
  
  const useGetEntities = (filter: EntityFilter) => {
    return useQuery({
      queryKey: ['entities', filter],
      queryFn: () => apiRequest.get('/api/entities', filter)
    });
  };
  
  const useCreateEntity = () => {
    return useMutation({
      mutationFn: (data) => apiRequest.post('/api/entities', data),
      meta: {
        successToast: 'Entity created successfully',
        errorToast: 'Failed to create entity'
      }
    });
  };
  
  return { useGetEntities, useCreateEntity };
};
```

### Admin Table Pattern
- Include STT column with dynamic numbering based on sort order
- Use consistent loading states with LoadingState component
- Implement proper pagination with totalPages > 1 check
- Include action columns with edit/delete functionality

### Form Handling Pattern
- Use controlled components
- Implement client-side validation with Zod
- Use React Query mutations for submissions
- Show loading states during form submission

## Performance Optimization

1. **Image Handling**
   - Use Next.js Image component with proper sizing
   - Implement `object-cover` for consistent display
   - Use placeholder images for missing content

2. **Code Splitting**
   - Use dynamic imports for heavy components
   - Implement proper loading boundaries

3. **Caching**
   - Leverage React Query caching
   - Use appropriate stale times for different data types

## Error Handling

1. **Client-side**
   - Use Error Boundaries for component errors
   - Display user-friendly error messages
   - Log errors for debugging

2. **Server-side**
   - Return standardized error responses
   - Log errors with context
   - Handle database connection issues gracefully

## Accessibility

- Use semantic HTML elements
- Include proper ARIA labels
- Ensure keyboard navigation works
- Test with screen readers when possible

## Best Practices Checklist

- [ ] TypeScript interfaces defined
- [ ] Zod validation schemas implemented
- [ ] React Query hooks used for API calls
- [ ] Loading states implemented
- [ ] Error handling in place
- [ ] Responsive design tested
- [ ] Accessibility considerations
- [ ] Performance optimized
- [ ] Security validated
- [ ] Code formatted and linted

## Troubleshooting

### Common Issues
1. **Hydration Errors**: Check for client/server state mismatches
2. **Database Connection**: Verify Prisma client setup
3. **Authentication Issues**: Check NextAuth configuration
4. **Build Errors**: Run typecheck and lint before building
5. **Import Errors**: Ensure correct paths, check kebab-case vs camelCase
6. **Duplicate Identifier**: Export from index files, avoid naming conflicts
7. **Missing Component Files**: Always create complete file sets for each feature
8. **Module Resolution**: Use aliases correctly, check tsconfig configuration

### Development Anti-Patterns to Avoid

- Creating excessive nested folder structures (>4 levels)
- Organizing by technical layer instead of domain
- Missing index.ts exports in domain directories
- Using relative imports instead of alias imports
- Mixing naming conventions within the same domain
- Complex logic in index.ts files
- Missing TypeScript types or schemas
- Lack of error boundaries and loading states

### Quick Fix Checklist

- [ ] All TypeScript types defined and exported
- [ ] Zod schemas for validation implemented
- [ ] index.ts files created for exports
- [ ] Alias imports used consistently (@/client/, @/server/, @/shared/)
- [ ] Named exports preferred over default exports
- [ ] Error handling implemented in hooks and services
- [ ] Loading states added to UI components
- [ ] Domain organization followed
- [ ] Single responsibility principle maintained
- [ ] Code formatted and linted

Remember: Always prioritize user experience, security, and maintainability in your development decisions.