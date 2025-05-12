# E-Learning Platform Requirements

## Project Overview
A comprehensive e-learning platform built with Next.js, featuring both robust frontend UI and backend functionality similar to Nomad Coders.

## Frontend Requirements

### Core Pages
1. **Home Page:** Modern landing page with featured courses and call-to-action elements
2. **Course Listing Page:** Grid layout with search and filtering capabilities
3. **Challenges Page:** Coding exercises and community challenges
4. **Reviews Page:** User testimonials and feedback
5. **FAQ Page:** Frequently asked questions with expandable sections
6. **Roadmap Page:** Learning path visualization
7. **Course Detail Page:** Comprehensive course information including:
   - Course banner and description
   - Instructor information
   - Lesson list and curriculum
   - Student reviews
8. **Login/Signup Page:** Authentication with multiple options
9. **User Dashboard:** Track progress and manage account
10. **Admin Dashboard:** Manage platform content and users

### Frontend Technical Stack
- **Framework:** Next.js with App Router
- **Styling:** Tailwind CSS
- **State Management:** React Query for server state, Context API/Zustand for client state
- **UI Components:** Custom components with Framer Motion animations
- **Responsive Design:** Mobile-first approach

## Backend Requirements

### Database Structure
**MongoDB Atlas** (cloud-hosted MongoDB) with Prisma ORM will be used for all data storage needs.

### MongoDB Atlas Integration
- Cloud-based database deployment
- Automatic scaling and backups
- Database monitoring and alerts
- Connection string management via environment variables
- Secure network access configuration

### Core Backend Components

#### 1. Database Models
- **User Model:** Authentication, profile, and role management
- **Course Model:** Course content, metadata, and relationships
- **Challenge Model:** Interactive coding exercises
- **Review Model:** User feedback and ratings
- **FAQ Model:** Platform documentation
- **Roadmap Model:** Learning path information

#### 2. API Routes Implementation
- Authentication endpoints
- Course management endpoints
- User progress tracking
- Challenge submission and evaluation
- Review submission and display
- Administrative functions

#### 3. Authentication System
- NextAuth.js integration
- Email/password authentication
- OAuth providers (Google, GitHub)
- Role-based access control

### Backend Technical Stack
- **Database:** MongoDB Atlas with Prisma ORM
- **Authentication:** NextAuth.js
- **File Storage:** AWS S3 or similar cloud storage
- **API Architecture:** RESTful endpoints in Next.js API routes

