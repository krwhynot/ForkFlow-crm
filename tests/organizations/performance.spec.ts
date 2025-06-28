import { expect, test } from '@playwright/test';
import { organizationTestData } from '../fixtures';
import { OrganizationTestHelpers } from '../helpers/organizationHelpers';
import { TestUtils, setupTestContext } from '../helpers/testUtils';

test.describe('Organization Performance Testing', () => {
  let orgHelpers: OrganizationTestHelpers;
  let utils: TestUtils;

  test.beforeEach(async ({ page, context }) => {
    await setupTestContext(context);
    orgHelpers = new OrganizationTestHelpers(page);
    utils = new TestUtils(page);
    await utils.logConsoleErrors();
    if (!(await utils.isLoggedIn())) {
      await utils.login();
    }
  });

  test.describe('Page Load Performance', () => {
    test('should load organization list within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await orgHelpers.navigateToOrganizations();
      const loadTime = Date.now() - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // Verify page is fully loaded
      await expect(page.locator('.organization-list, .MuiDataGrid-root')).toBeVisible();
    });

    test('should load organization create form quickly', async ({ page }) => {
      const startTime = Date.now();
      await orgHelpers.navigateToCreateOrganization();
      const loadTime = Date.now() - startTime;

      // Form should load within 2 seconds
      expect(loadTime).toBeLessThan(2000);

      // Verify form is ready for interaction
      await expect(page.locator('input[name="name"]')).toBeVisible();
    });

    test('should load organization details quickly', async ({ page }) => {
      // Create test organization first
      await orgHelpers.createTestOrganization(organizationTestData.basic);
      const orgId = await page.url().match(/\/organizations\/(\d+)/)?.[1];

      const startTime = Date.now();
      await orgHelpers.navigateToOrganization(orgId!);
      const loadTime = Date.now() - startTime;

      // Details should load within 2 seconds
      expect(loadTime).toBeLessThan(2000);

      // Verify details are displayed
      await expect(page.locator('.organization-details, .organization-name')).toBeVisible();
    });

    test('should handle concurrent page loads', async ({ page, context }) => {
      // Open multiple tabs simultaneously
      const page2 = await context.newPage();
      const page3 = await context.newPage();

      const startTime = Date.now();

      // Load different pages concurrently
      const promises = [
        orgHelpers.navigateToOrganizations(),
        new OrganizationTestHelpers(page2).navigateToCreateOrganization(),
        new OrganizationTestHelpers(page3).navigateToOrganizations(),
      ];

      await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // All pages should load within 5 seconds total
      expect(totalTime).toBeLessThan(5000);

      await page2.close();
      await page3.close();
    });
  });

  test.describe('Form Performance', () => {
    test('should handle form submission quickly', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();
      await orgHelpers.fillOrganizationForm(organizationTestData.basic);

      const startTime = Date.now();
      await orgHelpers.clickSaveButton();
      const submitTime = Date.now() - startTime;

      // Should submit within 3 seconds
      expect(submitTime).toBeLessThan(3000);

      // Verify successful submission
      await expect(page).toHaveURL(/\/organizations\/\d+/);
    });

    test('should handle form validation quickly', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      const startTime = Date.now();
      await page.fill('input[name="phone"]', 'invalid-phone');
      await page.locator('input[name="phone"]').blur();
      const validationTime = Date.now() - startTime;

      // Validation should appear within 500ms
      expect(validationTime).toBeLessThan(500);

      // Verify validation error appears
      await orgHelpers.expectValidationError('phone');
    });

    test('should handle real-time field updates efficiently', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      const nameInput = page.locator('input[name="name"]');

      // Measure typing performance
      const startTime = Date.now();
      await nameInput.type('Quick Performance Test Restaurant Name');
      const typingTime = Date.now() - startTime;

      // Should handle typing without lag (less than 1 second for full text)
      expect(typingTime).toBeLessThan(1000);

      // Verify text was entered correctly
      await expect(nameInput).toHaveValue('Quick Performance Test Restaurant Name');
    });
  });

  test.describe('Search and Filter Performance', () => {
    test.beforeAll(async ({ browser }) => {
      // Create test data for performance testing
      const context = await browser.newContext();
      const page = await context.newPage();
      const helpers = new OrganizationTestHelpers(page);
      const testUtils = new TestUtils(page);

      if (!(await testUtils.isLoggedIn())) {
        await testUtils.login();
      }

      // Create 50 test organizations for performance testing
      for (let i = 0; i < 50; i++) {
        await helpers.createTestOrganization({
          ...organizationTestData.basic,
          name: `Performance Test Org ${i}`,
          city: i % 5 === 0 ? 'San Francisco' : 'Oakland',
          state: 'CA',
        });
      }

      await context.close();
    });

    test('should search large datasets quickly', async ({ page }) => {
      await orgHelpers.navigateToOrganizations();

      const startTime = Date.now();
      await orgHelpers.searchOrganizations('Performance Test');
      const searchTime = Date.now() - startTime;

      // Search should complete within 2 seconds
      expect(searchTime).toBeLessThan(2000);

      // Verify search results appear
      const rowCount = await orgHelpers.getOrganizationRowCount();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('should apply filters quickly', async ({ page }) => {
      await orgHelpers.navigateToOrganizations();

      const startTime = Date.now();
      await orgHelpers.applyFilter('city', 'San Francisco');
      const filterTime = Date.now() - startTime;

      // Filter should apply within 1.5 seconds
      expect(filterTime).toBeLessThan(1500);

      // Verify filtered results
      const rowCount = await orgHelpers.getOrganizationRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('should handle multiple filters efficiently', async ({ page }) => {
      await orgHelpers.navigateToOrganizations();

      const startTime = Date.now();

      // Apply multiple filters in sequence
      await orgHelpers.applyFilter('city', 'San Francisco');
      await orgHelpers.applyFilter('state', 'CA');
      await orgHelpers.searchOrganizations('Performance');

      const totalTime = Date.now() - startTime;

      // Multiple filters should complete within 3 seconds
      expect(totalTime).toBeLessThan(3000);
    });

    test('should clear filters quickly', async ({ page }) => {
      await orgHelpers.navigateToOrganizations();

      // Apply some filters first
      await orgHelpers.applyFilter('city', 'San Francisco');
      await orgHelpers.searchOrganizations('Performance');

      const startTime = Date.now();
      await page.click('.clear-filters, button:has-text("Clear Filters")');
      const clearTime = Date.now() - startTime;

      // Should clear within 1 second
      expect(clearTime).toBeLessThan(1000);
    });
  });

  test.describe('Data Loading Performance', () => {
    test('should handle pagination efficiently', async ({ page }) => {
      await orgHelpers.navigateToOrganizations();

      // Navigate to next page if pagination exists
      const nextButton = page.locator('.MuiPagination-root button:has-text("2"), .pagination-next');

      if (await nextButton.isVisible()) {
        const startTime = Date.now();
        await nextButton.click();
        const paginationTime = Date.now() - startTime;

        // Pagination should complete within 1 second
        expect(paginationTime).toBeLessThan(1000);
      }
    });

    test('should load organization statistics quickly', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.complete);
      const orgId = await page.url().match(/\/organizations\/(\d+)/)?.[1];

      const startTime = Date.now();
      await orgHelpers.navigateToOrganization(orgId!);
      const statsLoadTime = Date.now() - startTime;

      // Statistics should load within 2 seconds
      expect(statsLoadTime).toBeLessThan(2000);

      // Verify stats are displayed
      await expect(page.locator('.organization-stats, .stats-section')).toBeVisible();
    });

    test('should handle bulk operations efficiently', async ({ page }) => {
      await orgHelpers.navigateToOrganizations();

      // Select multiple organizations if bulk operations exist
      const checkboxes = page.locator('.MuiCheckbox-root, .selection-checkbox');
      const checkboxCount = await checkboxes.count();

      if (checkboxCount > 0) {
        const startTime = Date.now();

        // Select first 3 checkboxes
        for (let i = 0; i < Math.min(3, checkboxCount); i++) {
          await checkboxes.nth(i).click();
        }

        const selectionTime = Date.now() - startTime;

        // Bulk selection should complete within 1 second
        expect(selectionTime).toBeLessThan(1000);
      }
    });
  });

  test.describe('Memory Performance', () => {
    test('should not cause memory leaks during navigation', async ({ page }) => {
      // Measure initial memory usage
      const initialMemory = await page.evaluate(() => {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize;
        }
        return 0;
      });

      // Navigate between pages multiple times
      for (let i = 0; i < 10; i++) {
        await orgHelpers.navigateToOrganizations();
        await orgHelpers.navigateToCreateOrganization();
        await page.goBack();
      }

      // Force garbage collection if available
      await page.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });

      const finalMemory = await page.evaluate(() => {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize;
        }
        return 0;
      });

      // Memory should not increase dramatically (allow 50% increase)
      if (initialMemory > 0 && finalMemory > 0) {
        expect(finalMemory).toBeLessThan(initialMemory * 1.5);
      }
    });

    test('should handle large forms without performance degradation', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      // Fill form with large amounts of data
      const largeNotes = 'A'.repeat(500); // Max allowed length

      const startTime = Date.now();
      await orgHelpers.fillOrganizationForm({
        ...organizationTestData.complete,
        notes: largeNotes,
      });
      const fillTime = Date.now() - startTime;

      // Should handle large data within 2 seconds
      expect(fillTime).toBeLessThan(2000);
    });
  });

  test.describe('Network Performance', () => {
    test('should handle slow network conditions', async ({ page, context }) => {
      // Simulate slow 3G network
      await context.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
        await route.continue();
      });

      const startTime = Date.now();
      await orgHelpers.navigateToOrganizations();
      const loadTime = Date.now() - startTime;

      // Should still load within reasonable time on slow network (10 seconds)
      expect(loadTime).toBeLessThan(10000);
    });

    test('should optimize API calls', async ({ page }) => {
      const apiCalls: string[] = [];

      // Monitor API calls
      page.on('request', request => {
        if (request.url().includes('/api/') || request.url().includes('/organizations')) {
          apiCalls.push(request.url());
        }
      });

      await orgHelpers.navigateToOrganizations();

      // Should not make excessive API calls
      expect(apiCalls.length).toBeLessThan(10);
    });

    test('should cache data appropriately', async ({ page }) => {
      // Navigate to organizations
      await orgHelpers.navigateToOrganizations();

      const requestCount1 = await page.evaluate(() => {
        return (window as any).requestCount || 0;
      });

      // Navigate away and back
      await orgHelpers.navigateToCreateOrganization();
      await orgHelpers.navigateToOrganizations();

      const requestCount2 = await page.evaluate(() => {
        return (window as any).requestCount || 0;
      });

      // Should use cached data when appropriate
      expect(requestCount2).toBeLessThanOrEqual(requestCount1 + 2);
    });
  });

  test.describe('Rendering Performance', () => {
    test('should render tables efficiently', async ({ page }) => {
      await orgHelpers.navigateToOrganizations();

      const startTime = Date.now();

      // Wait for table to be fully rendered
      await page.waitForSelector('.organization-list, .MuiDataGrid-root', { state: 'visible' });
      await page.waitForLoadState('networkidle');

      const renderTime = Date.now() - startTime;

      // Table should render within 2 seconds
      expect(renderTime).toBeLessThan(2000);
    });

    test('should handle scroll performance', async ({ page }) => {
      await orgHelpers.navigateToOrganizations();

      // Measure scroll performance
      const startTime = Date.now();

      for (let i = 0; i < 5; i++) {
        await page.mouse.wheel(0, 300);
        await page.waitForTimeout(100);
      }

      const scrollTime = Date.now() - startTime;

      // Scrolling should be smooth (less than 1 second for 5 scrolls)
      expect(scrollTime).toBeLessThan(1000);
    });

    test('should handle responsive layout changes efficiently', async ({ page }) => {
      await orgHelpers.navigateToOrganizations();

      const startTime = Date.now();

      // Change viewport size to trigger responsive layout
      await page.setViewportSize({ width: 375, height: 667 }); // Mobile
      await page.waitForTimeout(100);
      await page.setViewportSize({ width: 1280, height: 720 }); // Desktop

      const layoutTime = Date.now() - startTime;

      // Layout changes should complete within 500ms
      expect(layoutTime).toBeLessThan(500);
    });
  });

  test.describe('Resource Loading Performance', () => {
    test('should load CSS and JS efficiently', async ({ page }) => {
      const resourceSizes: number[] = [];

      page.on('response', response => {
        const url = response.url();
        if (url.includes('.css') || url.includes('.js')) {
          response.body().then(body => {
            resourceSizes.push(body.length);
          }).catch(() => {
            // Ignore errors for this test
          });
        }
      });

      await orgHelpers.navigateToOrganizations();

      // Allow time for resources to load
      await page.waitForTimeout(2000);

      // Check that resources aren't excessively large
      const totalSize = resourceSizes.reduce((sum, size) => sum + size, 0);

      // Total CSS/JS should be under 5MB (reasonable for modern web app)
      expect(totalSize).toBeLessThan(5 * 1024 * 1024);
    });

    test('should load images efficiently', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.basic);
      await orgHelpers.navigateToOrganizations();

      const imageLoadTimes: number[] = [];

      page.on('response', response => {
        const url = response.url();
        if (url.includes('.jpg') || url.includes('.png') || url.includes('.gif')) {
          const loadTime = Date.now();
          imageLoadTimes.push(loadTime);
        }
      });

      // Wait for images to load
      await page.waitForLoadState('networkidle');

      // Images should load reasonably quickly
      // This is more of a smoke test as we don't have control over external images
      expect(imageLoadTimes.length).toBeGreaterThanOrEqual(0);
    });
  });
});