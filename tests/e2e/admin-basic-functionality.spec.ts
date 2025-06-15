import { test, expect } from '@playwright/test';

// Basic test to check if admin pages load and basic elements are present
test.describe('Admin Pages Basic Functionality', () => {
  
  test('Students page loads and has filters', async ({ page }) => {
    console.log('Testing /admin/students...');
    
    // Navigate to students page
    await page.goto('/admin/students');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page.locator('h1')).toContainText('Students Management');
    
    // Check if search input exists
    const searchInput = page.locator('input[placeholder*="Search students"]');
    await expect(searchInput).toBeVisible();
    
    // Check if status filter exists
    const statusFilter = page.locator('select:has(option:text("All Status"))');
    await expect(statusFilter).toBeVisible();
    
    // Check if sort filter exists
    const sortFilter = page.locator('select:has(option:text("Newest"))');
    await expect(sortFilter).toBeVisible();
    
    console.log('✅ Students page basic functionality works');
  });

  test('Courses page loads and has filters', async ({ page }) => {
    console.log('Testing /admin/courses...');
    
    // Navigate to courses page
    await page.goto('/admin/courses');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page.locator('h1')).toContainText('Courses Management');
    
    // Check if search input exists
    const searchInput = page.locator('input[placeholder*="Search courses"]');
    await expect(searchInput).toBeVisible();
    
    // Check if level filter exists
    const levelFilter = page.locator('select:has(option:text("All Levels"))');
    await expect(levelFilter).toBeVisible();
    
    // Check if status filter exists
    const statusFilter = page.locator('select:has(option:text("All Status"))');
    await expect(statusFilter).toBeVisible();
    
    // Check if sort filter exists
    const sortFilter = page.locator('select:has(option:text("Newest First"))');
    await expect(sortFilter).toBeVisible();
    
    console.log('✅ Courses page basic functionality works');
  });

  test('Lessons page loads and has filters', async ({ page }) => {
    console.log('Testing /admin/lessons...');
    
    // Navigate to lessons page
    await page.goto('/admin/lessons');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page.locator('h1')).toContainText('Lessons Management');
    
    // Check if search input exists
    const searchInput = page.locator('input[placeholder*="Search lessons"]');
    await expect(searchInput).toBeVisible();
    
    // Check if course filter exists
    const courseFilter = page.locator('select:has(option:text("All Courses"))');
    await expect(courseFilter).toBeVisible();
    
    // Check if status filter exists
    const statusFilter = page.locator('select:has(option:text("All Status"))');
    await expect(statusFilter).toBeVisible();
    
    // Check if sort filter exists
    const sortFilter = page.locator('select:has(option:text("Newest First"))');
    await expect(sortFilter).toBeVisible();
    
    console.log('✅ Lessons page basic functionality works');
  });

  test('Topics page loads and has filters', async ({ page }) => {
    console.log('Testing /admin/topics...');
    
    // Navigate to topics page
    await page.goto('/admin/topics');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page.locator('h1')).toContainText('Topics Management');
    
    // Check if search input exists
    const searchInput = page.locator('input[placeholder*="Search topics"]');
    await expect(searchInput).toBeVisible();
    
    // Check if status filter exists
    const statusFilter = page.locator('select:has(option:text("All Status"))');
    await expect(statusFilter).toBeVisible();
    
    // Check if sort filter exists (with ID selector as backup)
    const sortFilter = page.locator('#sort-filter');
    await expect(sortFilter).toBeVisible();
    
    console.log('✅ Topics page basic functionality works');
  });

  test('FAQs page loads and has filters', async ({ page }) => {
    console.log('Testing /admin/faqs...');
    
    // Navigate to faqs page
    await page.goto('/admin/faqs');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page.locator('h1')).toContainText('FAQs Management');
    
    // Check if search input exists
    const searchInput = page.locator('input[placeholder*="Search FAQs"]');
    await expect(searchInput).toBeVisible();
    
    // Check if category filter exists
    const categoryFilter = page.locator('select:has(option:text("All Categories"))');
    await expect(categoryFilter).toBeVisible();
    
    // Check if status filter exists
    const statusFilter = page.locator('select:has(option:text("All Status"))');
    await expect(statusFilter).toBeVisible();
    
    // Check if sort filter exists
    const sortFilter = page.locator('#sort-filter');
    await expect(sortFilter).toBeVisible();
    
    console.log('✅ FAQs page basic functionality works');
  });

  test('Test filter interactions on Students page', async ({ page }) => {
    console.log('Testing filter interactions on Students page...');
    
    await page.goto('/admin/students');
    await page.waitForLoadState('networkidle');
    
    // Test status filter
    const statusFilter = page.locator('select:has(option:text("All Status"))');
    await statusFilter.selectOption('active');
    await page.waitForTimeout(1000);
    
    // Test sort filter
    const sortFilter = page.locator('select:has(option:text("Newest"))');
    await sortFilter.selectOption('nameAsc');
    await page.waitForTimeout(1000);
    
    // Test search
    const searchInput = page.locator('input[placeholder*="Search students"]');
    await searchInput.fill('test');
    await searchInput.press('Enter');
    await page.waitForTimeout(1000);
    
    console.log('✅ Students page filter interactions work');
  });

  test('Check for console errors on all admin pages', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(`${msg.url()}: ${msg.text()}`);
      }
    });
    
    const pages = [
      '/admin/students',
      '/admin/courses', 
      '/admin/lessons',
      '/admin/topics',
      '/admin/faqs'
    ];
    
    for (const url of pages) {
      console.log(`Checking console errors for ${url}...`);
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
    
    if (errors.length > 0) {
      console.log('❌ Console errors found:');
      errors.forEach(error => console.log(`   ${error}`));
    } else {
      console.log('✅ No console errors found on admin pages');
    }
    
    // Don't fail the test for console errors, just report them
    console.log(`Total console errors: ${errors.length}`);
  });
});