## Structure
src/
│
├── app/                            # Next.js App Router
│   ├── (auth)/                     # Route group cho xác thực
│   │   ├── login/                  # Trang đăng nhập
│   │   │   └── page.tsx
│   │   ├── signup/                 # Trang đăng ký
│   │   │   └── page.tsx
│   │   └── layout.tsx              # Layout chung cho phần auth
│   │
│   ├── (dashboard)/                # Route group cho người dùng đã đăng nhập
│   │   ├── dashboard/              # Trang tổng quan
│   │   │   └── page.tsx
│   │   ├── my-courses/             # Khóa học đã đăng ký
│   │   │   └── page.tsx
│   │   ├── learn/                  # Phần học tập
│   │   │   ├── [courseId]/         # Trang khóa học
│   │   │   │   ├── page.tsx
│   │   │   │   └── [lessonId]/     # Trang bài học
│   │   │   │       └── page.tsx
│   │   │   └── page.tsx            # Trang tổng quan học tập
│   │   └── layout.tsx              # Layout chung cho dashboard
│   │
│   ├── admin/                      # Admin routes
│   │   ├── courses/                # Quản lý khóa học
│   │   │   ├── page.tsx            # Danh sách khóa học
│   │   │   ├── new/                # Tạo khóa học mới
│   │   │   │   └── page.tsx
│   │   │   └── [courseId]/         # Chi tiết khóa học
│   │   │       ├── page.tsx
│   │   │       └── edit/           # Chỉnh sửa khóa học
│   │   │           └── page.tsx
│   │   │
│   │   ├── lessons/                # Quản lý bài học (mới)
│   │   │   ├── page.tsx            # Danh sách bài học
│   │   │   ├── new/                # Tạo bài học mới
│   │   │   │   └── [courseId]/     # Cho khóa học cụ thể
│   │   │   │       └── page.tsx
│   │   │   └── [lessonId]/         # Chi tiết bài học
│   │   │       ├── page.tsx
│   │   │       └── edit/           # Chỉnh sửa bài học
│   │   │           └── page.tsx
│   │   │
│   │   ├── students/               # Quản lý học viên
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [studentId]/
│   │   │       ├── page.tsx
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   │
│   │   ├── topics/                 # Quản lý chủ đề
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [topicId]/
│   │   │       ├── page.tsx
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   │
│   │   ├── faqs/                   # Quản lý FAQ
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [faqId]/
│   │   │       ├── page.tsx
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   │
│   │   ├── layout.tsx              # Layout chung cho admin
│   │   └── page.tsx                # Trang dashboard admin
│   │
│   ├── api/                        # API Routes
│   │   ├── admin/                  # Admin API endpoints
│   │   │   ├── courses/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── lessons/            # API bài học (mới)
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── students/
│   │   │   │   ├── route.ts
│   │   │   │   └── [studentId]/
│   │   │   │       └── route.ts
│   │   │   ├── topics/
│   │   │   │   ├── route.ts
│   │   │   │   └── [topicId]/
│   │   │   │       └── route.ts
│   │   │   ├── faqs/
│   │   │   │   ├── route.ts
│   │   │   │   ├── [faqId]/
│   │   │   │   │   └── route.ts
│   │   │   │   └── categories/
│   │   │   │       └── route.ts
│   │   │   └── users/
│   │   │       ├── route.ts
│   │   │       └── [userId]/
│   │   │           ├── route.ts
│   │   │           └── role/
│   │   │               └── route.ts
│   │   │
│   │   ├── auth/                   # Authentication endpoints
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts
│   │   │   ├── register/
│   │   │   │   └── route.ts
│   │   │   └── session/
│   │   │       └── route.ts
│   │   │
│   │   ├── courses/                # Public course endpoints
│   │   │   ├── route.ts
│   │   │   ├── [courseId]/
│   │   │   │   ├── route.ts
│   │   │   │   ├── enroll/
│   │   │   │   │   └── route.ts
│   │   │   │   └── lessons/
│   │   │   │       ├── route.ts
│   │   │   │       └── [lessonId]/
│   │   │   │           └── route.ts
│   │   │   └── topics/
│   │   │       └── route.ts
│   │   │
│   │   ├── faqs/                   # FAQ endpoints
│   │   │   ├── route.ts
│   │   │   └── categories/
│   │   │       └── route.ts
│   │   │
│   │   ├── topics/                 # Topics endpoints
│   │   │   └── route.ts
│   │   │
│   │   ├── upload/                 # File upload
│   │   │   └── route.ts
│   │   │
│   │   ├── userProgress/           # Learning progress
│   │   │   └── route.ts
│   │   │
│   │   ├── userStats/              # User statistics
│   │   │   └── route.ts
│   │   │
│   │   ├── achievements/           # Achievements
│   │   │   └── route.ts
│   │   │
│   │   └── users/                  # User endpoints
│   │       ├── me/
│   │       │   ├── route.ts
│   │       │   └── courses/
│   │       │       └── route.ts
│   │       └── profile/
│   │           └── route.ts
│   │
│   ├── courses/                    # Public course pages
│   │   ├── page.tsx                # Danh sách khóa học
│   │   └── [courseId]/             # Chi tiết khóa học
│   │       ├── page.tsx
│   │       └── layout.tsx
│   │
│   ├── challenges/                 # Challenges
│   │   └── page.tsx
│   │
│   ├── faq/                        # FAQ
│   │   └── page.tsx
│   │
│   ├── reviews/                    # Reviews
│   │   └── page.tsx
│   │
│   ├── roadmap/                    # Roadmap
│   │   └── page.tsx
│   │
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Homepage
│
├── client/                         # Client-side code
│   ├── components/                 # React components
│   │   ├── admin/                  # Admin components
│   │   │   ├── AdminSidebar.tsx    # Sidebar admin
│   │   │   ├── courses/            # Components quản lý khóa học
│   │   │   │   ├── CourseForm.tsx  # Form tạo/sửa khóa học
│   │   │   │   ├── CourseList.tsx  # Danh sách khóa học
│   │   │   │   ├── TopicSelector.tsx  # Chọn chủ đề
│   │   │   │   └── index.ts        # Re-export
│   │   │   │
│   │   │   ├── lessons/            # Components quản lý bài học
│   │   │   │   ├── LessonForm.tsx  # Form tạo/sửa bài học
│   │   │   │   ├── LessonList.tsx  # Danh sách bài học
│   │   │   │   └── index.ts        # Re-export
│   │   │   │
│   │   │   ├── students/           # Components quản lý học viên
│   │   │   │   ├── StudentDetail.tsx
│   │   │   │   ├── StudentForm.tsx
│   │   │   │   ├── StudentList.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── topics/             # Components quản lý chủ đề
│   │   │   │   ├── TopicForm.tsx
│   │   │   │   ├── TopicList.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── faqs/               # Components quản lý FAQ
│   │   │   │   ├── FAQForm.tsx
│   │   │   │   ├── FAQList.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── index.ts            # Re-export admin components
│   │   │
│   │   ├── auth/                   # Auth components
│   │   │   ├── LoginForm.tsx       # Form đăng nhập
│   │   │   ├── SignupForm.tsx      # Form đăng ký
│   │   │   ├── ProtectedRoute.tsx  # Bảo vệ route
│   │   │   └── index.ts
│   │   │
│   │   ├── common/                 # Common utility components
│   │   │   ├── ErrorBoundary.tsx   # Bắt lỗi
│   │   │   ├── FeatureFlag.tsx     # Feature flags
│   │   │   └── index.ts
│   │   │
│   │   ├── courses/                # Course components
│   │   │   ├── CourseCard.tsx      # Thẻ khóa học
│   │   │   ├── CourseDetail.tsx    # Chi tiết khóa học
│   │   │   ├── CoursesSection.tsx  # Section khóa học
│   │   │   ├── EnrollButton.tsx    # Nút đăng ký
│   │   │   └── index.ts
│   │   │
│   │   ├── dashboard/              # Dashboard components
│   │   │   ├── AchievementsSection.tsx
│   │   │   ├── EnrolledCoursesSection.tsx
│   │   │   ├── UserLoginStreak.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── faq/                    # FAQ components
│   │   │   ├── FAQSection.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── home/                   # Homepage components
│   │   │   ├── ClientComponents.tsx
│   │   │   ├── sections/           # Section components
│   │   │   │   ├── CTASection.tsx
│   │   │   │   ├── FeaturedCoursesSection.tsx
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── HowItWorksSection.tsx
│   │   │   │   ├── PopularCoursesSection.tsx
│   │   │   │   ├── RoadmapSection.tsx
│   │   │   │   ├── TestimonialsSection.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/                 # Layout components
│   │   │   ├── Header.tsx          # Header
│   │   │   ├── Footer.tsx          # Footer
│   │   │   ├── Sidebar.tsx         # Sidebar
│   │   │   ├── ConditionalLayout.tsx  # Layout có điều kiện
│   │   │   └── index.ts
│   │   │
│   │   ├── learn/                  # Components học tập
│   │   │   ├── LessonPlayer.tsx    # Trình phát bài học
│   │   │   ├── CourseProgress.tsx  # Tiến độ học tập
│   │   │   └── index.ts
│   │   │
│   │   ├── topics/                 # Topic components
│   │   │   ├── TopicsFilter.tsx    # Bộ lọc chủ đề
│   │   │   └── index.ts
│   │   │
│   │   ├── ui/                     # UI components
│   │   │   ├── Button.tsx          # Button component
│   │   │   ├── Card.tsx            # Card component
│   │   │   ├── Notification.tsx    # Thông báo
│   │   │   ├── animations/         # Animation components
│   │   │   │   ├── AnimationStyles.tsx
│   │   │   │   ├── CounterScript.tsx
│   │   │   │   └── index.ts
│   │   │   ├── file/               # File components
│   │   │   │   └── FileUpload.tsx  # Upload file
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts                # Re-export all components
│   │
│   ├── hooks/                      # React hooks
│   │   ├── auth/                   # Auth hooks
│   │   │   ├── useAuth.ts          # Hook xác thực
│   │   │   └── index.ts
│   │   │
│   │   ├── courses/                # Course hooks
│   │   │   ├── useCourses.ts       # Hook danh sách khóa học
│   │   │   ├── useCourse.ts        # Hook chi tiết khóa học
│   │   │   ├── useEnrollment.ts    # Hook đăng ký khóa học
│   │   │   └── index.ts
│   │   │
│   │   ├── faq/                    # FAQ hooks
│   │   │   ├── useFAQs.ts          # Hook FAQ
│   │   │   └── index.ts
│   │   │
│   │   ├── learn/                  # Learn hooks
│   │   │   ├── useLesson.ts        # Hook bài học
│   │   │   ├── useProgress.ts      # Hook tiến độ
│   │   │   └── index.ts
│   │   │
│   │   ├── queries/                # React Query hooks
│   │   │   ├── courses/            # Query cho courses
│   │   │   │   ├── useCoursesQuery.ts
│   │   │   │   ├── useCourseQuery.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── students/               # Student hooks
│   │   │   ├── useStudents.ts      # Hook học viên
│   │   │   └── index.ts
│   │   │
│   │   ├── topics/                 # Topic hooks
│   │   │   ├── useTopics.ts        # Hook chủ đề
│   │   │   └── index.ts
│   │   │
│   │   ├── user/                   # User hooks
│   │   │   ├── useUserState.ts     # Hook trạng thái người dùng
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts                # Re-export all hooks
│   │
│   ├── providers/                  # Context providers
│   │   ├── SessionProvider.tsx     # Provider phiên đăng nhập
│   │   ├── QueryProvider.tsx       # Provider React Query
│   │   └── index.ts
│   │
│   └── utils/                      # Client utilities
│       ├── http/                   # HTTP utilities
│       │   ├── api-client.ts       # API client
│       │   └── index.ts
│       └── index.ts
│
├── server/                         # Server-side code
│   ├── actions/                    # Next.js Server Actions
│   │   ├── auth/                   # Auth actions
│   │   │   ├── login.ts            # Đăng nhập
│   │   │   ├── register.ts         # Đăng ký
│   │   │   └── index.ts
│   │   │
│   │   ├── courses/                # Course actions
│   │   │   ├── createCourse.ts     # Tạo khóa học
│   │   │   ├── updateCourse.ts     # Cập nhật khóa học
│   │   │   ├── enrollCourse.ts     # Đăng ký khóa học
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── api/                        # API utilities
│   │   ├── api-docs.ts             # API docs
│   │   ├── api-error-codes.ts      # Mã lỗi API
│   │   ├── api-response.ts         # Format phản hồi API
│   │   ├── request-parser.ts       # Parser request
│   │   ├── route-handlers.ts       # Xử lý route
│   │   └── index.ts
│   │
│   ├── auth/                       # Authentication
│   │   ├── auth-middleware.ts      # Middleware xác thực
│   │   ├── auth-options.ts         # Tùy chọn xác thực
│   │   ├── middleware.ts           # Middleware
│   │   ├── roles.ts                # Vai trò
│   │   ├── session.ts              # Session
│   │   ├── services/               # Dịch vụ xác thực
│   │   │   ├── auth-service.ts     # Dịch vụ xác thực
│   │   │   └── index.ts
│   │   ├── utils/                  # Tiện ích xác thực
│   │   │   ├── auth-errors.ts      # Lỗi xác thực
│   │   │   ├── password-utils.ts   # Tiện ích mật khẩu
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── db/                         # Database access
│   │   ├── prisma-client.ts        # Prisma client
│   │   ├── prisma-helper.ts        # Trợ giúp Prisma
│   │   ├── bootstrap.ts            # Khởi tạo DB
│   │   ├── services/               # Dịch vụ DB
│   │   │   ├── course-service.ts   # Dịch vụ khóa học DB
│   │   │   ├── lesson-service.ts   # Dịch vụ bài học DB
│   │   │   ├── user-service.ts     # Dịch vụ người dùng DB
│   │   │   ├── db-service.ts       # Dịch vụ DB chung
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── services/                   # Business logic services
│   │   ├── achievements/           # Dịch vụ thành tựu
│   │   │   ├── achievement-service.ts  # Dịch vụ thành tựu
│   │   │   └── index.ts
│   │   │
│   │   ├── courses/                # Dịch vụ khóa học
│   │   │   ├── course-service.ts   # Dịch vụ khóa học
│   │   │   └── index.ts
│   │   │
│   │   ├── faq/                    # Dịch vụ FAQ
│   │   │   ├── faq-service.ts      # Dịch vụ FAQ
│   │   │   └── index.ts
│   │   │
│   │   ├── file/                   # Dịch vụ file
│   │   │   ├── file-upload-service.ts  # Dịch vụ upload file
│   │   │   └── index.ts
│   │   │
│   │   ├── lessons/                # Dịch vụ bài học
│   │   │   ├── lesson-service.ts   # Dịch vụ bài học
│   │   │   └── index.ts
│   │   │
│   │   ├── students/               # Dịch vụ học viên
│   │   │   ├── student-service.ts  # Dịch vụ học viên
│   │   │   └── index.ts
│   │   │
│   │   ├── topics/                 # Dịch vụ chủ đề
│   │   │   ├── topic-service.ts    # Dịch vụ chủ đề
│   │   │   └── index.ts
│   │   │
│   │   ├── user/                   # Dịch vụ người dùng
│   │   │   ├── login-streak-service.ts  # Dịch vụ đăng nhập liên tục
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts
│   │
│   └── utils/                      # Server utilities
│       ├── data/                   # Tiện ích dữ liệu
│       │   ├── pagination.ts       # Phân trang
│       │   ├── validation.ts       # Xác thực dữ liệu
│       │   └── index.ts
│       │
│       ├── file/                   # Tiện ích file
│       │   ├── file-upload.ts      # Upload file
│       │   └── index.ts
│       │
│       ├── text/                   # Tiện ích văn bản
│       │   ├── text-formatter.ts   # Định dạng văn bản
│       │   └── index.ts
│       │
│       ├── role-mapper.ts          # Mapper vai trò
│       ├── string-utils.ts         # Tiện ích chuỗi
│       └── index.ts
│
├── shared/                         # Shared between client & server
│   ├── types/                      # TypeScript types
│   │   ├── achievement/            # Types thành tựu
│   │   │   └── index.ts
│   │   │
│   │   ├── api/                    # Types API
│   │   │   ├── api.ts              # Types API chung
│   │   │   └── index.ts
│   │   │
│   │   ├── auth/                   # Types xác thực
│   │   │   ├── roles.ts            # Types vai trò
│   │   │   ├── session.ts          # Types phiên
│   │   │   └── index.ts
│   │   │
│   │   ├── common/                 # Types chung
│   │   │   ├── pagination.ts       # Types phân trang
│   │   │   └── index.ts
│   │   │
│   │   ├── courses/                # Types khóa học
│   │   │   ├── course.ts           # Interface khóa học
│   │   │   └── index.ts
│   │   │
│   │   ├── faq/                    # Types FAQ
│   │   │   ├── faq.ts              # Interface FAQ
│   │   │   └── index.ts
│   │   │
│   │   ├── files/                  # Types file
│   │   │   └── index.ts
│   │   │
│   │   ├── lessons/                # Types bài học
│   │   │   ├── lesson.ts           # Interface bài học
│   │   │   └── index.ts
│   │   │
│   │   ├── progress/               # Types tiến độ
│   │   │   ├── user-progress.ts    # Interface tiến độ người dùng
│   │   │   └── index.ts
│   │   │
│   │   ├── students/               # Types học viên
│   │   │   ├── student.ts          # Interface học viên
│   │   │   └── index.ts
│   │   │
│   │   ├── topics/                 # Types chủ đề
│   │   │   ├── topics.ts           # Interface chủ đề
│   │   │   └── index.ts
│   │   │
│   │   ├── user/                   # Types người dùng
│   │   │   ├── user.ts             # Interface người dùng
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts                # Re-export all types
│   │
│   ├── schemas/                    # Validation schemas
│   │   ├── auth/                   # Schemas xác thực
│   │   │   ├── login-schema.ts     # Schema đăng nhập
│   │   │   ├── register-schema.ts  # Schema đăng ký
│   │   │   └── index.ts
│   │   │
│   │   ├── courses/                # Schemas khóa học
│   │   │   ├── course-schema.ts    # Schema khóa học
│   │   │   └── index.ts
│   │   │
│   │   ├── faq/                    # Schemas FAQ
│   │   │   ├── faq-schema.ts       # Schema FAQ
│   │   │   └── index.ts
│   │   │
│   │   ├── lessons/                # Schemas bài học
│   │   │   ├── lesson-schema.ts    # Schema bài học
│   │   │   └── index.ts
│   │   │
│   │   ├── students/               # Schemas học viên
│   │   │   ├── student-schema.ts   # Schema học viên
│   │   │   └── index.ts
│   │   │
│   │   ├── topics/                 # Schemas chủ đề
│   │   │   ├── topic-schema.ts     # Schema chủ đề
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts                # Re-export all schemas
│   │
│   ├── config/                     # Configurations
│   │   ├── auth.ts                 # Cấu hình xác thực
│   │   ├── database.ts             # Cấu hình database
│   │   ├── feature-flags.ts        # Cấu hình feature flags
│   │   ├── storage.ts              # Cấu hình lưu trữ
│   │   └── index.ts
│   │
│   └── constants/                  # Shared constants
│       ├── api-paths.ts            # Đường dẫn API
│       ├── route-paths.ts          # Đường dẫn route
│       └── index.ts
│
├── styles/                         # Global styles
│   ├── animations.css              # Styles animation
│   ├── transitions.css             # Styles transition
│   └── index.css                   # Re-export all styles
│
└── middleware.ts                   # Next.js middleware

## MongoDB Atlas Configuration
- Create MongoDB Atlas account and project
- Set up cluster with appropriate tier (start with free tier for development)
- Configure network access (IP whitelisting)
- Create database user with appropriate permissions
- Obtain connection string for application
- Configure environment variables in Next.js application
- Set up database indexes for performance optimization

## Security Requirements
- Input validation for all endpoints
- Protection against common vulnerabilities
- Secure storage of sensitive data
- HTTPS enforcement
- MongoDB Atlas network security configuration
- Environment variable management for database credentials


