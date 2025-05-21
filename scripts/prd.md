# PRD: Triển khai React Query và Nâng cấp Loading State

## 1. Mục tiêu

1. Nâng cấp LoadingState component với nhiều variants
2. Chuyển toàn bộ dự án sang React Query
3. Cài đặt react-hot-toast cho hệ thống notifications
4. Chuẩn hóa cách xử lý loading state trong UI

## 2. Phân tích Codebase và Phạm vi Cập nhật

### 2.1. Cấu trúc Dự án Hiện tại

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group cho auth
│   ├── (dashboard)/              # Route group cho dashboard
│   ├── (marketing)/              # Route group cho marketing
│   ├── admin/                    # Admin routes
│   ├── api/                      # API Routes
│   ├── courses/                  # Public courses pages
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global CSS
├── client/                       # Client-side code
│   ├── components/               # React components
│   ├── hooks/                    # Custom hooks
│   ├── providers/                # Context providers
│   └── utils/                    # Client utilities
├── server/                       # Server-side code
└── shared/                       # Shared code
```

### 2.2. Các Phần Cần Cập nhật

#### 2.2.1. Cài đặt Packages Mới
- Thêm dependencies trong `package.json`:
  - @tanstack/react-query
  - @tanstack/react-query-devtools
  - react-hot-toast

#### 2.2.2. Components Cần Thay Đổi
- `src/client/components/common/LoadingState.tsx` - Cập nhật với nhiều variants

#### 2.2.3. Providers Cần Thêm Mới
- `src/client/providers/ReactQueryProvider.tsx` - Provider cho React Query
- `src/client/providers/ToastProvider.tsx` - Provider cho react-hot-toast

#### 2.2.4. Hooks Cần Chuyển Đổi Sang React Query
- Custom hooks hiện tại:
  - `src/client/hooks/courses/useCourses.ts`
  - `src/client/hooks/topics/useTopics.ts`
  - `src/client/hooks/faq/useFAQs.ts`
  - `src/client/hooks/learn/useLesson.ts`
  - `src/client/hooks/students/useStudents.ts`
  - `src/client/hooks/auth/useAuth.ts`
  - `src/client/hooks/user/useUserState.ts`
  - `src/client/hooks/common/useApiRequest.ts`

#### 2.2.5. CSS Variables 
- Cập nhật `src/app/globals.css` với biến `--spinner-color`

## 3. Chi tiết Triển khai

### 3.1. LoadingState Component

**Đường dẫn:** `src/client/components/common/LoadingState.tsx`

**Mô tả:** Thay thế hoàn toàn component hiện tại với phiên bản mới hỗ trợ nhiều variants.

**Code triển khai:**
```typescript
'use client';

import React from 'react';

// Định nghĩa các variants
type LoadingVariant = 'default' | 'page' | 'table' | 'section' | 'button';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  inline?: boolean;
  fullPage?: boolean;
  className?: string;
  variant?: LoadingVariant;
  colSpan?: number; 
  spinnerColor?: string;
}

export const LoadingState = ({ 
  message = 'Loading...', 
  size,
  inline,
  fullPage,
  className = '',
  variant = 'default',
  colSpan = 1,
  spinnerColor
}: LoadingStateProps) => {
  // Xác định settings dựa trên variant
  const variantSettings = {
    default: {
      size: size || 'medium',
      inline: inline || false,
      fullPage: fullPage || false,
      containerClasses: className
    },
    page: {
      size: size || 'large',
      inline: inline || false,
      fullPage: fullPage || true,
      containerClasses: `flex justify-center items-center h-screen ${className}`
    },
    table: {
      size: size || 'medium',
      inline: inline || false,
      fullPage: fullPage || false,
      containerClasses: `py-10 text-center ${className}`
    },
    section: {
      size: size || 'medium',
      inline: inline || false,
      fullPage: fullPage || false,
      containerClasses: `flex justify-center items-center h-40 ${className}`
    },
    button: {
      size: size || 'small',
      inline: inline || true,
      fullPage: fullPage || false,
      containerClasses: `inline-flex items-center ${className}`
    }
  };
  
  // Lấy settings dựa trên variant
  const settings = variantSettings[variant];
  
  // Xác định kích thước
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-4',
    large: 'w-12 h-12 border-4'
  };

  // Xác định style cho spinner (dùng CSS variable hoặc giá trị cụ thể)
  const spinnerStyle = {
    borderTopColor: spinnerColor || (variant === 'button' ? 'currentColor' : 'var(--spinner-color)')
  };

  // Nếu là variant table, chỉ render nội dung loading 
  if (variant === 'table') {
    return (
      <div className="flex flex-col items-center justify-center py-6 w-full">
        <div 
          className={`${sizeClasses[settings.size]} border-gray-200 rounded-full animate-spin`}
          style={spinnerStyle}
        ></div>
        {message && (
          <p className='mt-2 text-gray-600'>{message}</p>
        )}
      </div>
    );
  }
  
  // Tạo container classes
  const containerClasses = `
    ${settings.inline ? 'inline-flex items-center' : 'flex flex-col items-center justify-center'} 
    ${settings.fullPage ? 'fixed inset-0 z-50 bg-white/80' : ''} 
    ${!settings.inline ? 'p-4' : ''} 
    ${settings.containerClasses}
  `;

  // Đặc biệt xử lý cho trường hợp nút (dùng currentColor và kích thước nhỏ hơn)
  if (variant === 'button') {
    return (
      <div className={containerClasses}>
        <div 
          className={`${sizeClasses[settings.size]} mr-2 border-gray-200 rounded-full animate-spin`}
          style={spinnerStyle}
        ></div>
        {message && (
          <span>{message}</span> // Dùng span thay vì p để tốt hơn trong button
        )}
      </div>
    );
  }

  // Render cho các variants khác
  return (
    <div className={containerClasses}>
      <div 
        className={`${sizeClasses[settings.size]} border-gray-200 rounded-full animate-spin`}
        style={spinnerStyle}
      ></div>
      {message && (
        <p className={`${settings.inline ? 'ml-2' : 'mt-2'} text-gray-600`}>{message}</p>
      )}
    </div>
  );
};

