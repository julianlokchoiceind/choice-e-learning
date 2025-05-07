## ESLint Errors

D:\choice-e-learning\.next\server\src\middleware.js
  263:5  error  Definition for rule '@typescript-eslint/no-useless-constructor' was not found  @typescript-eslint/no-useless-constructor

D:\choice-e-learning\src\generated\prisma\index-browser.js
  258:14  error  Parsing error: Identifier 'PrismaClient' has already been declared

D:\choice-e-learning\src\generated\prisma\runtime\edge-esm.js
  1:4355  error  Parsing error: Unexpected token size

D:\choice-e-learning\src\generated\prisma\runtime\edge.js
  1:4411  error  Parsing error: Unexpected token size

D:\choice-e-learning\src\generated\prisma\runtime\index-browser.js
  1:34907  error  Parsing error: Unexpected token export

D:\choice-e-learning\src\generated\prisma\runtime\library.js
  6:900  error  Parsing error: 'import' and 'export' may only appear at the top level

D:\choice-e-learning\src\generated\prisma\runtime\react-native.js
  1:4477  error  Parsing error: Unexpected token size

D:\choice-e-learning\src\generated\prisma\wasm.js
  258:14  error  Parsing error: Identifier 'PrismaClient' has already been declared

✖ 8 problems (8 errors, 0 warnings)

## TypeScript Errors

.next/types/app/(auth)/layout.ts(8,13): error TS2344: Type 'OmitWithTag<typeof import("D:/choice-e-learning/src/app/(auth)/layout"), "default" | "config" | "generateStaticParams" | "revalidate" | "dynamic" | "dynamicParams" | "fetchCache" | "preferredRegion" | ... 5 more ... | "generateViewport", "">' does not satisfy the constraint '{ [x: string]: never; }'.
  Property 'AuthLayout' is incompatible with index signature.
    Type '({ children }: AuthLayoutProps) => Element' is not assignable to type 'never'.
.next/types/app/(dashboard)/layout.ts(8,13): error TS2344: Type 'OmitWithTag<typeof import("D:/choice-e-learning/src/app/(dashboard)/layout"), "default" | "config" | "generateStaticParams" | "revalidate" | "dynamic" | "dynamicParams" | "fetchCache" | ... 6 more ... | "generateViewport", "">' does not satisfy the constraint '{ [x: string]: never; }'.
  Property 'DashboardLayout' is incompatible with index signature.
    Type '({ children, showSidebar, hideFooter }: DashboardLayoutProps) => void' is not assignable to type 'never'.
.next/types/app/(dashboard)/layout.ts(28,13): error TS2344: Type 'OmitWithTag<DashboardLayoutProps, keyof LayoutProps, "default">' does not satisfy the constraint '{ [x: string]: never; }'.
  Property 'showSidebar' is incompatible with index signature.
    Type 'boolean' is not assignable to type 'never'.
src/app/(auth)/login/page.tsx(343,15): error TS2322: Type 'string' is not assignable to type 'boolean | undefined'.
src/app/(auth)/signup/page.tsx(416,15): error TS2322: Type 'string' is not assignable to type 'boolean | undefined'.
src/app/(dashboard)/learn/[courseId]/[lessonId]/page.tsx(4,10): error TS2305: Module '"@/server/services/courses/course-service"' has no exported member 'getCourse'.
src/app/(dashboard)/learn/[courseId]/[lessonId]/page.tsx(29,39): error TS2322: Type '{ lesson: any; course: any; }' is not assignable to type 'IntrinsicAttributes & LessonPlayerProps'.
  Property 'course' does not exist on type 'IntrinsicAttributes & LessonPlayerProps'.
