import { expect, test } from '@playwright/test';
import { organizationTestData } from '../fixtures/organizationFactory';
import { OrganizationHelpers } from '../helpers/organizationHelpers';
import { TestUtils } from '../helpers/testUtils';

test.describe('Organization Visual Regression Testing', () => {
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

  test.describe('Organization List Visual Tests', () => {
    test('should match organization list screenshot', async ({ page }) => {
      // Create consistent test data
      await orgHelpers.createTestOrganization({
        ...organizationTestData.basic,
        name: 'Visual Test Restaurant 1',
      });
      await orgHelpers.createTestOrganization({
        ...organizationTestData.basic,
        name: 'Visual Test Restaurant 2',
        city: 'Oakland',
      });

      await orgHelpers.navigateToOrganizations();

      // Wait for content to load
      await page.waitForSelector('.organization-list, .MuiDataGrid-root');
      await page.waitForLoadState('networkidle');

      // Take screenshot
      await expect(page).toHaveScreenshot('organization-list.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match organization list with search results', async ({ page }) => {
      await orgHelpers.createTestOrganization({
        ...organizationTestData.basic,
        name: 'Searchable Restaurant',
      });

      await orgHelpers.navigateToOrganizations();
      await orgHelpers.searchOrganizations('Searchable');

      // Wait for search results
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('organization-list-search.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match organization list with filters applied', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.complete);

      await orgHelpers.navigateToOrganizations();
      await orgHelpers.applyFilter('city', 'San Francisco');

      // Wait for filtered results
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('organization-list-filtered.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match empty organization list', async ({ page }) => {
      await orgHelpers.navigateToOrganizations();
      await orgHelpers.searchOrganizations('NonexistentOrganization');

      // Wait for empty state
      await page.waitForSelector('.no-results, .empty-state', { timeout: 5000 });

      await expect(page).toHaveScreenshot('organization-list-empty.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Organization Form Visual Tests', () => {
    test('should match create organization form', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      // Wait for form to load
      await page.waitForSelector('form');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('organization-create-form.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match create form with data filled', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();
      await orgHelpers.fillOrganizationForm(organizationTestData.complete);

      // Wait for form to update
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('organization-create-form-filled.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match create form with validation errors', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      // Fill with invalid data
      await orgHelpers.fillOrganizationForm({
        phone: 'invalid-phone',
        website: 'invalid-url',
        zipCode: 'invalid-zip',
        accountManager: 'invalid-email',
      });

      // Trigger validation
      await orgHelpers.clickSaveButton();

      // Wait for validation errors to appear
      await page.waitForSelector('.MuiFormHelperText-root.Mui-error');

      await expect(page).toHaveScreenshot('organization-create-form-errors.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match edit organization form', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.complete);
      const orgId = await page.url().match(/\/organizations\/(\d+)/)?.[1];

      await orgHelpers.navigateToEditOrganization(orgId!);

      // Wait for form to load with data
      await page.waitForSelector('form');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('organization-edit-form.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Organization Detail Visual Tests', () => {
    test('should match organization detail page', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.complete);

      // Wait for detail page to load
      await page.waitForSelector('.organization-details, .organization-name');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('organization-detail.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match organization detail with statistics', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.complete);

      // Wait for statistics to load
      await page.waitForSelector('.organization-stats, .stats-section');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('organization-detail-with-stats.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Mobile Visual Tests', () => {
    test('should match mobile organization list', async ({ page }) => {
      await utils.simulateMobileDevice();

      await orgHelpers.createTestOrganization(organizationTestData.basic);
      await orgHelpers.navigateToOrganizations();

      // Wait for mobile layout
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('organization-list-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match mobile create form', async ({ page }) => {
      await utils.simulateMobileDevice();

      await orgHelpers.navigateToCreateOrganization();

      // Wait for mobile form layout
      await page.waitForSelector('form');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('organization-create-form-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match mobile detail page', async ({ page }) => {
      await utils.simulateMobileDevice();

      await orgHelpers.createTestOrganization(organizationTestData.complete);

      // Wait for mobile detail layout
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('organization-detail-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Tablet Visual Tests', () => {
    test('should match tablet organization list', async ({ page }) => {
      await utils.simulateTabletDevice();

      await orgHelpers.createTestOrganization(organizationTestData.basic);
      await orgHelpers.navigateToOrganizations();

      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('organization-list-tablet.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match tablet create form', async ({ page }) => {
      await utils.simulateTabletDevice();

      await orgHelpers.navigateToCreateOrganization();

      await page.waitForSelector('form');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('organization-create-form-tablet.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Component Visual Tests', () => {
    test('should match organization card component', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.complete);
      await orgHelpers.navigateToOrganizations();

      // Focus on individual organization card if using card layout
      const firstCard = page.locator('.organization-card, .MuiDataGrid-row').first();

      if (await firstCard.isVisible()) {
        await expect(firstCard).toHaveScreenshot('organization-card.png', {
          animations: 'disabled',
        });
      }
    });

    test('should match form field components', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      // Test individual form components
      const nameField = page.locator('input[name="name"]').locator('..');
      await expect(nameField).toHaveScreenshot('form-field-name.png', {
        animations: 'disabled',
      });

      const phoneField = page.locator('input[name="phone"]').locator('..');
      await expect(phoneField).toHaveScreenshot('form-field-phone.png', {
        animations: 'disabled',
      });
    });

    test('should match dropdown components', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      // Open priority dropdown
      await page.click('[data-testid="priorityId-select"], .MuiSelect-root[name="priorityId"]');
      await page.waitForSelector('.MuiMenu-list, .MuiPopover-paper');

      const dropdown = page.locator('.MuiMenu-list, .MuiPopover-paper');
      await expect(dropdown).toHaveScreenshot('priority-dropdown.png', {
        animations: 'disabled',
      });
    });

    test('should match notification components', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();
      await orgHelpers.fillOrganizationForm(organizationTestData.basic);
      await orgHelpers.clickSaveButton();

      // Wait for success notification
      await page.waitForSelector('.MuiAlert-success, .ra-notification-success');

      const notification = page.locator('.MuiAlert-success, .ra-notification-success');
      await expect(notification).toHaveScreenshot('success-notification.png', {
        animations: 'disabled',
      });
    });
  });

  test.describe('Theme and Styling Visual Tests', () => {
    test('should match light theme appearance', async ({ page }) => {
      // Ensure light theme is active
      await page.addInitScript(() => {
        localStorage.setItem('theme', 'light');
      });

      await orgHelpers.navigateToOrganizations();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('organization-list-light-theme.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match dark theme appearance', async ({ page }) => {
      // Set dark theme if supported
      await page.addInitScript(() => {
        localStorage.setItem('theme', 'dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      });

      await orgHelpers.navigateToOrganizations();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('organization-list-dark-theme.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match high contrast mode', async ({ page }) => {
      // Simulate high contrast mode
      await page.addInitScript(() => {
        const style = document.createElement('style');
        style.textContent = `
          @media (prefers-contrast: high) {
            * {
              background: black !important;
              color: white !important;
              border-color: white !important;
            }
          }
        `;
        document.head.appendChild(style);
      });

      await orgHelpers.navigateToOrganizations();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('organization-list-high-contrast.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('State Variation Visual Tests', () => {
    test('should match loading state', async ({ page }) => {
      // Mock slow API to capture loading state
      await page.route('**/organizations', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.continue();
      });

      await orgHelpers.navigateToOrganizations();

      // Capture loading state
      await page.waitForSelector('.loading, .MuiCircularProgress-root', { timeout: 5000 });

      await expect(page).toHaveScreenshot('organization-list-loading.png', {
        animations: 'disabled',
      });
    });

    test('should match error state', async ({ page }) => {
      // Mock API error
      await page.route('**/organizations', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' }),
        });
      });

      await orgHelpers.navigateToOrganizations();

      // Wait for error state
      await page.waitForSelector('.error-state, .MuiAlert-error', { timeout: 5000 });

      await expect(page).toHaveScreenshot('organization-list-error.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match disabled state for form elements', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      // Disable form elements
      await page.addInitScript(() => {
        setTimeout(() => {
          const inputs = document.querySelectorAll('input, button, select');
          inputs.forEach(input => {
            (input as HTMLInputElement).disabled = true;
          });
        }, 1000);
      });

      await page.waitForTimeout(1500);

      await expect(page).toHaveScreenshot('organization-form-disabled.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Interaction State Visual Tests', () => {
    test('should match hover states', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.basic);
      await orgHelpers.navigateToOrganizations();

      // Hover over first organization row
      const firstRow = page.locator('.organization-row, .MuiDataGrid-row').first();
      await firstRow.hover();

      await expect(firstRow).toHaveScreenshot('organization-row-hover.png', {
        animations: 'disabled',
      });
    });

    test('should match focus states', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      // Focus on name input
      await page.focus('input[name="name"]');

      const nameField = page.locator('input[name="name"]').locator('..');
      await expect(nameField).toHaveScreenshot('form-field-focused.png', {
        animations: 'disabled',
      });
    });

    test('should match selected states', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.basic);
      await orgHelpers.navigateToOrganizations();

      // Select organization if checkbox exists
      const checkbox = page.locator('.MuiCheckbox-root, .selection-checkbox').first();

      if (await checkbox.isVisible()) {
        await checkbox.click();

        const selectedRow = page.locator('.selected, .MuiDataGrid-row--selected').first();
        await expect(selectedRow).toHaveScreenshot('organization-row-selected.png', {
          animations: 'disabled',
        });
      }
    });
  });

  test.describe('Cross-Browser Visual Consistency', () => {
    test('should render consistently across viewport sizes', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.basic);

      // Test different viewport sizes
      const viewports = [
        { width: 320, height: 568 }, // iPhone SE
        { width: 768, height: 1024 }, // iPad
        { width: 1920, height: 1080 }, // Desktop HD
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await orgHelpers.navigateToOrganizations();
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveScreenshot(`organization-list-${viewport.width}x${viewport.height}.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      }
    });
  });
});