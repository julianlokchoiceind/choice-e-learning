import { test, expect } from '@playwright/test';

test.describe('Student Edit Page Navigation Test', () => {
  
  test('Test navigation from Student edit page', async ({ page }) => {
    console.log('🔍 Testing Student edit page navigation...');
    
    // Navigate to admin - handle potential login redirect
    await page.goto('http://localhost:3000/admin/students');
    await page.waitForLoadState('networkidle');
    
    console.log('Current URL after loading students page:', page.url());
    
    // Check if we were redirected to login page
    if (page.url().includes('/login')) {
      console.log('❌ Redirected to login page - authentication required');
      console.log('⚠️  Cannot test navigation without proper authentication');
      
      // Try direct navigation to a student edit page to test
      const directEditUrl = 'http://localhost:3000/admin/students/684d1c3cc349af75750889fc/edit';
      console.log('Trying direct navigation to:', directEditUrl);
      
      await page.goto(directEditUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      if (page.url().includes('/login')) {
        console.log('❌ Still redirected to login - skipping detailed tests');
        return;
      }
    }
    
    // Wait for page to load and check if we're on the students page
    const pageTitle = await page.locator('h1').first().textContent({ timeout: 5000 });
    console.log('Page title:', pageTitle);
    
    // Look for edit buttons in the student list
    const editButtons = await page.locator('a[href*="/admin/students/"][href*="/edit"]').all();
    console.log(`Found ${editButtons.length} edit buttons`);
    
    if (editButtons.length > 0) {
      // Click on the first edit button
      const firstEditButton = editButtons[0];
      const editHref = await firstEditButton.getAttribute('href');
      console.log('Clicking edit button with href:', editHref);
      
      await firstEditButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const editPageUrl = page.url();
      console.log('Edit page URL:', editPageUrl);
      
      // Check if we're on the edit page
      const editTitle = await page.locator('h1').textContent();
      console.log('Edit page title:', editTitle);
      
      // Look for the Save Changes button
      const saveButton = await page.locator('button:has-text("Save Changes")');
      const saveButtonExists = await saveButton.isVisible({ timeout: 3000 });
      console.log('Save Changes button visible:', saveButtonExists);
      
      if (saveButtonExists) {
        console.log('Save Changes button found at position:', await saveButton.boundingBox());
      }
      
      // Test navigation back to students list
      console.log('\n📍 Testing navigation back to students...');
      
      // Try clicking "Back to Students" link
      const backButton = await page.locator('button:has-text("Back to Students"), a:has-text("Back to Students")');
      const backButtonExists = await backButton.isVisible({ timeout: 2000 });
      console.log('Back to Students button visible:', backButtonExists);
      
      if (backButtonExists) {
        console.log('Clicking Back to Students...');
        await backButton.click();
        await page.waitForTimeout(2000);
        
        const afterBackUrl = page.url();
        console.log('URL after clicking back:', afterBackUrl);
        
        const isBackOnStudents = afterBackUrl.includes('/admin/students') && !afterBackUrl.includes('/edit');
        console.log('Successfully navigated back to students list:', isBackOnStudents);
        
        if (!isBackOnStudents) {
          console.log('❌ Navigation back to students FAILED');
          
          // Check for any dialogs or modals that might be blocking navigation
          const dialogs = await page.locator('[role="dialog"], .modal, .popup').all();
          console.log('Found dialogs/modals:', dialogs.length);
          
          // Check if there's an unsaved changes warning
          const unsavedWarning = await page.locator('text*="unsaved", text*="Unsaved"').isVisible();
          console.log('Unsaved changes warning visible:', unsavedWarning);
        }
      }
      
      // Test navigation to other admin pages
      console.log('\n📍 Testing navigation to other admin pages...');
      
      // Go back to edit page first
      await page.goto(editPageUrl);
      await page.waitForLoadState('networkidle');
      
      // Try clicking sidebar links
      const sidebarLinks = [
        { text: 'Courses', href: '/admin/courses' },
        { text: 'Topics', href: '/admin/topics' },
        { text: 'Lessons', href: '/admin/lessons' },
        { text: 'FAQs', href: '/admin/faqs' }
      ];
      
      for (const link of sidebarLinks) {
        console.log(`\nTesting navigation to ${link.text}...`);
        
        const linkElement = await page.locator(`a:has-text("${link.text}")`).first();
        const linkVisible = await linkElement.isVisible({ timeout: 2000 });
        
        if (linkVisible) {
          await linkElement.click();
          await page.waitForTimeout(2000);
          
          const currentUrl = page.url();
          const navigatedSuccessfully = currentUrl.includes(link.href);
          console.log(`Navigation to ${link.text}: ${navigatedSuccessfully ? '✅ SUCCESS' : '❌ FAILED'}`);
          console.log(`Expected: ${link.href}, Got: ${currentUrl}`);
          
          if (!navigatedSuccessfully) {
            // Check for any blocking elements
            const hasDialog = await page.locator('[role="dialog"]').isVisible();
            const hasUnsavedWarning = await page.locator('text*="unsaved"').isVisible();
            console.log(`Dialog blocking: ${hasDialog}, Unsaved warning: ${hasUnsavedWarning}`);
          }
          
          // Go back to edit page for next test
          await page.goto(editPageUrl);
          await page.waitForTimeout(1000);
        } else {
          console.log(`${link.text} link not visible in sidebar`);
        }
      }
      
    } else {
      console.log('❌ No edit buttons found on students page');
    }
  });
  
  test('Compare with Topic edit page navigation', async ({ page }) => {
    console.log('🔍 Testing Topic edit page navigation for comparison...');
    
    // Navigate to topics page
    await page.goto('http://localhost:3000/admin/topics');
    await page.waitForLoadState('networkidle');
    
    // Find and click edit button
    const topicEditButtons = await page.locator('a[href*="/admin/topics/"][href*="/edit"]').all();
    console.log(`Found ${topicEditButtons.length} topic edit buttons`);
    
    if (topicEditButtons.length > 0) {
      await topicEditButtons[0].click();
      await page.waitForLoadState('networkidle');
      
      const topicEditUrl = page.url();
      console.log('Topic edit page URL:', topicEditUrl);
      
      // Test navigation from topic edit
      const backToTopics = await page.locator('button:has-text("Back to Topics")');
      if (await backToTopics.isVisible({ timeout: 2000 })) {
        await backToTopics.click();
        await page.waitForTimeout(2000);
        
        const afterBackUrl = page.url();
        const topicNavWorked = afterBackUrl.includes('/admin/topics') && !afterBackUrl.includes('/edit');
        console.log('Topic edit navigation back works:', topicNavWorked ? '✅ YES' : '❌ NO');
      }
    }
  });
  
  test('Test GuardedFormPage navigation behavior', async ({ page }) => {
    console.log('🔍 Testing GuardedFormPage navigation behavior...');
    
    // Go to student edit page
    await page.goto('http://localhost:3000/admin/students');
    await page.waitForLoadState('networkidle');
    
    const editButtons = await page.locator('a[href*="/admin/students/"][href*="/edit"]').all();
    if (editButtons.length > 0) {
      await editButtons[0].click();
      await page.waitForLoadState('networkidle');
      
      // Make a change to trigger unsaved state
      const nameInput = await page.locator('input[name="name"], input#name');
      if (await nameInput.isVisible({ timeout: 2000 })) {
        await nameInput.fill('Modified Name Test');
        await page.waitForTimeout(1000);
        
        console.log('Made changes to form, now testing navigation...');
        
        // Try to navigate away
        const backButton = await page.locator('button:has-text("Back to Students")');
        if (await backButton.isVisible()) {
          await backButton.click();
          await page.waitForTimeout(1000);
          
          // Check if confirmation dialog appeared
          const confirmDialog = await page.locator('text*="unsaved", text*="rời khỏi"').isVisible();
          console.log('Unsaved changes confirmation dialog:', confirmDialog ? '✅ APPEARED' : '❌ MISSING');
          
          if (confirmDialog) {
            // Try clicking cancel/stay
            const cancelButton = await page.locator('button:has-text("Cancel"), button:has-text("Hủy")');
            if (await cancelButton.isVisible()) {
              await cancelButton.click();
              await page.waitForTimeout(500);
              console.log('Clicked cancel, should stay on edit page');
            }
          }
        }
      }
    }
  });
});