src/app/(dashboard)/learn/[courseId]/page.tsx(4,10): error TS2305: Module '"@/server/services/courses/course-service"' has no exported member 'getCourse'.
src/app/(dashboard)/learn/page.tsx(2,10): error TS2305: Module '"@/server/services/courses/course-service"' has no exported member 'getUserCourses'.
src/app/(dashboard)/learn/page.tsx(25,37): error TS7006: Parameter 'course' implicitly has an 'any' type.
src/app/(dashboard)/my-courses/page.tsx(2,10): error TS2305: Module '"@/server/services/courses/course-service"' has no exported member 'getUserCourses'.
src/app/(dashboard)/my-courses/page.tsx(26,37): error TS7006: Parameter 'course' implicitly has an 'any' type.
src/app/admin/lessons/[lessonId]/edit/page.tsx(2,28): error TS2307: Cannot find module '@/client/components/admin/lessons/LessonForm' or its corresponding type declarations.
src/app/admin/lessons/new/[courseId]/page.tsx(2,28): error TS2307: Cannot find module '@/client/components/admin/lessons/LessonForm' or its corresponding type declarations.
src/app/admin/lessons/new/[courseId]/page.tsx(3,10): error TS2305: Module '"@/server/services/courses/course-service"' has no exported member 'getCourse'.
src/app/admin/lessons/page.tsx(1,28): error TS2307: Cannot find module '@/client/components/admin/lessons/LessonList' or its corresponding type declarations.
src/app/admin/topics/[topicId]/edit/page.tsx(121,22): error TS18046: 'err' is of type 'unknown'.
src/app/admin/topics/[topicId]/edit/page.tsx(194,15): error TS2322: Type 'string' is not assignable to type 'ChangeEventHandler<HTMLTextAreaElement>'.
src/app/admin/topics/[topicId]/edit/page.tsx(195,15): error TS2322: Type 'string' is not assignable to type 'number'.
src/app/admin/topics/[topicId]/edit/page.tsx(199,15): error TS2322: Type 'string' is not assignable to type 'boolean | undefined'.
src/app/admin/topics/[topicId]/edit/page.tsx(232,15): error TS2322: Type 'string' is not assignable to type 'boolean | undefined'.
src/app/admin/topics/[topicId]/page.tsx(59,22): error TS18046: 'err' is of type 'unknown'.
src/app/admin/topics/[topicId]/page.tsx(230,52): error TS7006: Parameter '$1' implicitly has an 'any' type.
src/app/admin/topics/[topicId]/page.tsx(231,27): error TS2304: Cannot find name 'course'.
src/app/admin/topics/[topicId]/page.tsx(234,24): error TS2304: Cannot find name 'course'.
src/app/admin/topics/[topicId]/page.tsx(235,37): error TS2304: Cannot find name 'course'.
src/app/admin/topics/[topicId]/page.tsx(236,32): error TS2304: Cannot find name 'course'.
src/app/admin/topics/[topicId]/page.tsx(246,76): error TS2304: Cannot find name 'course'.
src/app/admin/topics/[topicId]/page.tsx(249,27): error TS2304: Cannot find name 'course'.
src/app/admin/topics/[topicId]/page.tsx(250,27): error TS2304: Cannot find name 'course'.
src/app/admin/topics/[topicId]/page.tsx(253,28): error TS2304: Cannot find name 'course'.
src/app/admin/topics/[topicId]/page.tsx(253,67): error TS2304: Cannot find name 'course'.
src/app/admin/topics/[topicId]/page.tsx(256,29): error TS2304: Cannot find name 'course'.
src/app/admin/topics/[topicId]/page.tsx(262,45): error TS2304: Cannot find name 'course'.
src/app/admin/topics/new/page.tsx(114,29): error TS18046: 'err' is of type 'unknown'.
src/app/admin/topics/new/page.tsx(122,23): error TS2339: Property 'message' does not exist on type '{}'.
src/app/admin/topics/new/page.tsx(124,17): error TS2339: Property 'message' does not exist on type '{}'.
src/app/admin/topics/new/page.tsx(125,18): error TS2339: Property 'message' does not exist on type '{}'.
src/app/admin/topics/new/page.tsx(126,30): error TS2339: Property 'message' does not exist on type '{}'.
src/app/admin/topics/new/page.tsx(183,15): error TS2322: Type 'string' is not assignable to type 'ChangeEventHandler<HTMLTextAreaElement>'.
src/app/admin/topics/new/page.tsx(184,15): error TS2322: Type 'string' is not assignable to type 'number'.
src/app/admin/topics/new/page.tsx(188,15): error TS2322: Type 'string' is not assignable to type 'boolean | undefined'.
src/app/admin/topics/new/page.tsx(221,15): error TS2322: Type 'string' is not assignable to type 'boolean | undefined'.
src/app/admin/topics/page.tsx(238,15): error TS2322: Type 'string' is not assignable to type 'MouseEventHandler<HTMLButtonElement>'.
src/app/api/admin/topics/[topicId]/route.ts(97,9): error TS18046: 'error' is of type 'unknown'.
src/app/api/admin/topics/[topicId]/route.ts(97,26): error TS18046: 'error' is of type 'unknown'.
src/app/api/admin/topics/[topicId]/route.ts(99,9): error TS18046: 'error' is of type 'unknown'.
src/app/api/admin/topics/[topicId]/route.ts(133,9): error TS18046: 'error' is of type 'unknown'.
src/app/api/admin/topics/[topicId]/route.ts(133,26): error TS18046: 'error' is of type 'unknown'.
src/app/api/admin/topics/[topicId]/route.ts(135,9): error TS18046: 'error' is of type 'unknown'.
src/app/api/admin/topics/route.ts(177,35): error TS18046: 'error' is of type 'unknown'.
src/app/api/admin/topics/route.ts(180,9): error TS18046: 'error' is of type 'unknown'.
src/app/api/admin/topics/route.ts(180,26): error TS18046: 'error' is of type 'unknown'.
src/app/api/admin/topics/route.ts(182,9): error TS18046: 'error' is of type 'unknown'.
src/app/api/admin/topics/route.ts(189,9): error TS18046: 'error' is of type 'unknown'.
src/app/api/admin/topics/route.ts(190,43): error TS18046: 'error' is of type 'unknown'.
src/app/api/admin/topics/route.ts(192,28): error TS18046: 'error' is of type 'unknown'.
src/app/api/admin/topics/route.ts(193,17): error TS18046: 'error' is of type 'unknown'.
src/app/api/admin/topics/route.ts(198,64): error TS18046: 'error' is of type 'unknown'.
src/app/api/courses/[courseId]/lessons/[lessonId]/route.ts(80,49): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/app/api/courses/[courseId]/lessons/[lessonId]/route.ts(98,46): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/app/api/courses/[courseId]/lessons/[lessonId]/route.ts(126,49): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/app/api/courses/[courseId]/lessons/[lessonId]/route.ts(142,46): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/app/api/courses/[courseId]/lessons/route.ts(77,57): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/app/api/lessons/[lessonId]/route.ts(3,10): error TS2305: Module '"@/server/auth/auth-middleware"' has no exported member 'withAuth'.
src/app/api/lessons/[lessonId]/route.ts(24,21): error TS18046: 'error' is of type 'unknown'.
src/app/api/lessons/[lessonId]/route.ts(24,60): error TS18046: 'error' is of type 'unknown'.
src/app/api/lessons/[lessonId]/route.ts(43,9): error TS18046: 'error' is of type 'unknown'.
src/app/api/lessons/[lessonId]/route.ts(44,67): error TS2345: Argument of type '{ errors: any; }' is not assignable to parameter of type 'ApiErrorCode | undefined'.
src/app/api/lessons/[lessonId]/route.ts(44,77): error TS18046: 'error' is of type 'unknown'.
src/app/api/lessons/[lessonId]/route.ts(46,21): error TS18046: 'error' is of type 'unknown'.
src/app/api/lessons/[lessonId]/route.ts(46,60): error TS18046: 'error' is of type 'unknown'.
src/app/api/lessons/[lessonId]/route.ts(62,21): error TS18046: 'error' is of type 'unknown'.
src/app/api/lessons/[lessonId]/route.ts(62,60): error TS18046: 'error' is of type 'unknown'.
src/app/api/lessons/route.ts(3,10): error TS2305: Module '"@/server/auth/auth-middleware"' has no exported member 'withAuth'.
src/app/api/lessons/route.ts(28,21): error TS18046: 'error' is of type 'unknown'.
src/app/api/lessons/route.ts(28,60): error TS18046: 'error' is of type 'unknown'.
src/app/api/lessons/route.ts(44,42): error TS2345: Argument of type '{ title: string; courseId: string; order: number; content?: string | undefined; videoUrl?: string | null | undefined; chapterId?: string | null | undefined; }' is not assignable to parameter of type '{ id: string; title: string; courseId: string; order: number; createdAt?: Date | undefined; updatedAt?: Date | undefined; content?: string | undefined; videoUrl?: string | null | undefined; chapterId?: string | ... 1 more ... | undefined; }'.
  Property 'id' is missing in type '{ title: string; courseId: string; order: number; content?: string | undefined; videoUrl?: string | null | undefined; chapterId?: string | null | undefined; }' but required in type '{ id: string; title: string; courseId: string; order: number; createdAt?: Date | undefined; updatedAt?: Date | undefined; content?: string | undefined; videoUrl?: string | null | undefined; chapterId?: string | ... 1 more ... | undefined; }'.
