# E-Learning Platform Backend Requirements

## Project Overview
This document outlines the backend requirements for our Next.js e-learning platform. The frontend UI is already developed, and we need to implement the backend functionality according to the structure below.

## Backend Structure
```
/src
  /app
    /api
      /auth
        /[...nextauth]
          route.ts         # Authentication routes
      /courses
        route.ts           # GET: list courses, POST: create course
        /[id]
          route.ts         # GET, PUT, DELETE for single course
      /challenges
        route.ts           # GET: list challenges, POST: create challenge
        /[id]
          route.ts         # GET, PUT, DELETE for single challenge
      /reviews
        route.ts           # GET: list reviews, POST: create review
        /[id]
          route.ts         # GET, PUT, DELETE for single review
      /faq
        route.ts           # GET: list FAQs, POST: create FAQ
      /roadmap
        route.ts           # GET: fetch roadmap data, POST: update roadmap
      /admin
        /courses
          route.ts         # Admin course management
        /challenges
          route.ts         # Admin challenge management
        /users
          route.ts         # Admin user management

  /lib
    /db
      index.ts             # Database connection
      schema.prisma        # Prisma schema definitions
    /auth
      auth-options.ts      # NextAuth.js configuration
      session.ts           # Session management
      middleware.ts        # Auth middleware

  /services
    user-service.ts        # User-related business logic
    course-service.ts      # Course-related business logic
    challenge-service.ts   # Challenge-related business logic
    review-service.ts      # Review-related business logic
    faq-service.ts         # FAQ-related business logic
    roadmap-service.ts     # Roadmap-related business logic

  /types
    index.ts               # Type exports
    user.ts                # User-related types
    course.ts              # Course-related types
    challenge.ts           # Challenge-related types
    review.ts              # Review-related types
    faq.ts                 # FAQ-related types
    roadmap.ts             # Roadmap-related types

  /utils
    validation.ts          # Input validation helpers
    auth-utils.ts          # Authentication helpers
    pagination.ts          # Pagination helpers
    file-upload.ts         # File upload utilities

  /config
    database.ts            # Database configuration
    auth.ts                # Auth configuration
    storage.ts             # Storage configuration

  /middleware
    index.ts               # Global middleware
```

## Technology Stack
- **Framework**: Next.js with App Router
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js
- **File Storage**: AWS S3 or similar cloud storage

## Implementation Requirements

### 1. Database Models

#### User Model
```typescript
// Required fields for User model
- id: string
- name: string
- email: string
- password: string (hashed)
- role: enum ('student', 'instructor', 'admin')
- createdAt: Date
- updatedAt: Date
```

#### Course Model
```typescript
// Required fields for Course model
- id: string
- title: string
- description: string
- instructorId: string (ref: User)
- price: number
- imageUrl: string
- level: enum ('beginner', 'intermediate', 'advanced')
- topics: string[]
- lessons: Lesson[] (sub-document or relation)
- createdAt: Date
- updatedAt: Date
```

#### Challenge Model
```typescript
// Required fields for Challenge model
- id: string
- title: string
- description: string
- difficulty: enum ('easy', 'medium', 'hard')
- startDate: Date
- endDate: Date
- submissions: Submission[] (sub-document or relation)
- createdAt: Date
- updatedAt: Date
```

#### Review Model
```typescript
// Required fields for Review model
- id: string
- userId: string (ref: User)
- courseId: string (ref: Course)
- rating: number (1-5)
- comment: string
- createdAt: Date
- updatedAt: Date
```

#### FAQ Model
```typescript
// Required fields for FAQ model
- id: string
- question: string
- answer: string
- category: string
- createdAt: Date
- updatedAt: Date
```

#### Roadmap Model
```typescript
// Required fields for Roadmap model
- id: string
- title: string
- description: string
- steps: RoadmapStep[] (sub-document)
- createdAt: Date
- updatedAt: Date
```

### 2. API Routes Implementation

For each endpoint, implement:
- Data validation
- Authentication/authorization checks
- Error handling
- Success responses

### 3. Authentication Requirements
- Secure password hashing
- JWT token-based authentication
- Role-based access control
- Protected routes for admin and authenticated users

### 4. Implementation Order
1. Set up database connection and schema
2. Implement authentication system
3. Create course-related functionality
4. Add challenge system
5. Implement reviews functionality
6. Add FAQ and roadmap features
7. Develop admin functionality

## Testing Requirements
Each API endpoint should include appropriate tests.

## Security Requirements
- Input validation for all endpoints
- Protection against common vulnerabilities (CSRF, XSS)
- Secure storage of sensitive data