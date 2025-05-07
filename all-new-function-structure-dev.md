# Tài liệu Cấu trúc Dự án Choice E-Learning và Quy trình Phát triển

## Cấu trúc Dự án

```
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
│   ├── (marketing)/                # Route group cho marketing/landing pages
│   │   ├── about/                  # Trang giới thiệu
│   │   │   └── page.tsx
│   │   ├── pricing/                # Trang bảng giá
│   │   │   └── page.tsx
│   │   └── layout.tsx              # Layout chung cho marketing
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
│   │   ├── lessons/                # Quản lý bài học
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
│   │   │   └── [studentId]/
│   │   │       └── page.tsx
│   │   │
│   │   └── layout.tsx              # Layout chung cho admin
│   │
│   ├── api/                        # API Routes
│   │   ├── auth/                   # Authentication endpoints
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   │
│   │   ├── courses/                # Course endpoints
│   │   │   ├── route.ts
│   │   │   └── [courseId]/
│   │   │       └── route.ts
│   │   │
│   │   └── lessons/                # Lesson endpoints
│   │       ├── route.ts
│   │       └── [lessonId]/
│   │           └── route.ts
│   │
│   ├── courses/                    # Public course pages
│   │   ├── page.tsx                # Danh sách khóa học
│   │   └── [courseId]/             # Chi tiết khóa học
│   │       └── page.tsx
│   │
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Homepage
│
├── client/                         # Client-side code
│   ├── components/                 # React components
│   │   ├── admin/                  # Admin components
│   │   │   ├── AdminSidebar.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── auth/                   # Auth components
│   │   │   ├── LoginForm.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── courses/                # Course components
│   │   │   ├── CourseCard.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/                 # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── ui/                     # UI components
│   │       ├── Button.tsx
│   │       └── index.ts
│   │
│   ├── hooks/                      # React hooks
│   │   ├── auth/                   # Auth hooks
│   │   │   ├── useAuth.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── courses/                # Course hooks
│   │   │   ├── useCourses.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── learn/                  # Learn hooks
│   │   │   ├── useLesson.ts
│   │   │   └── index.ts
│   │   │
│   │   └── queries/                # React Query hooks
│   │       ├── useCourseQuery.ts
│   │       └── index.ts
│   │
│   ├── providers/                  # Context providers
│   │   ├── SessionProvider.tsx
│   │   └── index.ts
│   │
│   └── utils/                      # Client utilities
│       ├── http/                   # HTTP utilities
│       │   ├── api-client.ts
│       │   └── index.ts
│       └── index.ts
│
├── server/                         # Server-side code
│   ├── actions/                    # Next.js Server Actions
│   │   ├── auth/                   # Auth actions
│   │   │   ├── login.ts
│   │   │   └── index.ts
│   │   │
│   │   └── courses/                # Course actions
│   │       ├── createCourse.ts
│   │       └── index.ts
│   │
│   ├── api/                        # API utilities
│   │   ├── api-response.ts
│   │   └── index.ts
│   │
│   ├── auth/                       # Authentication
│   │   ├── auth-options.ts
│   │   └── index.ts
│   │
│   ├── db/                         # Database access
│   │   ├── prisma-client.ts
│   │   └── index.ts
│   │
│   ├── services/                   # Business logic services
│   │   ├── courses/                # Course services
│   │   │   ├── course-service.ts
│   │   │   └── index.ts
│   │   │
│   │   └── lessons/                # Lesson services
│   │       ├── lesson-service.ts
│   │       └── index.ts
│   │
│   └── utils/                      # Server utilities
│       ├── string-utils.ts
│       └── index.ts
│
└── shared/                         # Shared between client & server
    ├── types/                      # TypeScript types
    │   ├── courses/                # Course types
    │   │   ├── course.ts
    │   │   └── index.ts
    │   │
    │   └── lessons/                # Lesson types
    │       ├── lesson.ts
    │       └── index.ts
    │
    ├── schemas/                    # Validation schemas
    │   ├── courses/                # Course schemas
    │   │   ├── course-schema.ts
    │   │   └── index.ts
    │   │
    │   └── lessons/                # Lesson schemas
    │       ├── lesson-schema.ts
    │       └── index.ts
    │
    └── constants/                  # Shared constants
        ├── api-paths.ts
        └── index.ts
```

## Quy ước Đặt tên

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

## Quy trình Phát triển Tính năng Mới

### 1. Khởi tạo Tính năng

