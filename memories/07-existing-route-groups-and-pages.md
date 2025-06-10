# Existing Route Groups and Pages

Existing route groups and pages in Choice E-Learning:

## Route Groups:
- **(auth)**: login/, signup/
- **(dashboard)**: dashboard/, my-courses/, learn/[courseId]/[lessonId]/
- **(marketing)**: roadmap/, reviews/, faq/

## Admin Routes:
- **admin/**: page.tsx, layout.tsx
- **admin/topics/**, **admin/courses/**, **admin/faqs/**, **admin/students/**, **admin/lessons/**

## API Routes:
- **api/courses/**, **api/lessons/**, **api/marketing/**, **api/dashboard/**, **api/auth/**, **api/admin/**, **api/protected-route/**

## Public Routes:
- **courses/[courseId]/**, **challenges/**

## Root Files:
- **page.tsx** (homepage)
- **layout.tsx**
- **not-found.tsx**
- **globals.css**
- **favicon.ico**

## Structure Notes:
- Route groups use parentheses: (auth), (dashboard), (marketing)
- Dynamic routes use brackets: [courseId], [lessonId]
- Admin routes are separate from grouped routes
- API routes mirror the feature organization 