export default LoadingState;
```

### 3.2. CSS Variables

**Đường dẫn:** `src/app/globals.css`

**Mô tả:** Thêm biến CSS `--spinner-color` vào block `:root` đã có.

```css
/* Thêm vào block :root đã có, KHÔNG thay đổi các biến sẵn có */
:root {
  /* Các biến hiện tại giữ nguyên... */
  
  /* Biến mới cho spinner */
  --spinner-color: var(--color-primary); /* Sử dụng màu primary đã có */
}
```

### 3.3. React Query Provider

**Đường dẫn:** `src/client/providers/ReactQueryProvider.tsx` (file mới)

**Mô tả:** Tạo provider cho React Query với các cấu hình mặc định.

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';

export default function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 3.4. Toast Provider

**Đường dẫn:** `src/client/providers/ToastProvider.tsx` (file mới)

**Mô tả:** Tạo provider cho React Hot Toast.

```typescript
'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}
```

### 3.5. useToast Hook

**Đường dẫn:** `src/client/hooks/common/useToast.ts` (file mới)

**Mô tả:** Tạo custom hook để sử dụng Toast notifications.

```typescript
'use client';

import toast, { Toast, ToastOptions } from 'react-hot-toast';

export type NotificationType = 'success' | 'error' | 'info' | 'loading';

export interface NotificationProps {
  message: string;
  details?: string;
  duration?: number;
}

export function useToast() {
  const showNotification = (
    type: NotificationType,
    message: string,
    options?: Omit<NotificationProps, 'message'>
  ): string => {
    const defaultOptions: ToastOptions = {
      duration: options?.duration || 3000,
    };

    // Handle details with custom rendering
    const content = options?.details
      ? (
        <div>
          <p className="font-medium">{message}</p>
          <p className="text-sm opacity-90">{options.details}</p>
        </div>
      )
      : message;

    switch (type) {
      case 'success':
        return toast.success(content, defaultOptions);
      case 'error':
        return toast.error(content, defaultOptions);
      case 'loading':
        return toast.loading(content, defaultOptions);
      case 'info':
      default:
        return toast(content, defaultOptions);
    }
  };

  const dismissNotification = (id: string) => {
    toast.dismiss(id);
  };

  const dismissAll = () => {
    toast.dismiss();
  };

  return {
    success: (message: string, options?: Omit<NotificationProps, 'message'>) => 
      showNotification('success', message, options),
    error: (message: string, options?: Omit<NotificationProps, 'message'>) => 
      showNotification('error', message, options),
    info: (message: string, options?: Omit<NotificationProps, 'message'>) => 
      showNotification('info', message, options),
    loading: (message: string, options?: Omit<NotificationProps, 'message'>) => 
      showNotification('loading', message, options),
    dismiss: dismissNotification,
    dismissAll,
  };
}
```

### 3.6. Cập nhật Root Layout

**Đường dẫn:** `src/app/layout.tsx`

**Mô tả:** Bọc ứng dụng trong ReactQueryProvider và ToastProvider.

```typescript
import { Inter } from 'next/font/google';
import './globals.css';
import ConditionalLayout from '@/client/components/layout/ConditionalLayout';
import { AuthSessionProvider } from '@/client/providers';
import ReactQueryProvider from '@/client/providers/ReactQueryProvider';
import { ToastProvider } from '@/client/providers/ToastProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Choice E-Learning',
  description: 'Online learning platform for everyone',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={`${inter.className} ${inter.variable} font-sans bg-slate-50 text-slate-900`}>
        <ReactQueryProvider>
          <AuthSessionProvider>
            <ToastProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </ToastProvider>
          </AuthSessionProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
