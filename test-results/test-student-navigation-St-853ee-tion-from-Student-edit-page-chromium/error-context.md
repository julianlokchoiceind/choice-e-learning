# Test info

- Name: Student Edit Page Navigation Test >> Test navigation from Student edit page
- Location: /Users/julianlok/Code_Projects/choice-e-learning/tests/e2e/test-student-navigation.spec.ts:5:3

# Error details

```
Error: locator.textContent: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('h1')

    at /Users/julianlok/Code_Projects/choice-e-learning/tests/e2e/test-student-navigation.spec.ts:15:48
```

# Page snapshot

```yaml
- banner:
  - navigation:
    - link "Choice E-Learning":
      - /url: /
    - list:
      - listitem:
        - link "Courses":
          - /url: /courses
      - listitem:
        - link "Challenges":
          - /url: /challenges
      - listitem:
        - link "Reviews":
          - /url: /reviews
      - listitem:
        - link "FAQ":
          - /url: /faq
      - listitem:
        - link "Roadmap":
          - /url: /roadmap
    - link "Sign In":
      - /url: /login
    - link "Sign Up":
      - /url: /signup
- main:
  - heading "Login to your account" [level=2]
  - paragraph:
    - text: Or
    - link "sign up for a new account":
      - /url: /signup
  - text: Email address
  - textbox "Email address"
  - text: Password
  - textbox "Password"
  - checkbox "Remember me"
  - text: Remember me
  - link "Forgot your password?":
    - /url: /forgot-password
  - button "Sign in"
  - text: Or continue with
  - button "Continue with Google":
    - img
    - text: Continue with Google
  - button "Continue with GitHub":
    - img
    - text: Continue with GitHub
  - button "Continue with Facebook":
    - img
    - text: Continue with Facebook
  - button "Continue with Microsoft":
    - img
    - text: Continue with Microsoft
- contentinfo:
  - paragraph: Choice E-Learning offers high-quality online courses taught by experienced instructors. Learn at your own pace with hands-on projects and join our community of developers to accelerate your learning journey.
  - heading "Learn" [level=3]
  - list:
    - listitem:
      - link "All Courses":
        - /url: /all-courses
    - listitem:
      - link "Challenges":
        - /url: /challenges
    - listitem:
      - link "Learning Roadmap":
        - /url: /learning-roadmap
  - heading "Community" [level=3]
  - list:
    - listitem:
      - link "Reviews":
        - /url: /reviews
    - listitem:
      - link "Discord":
        - /url: https://discord.com
    - listitem:
      - link "YouTube":
        - /url: https://youtube.com
  - heading "About" [level=3]
  - list:
    - listitem:
      - link "Our Story":
        - /url: /our-story
    - listitem:
      - link "Instructors":
        - /url: /instructors
    - listitem:
      - link "Careers":
        - /url: /careers
  - heading "Support" [level=3]
  - list:
    - listitem:
      - link "FAQ":
        - /url: /faq
    - listitem:
      - link "Contact Us":
        - /url: mailto:support@choice-elearning.com
    - listitem:
      - link "Privacy Policy":
        - /url: /privacy
    - listitem:
      - link "Terms of Service":
        - /url: /terms
  - heading "Connect" [level=3]
  - link:
    - /url: https://github.com
    - img
  - link:
    - /url: https://twitter.com
    - img
  - link:
    - /url: https://discord.com
    - img
  - link:
    - /url: https://youtube.com
    - img
  - paragraph: Available worldwide
  - paragraph: Copyright © 2025 Choice E-Learning. All rights reserved.
  - link "Privacy Policy":
    - /url: /privacy
  - link "Terms of Use":
    - /url: /terms
  - link "Site Map":
    - /url: /sitemap
- button "Open Tanstack query devtools":
  - img
- alert
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Student Edit Page Navigation Test', () => {
   4 |   
   5 |   test('Test navigation from Student edit page', async ({ page }) => {
   6 |     console.log('🔍 Testing Student edit page navigation...');
   7 |     
   8 |     // Navigate to admin with pre-login
   9 |     await page.goto('http://localhost:3000/admin/students');
   10 |     await page.waitForLoadState('networkidle');
   11 |     
   12 |     console.log('Current URL after loading students page:', page.url());
   13 |     
   14 |     // Wait for page to load and check if we're on the students page
>  15 |     const pageTitle = await page.locator('h1').textContent();
      |                                                ^ Error: locator.textContent: Test timeout of 30000ms exceeded.
   16 |     console.log('Page title:', pageTitle);
   17 |     
   18 |     // Look for edit buttons in the student list
   19 |     const editButtons = await page.locator('a[href*="/admin/students/"][href*="/edit"]').all();
   20 |     console.log(`Found ${editButtons.length} edit buttons`);
   21 |     
   22 |     if (editButtons.length > 0) {
   23 |       // Click on the first edit button
   24 |       const firstEditButton = editButtons[0];
   25 |       const editHref = await firstEditButton.getAttribute('href');
   26 |       console.log('Clicking edit button with href:', editHref);
   27 |       
   28 |       await firstEditButton.click();
   29 |       await page.waitForLoadState('networkidle');
   30 |       await page.waitForTimeout(2000);
   31 |       
   32 |       const editPageUrl = page.url();
   33 |       console.log('Edit page URL:', editPageUrl);
   34 |       
   35 |       // Check if we're on the edit page
   36 |       const editTitle = await page.locator('h1').textContent();
   37 |       console.log('Edit page title:', editTitle);
   38 |       
   39 |       // Look for the Save Changes button
   40 |       const saveButton = await page.locator('button:has-text("Save Changes")');
   41 |       const saveButtonExists = await saveButton.isVisible({ timeout: 3000 });
   42 |       console.log('Save Changes button visible:', saveButtonExists);
   43 |       
   44 |       if (saveButtonExists) {
   45 |         console.log('Save Changes button found at position:', await saveButton.boundingBox());
   46 |       }
   47 |       
   48 |       // Test navigation back to students list
   49 |       console.log('\n📍 Testing navigation back to students...');
   50 |       
   51 |       // Try clicking "Back to Students" link
   52 |       const backButton = await page.locator('button:has-text("Back to Students"), a:has-text("Back to Students")');
   53 |       const backButtonExists = await backButton.isVisible({ timeout: 2000 });
   54 |       console.log('Back to Students button visible:', backButtonExists);
   55 |       
   56 |       if (backButtonExists) {
   57 |         console.log('Clicking Back to Students...');
   58 |         await backButton.click();
   59 |         await page.waitForTimeout(2000);
   60 |         
   61 |         const afterBackUrl = page.url();
   62 |         console.log('URL after clicking back:', afterBackUrl);
   63 |         
   64 |         const isBackOnStudents = afterBackUrl.includes('/admin/students') && !afterBackUrl.includes('/edit');
   65 |         console.log('Successfully navigated back to students list:', isBackOnStudents);
   66 |         
   67 |         if (!isBackOnStudents) {
   68 |           console.log('❌ Navigation back to students FAILED');
   69 |           
   70 |           // Check for any dialogs or modals that might be blocking navigation
   71 |           const dialogs = await page.locator('[role="dialog"], .modal, .popup').all();
   72 |           console.log('Found dialogs/modals:', dialogs.length);
   73 |           
   74 |           // Check if there's an unsaved changes warning
   75 |           const unsavedWarning = await page.locator('text*="unsaved", text*="Unsaved"').isVisible();
   76 |           console.log('Unsaved changes warning visible:', unsavedWarning);
   77 |         }
   78 |       }
   79 |       
   80 |       // Test navigation to other admin pages
   81 |       console.log('\n📍 Testing navigation to other admin pages...');
   82 |       
   83 |       // Go back to edit page first
   84 |       await page.goto(editPageUrl);
   85 |       await page.waitForLoadState('networkidle');
   86 |       
   87 |       // Try clicking sidebar links
   88 |       const sidebarLinks = [
   89 |         { text: 'Courses', href: '/admin/courses' },
   90 |         { text: 'Topics', href: '/admin/topics' },
   91 |         { text: 'Lessons', href: '/admin/lessons' },
   92 |         { text: 'FAQs', href: '/admin/faqs' }
   93 |       ];
   94 |       
   95 |       for (const link of sidebarLinks) {
   96 |         console.log(`\nTesting navigation to ${link.text}...`);
   97 |         
   98 |         const linkElement = await page.locator(`a:has-text("${link.text}")`).first();
   99 |         const linkVisible = await linkElement.isVisible({ timeout: 2000 });
  100 |         
  101 |         if (linkVisible) {
  102 |           await linkElement.click();
  103 |           await page.waitForTimeout(2000);
  104 |           
  105 |           const currentUrl = page.url();
  106 |           const navigatedSuccessfully = currentUrl.includes(link.href);
  107 |           console.log(`Navigation to ${link.text}: ${navigatedSuccessfully ? '✅ SUCCESS' : '❌ FAILED'}`);
  108 |           console.log(`Expected: ${link.href}, Got: ${currentUrl}`);
  109 |           
  110 |           if (!navigatedSuccessfully) {
  111 |             // Check for any blocking elements
  112 |             const hasDialog = await page.locator('[role="dialog"]').isVisible();
  113 |             const hasUnsavedWarning = await page.locator('text*="unsaved"').isVisible();
  114 |             console.log(`Dialog blocking: ${hasDialog}, Unsaved warning: ${hasUnsavedWarning}`);
  115 |           }
```