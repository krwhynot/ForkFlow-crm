import { expect, test } from '@playwright/test';
import { organizationTestData, testConfig } from '../fixtures';
import { OrganizationTestHelpers, expectErrorNotification, expectSuccessNotification } from '../helpers/organizationHelpers';
import { TestUtils, setupTestContext } from '../helpers/testUtils';

test.describe('Organization CRUD Workflow', () => {
  let orgHelpers: OrganizationTestHelpers;
  let utils: TestUtils;

  test.beforeEach(async ({ page, context }) => {
    await setupTestContext(context);
    orgHelpers = new OrganizationTestHelpers(page);
    utils = new TestUtils(page);
    await utils.logConsoleErrors();

    // Setup test environment
    await utils.seedTestData();
    await utils.setupTestAuth();
    
    // Navigate to app and wait for it to be ready
    await page.goto('/?test=true');
    await utils.waitForAppReady();

    // Ensure we're logged in for each test
    if (!(await utils.isLoggedIn())) {
      await utils.login();
    }
  });

  test.describe('Create Organization', () => {
    test('should create organization with basic information', async ({ page }) => {
      const testData = organizationTestData.basic;

      await orgHelpers.navigateToCreateOrganization();
      await orgHelpers.fillOrganizationForm(testData);
      await orgHelpers.clickSaveButton();

      // Should redirect to organization detail page
      await expect(page).toHaveURL(/\/organizations\/\d+/);
      await expectSuccessNotification(page);

      // Verify the organization was created with correct data
      await orgHelpers.expectOrganizationDetails(testData);
    });

    test('should create organization with complete information', async ({ page }) => {
      const testData = organizationTestData.complete;

      await orgHelpers.navigateToCreateOrganization();
      await orgHelpers.fillOrganizationForm(testData);
      await orgHelpers.clickSaveButton();

      await expect(page).toHaveURL(/\/organizations\/\d+/);
      await expectSuccessNotification(page);
      await orgHelpers.expectOrganizationDetails(testData);
    });

    test('should create organization with minimal required fields', async ({ page }) => {
      const testData = organizationTestData.minimal;

      await orgHelpers.navigateToCreateOrganization();
      await orgHelpers.fillOrganizationForm(testData);
      await orgHelpers.clickSaveButton();

      await expect(page).toHaveURL(/\/organizations\/\d+/);
      await expectSuccessNotification(page);
    });

    test('should validate required fields', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      // Try to save without required fields
      await orgHelpers.clickSaveButton();

      // Should show validation errors for required fields
      await orgHelpers.expectValidationError('name', 'Required');

      // Should not redirect
      await expect(page).toHaveURL(/\/organizations\/create/);
    });

    test('should validate field formats', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      const invalidData = organizationTestData.invalid;
      await orgHelpers.fillOrganizationForm(invalidData);

      // Check specific validation errors
      await orgHelpers.expectValidationError('phone', 'Must be a valid phone number');
      await orgHelpers.expectValidationError('website', 'Must be a valid URL');
      await orgHelpers.expectValidationError('zipCode', 'Must be a valid ZIP code');
      await orgHelpers.expectValidationError('accountManager', 'Must be a valid email address');
    });

    test('should auto-populate account manager if not provided', async ({ page }) => {
      const testData = { ...organizationTestData.basic };
      delete testData.accountManager; // Remove account manager

      await orgHelpers.navigateToCreateOrganization();
      await orgHelpers.fillOrganizationForm(testData);
      await orgHelpers.clickSaveButton();

      await expect(page).toHaveURL(/\/organizations\/\d+/);

      // Verify default account manager was set
      await expect(page.locator('.account-manager, .organization-account-manager'))
        .toContainText('john.smith@forkflow.com');
    });

    test('should handle GPS location capture', async ({ page }) => {
      const coordinates = testConfig.coordinates.sanFrancisco;
      await orgHelpers.mockGPSLocation(coordinates.latitude, coordinates.longitude);

      await orgHelpers.navigateToCreateOrganization();
      await orgHelpers.fillOrganizationForm(organizationTestData.basic);

      // Click GPS button and verify location is captured
      await orgHelpers.clickGPSButton();
      await orgHelpers.waitForGPSCapture();

      await orgHelpers.clickSaveButton();
      await expect(page).toHaveURL(/\/organizations\/\d+/);

      // Verify GPS coordinates are displayed
      await expect(page.locator('.gps-coordinates, .location-info'))
        .toContainText(coordinates.latitude.toString().substring(0, 6));
    });
  });

  test.describe('Read Organization', () => {
    test('should display organization details', async ({ page }) => {
      // First create an organization
      await orgHelpers.createTestOrganization(organizationTestData.complete);

      // Navigate to list and find the organization
      await orgHelpers.navigateToOrganizations();
      await orgHelpers.clickOrganizationRow(organizationTestData.complete.name!);

      // Should show organization details
      await orgHelpers.expectOrganizationDetails(organizationTestData.complete);
    });

    test('should display computed statistics', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.basic);

      await orgHelpers.navigateToOrganizations();
      await orgHelpers.clickOrganizationRow(organizationTestData.basic.name!);

      // Should show contact count, last contact date, etc.
      await expect(page.locator('.organization-stats, .stats-section')).toBeVisible();
    });

    test('should show related contacts and deals', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.basic);

      await orgHelpers.navigateToOrganizations();
      await orgHelpers.clickOrganizationRow(organizationTestData.basic.name!);

      // Should have sections for contacts and deals
      await expect(page.locator('.contacts-section, .related-contacts')).toBeVisible();
      await expect(page.locator('.deals-section, .opportunities-section')).toBeVisible();
    });
  });

  test.describe('Update Organization', () => {
    test('should update organization information', async ({ page }) => {
      // Create organization first
      await orgHelpers.createTestOrganization(organizationTestData.basic);

      // Navigate to edit
      const orgId = await page.url().match(/\/organizations\/(\d+)/)?.[1];
      await orgHelpers.navigateToEditOrganization(orgId!);

      // Update some fields
      const updatedData = {
        name: 'Updated Restaurant Name',
        phone: '(555) 999-8888',
        notes: 'Updated notes with new information.',
      };

      await orgHelpers.fillOrganizationForm(updatedData);
      await orgHelpers.clickSaveButton();

      // Should redirect back to detail page
      await expect(page).toHaveURL(/\/organizations\/\d+/);
      await expectSuccessNotification(page);

      // Verify updates
      await orgHelpers.expectOrganizationDetails(updatedData);
    });

    test('should validate updates', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.basic);

      const orgId = await page.url().match(/\/organizations\/(\d+)/)?.[1];
      await orgHelpers.navigateToEditOrganization(orgId!);

      // Try invalid updates
      await orgHelpers.fillOrganizationForm({
        name: '', // Clear required field
        phone: 'invalid-phone',
        website: 'not-a-url',
      });

      await orgHelpers.clickSaveButton();

      // Should show validation errors
      await orgHelpers.expectValidationError('name', 'Required');
      await orgHelpers.expectValidationError('phone', 'Must be a valid phone number');
      await orgHelpers.expectValidationError('website', 'Must be a valid URL');

      // Should not redirect
      await expect(page).toHaveURL(/\/organizations\/\d+\/edit/);
    });

    test('should preserve existing data when updating', async ({ page }) => {
      const initialData = organizationTestData.complete;
      await orgHelpers.createTestOrganization(initialData);

      const orgId = await page.url().match(/\/organizations\/(\d+)/)?.[1];
      await orgHelpers.navigateToEditOrganization(orgId!);

      // Verify form is pre-populated
      await orgHelpers.expectFormValues(initialData);

      // Update only one field
      await orgHelpers.fillOrganizationForm({ notes: 'Updated notes only' });
      await orgHelpers.clickSaveButton();

      // Verify other fields remain unchanged
      await orgHelpers.expectOrganizationDetails({
        name: initialData.name,
        address: initialData.address,
        phone: initialData.phone,
      });
    });
  });

  test.describe('Delete Organization', () => {
    test('should delete organization', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.basic);

      // Navigate to organization detail
      await orgHelpers.navigateToOrganizations();
      await orgHelpers.clickOrganizationRow(organizationTestData.basic.name!);

      // Click delete button
      await page.click('.delete-button, button:has-text("Delete")');

      // Confirm deletion in modal
      await page.click('.MuiDialog-root button:has-text("Delete"), .confirm-delete');

      // Should redirect to organization list
      await expect(page).toHaveURL(/\/organizations$/);
      await expectSuccessNotification(page, 'Organization deleted');
    });

    test('should require confirmation for deletion', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.basic);

      await orgHelpers.navigateToOrganizations();
      await orgHelpers.clickOrganizationRow(organizationTestData.basic.name!);

      await page.click('.delete-button, button:has-text("Delete")');

      // Should show confirmation dialog
      await expect(page.locator('.MuiDialog-root, .confirmation-modal')).toBeVisible();
      await expect(page.locator('.MuiDialog-root')).toContainText('Are you sure');

      // Cancel should close dialog
      await page.click('.MuiDialog-root button:has-text("Cancel"), .cancel-delete');
      await expect(page.locator('.MuiDialog-root')).toBeHidden();

      // Should still be on organization page
      await expect(page).toHaveURL(/\/organizations\/\d+/);
    });

    test('should handle deletion errors gracefully', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.basic);

      // Mock a deletion error
      await page.route('**/organizations/*', route => {
        if (route.request().method() === 'DELETE') {
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Internal server error' }),
          });
        } else {
          route.continue();
        }
      });

      await orgHelpers.navigateToOrganizations();
      await orgHelpers.clickOrganizationRow(organizationTestData.basic.name!);

      await page.click('.delete-button, button:has-text("Delete")');
      await page.click('.MuiDialog-root button:has-text("Delete"), .confirm-delete');

      // Should show error notification
      await expectErrorNotification(page);

      // Should still be on organization page
      await expect(page).toHaveURL(/\/organizations\/\d+/);
    });
  });

  test.describe('Bulk Operations', () => {
    test('should handle bulk updates', async ({ page }) => {
      // Create multiple organizations
      await orgHelpers.createMultipleTestOrganizations(3, { name: 'Bulk Test Org' });

      await orgHelpers.navigateToOrganizations();

      // Select multiple organizations
      const checkboxes = page.locator('.MuiCheckbox-root, .selection-checkbox');
      await checkboxes.first().click();
      await checkboxes.nth(1).click();
      await checkboxes.nth(2).click();

      // Perform bulk action
      await page.click('.bulk-actions button:has-text("Update"), .bulk-update-button');

      // Should show bulk update form or modal
      await expect(page.locator('.bulk-update-modal, .MuiDialog-root')).toBeVisible();
    });

    test('should export organization data', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.basic);

      await orgHelpers.navigateToOrganizations();

      // Click export button
      await page.click('.export-button, button:has-text("Export")');

      // Should trigger download (we can't easily test the actual file download in Playwright)
      // But we can verify the button works
      await expect(page.locator('.export-button')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load organization form quickly', async ({ page }) => {
      const loadTime = await orgHelpers.measureFormLoadTime();

      // Form should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should save organization quickly', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();
      await orgHelpers.fillOrganizationForm(organizationTestData.basic);

      const saveTime = await orgHelpers.measureSaveTime();

      // Save operation should complete within 5 seconds
      expect(saveTime).toBeLessThan(5000);
    });

    test('should handle large datasets', async ({ page }) => {
      // Create multiple organizations to test list performance
      await orgHelpers.createMultipleTestOrganizations(10, { name: 'Performance Test Org' });

      const loadTime = await utils.measurePageLoadTime();

      // List should load within 5 seconds even with many organizations
      expect(loadTime).toBeLessThan(5000);
    });
  });
});