```

### 3.7. Hooks pattern mẫu - useCoursesQuery

**Đường dẫn:** `src/client/hooks/courses/useCoursesQuery.ts` (file mới)

**Mô tả:** Pattern này sẽ áp dụng cho tất cả domain hooks - ví dụ với courses.

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/client/hooks/common/useToast';
import { Course, CourseListItem, CourseStatus } from '@/shared/types/courses/course';
import { formatCourseTitle } from '@/shared/utils/courses';

// Lấy lại hàm utility từ hook cũ
function normalizeStatus(course: any) {
  // Logic từ hook cũ giữ nguyên
}

interface CourseFilter {
  search?: string;
  category?: string;
  topics?: string[];
  level?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  _cache?: number;
}

export function useCoursesQuery(isAdmin = false) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const baseUrl = isAdmin ? '/api/admin/courses' : '/api/courses';
  
  // Fetch courses list with filters
  const getCourses = (filters: CourseFilter = {}) => {
    // Build query string
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    // ... setup other params
    
    return useQuery({
      queryKey: ['courses', filters],
      queryFn: async () => {
        try {
          const response = await axios.get(`${baseUrl}?${params.toString()}`);
          
          if (response.data.success) {
            // Process data similar to the original hook
            const coursesData = response.data.courses || 
                              (Array.isArray(response.data.data) ? response.data.data : []);
            
            // Apply transformations
            const processedCourses = coursesData.map(course => {
              const normalizedCourse = normalizeStatus(course);
              return {
                ...normalizedCourse,
                displayTitle: formatCourseTitle(normalizedCourse.title || ''),
                imageUrl: normalizedCourse.imageUrl ? `${normalizedCourse.imageUrl}?t=${Date.now()}` : '/images/courses/course-placeholder.jpg'
              };
            });
            
            return {
              courses: processedCourses,
              pagination: response.data.meta?.pagination || {
                page: 1,
                pageSize: 10,
                totalItems: processedCourses.length,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false
              }
            };
          }
          
          throw new Error('Failed to fetch courses');
        } catch (error) {
          console.error('Error fetching courses:', error);
          throw error;
        }
      }
    });
  };
  
  // Fetch single course
  const getCourseById = (id: string) => {
    return useQuery({
      queryKey: ['courses', id],
      queryFn: async () => {
        const response = await axios.get(`${baseUrl}/${id}`);
        // Process response similar to the original hook
        return normalizeStatus(response.data.data);
      },
      enabled: !!id
    });
  };
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post(`${baseUrl}`, data);
      return normalizeStatus(response.data.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create course: ${error.message}`);
    }
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await axios.put(`${baseUrl}/${id}`, data);
      return normalizeStatus(response.data.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses', variables.id] });
      toast.success('Course updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update course: ${error.message}`);
    }
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`${baseUrl}/${id}`);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete course: ${error.message}`);
    }
  });
  
  return {
    // Query functions
    getCourses,
    getCourseById,
    
    // Mutations
    createCourse: createMutation.mutate,
    updateCourse: (id: string, data: any) => updateMutation.mutate({ id, data }),
    deleteCourse: deleteMutation.mutate,
    
    // Mutation statuses
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}
```

## 4. Chiến lược Triển khai

### 4.1. Danh sách đầy đủ file cần cập nhật

#### 4.1.1. Các file infrastructure cần thay đổi hoàn toàn
* [X] `src/client/components/common/LoadingState.tsx` - Thay thế toàn bộ
* [X] `src/client/providers/ReactQueryProvider.tsx` - Tạo mới
* [X] `src/client/providers/ToastProvider.tsx` - Tạo mới
* [X] `src/client/hooks/common/useToast.ts` - Tạo mới
* [X] `src/app/layout.tsx` - Cập nhật
* [X] `src/app/globals.css` - Thêm biến CSS
* [X] `src/client/hooks/common/useQueryUtils.ts` - Tạo mới
* [X] `src/client/providers/index.ts` - Cập nhật exports
* [X] `src/client/hooks/common/index.ts` - Cập nhật exports

