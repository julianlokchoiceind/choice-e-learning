# Client Components Structure

Client components by domain: Common (LoadingState, ErrorBoundary, FeatureFlag), UI (Notification, animations, file), Admin (courses, lessons, students, topics), Auth, Courses (CourseCard, CoursesSection, EnrollButton), Dashboard (UserLoginStreak), FAQ (FAQSection), Home (sections), Layout (Header), Learn, Public (courses), Topics (TopicsFilter). All use TypeScript with proper props.

## Common Components:
- **LoadingState** - Multiple variants: page, section, table, button
- **ErrorBoundary** - Error handling wrapper
- **FeatureFlag** - Feature toggle component

## UI Components:
- **Notification** - Toast notifications
- **animations/** - Animation components
- **file/** - File handling components

## Domain Components:

### Admin:
- **courses/** - Course management components
- **lessons/** - Lesson management components
- **students/** - Student management components
- **topics/** - Topic management components

### Authentication:
- **auth/** - Login, signup, and auth-related components

### Courses:
- **CourseCard** - Individual course display
- **CoursesSection** - Course listing section
- **EnrollButton** - Course enrollment action

### Dashboard:
- **UserLoginStreak** - User login streak display

### FAQ:
- **FAQSection** - FAQ display and management

### Home:
- **sections/** - Homepage sections

### Layout:
- **Header** - Main navigation header
- Other layout components

### Learning:
- **learn/** - Learning interface components

### Public:
- **courses/** - Public course browsing components

### Topics:
- **TopicsFilter** - Topic filtering component

## Standards:
- All components use TypeScript with proper prop types
- Error handling implemented throughout
- Consistent naming conventions
- Domain-based organization 