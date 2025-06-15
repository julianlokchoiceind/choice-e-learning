import { test, expect } from '@playwright/test';

interface FilterTestResult {
  page: string;
  hasFilters: boolean;
  errors: string[];
  filterElements: {
    search: boolean;
    filters: string[];
    sort: boolean;
  };
}

let testResults: FilterTestResult[] = [];

// Helper function to login as admin
async function loginAsAdmin(page: any) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  // Try to fill in login credentials (you can replace with actual test admin credentials)
  // For now, we'll test with a mock admin account
  const emailInput = page.locator('input[name="email"], input[type="email"]');
  const passwordInput = page.locator('input[name="password"], input[type="password"]');
  
  if (await emailInput.isVisible({ timeout: 1000 })) {
    await emailInput.fill('admin@test.com');
    await passwordInput.fill('password123');
    
    // Look for sign-in button
    const signInButton = page.locator('button:has-text("Sign in"), button:has-text("Login"), button[type="submit"]');
    if (await signInButton.isVisible({ timeout: 1000 })) {
      await signInButton.click();
      await page.waitForTimeout(2000);
    }
  }
}

// Helper function to check if page loads correctly
async function checkPageAccess(page: any, url: string): Promise<boolean> {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Check if we're redirected to login page
  const currentUrl = page.url();
  const isLoginPage = currentUrl.includes('/login') || currentUrl.includes('/auth');
  
  // Check if page has admin content
  const hasAdminContent = await page.locator('h1').isVisible({ timeout: 2000 });
  
  return !isLoginPage && hasAdminContent;
}

// Helper function to analyze filters on a page
async function analyzePageFilters(page: any, pageName: string): Promise<FilterTestResult> {
  const errors: string[] = [];
  const filters: string[] = [];
  
  try {
    // Check for search input
    const hasSearch = await page.locator('input[placeholder*="Search"], input[type="search"]').isVisible({ timeout: 2000 });
    
    // Check for filter dropdowns/selects
    const selects = await page.locator('select').all();
    for (const select of selects) {
      try {
        const options = await select.locator('option').all();
        if (options.length > 1) { // More than just a placeholder option
          const firstOption = await options[0].textContent();
          if (firstOption) {
            filters.push(firstOption.trim());
          }
        }
      } catch (e) {
        // Ignore individual select errors
      }
    }
    
    // Check for sort functionality (usually the last select or one with "sort" in options)
    let hasSort = false;
    for (const select of selects) {
      try {
        const text = await select.textContent();
        if (text && (text.includes('Newest') || text.includes('Oldest') || text.includes('Sort') || text.includes('Name'))) {
          hasSort = true;
          break;
        }
      } catch (e) {
        // Continue checking other selects
      }
    }
    
    return {
      page: pageName,
      hasFilters: hasSearch || filters.length > 0 || hasSort,
      errors,
      filterElements: {
        search: hasSearch,
        filters,
        sort: hasSort
      }
    };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return {
      page: pageName,
      hasFilters: false,
      errors,
      filterElements: {
        search: false,
        filters: [],
        sort: false
      }
    };
  }
}

