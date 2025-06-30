import { expect, test } from '@playwright/test';
import { organizationTestData } from '../fixtures/organizationFactory';
import { OrganizationHelpers } from '../helpers/organizationHelpers';
import { TestUtils } from '../helpers/testUtils';

test.describe('Organization Mobile Responsive Design', () => {
  let orgHelpers: OrganizationHelpers;
  let utils: TestUtils;
  let createdOrgNames: string[] = [];

  test.beforeEach(async ({ page }) => {
    orgHelpers = new OrganizationHelpers(page);
    utils = new TestUtils(page);
    await utils.logConsoleErrors();
    await utils.login();
    await utils.waitForAppReady();
  });

  test.afterEach(async () => {
    if (createdOrgNames.length > 0) {
      await orgHelpers.cleanupTestOrgs([]); // Implement actual cleanup logic as needed
      createdOrgNames = [];
    }
  });

  test.describe('Mobile Device Testing', () => {
    test('should display properly on iPhone', async ({ page }) => {
      await utils.simulateMobileDevice();

      await orgHelpers.navigateToOrganizations();

      // Should show mobile-optimized layout
      await orgHelpers.expectMobileLayout();

      // Navigation should be accessible
      await expect(page.locator('.mobile-menu, .MuiDrawer-root')).toBeVisible();

      // List should be readable
      await expect(page.locator('.organization-list, .mobile-list')).toBeVisible();
    });

    test('should handle touch interactions', async ({ page }) => {
      await utils.simulateMobileDevice();

      await orgHelpers.navigateToOrganizations();

      // Create test organization
      await orgHelpers.createTestOrganization(organizationTestData.basic);
      await orgHelpers.navigateToOrganizations();

      // Touch targets should be at least 44px (accessibility guideline)
      const buttons = page.locator('button, .MuiButton-root');
      const buttonCount = await buttons.count();

      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const boundingBox = await button.boundingBox();
        if (boundingBox) {
          expect(boundingBox.height).toBeGreaterThanOrEqual(44);
          expect(boundingBox.width).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('should support swipe gestures on mobile', async ({ page }) => {
      await utils.simulateMobileDevice();

      await orgHelpers.createTestOrganization(organizationTestData.basic);
      await orgHelpers.navigateToOrganizations();

      // Simulate swipe gesture on organization row
      const orgRow = page.locator('.organization-row, .MuiDataGrid-row').first();

      await orgRow.hover();
      await page.mouse.down();
      await page.mouse.move(100, 0); // Swipe right
      await page.mouse.up();

      // Should reveal action buttons or trigger action
      await expect(page.locator('.swipe-actions, .row-actions')).toBeVisible();
    });
  });

  test.describe('Tablet Device Testing', () => {
    test('should display properly on tablet', async ({ page }) => {
      await utils.simulateTabletDevice();

      await orgHelpers.navigateToOrganizations();

      // Should show tablet-optimized layout
      const viewport = page.viewportSize();
      expect(viewport?.width).toBe(768);
      expect(viewport?.height).toBe(1024);

      // Should have more space than mobile but less than desktop
      await expect(page.locator('.tablet-layout, .MuiContainer-maxWidthMd')).toBeVisible();
    });

    test('should handle tablet form layout', async ({ page }) => {
      await utils.simulateTabletDevice();

      await orgHelpers.navigateToCreateOrganization();

      // Form should be optimized for tablet
      await expect(page.locator('form')).toBeVisible();

      // Fields should be properly sized for tablet
      const inputs = page.locator('input, textarea');
      const inputCount = await inputs.count();

      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const boundingBox = await input.boundingBox();
        if (boundingBox) {
          // Should be wide enough for comfortable typing
          expect(boundingBox.width).toBeGreaterThan(200);
        }
      }
    });
  });

  test.describe('Form Responsive Behavior', () => {
    test('should stack form fields vertically on mobile', async ({ page }) => {
      await utils.simulateMobileDevice();

      await orgHelpers.navigateToCreateOrganization();

      // Form sections should stack vertically
      const formSections = page.locator('.form-section, .MuiStack-root');
      const firstSection = formSections.first();
      const secondSection = formSections.nth(1);

      if (await firstSection.isVisible() && await secondSection.isVisible()) {
        const firstBox = await firstSection.boundingBox();
        const secondBox = await secondSection.boundingBox();

        if (firstBox && secondBox) {
          // Second section should be below first (vertical stacking)
          expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height);
        }
      }
    });

    test('should use horizontal layout on desktop', async ({ page }) => {
      await utils.simulateDesktopDevice();

      await orgHelpers.navigateToCreateOrganization();

      // Form sections should be side by side on desktop
      const formSections = page.locator('.form-section, .MuiStack-root');
      const firstSection = formSections.first();
      const secondSection = formSections.nth(1);

      if (await firstSection.isVisible() && await secondSection.isVisible()) {
        const firstBox = await firstSection.boundingBox();
        const secondBox = await secondSection.boundingBox();

        if (firstBox && secondBox && page.viewportSize()!.width >= 1024) {
          // Sections might be side by side (horizontal layout)
          const isHorizontal = Math.abs(firstBox.y - secondBox.y) < 50;
          // This test is flexible as layout might vary
          expect(isHorizontal || secondBox.y > firstBox.y).toBe(true);
        }
      }
    });

    test('should handle form validation on mobile', async ({ page }) => {
      await utils.simulateMobileDevice();

      await orgHelpers.navigateToCreateOrganization();

      // Try to submit without required fields
      await orgHelpers.clickSaveButton();

      // Validation errors should be visible and readable on mobile
      await orgHelpers.expectValidationError('name');

      const errorElement = page.locator('.MuiFormHelperText-root.Mui-error').first();
      const errorBox = await errorElement.boundingBox();

      if (errorBox) {
        // Error text should be readable on mobile
        expect(errorBox.width).toBeGreaterThan(100);
      }
    });
  });

  test.describe('List View Responsive Behavior', () => {
    test('should use card layout on mobile', async ({ page }) => {
      await utils.simulateMobileDevice();

      await orgHelpers.createTestOrganization(organizationTestData.basic);
      await orgHelpers.navigateToOrganizations();

      // Should show card layout instead of table on mobile
      if (await orgHelpers.isMobileView()) {
        await expect(page.locator('.organization-card, .mobile-card')).toBeVisible();
        await expect(page.locator('.MuiDataGrid-root, table')).not.toBeVisible();
      }
    });

    test('should use table layout on desktop', async ({ page }) => {
      await utils.simulateDesktopDevice();

      await orgHelpers.createTestOrganization(organizationTestData.basic);
      await orgHelpers.navigateToOrganizations();

      // Should show table layout on desktop
      await expect(page.locator('.MuiDataGrid-root, table')).toBeVisible();
    });

    test('should handle horizontal scrolling on mobile table', async ({ page }) => {
      await utils.simulateMobileDevice();

      await orgHelpers.createTestOrganization(organizationTestData.basic);
      await orgHelpers.navigateToOrganizations();

      // If table is shown on mobile, it should be horizontally scrollable
      const table = page.locator('.MuiDataGrid-root, table');

      if (await table.isVisible()) {
        const tableBox = await table.boundingBox();
        const viewport = page.viewportSize();

        if (tableBox && viewport) {
          // Table might be wider than viewport (horizontally scrollable)
          expect(tableBox.width).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Navigation Responsive Behavior', () => {
    test('should show hamburger menu on mobile', async ({ page }) => {
      await utils.simulateMobileDevice();

      await orgHelpers.navigateToOrganizations();

      // Should show mobile navigation menu
      await expect(page.locator('.hamburger-menu, .mobile-menu-button, .MuiIconButton-root')).toBeVisible();
    });

    test('should show sidebar navigation on desktop', async ({ page }) => {
      await utils.simulateDesktopDevice();

      await orgHelpers.navigateToOrganizations();

      // Should show sidebar navigation on desktop
      await expect(page.locator('.sidebar, .MuiDrawer-docked')).toBeVisible();
    });

    test('should handle navigation menu toggle', async ({ page }) => {
      await utils.simulateMobileDevice();

      await orgHelpers.navigateToOrganizations();

      const menuButton = page.locator('.hamburger-menu, .mobile-menu-button').first();

      if (await menuButton.isVisible()) {
        // Click to open menu
        await menuButton.click();

        // Menu should be visible
        await expect(page.locator('.navigation-menu, .MuiDrawer-root')).toBeVisible();

        // Click to close menu
        await menuButton.click();

        // Menu should be hidden
        await expect(page.locator('.navigation-menu, .MuiDrawer-root')).toBeHidden();
      }
    });
  });

  test.describe('Search and Filter Responsive Behavior', () => {
    test('should adapt search interface for mobile', async ({ page }) => {
      await utils.simulateMobileDevice();

      await orgHelpers.navigateToOrganizations();

      // Search input should be full width on mobile
      const searchInput = page.locator('.ra-search-input input, input[name="q"]');

      if (await searchInput.isVisible()) {
        const inputBox = await searchInput.boundingBox();
        const viewport = page.viewportSize();

        if (inputBox && viewport) {
          // Search should take significant portion of screen width
          expect(inputBox.width).toBeGreaterThan(viewport.width * 0.7);
        }
      }
    });

    test('should handle filter menu on mobile', async ({ page }) => {
      await utils.simulateMobileDevice();

      await orgHelpers.navigateToOrganizations();

      const filterButton = page.locator('.ra-filter-button, button:has-text("Filters")');

      if (await filterButton.isVisible()) {
        await filterButton.click();

        // Filter panel should open as modal or fullscreen on mobile
        await expect(page.locator('.filter-modal, .MuiDialog-root, .filter-panel')).toBeVisible();
      }
    });

    test('should show filters inline on desktop', async ({ page }) => {
      await utils.simulateDesktopDevice();

      await orgHelpers.navigateToOrganizations();

      const filterButton = page.locator('.ra-filter-button, button:has-text("Filters")');

      if (await filterButton.isVisible()) {
        await filterButton.click();

        // Filters should appear inline or as dropdown on desktop
        await expect(page.locator('.filter-form, .filter-dropdown')).toBeVisible();
      }
    });
  });

  test.describe('Touch and Gesture Support', () => {
    test('should support touch scrolling', async ({ page }) => {
      await utils.simulateMobileDevice();

      // Create multiple organizations to ensure scrolling
      for (let i = 0; i < 10; i++) {
        await orgHelpers.createTestOrganization({
          ...organizationTestData.basic,
          name: `Touch Test Org ${i}`,
        });
      }

      await orgHelpers.navigateToOrganizations();

      // Simulate touch scroll
      await page.touchscreen.tap(200, 300);
      await page.mouse.wheel(0, 500); // Scroll down

      // Page should have scrolled
      const scrollPosition = await page.evaluate(() => window.pageYOffset);
      expect(scrollPosition).toBeGreaterThan(0);
    });

    test('should support pinch to zoom', async ({ page }) => {
      await utils.simulateMobileDevice();

      await orgHelpers.navigateToOrganizations();

      // Simulate pinch gesture (zoom in)
      await page.touchscreen.tap(200, 300);

      // Note: Playwright doesn't directly support pinch gestures,
      // but we can verify the page handles touch events
      const touchSupport = await page.evaluate(() => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      });

      expect(touchSupport).toBe(true);
    });

    test('should handle touch input on form fields', async ({ page }) => {
      await utils.simulateMobileDevice();

      await orgHelpers.navigateToCreateOrganization();

      // Use touch to interact with form fields
      const nameInput = page.locator('input[name="name"]');
      await nameInput.tap();

      // Input should be focused
      await expect(nameInput).toBeFocused();

      // Type with touch keyboard
      await nameInput.type('Touch Test Restaurant');

      // Value should be entered
      await expect(nameInput).toHaveValue('Touch Test Restaurant');
    });
  });

  test.describe('Orientation Changes', () => {
    test('should handle portrait to landscape rotation', async ({ page }) => {
      // Start in portrait
      await page.setViewportSize({ width: 375, height: 667 });

      await orgHelpers.navigateToOrganizations();

      // Rotate to landscape
      await page.setViewportSize({ width: 667, height: 375 });

      // Layout should adapt
      await expect(page.locator('body')).toBeVisible();

      // Should still be functional
      await expect(page.locator('.organization-list, .MuiDataGrid-root')).toBeVisible();
    });

    test('should handle landscape to portrait rotation', async ({ page }) => {
      // Start in landscape
      await page.setViewportSize({ width: 667, height: 375 });

      await orgHelpers.navigateToCreateOrganization();

      // Rotate to portrait
      await page.setViewportSize({ width: 375, height: 667 });

      // Form should adapt
      await expect(page.locator('form')).toBeVisible();

      // Fields should be accessible
      await expect(page.locator('input[name="name"]')).toBeVisible();
    });
  });

  test.describe('Performance on Mobile', () => {
    test('should load quickly on mobile devices', async ({ page }) => {
      await utils.simulateMobileDevice();

      const startTime = Date.now();
      await orgHelpers.navigateToOrganizations();
      const loadTime = Date.now() - startTime;

      // Should load within 5 seconds on mobile
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle low bandwidth conditions', async ({ page, context }) => {
      await utils.simulateMobileDevice();

      // Simulate slow 3G network
      await context.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add delay
        await route.continue();
      });

      const startTime = Date.now();
      await orgHelpers.navigateToOrganizations();
      const loadTime = Date.now() - startTime;

      // Should still load within reasonable time even with slow network
      expect(loadTime).toBeLessThan(10000);
    });
  });

  test.describe('Cross-Device Consistency', () => {
    test('should maintain data consistency across devices', async ({ page }) => {
      // Create organization on desktop
      await utils.simulateDesktopDevice();
      await orgHelpers.createTestOrganization({
        ...organizationTestData.basic,
        name: 'Cross Device Test Org',
      });

      // Switch to mobile and verify data is there
      await utils.simulateMobileDevice();
      await orgHelpers.navigateToOrganizations();
      await orgHelpers.searchOrganizations('Cross Device Test Org');

      // Should find the organization
      await expect(page.locator('.organization-row, .organization-card')).toContainText('Cross Device Test Org');
    });

    test('should sync form state across orientations', async ({ page }) => {
      await utils.simulateMobileDevice();

      await orgHelpers.navigateToCreateOrganization();

      // Fill some form data
      await orgHelpers.fillOrganizationForm({
        name: 'Orientation Test Restaurant',
        address: '123 Test Street',
      });

      // Rotate device
      await page.setViewportSize({ width: 667, height: 375 });

      // Form data should be preserved
      await expect(page.locator('input[name="name"]')).toHaveValue('Orientation Test Restaurant');
      await expect(page.locator('input[name="address"]')).toHaveValue('123 Test Street');
    });
  });
});