#### 4.1.2. Các hooks cần tạo phiên bản React Query
* [ ] `src/client/hooks/courses/useCoursesQuery.ts` 
* [ ] `src/client/hooks/topics/useTopicsQuery.ts`
* [ ] `src/client/hooks/faq/useFAQsQuery.ts`
* [ ] `src/client/hooks/learn/useLessonsQuery.ts`
* [ ] `src/client/hooks/students/useStudentsQuery.ts`
* [ ] `src/client/hooks/auth/useAuthQuery.ts`
* [ ] `src/client/hooks/user/useUserQuery.ts`

#### 4.1.3. Các hooks cần cập nhật exports
* [ ] `src/client/hooks/courses/index.ts`
* [ ] `src/client/hooks/topics/index.ts`
* [ ] `src/client/hooks/faq/index.ts`
* [ ] `src/client/hooks/learn/index.ts`
* [ ] `src/client/hooks/students/index.ts`
* [ ] `src/client/hooks/auth/index.ts`
* [ ] `src/client/hooks/user/index.ts`

#### 4.1.4. Components và Pages sử dụng LoadingState cần cập nhật

##### Admin Components
* [ ] `src/client/components/admin/students/StudentList.tsx`
* [ ] `src/client/components/admin/students/StudentForm.tsx` 
* [ ] `src/client/components/admin/students/StudentDetail.tsx`
* [ ] `src/client/components/admin/topics/TopicList.tsx`
* [ ] `src/client/components/admin/topics/TopicForm.tsx`
* [ ] `src/client/components/admin/lessons/LessonList.tsx`
* [ ] `src/client/components/admin/lessons/LessonForm.tsx`
* [ ] `src/client/components/admin/CourseManager.tsx`

##### Course Components
* [ ] `src/client/components/courses/CourseCard.tsx`
* [ ] `src/client/components/courses/CourseDetail.tsx`
* [ ] `src/client/components/courses/CoursesSection.tsx`
* [ ] `src/client/components/courses/EnrollButton.tsx`

##### Layout Components
* [ ] `src/client/components/layout/Header.tsx`
* [ ] `src/client/components/layout/Footer.tsx`

##### Learn Components
* [ ] `src/client/components/learn/LessonPlayer.tsx`

##### Dashboard Components
* [ ] `src/client/components/dashboard/UserLoginStreak.tsx`

##### Other Components
* [ ] `src/client/components/topics/TopicsFilter.tsx`
* [ ] `src/client/components/faq/FAQSection.tsx`
* [ ] `src/client/components/ui/file/FileUpload.tsx`
* [ ] `src/client/components/auth/ProtectedRoute.tsx`

##### Admin Pages
* [ ] `src/app/admin/page.tsx`
* [ ] `src/app/admin/courses/page.tsx`
* [ ] `src/app/admin/courses/[courseId]/edit/page.tsx`
* [ ] `src/app/admin/courses/new/page.tsx`
* [ ] `src/app/admin/courses/[courseId]/page.tsx`
* [ ] `src/app/admin/topics/page.tsx`
* [ ] `src/app/admin/topics/[topicId]/page.tsx`
* [ ] `src/app/admin/topics/[topicId]/edit/page.tsx`
* [ ] `src/app/admin/topics/new/page.tsx`
* [ ] `src/app/admin/faqs/page.tsx`
* [ ] `src/app/admin/faqs/[faqId]/edit/page.tsx`
* [ ] `src/app/admin/faqs/new/page.tsx`
* [ ] `src/app/admin/students/page.tsx`
* [ ] `src/app/admin/students/[studentId]/page.tsx`
* [ ] `src/app/admin/students/[studentId]/edit/page.tsx`
* [ ] `src/app/admin/students/new/page.tsx`
* [ ] `src/app/admin/lessons/page.tsx`
* [ ] `src/app/admin/lessons/[lessonId]/page.tsx`
* [ ] `src/app/admin/lessons/[lessonId]/edit/page.tsx`
* [ ] `src/app/admin/lessons/new/[courseId]/page.tsx`

##### Public Pages
* [ ] `src/app/courses/page.tsx`
* [ ] `src/app/courses/[courseId]/page.tsx`
* [ ] `src/app/courses/[courseId]/learn/page.tsx`
* [ ] `src/app/(dashboard)/dashboard/page.tsx`
* [ ] `src/app/(dashboard)/my-courses/page.tsx`
* [ ] `src/app/(dashboard)/learn/[courseId]/page.tsx`
* [ ] `src/app/(auth)/login/page.tsx`
* [ ] `src/app/(auth)/signup/page.tsx`
* [ ] `src/app/challenges/page.tsx`
* [ ] `src/app/(marketing)/faq/page.tsx`
* [ ] `src/app/(marketing)/reviews/page.tsx`
* [ ] `src/app/(marketing)/roadmap/page.tsx`