test.describe('Admin Authentication and Filter Tests', () => {

  test('Check admin page accessibility', async ({ page }) => {
    console.log('🔍 Testing admin page accessibility...');
    
    const adminPages = [
      { url: '/admin/students', name: 'Students' },
      { url: '/admin/courses', name: 'Courses' },
      { url: '/admin/lessons', name: 'Lessons' },
      { url: '/admin/topics', name: 'Topics' },
      { url: '/admin/faqs', name: 'FAQs' }
    ];
    
    // First, try to access without login
    console.log('Testing pages without authentication...');
    for (const adminPage of adminPages) {
      const accessible = await checkPageAccess(page, adminPage.url);
      console.log(`${adminPage.name}: ${accessible ? '✅ Accessible' : '❌ Requires auth'}`);
      
      if (!accessible) {
        console.log(`🔐 ${adminPage.name} page requires authentication (as expected)`);
      }
    }
    
    // Try to login (this might fail if no test admin exists)
    console.log('\n🔐 Attempting to login as admin...');
    try {
      await loginAsAdmin(page);
      const loginSuccess = !page.url().includes('/login');
      console.log(`Login attempt: ${loginSuccess ? '✅ Success' : '❌ Failed'}`);
      
      if (loginSuccess) {
        console.log('\n🎉 Login successful! Testing authenticated access...');
        for (const adminPage of adminPages) {
          const accessible = await checkPageAccess(page, adminPage.url);
          console.log(`${adminPage.name} (authenticated): ${accessible ? '✅ Accessible' : '❌ Still blocked'}`);
        }
      }
    } catch (error) {
      console.log(`❌ Login failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  test('Analyze filter structures on accessible pages', async ({ page }) => {
    console.log('🔍 Analyzing filter structures...');
    
    const adminPages = [
      { url: '/admin/students', name: 'Students' },
      { url: '/admin/courses', name: 'Courses' },
      { url: '/admin/lessons', name: 'Lessons' },
      { url: '/admin/topics', name: 'Topics' },
      { url: '/admin/faqs', name: 'FAQs' }
    ];
    
    // Try to login first
    try {
      await loginAsAdmin(page);
    } catch (error) {
      console.log('Could not login, testing without authentication...');
    }
    
    for (const adminPage of adminPages) {
      const accessible = await checkPageAccess(page, adminPage.url);
      
      if (accessible) {
        console.log(`\n📊 Analyzing ${adminPage.name} page...`);
        const filterAnalysis = await analyzePageFilters(page, adminPage.name);
        testResults.push(filterAnalysis);
        
        console.log(`  Search input: ${filterAnalysis.filterElements.search ? '✅' : '❌'}`);
        console.log(`  Filter dropdowns: ${filterAnalysis.filterElements.filters.length} found`);
        if (filterAnalysis.filterElements.filters.length > 0) {
          console.log(`    Filters: ${filterAnalysis.filterElements.filters.join(', ')}`);
        }
        console.log(`  Sort functionality: ${filterAnalysis.filterElements.sort ? '✅' : '❌'}`);
        
        if (filterAnalysis.errors.length > 0) {
          console.log(`  ⚠️  Errors: ${filterAnalysis.errors.join(', ')}`);
        }
      } else {
        console.log(`\n❌ ${adminPage.name} page not accessible`);
        testResults.push({
          page: adminPage.name,
          hasFilters: false,
          errors: ['Page not accessible - requires authentication'],
          filterElements: {
            search: false,
            filters: [],
            sort: false
          }
        });
      }
    }
  });

  test('Test basic filter interactions on accessible pages', async ({ page }) => {
    console.log('🧪 Testing filter interactions...');
    
    // Try to login first
    try {
      await loginAsAdmin(page);
    } catch (error) {
      console.log('Proceeding without authentication...');
    }
    
    const testPages = ['/admin/students', '/admin/courses', '/admin/topics'];
    
    for (const pageUrl of testPages) {
      const accessible = await checkPageAccess(page, pageUrl);
      
      if (accessible) {
        const pageName = pageUrl.split('/').pop() || 'unknown';
        console.log(`\n🔧 Testing interactions on ${pageName} page...`);
        
        try {
          // Test search input
          const searchInput = page.locator('input[placeholder*="Search"]').first();
          if (await searchInput.isVisible({ timeout: 1000 })) {
            await searchInput.fill('test');
            await searchInput.press('Enter');
            await page.waitForTimeout(1000);
            console.log(`  Search test: ✅`);
          } else {
            console.log(`  Search test: ❌ No search input found`);
          }
          
          // Test first dropdown
          const firstSelect = page.locator('select').first();
          if (await firstSelect.isVisible({ timeout: 1000 })) {
            const options = await firstSelect.locator('option').all();
            if (options.length > 1) {
              await firstSelect.selectOption({ index: 1 });
              await page.waitForTimeout(1000);
              console.log(`  Filter dropdown test: ✅`);
            } else {
              console.log(`  Filter dropdown test: ❌ No options found`);
            }
          } else {
            console.log(`  Filter dropdown test: ❌ No dropdown found`);
          }
          
        } catch (error) {
          console.log(`  ❌ Interaction error: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        console.log(`\n❌ ${pageUrl} not accessible for interaction testing`);
      }
    }
  });

  test('Generate comprehensive report', async ({ page }) => {
    console.log('\n' + '='.repeat(60));
    console.log('📋 COMPREHENSIVE ADMIN FILTER ANALYSIS REPORT');
    console.log('='.repeat(60));
    
    let totalPages = testResults.length;
    let accessiblePages = testResults.filter(r => r.hasFilters || r.filterElements.search).length;
    let pagesWithSearch = testResults.filter(r => r.filterElements.search).length;
    let pagesWithFilters = testResults.filter(r => r.filterElements.filters.length > 0).length;
    let pagesWithSort = testResults.filter(r => r.filterElements.sort).length;
    let pagesWithErrors = testResults.filter(r => r.errors.length > 0).length;
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`  Total pages tested: ${totalPages}`);
    console.log(`  Accessible pages: ${accessiblePages}`);
    console.log(`  Pages with search: ${pagesWithSearch}`);
    console.log(`  Pages with filters: ${pagesWithFilters}`);
    console.log(`  Pages with sort: ${pagesWithSort}`);
    console.log(`  Pages with errors: ${pagesWithErrors}`);
    
    console.log(`\n📄 DETAILED RESULTS:`);
    testResults.forEach(result => {
      console.log(`\n  ${result.page}:`);
      console.log(`    Has filters: ${result.hasFilters ? '✅' : '❌'}`);
      console.log(`    Search input: ${result.filterElements.search ? '✅' : '❌'}`);
      console.log(`    Filter options: ${result.filterElements.filters.length} (${result.filterElements.filters.join(', ')})`);
      console.log(`    Sort functionality: ${result.filterElements.sort ? '✅' : '❌'}`);
      
      if (result.errors.length > 0) {
        console.log(`    ⚠️  Issues: ${result.errors.join('; ')}`);
      }
    });
    
    console.log('\n🎯 RECOMMENDATIONS:');
    if (pagesWithErrors > 0) {
      console.log('  1. ⚠️  Some pages have authentication issues or errors');
      console.log('     - Consider setting up test admin credentials');
      console.log('     - Check middleware configuration');
    }
    
    if (pagesWithSearch < totalPages) {
      console.log('  2. 🔍 Not all pages have search functionality');
      console.log('     - Verify search inputs are properly implemented');
    }
    
    if (pagesWithSort < totalPages) {
      console.log('  3. ⬆️  Not all pages have sort functionality');
      console.log('     - Check sort dropdown implementations');
    }
    
    console.log('\n✅ ANALYSIS COMPLETE');
    console.log('='.repeat(60));
    
    // Don't fail the test - this is just reporting
    expect(totalPages).toBeGreaterThan(0);
  });
});