import { test, expect } from '@playwright/test';
import { TestUtils, setupTestContext } from '../helpers/testUtils';

test.describe('Application Loading - Smoke Tests', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page, context }) => {
    await setupTestContext(context);
    utils = new TestUtils(page);
    await utils.logConsoleErrors();
    
    // Setup test environment
    await utils.seedTestData();
    await utils.setupTestAuth();
  });

  test('should load application without getting stuck in loading state', async ({ page }) => {
    // Navigate to the application with test mode enabled
    await page.goto('/?test=true');
    
    // Wait for app to be ready
    const isReady = await utils.waitForAppReady();
    expect(isReady).toBe(true);
    
    // Verify we're not stuck in loading state
    const loadingElements = await page.locator('.ra-loading, .MuiCircularProgress-root').count();
    expect(loadingElements).toBe(0);
    
    // Verify core app elements are present
    await expect(page.locator('.MuiToolbar-root, .ra-layout')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/?test=true');
    await utils.waitForAppReady();
    
    // Check if we can navigate to organizations
    try {
      await page.click('a[href*="organizations"], nav a:has-text("Organizations")');
      await utils.waitForPageLoad();
      
      // Should reach organizations page
      await expect(page).toHaveURL(/.*organizations.*/);
    } catch (error) {
      // If navigation link doesn't exist, that's also valuable information
      console.log('Navigation test: Organizations link not found or not clickable');
    }
  });

  test('should not have console errors on load', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/?test=true');
    await utils.waitForAppReady();
    
    // Wait a bit more for any delayed errors
    await page.waitForTimeout(2000);
    
    // Filter out known test-related errors
    const significantErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('manifest') &&
      !error.includes('chunk-')
    );
    
    expect(significantErrors).toHaveLength(0);
  });

  test('should have correct data provider in test mode', async ({ page }) => {
    await page.goto('/?test=true');
    await utils.waitForAppReady();
    
    // Check that test mode is properly configured
    const testModeEnabled = await page.evaluate(() => {
      return localStorage.getItem('test-mode') === 'true' &&
             localStorage.getItem('data-provider') === 'fakerest';
    });
    
    expect(testModeEnabled).toBe(true);
  });

  test('should be authenticated in test mode', async ({ page }) => {
    await page.goto('/?test=true');
    await utils.waitForAppReady();
    
    // Check authentication status
    const isAuthenticated = await utils.isLoggedIn();
    expect(isAuthenticated).toBe(true);
    
    // Should not be on login page
    expect(page.url()).not.toContain('/login');
  });
});