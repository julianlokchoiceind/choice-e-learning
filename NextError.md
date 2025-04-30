## ESLint Errors

/Users/julianlok/Documents/choice-e-learning/.next/server/src/middleware.js
  263:5  error  Definition for rule '@typescript-eslint/no-useless-constructor' was not found  @typescript-eslint/no-useless-constructor

✖ 1 problem (1 error, 0 warnings)

(node:47608) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/julianlok/Documents/choice-e-learning/eslint.config.js?mtime=1745939165015 is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/julianlok/Documents/choice-e-learning/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)

## TypeScript Errors

No errors.

## Next.js Build Errors

▲ Next.js 14.0.4
   - Environments: .env

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/44) ...
   Generating static pages (11/44) 
   Generating static pages (22/44) 
   Generating static pages (33/44) 
 ✓ Generating static pages (44/44) 
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                     Size     First Load JS
┌ ○ /                                           8.98 kB         105 kB
├ ○ /_not-found                                 0 B                0 B
├ ○ /admin                                      296 B          87.3 kB
├ ○ /admin/courses                              4.04 kB         121 kB
├ λ /admin/courses/[courseId]                   3.69 kB        97.4 kB
├ λ /admin/courses/[courseId]/edit              5.72 kB         123 kB
├ ○ /admin/courses/new                          39.7 kB         157 kB
├ ○ /admin/faqs                                 4.73 kB         114 kB
├ λ /admin/faqs/[faqId]/edit                    3.89 kB         113 kB
├ ○ /admin/faqs/new                             3.73 kB         113 kB
├ ○ /admin/students                             6.51 kB         120 kB
├ λ /admin/students/[studentId]                 5.64 kB         120 kB
├ λ /admin/students/[studentId]/edit            151 B           135 kB
├ ○ /admin/students/new                         151 B           135 kB
├ ○ /admin/topics                               5.83 kB         115 kB
├ λ /admin/topics/[topicId]                     6.2 kB          120 kB
├ λ /admin/topics/[topicId]/edit                4.54 kB         114 kB
├ ○ /admin/topics/new                           4.2 kB          113 kB
├ λ /api/achievements                           0 B                0 B
├ λ /api/admin/courses                          0 B                0 B
├ λ /api/admin/courses/[id]                     0 B                0 B
├ λ /api/admin/faqs                             0 B                0 B
├ λ /api/admin/faqs/[faqId]                     0 B                0 B
├ λ /api/admin/faqs/categories                  0 B                0 B
├ λ /api/admin/students                         0 B                0 B
├ λ /api/admin/students/[studentId]             0 B                0 B
├ λ /api/admin/topics                           0 B                0 B
├ λ /api/admin/topics/[topicId]                 0 B                0 B
├ λ /api/admin/users                            0 B                0 B
├ λ /api/admin/users/[userId]/role              0 B                0 B
├ λ /api/auth/[...nextauth]                     0 B                0 B
├ λ /api/auth/register                          0 B                0 B
├ λ /api/auth/session                           0 B                0 B
├ λ /api/courses                                0 B                0 B
├ λ /api/courses/[courseId]                     0 B                0 B
├ λ /api/courses/[courseId]/enroll              0 B                0 B
├ λ /api/courses/[courseId]/lessons             0 B                0 B
├ λ /api/courses/[courseId]/lessons/[lessonId]  0 B                0 B
├ ○ /api/courses/topics                         0 B                0 B
├ λ /api/enrolledCourses                        0 B                0 B
├ λ /api/faqs                                   0 B                0 B
├ λ /api/faqs/categories                        0 B                0 B
├ λ /api/protected-route                        0 B                0 B
├ λ /api/topics                                 0 B                0 B
├ λ /api/upload                                 0 B                0 B
├ λ /api/userProgress                           0 B                0 B
├ λ /api/users/me                               0 B                0 B
├ λ /api/users/me/courses                       0 B                0 B
├ λ /api/users/profile                          0 B                0 B
├ λ /api/userStats                              0 B                0 B
├ ○ /challenges                                 296 B          87.3 kB
├ ○ /courses                                    4.34 kB         122 kB
├ λ /courses/[courseId]                         3.61 kB         103 kB
├ λ /courses/[courseId]/learn                   3.74 kB         103 kB
├ ○ /dashboard                                  4.78 kB         129 kB
├ ○ /faq                                        3.62 kB         106 kB
├ ○ /login                                      3.48 kB         129 kB
├ ○ /reviews                                    192 B          93.9 kB
├ ○ /roadmap                                    192 B          93.9 kB
└ ○ /signup                                     3.79 kB         129 kB
+ First Load JS shared by all                   82 kB
  ├ chunks/4938-a4c5adeced678b58.js             26.7 kB
  ├ chunks/fd9d1056-394c4b9237b372cc.js         53.3 kB
  ├ chunks/main-app-3c02ea2eb185767e.js         223 B
  └ chunks/webpack-718bfa424c238c50.js          1.88 kB


ƒ Middleware                                    72.9 kB

○  (Static)   prerendered as static content
λ  (Dynamic)  server-rendered on demand using Node.js
