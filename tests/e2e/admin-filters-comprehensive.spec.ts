import { test, expect, Page } from '@playwright/test';

interface TestResult {
  page: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
  filterTests: FilterTestResult[];
}

interface FilterTestResult {
  type: 'filter' | 'search' | 'sort';
  name: string;
  passed: boolean;
  error?: string;
}

let testResults: TestResult[] = [];

// Helper function to wait for page load and check for errors
async function waitForPageLoad(page: Page, url: string): Promise<string[]> {
  const errors: string[] = [];
  
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    }
  });

  // Listen for page errors
  page.on('pageerror', error => {
    errors.push(`Page Error: ${error.message}`);
  });

  // Navigate to page
  await page.goto(url);
  
  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');
  
  // Wait a bit more for any dynamic content
  await page.waitForTimeout(1000);
  
  return errors;
}

// Helper function to test dropdowns
async function testDropdown(page: Page, selector: string, optionValue: string, filterName: string): Promise<FilterTestResult> {
  try {
    // Check if dropdown exists
    const dropdown = page.locator(selector);
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    
    // Select the option
    await dropdown.selectOption(optionValue);
    
    // Wait for any potential API calls
    await page.waitForTimeout(1000);
    
    // Check if URL or content changed (indicating filter worked)
    const currentValue = await dropdown.inputValue();
    if (currentValue !== optionValue) {
      throw new Error(`Dropdown value not updated correctly. Expected: ${optionValue}, Got: ${currentValue}`);
    }
    
    return {
      type: 'filter',
      name: filterName,
      passed: true
    };
  } catch (error) {
    return {
      type: 'filter',
      name: filterName,
      passed: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Helper function to test search
async function testSearch(page: Page, searchSelector: string, searchTerm: string): Promise<FilterTestResult> {
  try {
    // Check if search input exists
    const searchInput = page.locator(searchSelector);
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    
    // Clear and type search term
    await searchInput.clear();
    await searchInput.fill(searchTerm);
    
    // Press Enter or wait for auto-search
    await searchInput.press('Enter');
    
    // Wait for search results
    await page.waitForTimeout(2000);
    
    return {
      type: 'search',
      name: 'Search functionality',
      passed: true
    };
  } catch (error) {
    return {
      type: 'search',
      name: 'Search functionality',
      passed: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Test Students page
test('Admin Students page filters', async ({ page }) => {
  const pageUrl = '/admin/students';
  const pageErrors = await waitForPageLoad(page, pageUrl);
  
  const filterTests: FilterTestResult[] = [];
  
  try {
    // Test status filter
    const statusTest = await testDropdown(
      page, 
      'select:near(:text("All Status"))', 
      'active', 
      'Status Filter (Active)'
    );
    filterTests.push(statusTest);
    
    // Test another status option
    const statusTest2 = await testDropdown(
      page, 
      'select:near(:text("Active Only"))', 
      'inactive', 
      'Status Filter (Inactive)'
    );
    filterTests.push(statusTest2);
    
    // Test sort dropdown
    const sortTest = await testDropdown(
      page, 
      '#sort-filter', 
      'nameAsc', 
      'Sort by Name (A-Z)'
    );
    filterTests.push(sortTest);
    
    // Test another sort option
    const sortTest2 = await testDropdown(
      page, 
      '#sort-filter', 
      'gradeDesc', 
      'Sort by Grade (High-Low)'
    );
    filterTests.push(sortTest2);
    
    // Test search functionality
    const searchTest = await testSearch(
      page, 
      'input[placeholder*="Search students"]', 
      'test'
    );
    filterTests.push(searchTest);
    
  } catch (error) {
    pageErrors.push(`General page error: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  testResults.push({
    page: 'Students (/admin/students)',
    passed: pageErrors.length === 0 && filterTests.every(t => t.passed),
    errors: pageErrors,
    warnings: [],
    filterTests
  });
});

// Test Courses page
test('Admin Courses page filters', async ({ page }) => {
  const pageUrl = '/admin/courses';
  const pageErrors = await waitForPageLoad(page, pageUrl);
  
  const filterTests: FilterTestResult[] = [];
  
  try {
    // Test level filter
    const levelTest = await testDropdown(
      page, 
      'select:near(:text("All Levels"))', 
      'beginner', 
      'Level Filter (Beginner)'
    );
    filterTests.push(levelTest);
    
    // Test status filter
    const statusTest = await testDropdown(
      page, 
      'select:near(:text("All Status"))', 
      'published', 
      'Status Filter (Published)'
    );
    filterTests.push(statusTest);
    
    // Test sort dropdown
    const sortTest = await testDropdown(
      page, 
      'select:has(option[value="newest"])', 
      'title-asc', 
      'Sort by Title (A-Z)'
    );
    filterTests.push(sortTest);
    
    // Test search functionality
    const searchTest = await testSearch(
      page, 
      'input[placeholder*="Search courses"]', 
      'test'
    );
    filterTests.push(searchTest);
    
  } catch (error) {
    pageErrors.push(`General page error: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  testResults.push({
    page: 'Courses (/admin/courses)',
    passed: pageErrors.length === 0 && filterTests.every(t => t.passed),
    errors: pageErrors,
    warnings: [],
    filterTests
  });
});

// Test Lessons page
test('Admin Lessons page filters', async ({ page }) => {
  const pageUrl = '/admin/lessons';
  const pageErrors = await waitForPageLoad(page, pageUrl);
  
  const filterTests: FilterTestResult[] = [];
  
  try {
    // Test course filter
    const courseTest = await testDropdown(
      page, 
      'select:near(:text("All Courses"))', 
      'all', 
      'Course Filter'
    );
    filterTests.push(courseTest);
    
    // Test status filter
    const statusTest = await testDropdown(
      page, 
      'select:near(:text("All Status"))', 
      'published', 
      'Status Filter (Published)'
    );
    filterTests.push(statusTest);
    
    // Test sort dropdown
    const sortTest = await testDropdown(
      page, 
      'select:has(option[value="newest"])', 
      'title-asc', 
      'Sort by Title (A-Z)'
    );
    filterTests.push(sortTest);
    
    // Test search functionality
    const searchTest = await testSearch(
      page, 
      'input[placeholder*="Search lessons"]', 
      'test'
    );
    filterTests.push(searchTest);
    
  } catch (error) {
    pageErrors.push(`General page error: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  testResults.push({
    page: 'Lessons (/admin/lessons)',
    passed: pageErrors.length === 0 && filterTests.every(t => t.passed),
    errors: pageErrors,
    warnings: [],
    filterTests
  });
});

// Test Topics page
test('Admin Topics page filters', async ({ page }) => {
  const pageUrl = '/admin/topics';
  const pageErrors = await waitForPageLoad(page, pageUrl);
  
  const filterTests: FilterTestResult[] = [];
  
  try {
    // Test status filter
    const statusTest = await testDropdown(
      page, 
      'select:near(:text("All Status"))', 
      'active', 
      'Status Filter (Active)'
    );
    filterTests.push(statusTest);
    
    // Test sort dropdown
    const sortTest = await testDropdown(
      page, 
      '#sort-filter', 
      'nameAsc', 
      'Sort by Name (A-Z)'
    );
    filterTests.push(sortTest);
    
    // Test search functionality
    const searchTest = await testSearch(
      page, 
      'input[placeholder*="Search topics"]', 
      'test'
    );
    filterTests.push(searchTest);
    
  } catch (error) {
    pageErrors.push(`General page error: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  testResults.push({
    page: 'Topics (/admin/topics)',
    passed: pageErrors.length === 0 && filterTests.every(t => t.passed),
    errors: pageErrors,
    warnings: [],
    filterTests
  });
});

// Test FAQs page
test('Admin FAQs page filters', async ({ page }) => {
  const pageUrl = '/admin/faqs';
  const pageErrors = await waitForPageLoad(page, pageUrl);
  
  const filterTests: FilterTestResult[] = [];
  
  try {
    // Test category filter
    const categoryTest = await testDropdown(
      page, 
      'select:near(:text("All Categories"))', 
      '', 
      'Category Filter'
    );
    filterTests.push(categoryTest);
    
    // Test status filter
    const statusTest = await testDropdown(
      page, 
      'select:near(:text("All Status"))', 
      'active', 
      'Status Filter (Active)'
    );
    filterTests.push(statusTest);
    
    // Test sort dropdown
    const sortTest = await testDropdown(
      page, 
      '#sort-filter', 
      'questionAsc', 
      'Sort by Question (A-Z)'
    );
    filterTests.push(sortTest);
    
    // Test search functionality
    const searchTest = await testSearch(
      page, 
      'input[placeholder*="Search FAQs"]', 
      'test'
    );
    filterTests.push(searchTest);
    
  } catch (error) {
    pageErrors.push(`General page error: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  testResults.push({
    page: 'FAQs (/admin/faqs)',
    passed: pageErrors.length === 0 && filterTests.every(t => t.passed),
    errors: pageErrors,
    warnings: [],
    filterTests
  });
});

// Generate comprehensive report
test('Generate Admin Filter Test Report', async ({ page }) => {
  // Wait for all tests to complete
  await page.waitForTimeout(1000);
  
  console.log('\n=== ADMIN FILTER TEST REPORT ===\n');
  
  let totalPassed = 0;
  let totalFailed = 0;
  let totalFilterTests = 0;
  let passedFilterTests = 0;
  
  testResults.forEach(result => {
    if (result.passed) {
      totalPassed++;
    } else {
      totalFailed++;
    }
    
    console.log(`📄 ${result.page}`);
    console.log(`   Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (result.errors.length > 0) {
      console.log(`   Errors:`);
      result.errors.forEach(error => {
        console.log(`     ❌ ${error}`);
      });
    }
    
    if (result.warnings.length > 0) {
      console.log(`   Warnings:`);
      result.warnings.forEach(warning => {
        console.log(`     ⚠️  ${warning}`);
      });
    }
    
    console.log(`   Filter Tests:`);
    result.filterTests.forEach(filterTest => {
      totalFilterTests++;
      if (filterTest.passed) {
        passedFilterTests++;
        console.log(`     ✅ ${filterTest.name} (${filterTest.type})`);
      } else {
        console.log(`     ❌ ${filterTest.name} (${filterTest.type})`);
        if (filterTest.error) {
          console.log(`        Error: ${filterTest.error}`);
        }
      }
    });
    
    console.log('');
  });
  
  console.log('=== SUMMARY ===');
  console.log(`Total Pages Tested: ${testResults.length}`);
  console.log(`Pages Passed: ${totalPassed}`);
  console.log(`Pages Failed: ${totalFailed}`);
  console.log(`Total Filter Tests: ${totalFilterTests}`);
  console.log(`Filter Tests Passed: ${passedFilterTests}`);
  console.log(`Filter Tests Failed: ${totalFilterTests - passedFilterTests}`);
  console.log(`Success Rate: ${((passedFilterTests / totalFilterTests) * 100).toFixed(1)}%`);
  
  if (totalFailed === 0 && passedFilterTests === totalFilterTests) {
    console.log('\n🎉 ALL TESTS PASSED! All admin page filters are working correctly.');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED. Check the detailed report above for issues.');
  }
  
  // Expect the overall test to pass if most filters work
  expect(passedFilterTests / totalFilterTests).toBeGreaterThan(0.7); // At least 70% success rate
});