src/app/api/lessons/route.ts(47,9): error TS18046: 'error' is of type 'unknown'.
src/app/api/lessons/route.ts(48,67): error TS2345: Argument of type '{ errors: any; }' is not assignable to parameter of type 'ApiErrorCode | undefined'.
src/app/api/lessons/route.ts(48,77): error TS18046: 'error' is of type 'unknown'.
src/app/api/lessons/route.ts(50,21): error TS18046: 'error' is of type 'unknown'.
src/app/api/lessons/route.ts(50,60): error TS18046: 'error' is of type 'unknown'.
src/app/api/lessons/route.ts(70,21): error TS18046: 'error' is of type 'unknown'.
src/app/api/lessons/route.ts(70,60): error TS18046: 'error' is of type 'unknown'.
src/app/courses/[courseId]/page.tsx(116,47): error TS7006: Parameter 'c' implicitly has an 'any' type.
src/app/courses/[courseId]/page.tsx(279,21): error TS2322: Type 'string' is not assignable to type 'MouseEventHandler<HTMLButtonElement>'.
src/app/courses/[courseId]/page.tsx(280,21): error TS2322: Type 'string' is not assignable to type 'boolean | undefined'.
src/app/courses/[courseId]/page.tsx(288,19): error TS2322: Type 'string' is not assignable to type 'MouseEventHandler<HTMLButtonElement>'.
src/app/courses/[courseId]/page.tsx(289,19): error TS2322: Type 'string' is not assignable to type 'boolean | undefined'.
src/client/components/admin/CourseManager.tsx(112,54): error TS7006: Parameter 'course' implicitly has an 'any' type.
src/client/components/admin/CourseManager.tsx(123,51): error TS7006: Parameter 'course' implicitly has an 'any' type.
src/client/components/admin/index.ts(3,15): error TS2307: Cannot find module './TopicList' or its corresponding type declarations.
src/client/components/admin/index.ts(4,15): error TS2307: Cannot find module './TopicForm' or its corresponding type declarations.
src/client/components/admin/index.ts(6,15): error TS2307: Cannot find module './StudentList' or its corresponding type declarations.
src/client/components/admin/index.ts(7,15): error TS2307: Cannot find module './StudentForm' or its corresponding type declarations.
src/client/components/admin/index.ts(8,15): error TS2307: Cannot find module './StudentDetail' or its corresponding type declarations.
src/client/components/admin/index.ts(9,15): error TS2307: Cannot find module './TopicSelector' or its corresponding type declarations.
src/client/components/admin/students/StudentDetail.tsx(152,18): error TS18046: 'error' is of type 'unknown'.
src/client/components/admin/students/StudentDetail.tsx(152,49): error TS18046: 'error' is of type 'unknown'.
src/client/components/admin/students/StudentForm.tsx(10,34): error TS2307: Cannot find module '@/shared/types/student' or its corresponding type declarations.
src/client/components/admin/students/StudentForm.tsx(106,30): error TS18046: 'error' is of type 'unknown'.
src/client/components/admin/students/StudentForm.tsx(106,61): error TS18046: 'error' is of type 'unknown'.
src/client/components/admin/students/StudentForm.tsx(186,28): error TS18046: 'error' is of type 'unknown'.
src/client/components/admin/students/StudentForm.tsx(186,59): error TS18046: 'error' is of type 'unknown'.
src/client/components/admin/topics/TopicForm.tsx(11,14): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/client/components/admin/topics/TopicForm.tsx(106,22): error TS18046: 'err' is of type 'unknown'.
src/client/components/admin/topics/TopicForm.tsx(159,13): error TS2322: Type 'string' is not assignable to type 'ChangeEventHandler<HTMLTextAreaElement>'.
src/client/components/admin/topics/TopicForm.tsx(160,13): error TS2322: Type 'string' is not assignable to type 'number'.
src/client/components/admin/topics/TopicForm.tsx(164,13): error TS2322: Type 'string' is not assignable to type 'boolean | undefined'.
src/client/components/admin/topics/TopicForm.tsx(191,13): error TS2322: Type 'string' is not assignable to type 'boolean | undefined'.
src/client/components/courses/CourseCard.tsx(4,24): error TS2307: Cannot find module '@/shared/types/courses/courses/course' or its corresponding type declarations.
src/client/components/courses/CourseCard.tsx(38,13): error TS2322: Type 'string' is not assignable to type 'MouseEventHandler<HTMLButtonElement>'.
src/client/components/courses/CourseCard.tsx(39,13): error TS2322: Type 'string' is not assignable to type 'boolean | undefined'.
src/client/components/courses/CourseDetail.tsx(3,24): error TS2307: Cannot find module '@/shared/types/courses/courses/course' or its corresponding type declarations.
src/client/components/courses/CourseDetail.tsx(33,36): error TS7006: Parameter 'lesson' implicitly has an 'any' type.
src/client/components/courses/CoursesSection.tsx(190,13): error TS2322: Type 'string' is not assignable to type 'MouseEventHandler<HTMLButtonElement>'.
src/client/components/courses/CoursesSection.tsx(197,13): error TS2322: Type 'string' is not assignable to type 'MouseEventHandler<HTMLButtonElement>'.
src/client/components/courses/EnrollButton.tsx(53,7): error TS2322: Type 'string' is not assignable to type 'MouseEventHandler<HTMLButtonElement>'.
src/client/components/courses/EnrollButton.tsx(54,7): error TS2322: Type 'string' is not assignable to type 'boolean | undefined'.
src/client/components/faq/FAQSection.tsx(132,13): error TS2322: Type 'string' is not assignable to type 'MouseEventHandler<HTMLButtonElement>'.
src/client/components/home/index.ts(2,15): error TS2307: Cannot find module './TestimonialsSection' or its corresponding type declarations.
src/client/components/home/index.ts(3,15): error TS2307: Cannot find module './RoadmapSection' or its corresponding type declarations.
src/client/components/home/index.ts(4,15): error TS2307: Cannot find module './PopularCoursesSection' or its corresponding type declarations.
src/client/components/home/index.ts(6,15): error TS2307: Cannot find module './HowItWorksSection' or its corresponding type declarations.
src/client/components/home/index.ts(7,15): error TS2307: Cannot find module './HeroSection' or its corresponding type declarations.
src/client/components/home/index.ts(8,15): error TS2307: Cannot find module './FeaturedCoursesSection' or its corresponding type declarations.
src/client/components/home/index.ts(9,15): error TS2307: Cannot find module './CTASection' or its corresponding type declarations.
src/client/components/home/sections/FeaturedCoursesSection.tsx(7,32): error TS2307: Cannot find module '../../../types/course' or its corresponding type declarations.
src/client/components/home/sections/HowItWorksSection.tsx(4,32): error TS2307: Cannot find module '../../../types/course' or its corresponding type declarations.
src/client/components/home/sections/PopularCoursesSection.tsx(7,31): error TS2307: Cannot find module '../../../types/course' or its corresponding type declarations.
src/client/components/home/sections/RoadmapSection.tsx(5,25): error TS2307: Cannot find module '../../../types/course' or its corresponding type declarations.
src/client/components/home/sections/TestimonialsSection.tsx(7,29): error TS2307: Cannot find module '../../../types/course' or its corresponding type declarations.
src/client/components/index.ts(9,15): error TS2306: File 'D:/choice-e-learning/src/client/components/learn/index.ts' is not a module.
src/client/components/layout/Header.tsx(254,25): error TS2322: Type 'string' is not assignable to type 'MouseEventHandler<HTMLAnchorElement>'.
src/client/components/layout/Header.tsx(270,27): error TS2322: Type 'string' is not assignable to type 'MouseEventHandler<HTMLAnchorElement>'.
src/client/components/layout/Header.tsx(289,27): error TS2322: Type 'string' is not assignable to type 'MouseEventHandler<HTMLAnchorElement>'.
src/client/components/layout/Header.tsx(296,27): error TS2322: Type 'string' is not assignable to type 'MouseEventHandler<HTMLAnchorElement>'.
src/client/components/learn/LessonPlayer.tsx(131,13): error TS2322: Type 'string' is not assignable to type 'MouseEventHandler<HTMLButtonElement>'.
src/client/components/learn/LessonPlayer.tsx(133,13): error TS2322: Type 'string' is not assignable to type 'boolean | undefined'.
src/client/components/ui/index.ts(2,15): error TS2307: Cannot find module './FileUpload' or its corresponding type declarations.
src/client/components/ui/index.ts(4,15): error TS2307: Cannot find module './CounterScript' or its corresponding type declarations.
src/client/components/ui/index.ts(5,15): error TS2307: Cannot find module './AnimationStyles' or its corresponding type declarations.
src/client/hooks/auth/useAuth.ts(71,47): error TS18046: 'axiosError' is of type 'unknown'.
src/client/hooks/auth/useAuth.ts(74,30): error TS18046: 'axiosError' is of type 'unknown'.
src/client/hooks/auth/useAuth.ts(75,29): error TS18046: 'axiosError' is of type 'unknown'.
src/client/hooks/courses/useCourses.ts(119,13): error TS18046: 'apiError' is of type 'unknown'.
src/client/hooks/courses/useCourses.ts(120,58): error TS18046: 'apiError' is of type 'unknown'.
src/client/hooks/courses/useCourses.ts(121,56): error TS18046: 'apiError' is of type 'unknown'.
src/client/hooks/courses/useCourses.ts(317,43): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/client/hooks/courses/useCourses.ts(346,55): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/client/hooks/index.ts(4,15): error TS2306: File 'D:/choice-e-learning/src/client/hooks/learn/index.ts' is not a module.
src/client/hooks/index.ts(5,15): error TS2306: File 'D:/choice-e-learning/src/client/hooks/queries/index.ts' is not a module.
src/client/hooks/learn/useLesson.ts(36,16): error TS18046: 'err' is of type 'unknown'.
src/client/hooks/learn/useLesson.ts(56,16): error TS18046: 'err' is of type 'unknown'.
src/client/hooks/students/useStudents.ts(141,52): error TS7006: Parameter '$1' implicitly has an 'any' type.
src/client/hooks/students/useStudents.ts(143,15): error TS18047: 'student' is possibly 'null'.
src/client/hooks/students/useStudents.ts(144,17): error TS18047: 'student' is possibly 'null'.
src/client/hooks/students/useStudents.ts(145,18): error TS18047: 'student' is possibly 'null'.
src/client/hooks/students/useStudents.ts(146,17): error TS18047: 'student' is possibly 'null'.
src/client/hooks/students/useStudents.ts(146,25): error TS2339: Property 'role' does not exist on type 'Student'.
src/client/hooks/students/useStudents.ts(150,15): error TS18047: 'student' is possibly 'null'.
src/client/hooks/students/useStudents.ts(151,17): error TS18047: 'student' is possibly 'null'.
src/client/hooks/students/useStudents.ts(152,20): error TS18047: 'student' is possibly 'null'.
src/client/hooks/students/useStudents.ts(153,22): error TS18047: 'student' is possibly 'null'.
src/client/hooks/students/useStudents.ts(154,24): error TS18047: 'student' is possibly 'null'.
src/client/hooks/students/useStudents.ts(155,21): error TS18047: 'student' is possibly 'null'.
src/client/hooks/students/useStudents.ts(156,22): error TS18047: 'student' is possibly 'null'.
src/client/hooks/students/useStudents.ts(157,25): error TS18047: 'student' is possibly 'null'.
src/client/hooks/students/useStudents.ts(158,35): error TS18047: 'student' is possibly 'null'.
src/client/hooks/students/useStudents.ts(159,35): error TS18047: 'student' is possibly 'null'.
src/client/hooks/students/useStudents.ts(239,21): error TS2339: Property 'response' does not exist on type '{}'.
src/client/hooks/students/useStudents.ts(239,51): error TS2339: Property 'message' does not exist on type '{}'.
src/client/hooks/students/useStudents.ts(270,21): error TS2339: Property 'response' does not exist on type '{}'.
src/client/hooks/students/useStudents.ts(270,51): error TS2339: Property 'message' does not exist on type '{}'.
src/client/hooks/students/useStudents.ts(301,21): error TS2339: Property 'response' does not exist on type '{}'.
src/client/hooks/students/useStudents.ts(301,51): error TS2339: Property 'message' does not exist on type '{}'.
src/client/hooks/students/useStudents.ts(325,21): error TS2339: Property 'response' does not exist on type '{}'.
src/client/hooks/students/useStudents.ts(325,51): error TS2339: Property 'message' does not exist on type '{}'.
src/client/hooks/topics/useTopics.ts(32,30): error TS7006: Parameter 'response' implicitly has an 'any' type.
src/client/hooks/topics/useTopics.ts(142,13): error TS18046: 'apiError' is of type 'unknown'.
src/client/hooks/topics/useTopics.ts(143,57): error TS18046: 'apiError' is of type 'unknown'.
src/client/hooks/topics/useTopics.ts(144,55): error TS18046: 'apiError' is of type 'unknown'.
src/client/hooks/topics/useTopics.ts(193,28): error TS18046: 'err' is of type 'unknown'.
src/client/hooks/topics/useTopics.ts(193,57): error TS18046: 'err' is of type 'unknown'.
src/client/hooks/topics/useTopics.ts(244,13): error TS18046: 'apiError' is of type 'unknown'.
src/client/hooks/topics/useTopics.ts(245,57): error TS18046: 'apiError' is of type 'unknown'.
src/client/hooks/topics/useTopics.ts(246,55): error TS18046: 'apiError' is of type 'unknown'.
src/client/hooks/topics/useTopics.ts(330,11): error TS18046: 'err' is of type 'unknown'.
src/client/hooks/topics/useTopics.ts(331,52): error TS18046: 'err' is of type 'unknown'.
src/client/hooks/topics/useTopics.ts(332,50): error TS18046: 'err' is of type 'unknown'.
src/client/hooks/topics/useTopics.ts(333,18): error TS18046: 'err' is of type 'unknown'.
src/client/hooks/topics/useTopics.ts(335,60): error TS18046: 'err' is of type 'unknown'.
src/client/hooks/topics/useTopics.ts(340,59): error TS18046: 'err' is of type 'unknown'.
src/client/hooks/topics/useTopics.ts(344,16): error TS18046: 'err' is of type 'unknown'.
src/client/hooks/topics/useTopics.ts(344,45): error TS18046: 'err' is of type 'unknown'.
src/client/hooks/topics/useTopics.ts(373,16): error TS18046: 'err' is of type 'unknown'.
src/client/hooks/topics/useTopics.ts(402,16): error TS18046: 'err' is of type 'unknown'.
src/client/providers/SessionProvider.tsx(18,30): error TS2322: Type 'string' is not assignable to type 'Session'.
src/server/api/api-response.ts(106,36): error TS7006: Parameter 'zodError' implicitly has an 'any' type.
src/server/api/api-response.ts(107,45): error TS7006: Parameter '$1' implicitly has an 'any' type.
src/server/api/api-response.ts(108,8): error TS2304: Cannot find name 'err'.
src/server/api/api-response.ts(108,31): error TS2304: Cannot find name 'err'.
src/server/auth/index.ts(2,1): error TS2308: Module './session' has already exported a member named 'isAdmin'. Consider explicitly re-exporting to resolve the ambiguity.
src/server/auth/index.ts(2,1): error TS2308: Module './session' has already exported a member named 'isAuthenticated'. Consider explicitly re-exporting to resolve the ambiguity.
src/server/auth/index.ts(2,1): error TS2308: Module './session' has already exported a member named 'isStudent'. Consider explicitly re-exporting to resolve the ambiguity.
src/server/auth/index.ts(5,1): error TS2308: Module './session' has already exported a member named 'checkUserRole'. Consider explicitly re-exporting to resolve the ambiguity.
src/server/auth/index.ts(6,1): error TS2308: Module './roles' has already exported a member named 'hasPermission'. Consider explicitly re-exporting to resolve the ambiguity.
src/server/auth/index.ts(7,1): error TS2308: Module './services' has already exported a member named 'AuthError'. Consider explicitly re-exporting to resolve the ambiguity.
src/server/db/services/db-service.ts(68,3): error TS7006: Parameter 'where' implicitly has an 'any' type.
src/server/db/services/db-service.ts(92,3): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/server/db/services/db-service.ts(115,3): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/server/services/courses/course-service.ts(481,47): error TS2339: Property 'updatedAt' does not exist on type 'UserProgress'.
src/server/services/index.ts(2,1): error TS2308: Module './achievements' has already exported a member named 'dynamic'. Consider explicitly re-exporting to resolve the ambiguity.
src/server/services/lessons/index.ts(2,15): error TS2307: Cannot find module './lessons' or its corresponding type declarations.
src/server/services/lessons/lesson-service.ts(2,10): error TS2614: Module '"@/server/db/prisma-client"' has no exported member 'prisma'. Did you mean to use 'import prisma from "@/server/db/prisma-client"' instead?
src/server/services/lessons/lesson-service.ts(4,26): error TS2307: Cannot find module '@/server/api/api-errors' or its corresponding type declarations.
src/server/services/topics/topic-service.ts(277,13): error TS18046: 'dbError' is of type 'unknown'.
src/server/services/topics/topic-service.ts(279,26): error TS18046: 'dbError' is of type 'unknown'.
src/server/services/topics/topic-service.ts(290,44): error TS18046: 'dbError' is of type 'unknown'.
src/server/utils/data/pagination.ts(131,41): error TS7006: Parameter 'query' implicitly has an 'any' type.
src/server/utils/index.ts(5,1): error TS2308: Module './string-utils' has already exported a member named 'slugify'. Consider explicitly re-exporting to resolve the ambiguity.
src/server/utils/index.ts(5,1): error TS2308: Module './string-utils' has already exported a member named 'truncate'. Consider explicitly re-exporting to resolve the ambiguity.
src/shared/schemas/index.ts(8,15): error TS2306: File 'D:/choice-e-learning/src/shared/schemas/lessons/index.ts' is not a module.
src/shared/schemas/index.ts(10,15): error TS2306: File 'D:/choice-e-learning/src/shared/schemas/students/index.ts' is not a module.
src/shared/schemas/index.ts(11,15): error TS2306: File 'D:/choice-e-learning/src/shared/schemas/topics/index.ts' is not a module.
src/shared/types/index.ts(5,1): error TS2308: Module './api' has already exported a member named 'ApiResponse'. Consider explicitly re-exporting to resolve the ambiguity.
src/shared/types/index.ts(5,1): error TS2308: Module './api' has already exported a member named 'PaginatedResponse'. Consider explicitly re-exporting to resolve the ambiguity.
src/shared/types/index.ts(9,1): error TS2308: Module './courses' has already exported a member named 'CreateLessonParams'. Consider explicitly re-exporting to resolve the ambiguity.
src/shared/types/index.ts(9,1): error TS2308: Module './courses' has already exported a member named 'Lesson'. Consider explicitly re-exporting to resolve the ambiguity.
src/shared/types/students/student.ts(2,22): error TS2307: Cannot find module './auth/roles' or its corresponding type declarations.
src/shared/types/user/user.ts(6,22): error TS2307: Cannot find module './auth/roles' or its corresponding type declarations.
src/shared/types/user/user.ts(7,24): error TS2307: Cannot find module './course' or its corresponding type declarations.

## Next.js Build Errors

▲ Next.js 14.0.4
   - Environments: .env

   Creating an optimized production build ...
Failed to compile.

./src/app/admin/lessons/[lessonId]/edit/page.tsx
Module not found: Can't resolve '@/client/components/admin/lessons/LessonForm'

https://nextjs.org/docs/messages/module-not-found

./src/app/admin/lessons/new/[courseId]/page.tsx
Module not found: Can't resolve '@/client/components/admin/lessons/LessonForm'

https://nextjs.org/docs/messages/module-not-found

./src/app/admin/lessons/page.tsx
Module not found: Can't resolve '@/client/components/admin/lessons/LessonList'

https://nextjs.org/docs/messages/module-not-found

./src/server/services/lessons/lesson-service.ts
Module not found: Can't resolve '@/server/api/api-errors'

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./src/app/api/lessons/route.ts


> Build failed because of webpack errors