### 4.2. Chiến lược chuyển đổi

Có hai chiến lược chuyển đổi:

#### Chiến lược 1: Chuyển đổi từng Domain (Khuyến nghị)
1. Triển khai infrastructure (LoadingState, Providers, useToast)
2. Chuyển đổi từng domain một, bắt đầu với courses:
   - Tạo useCoursesQuery.ts
   - Cập nhật tất cả các trang và components liên quan
   - Kiểm thử kỹ lưỡng trước khi chuyển sang domain khác
3. Tiếp tục với các domain khác theo thứ tự ưu tiên

#### Chiến lược 2: Chuyển đổi Giai đoạn
1. Giai đoạn 1: Triển khai tất cả cơ sở hạ tầng
2. Giai đoạn 2: Tạo tất cả các hooks React Query mới (chưa sử dụng)
3. Giai đoạn 3: Chuyển đổi dần dần từng UI component và page
4. Giai đoạn 4: Loại bỏ hoàn toàn các hooks cũ

### 4.3. Pattern Migration Cụ thể

#### Pattern LoadingState
- Thay thế:
```jsx
{loading && <div className="spinner">Loading...</div>}
```
- Thành:
```jsx
{isLoading && <LoadingState variant="table" message="Loading courses..." />}
```

#### Pattern React Query Hook
- Thay thế:
```jsx
const { courses, loading, error, fetchCourses } = useCourses();
useEffect(() => { fetchCourses(); }, []);
```
- Thành:
```jsx
const { data, isLoading, isError } = useCoursesQuery().getCourses();
```

#### Pattern React Query Mutation
- Thay thế:
```jsx
const { createCourse, loading } = useCourses();
const handleSubmit = () => { createCourse(data); };
```
- Thành:
```jsx
const { createCourse, isCreating } = useCoursesQuery();
const handleSubmit = () => { createCourse(data); };
```

#### Pattern Toast Notification
- Thay thế:
```jsx
setMessage('Course created');
```
- Thành:
```jsx
useToast().success('Course created successfully');
```

## 5. Timeline và Deliverables

### 5.1. Phase 1: Infrastructure (2 ngày)
- [X] Nâng cấp LoadingState component
- [X] Thêm biến CSS
- [X] Cài đặt React Query và React Hot Toast
- [X] Tạo và cấu hình providers
- [X] Tạo hook useToast
- [X] Cập nhật Root layout

### 5.2. Phase 2: Domain Courses (3 ngày)
- [ ] Tạo useCoursesQuery
- [ ] Cập nhật tất cả các components courses
- [ ] Cập nhật tất cả các pages courses

### 5.3. Phase 3: Domain Topics (2 ngày)
- [ ] Tạo useTopicsQuery
- [ ] Cập nhật tất cả các components và pages topics

### 5.4. Phase 4: Domain FAQs (2 ngày)
- [ ] Tạo useFAQsQuery
- [ ] Cập nhật tất cả các components và pages FAQs

### 5.5. Phase 5: Domains còn lại (3 ngày)
- [ ] Tạo useAuthQuery, useUserQuery, useLessonsQuery, useStudentsQuery
- [ ] Cập nhật tất cả các components và pages liên quan

### 5.6. Phase 6: Testing và Refining (2 ngày)
- [ ] Kiểm tra toàn diện
- [ ] Sửa lỗi
- [ ] Tối ưu hóa performance

## 6. Ràng buộc và Lưu ý Triển khai

1. **Không cần tương thích ngược với code cũ**:
   - Được phép xóa code dư thừa
   - Không cần giữ tương thích với các phương thức cũ

2. **Tuân thủ Domain-Driven Design**:
   - Tổ chức hooks và components theo domain như hiện tại
   - Không tạo thêm thư mục lồng nhau không cần thiết

3. **Sử dụng LoadingState component đồng nhất**:
   - Tất cả hiển thị loading phải sử dụng LoadingState với variant phù hợp
   - Không sử dụng các spinner hay loading khác trong ứng dụng

4. **Chuẩn hóa xử lý lỗi**:
   - Sử dụng react-hot-toast cho tất cả thông báo lỗi/thành công
   - Đảm bảo các thông báo lỗi rõ ràng và hữu ích

5. **CSS variables**:
   - Sử dụng biến CSS mới thêm cho LoadingState
   - Đảm bảo tính nhất quán trong style