**Bắt đầu từ đâu:**
- Xác định loại tính năng (frontend, backend, hay full-stack)
- Xác định xem tính năng thuộc domain nào

### 2. Các bước triển khai

#### Bước 1: Định nghĩa Types
- Tạo các types trong `shared/types/[domain]/[name].ts`
- Tạo file index.ts trong thư mục con để export types
- Tuân theo Pattern #4 (Type Pattern)

#### Bước 2: Tạo Schemas (nếu cần)
- Tạo schema validation trong `shared/schemas/[domain]/[name]-schema.ts`
- Tuân theo Pattern #9 (Validation Schema Pattern)

#### Bước 3: Triển khai Backend
- **Service Layer**: Tạo file trong `server/services/[domain]/[name]-service.ts`
  - Tuân theo Pattern #3 (Service Pattern)
- **Database Access**: Cập nhật/tạo mới trong `server/db/services/[name]-service.ts` nếu cần
  - Tuân theo Pattern #16 (Database Service Pattern)
- **API Routes**: Tạo file trong `app/api/[domain]/route.ts` hoặc `app/api/[domain]/[id]/route.ts`
  - Tuân theo Pattern #7 (API Route Pattern)
- **Server Actions**: Tạo file trong `server/actions/[domain]/[name].ts` nếu dùng Server Actions
  - Tuân theo Pattern #8 (Server Actions Pattern)

#### Bước 4: Triển khai Frontend
- **Components**: Tạo file trong `client/components/[domain]/[ComponentName].tsx`
  - Tuân theo Pattern #1 (Component Pattern)
- **Hooks**: Tạo file trong `client/hooks/[domain]/use[Name].ts`
  - Tuân theo Pattern #2 (Hook Pattern)
- **Pages/Routes**: Tạo file trong `app/[domain]/page.tsx` hoặc `app/[domain]/[id]/page.tsx`
  - Tuân theo Pattern #6 (Page Component Pattern)
  - **Lưu ý**: Xác định xem trang này nên được đặt trong route group nào:
    - `(marketing)`: Cho các trang public, landing pages, giới thiệu, bảng giá...
    - `(dashboard)`: Cho các trang yêu cầu đăng nhập, liên quan đến học tập
    - `(auth)`: Cho các trang liên quan đến xác thực
    - `admin`: Cho các trang quản trị

#### Bước 5: Export và Index
- Tạo hoặc cập nhật file `index.ts` trong mỗi thư mục con để export
- Tuân theo Pattern #5 (Index File Pattern)

### 3. Kiểm tra và Đảm bảo chất lượng

- **Kiểm tra TypeScript**: Chạy `npm run type-check` để đảm bảo không có lỗi types
- **ESLint**: Chạy `npm run lint` để kiểm tra code style và lỗi

## Lưu ý Quan trọng khi Phát triển

### 1. Tuân thủ File Patterns

Mỗi loại file phải tuân theo patterns tương ứng trong 17 patterns đã định nghĩa:

- **Components**: Nên có PropTypes, khai báo types rõ ràng, props có default values
- **Hooks**: Sử dụng try/catch và xử lý errors, trả về error state
- **Services**: Tuân thủ separation of concerns, mỗi service file có một nhiệm vụ rõ ràng
- **Types & Schemas**: Khai báo đầy đủ, sử dụng Zod cho validation
- **Pages**: Sử dụng Suspense và Error Boundary

### 2. Không Quên Files Quan trọng

- Luôn tạo `index.ts` trong mỗi thư mục con để export
- Mỗi component, hook, service phải có TypeScript types rõ ràng
- Đảm bảo mỗi API route có validation đầu vào

### 3. Xử lý Lỗi và Trạng thái Tải

- Sử dụng ErrorBoundary cho components (Pattern #10)
- Hiển thị trạng thái loading cho người dùng
- Xử lý lỗi API ở cả client và server

### 4. Import/Export Nhất quán

- Sử dụng named exports thay vì default exports khi có thể
- Sử dụng alias imports từ file index
- Sử dụng đúng đường dẫn: `@/client/...`, `@/server/...`, `@/shared/...`

### 5. Vấn đề Thường Gặp và Cách Khắc phục

- **Lỗi import**: Đảm bảo đường dẫn chính xác, đặc biệt chú ý đến kebab-case vs camelCase
- **Duplicate identifier**: Export từ file index, tránh đặt tên trùng lặp
- **Missing component files**: Luôn tạo đủ bộ files cho mỗi tính năng
- **Module resolution**: Sử dụng aliases chính xác, kiểm tra cấu hình tsconfig