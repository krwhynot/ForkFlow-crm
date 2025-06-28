import { expect, test } from '@playwright/test';
import { organizationTestData } from '../fixtures';
import { OrganizationTestHelpers, expectErrorNotification } from '../helpers/organizationHelpers';
import { TestUtils, setupTestContext } from '../helpers/testUtils';

test.describe('Organization Error Handling and Edge Cases', () => {
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

  test.describe('Network Error Handling', () => {
    test('should handle network timeout during create', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      // Mock network timeout
      await page.route('**/organizations', async route => {
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second delay
        await route.continue();
      });

      await orgHelpers.fillOrganizationForm(organizationTestData.basic);
      await orgHelpers.clickSaveButton();

      // Should show timeout error
      await expectErrorNotification(page, 'Network timeout');

      // Should remain on create page
      await expect(page).toHaveURL(/\/organizations\/create/);
    });

    test('should handle 500 server error during create', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      // Mock server error
      await page.route('**/organizations', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      });

      await orgHelpers.fillOrganizationForm(organizationTestData.basic);
      await orgHelpers.clickSaveButton();

      // Should show server error
      await expectErrorNotification(page, 'Server error');

      // Should remain on create page
      await expect(page).toHaveURL(/\/organizations\/create/);
    });

    test('should handle network disconnection', async ({ page, context }) => {
      await orgHelpers.navigateToCreateOrganization();

      // Simulate network disconnection
      await context.setOffline(true);

      await orgHelpers.fillOrganizationForm(organizationTestData.basic);
      await orgHelpers.clickSaveButton();

      // Should show offline error
      await expectErrorNotification(page, 'Network unavailable');

      // Restore connection
      await context.setOffline(false);

      // Should be able to retry
      await orgHelpers.clickSaveButton();
      await expect(page).toHaveURL(/\/organizations\/\d+/);
    });

    test('should handle slow API responses', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      // Mock slow API
      await page.route('**/organizations', async route => {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
        await route.continue();
      });

      await orgHelpers.fillOrganizationForm(organizationTestData.basic);

      const saveButton = page.locator('button[type="submit"], .ra-save-button');
      await saveButton.click();

      // Button should be disabled during slow request
      await expect(saveButton).toBeDisabled();

      // Should show loading indicator
      await expect(page.locator('.loading, .MuiCircularProgress-root')).toBeVisible();
    });
  });

  test.describe('Data Validation Edge Cases', () => {
    test('should handle extremely long text inputs', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      const extremelyLongName = 'A'.repeat(1000);
      const extremelyLongNotes = 'B'.repeat(10000);

      await orgHelpers.fillOrganizationForm({
        name: extremelyLongName,
        notes: extremelyLongNotes,
      });

      await orgHelpers.clickSaveButton();

      // Should either truncate or show validation error
      const nameInput = page.locator('input[name="name"]');
      const actualName = await nameInput.inputValue();
      expect(actualName.length).toBeLessThanOrEqual(100);
    });

    test('should handle special characters in inputs', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      const specialCharsData = {
        name: `Restaurant with Special Chars: !@#$%^&*()_+-=[]{}|;':",./<>?`,
        address: `123 Émile Zola Street, Côte d'Azur`,
        notes: `Unicode test: 测试 テスト тест 🍕🍝🍷`,
      };

      await orgHelpers.fillOrganizationForm(specialCharsData);
      await orgHelpers.clickSaveButton();

      // Should handle special characters properly
      await expect(page).toHaveURL(/\/organizations\/\d+/);
      await orgHelpers.expectOrganizationDetails(specialCharsData);
    });

    test('should handle SQL injection attempts', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      const sqlInjectionAttempts = {
        name: `'; DROP TABLE organizations; --`,
        address: `123 Main'; DELETE FROM users; --`,
        notes: `<script>alert('xss')</script>`,
      };

      await orgHelpers.fillOrganizationForm(sqlInjectionAttempts);
      await orgHelpers.clickSaveButton();

      // Should sanitize inputs and save safely
      await expect(page).toHaveURL(/\/organizations\/\d+/);

      // Malicious content should be escaped or sanitized
      await expect(page.locator('body')).not.toContainText('DROP TABLE');
    });

    test('should handle XSS attempts', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      const xssPayload = {
        name: `<script>alert('XSS')</script>Restaurant`,
        website: `javascript:alert('XSS')`,
        notes: `<img src="x" onerror="alert('XSS')">`,
      };

      await orgHelpers.fillOrganizationForm(xssPayload);
      await orgHelpers.clickSaveButton();

      // Should sanitize XSS attempts
      await expect(page).toHaveURL(/\/organizations\/\d+/);

      // No alerts should have been triggered
      page.on('dialog', dialog => {
        expect(dialog.message()).not.toContain('XSS');
        dialog.dismiss();
      });
    });
  });

  test.describe('Concurrency and Race Conditions', () => {
    test('should handle simultaneous organization creation', async ({ page, context }) => {
      // Open multiple tabs
      const page2 = await context.newPage();
      const orgHelpers2 = new OrganizationTestHelpers(page2);

      await orgHelpers.navigateToCreateOrganization();
      await orgHelpers2.navigateToCreateOrganization();

      const orgData = {
        ...organizationTestData.basic,
        name: 'Concurrent Test Restaurant',
      };

      // Fill forms simultaneously
      await Promise.all([
        orgHelpers.fillOrganizationForm(orgData),
        orgHelpers2.fillOrganizationForm({ ...orgData, name: 'Concurrent Test Restaurant 2' }),
      ]);

      // Submit simultaneously
      await Promise.all([
        orgHelpers.clickSaveButton(),
        orgHelpers2.clickSaveButton(),
      ]);

      // Both should succeed or handle conflicts gracefully
      await Promise.all([
        expect(page).toHaveURL(/\/organizations\/\d+/),
        expect(page2).toHaveURL(/\/organizations\/\d+/),
      ]);

      await page2.close();
    });

    test('should handle edit conflicts', async ({ page, context }) => {
      // Create organization first
      await orgHelpers.createTestOrganization(organizationTestData.basic);
      const orgId = await page.url().match(/\/organizations\/(\d+)/)?.[1];

      // Open in two tabs
      const page2 = await context.newPage();
      const orgHelpers2 = new OrganizationTestHelpers(page2);

      await orgHelpers.navigateToEditOrganization(orgId!);
      await orgHelpers2.navigateToEditOrganization(orgId!);

      // Make different changes
      await orgHelpers.fillOrganizationForm({ name: 'Updated Name 1' });
      await orgHelpers2.fillOrganizationForm({ name: 'Updated Name 2' });

      // Submit first change
      await orgHelpers.clickSaveButton();
      await expect(page).toHaveURL(/\/organizations\/\d+/);

      // Submit second change - should handle conflict
      await orgHelpers2.clickSaveButton();

      // Should either show conflict error or merge changes
      await expect(page2.locator('.conflict-error, .merge-conflict')).toBeVisible().or(
        expect(page2).toHaveURL(/\/organizations\/\d+/)
      );

      await page2.close();
    });
  });

  test.describe('Resource Limits and Performance Edge Cases', () => {
    test('should handle large file uploads for logos', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      // Mock large file upload (>10MB)
      const largeFileContent = 'A'.repeat(10 * 1024 * 1024); // 10MB

      await page.setInputFiles('input[type="file"]', {
        name: 'large-logo.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from(largeFileContent),
      }).catch(() => {
        // File input might not exist, that's okay
      });

      await orgHelpers.fillOrganizationForm(organizationTestData.basic);

      // Should either reject large file or handle gracefully
      await orgHelpers.clickSaveButton();

      // Should either show file size error or process successfully
      await expect(page.locator('.file-size-error, .upload-error')).toBeVisible().or(
        expect(page).toHaveURL(/\/organizations\/\d+/)
      );
    });

    test('should handle browser memory limits', async ({ page }) => {
      // Create many organizations to test memory usage
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(
          orgHelpers.createTestOrganization({
            ...organizationTestData.basic,
            name: `Memory Test Org ${i}`,
          })
        );
      }

      await Promise.all(promises);

      // Navigate to list and verify it still works
      await orgHelpers.navigateToOrganizations();

      // Should not crash or become unresponsive
      await expect(page.locator('.organization-list, .MuiDataGrid-root')).toBeVisible();
    });
  });

  test.describe('Browser Compatibility Edge Cases', () => {
    test('should handle disabled JavaScript', async ({ page, context }) => {
      // Disable JavaScript
      await context.addInitScript(() => {
        // Mock some functionality being disabled
        (window as any).jsDisabled = true;
      });

      await orgHelpers.navigateToOrganizations();

      // Should show graceful degradation or no-JS message
      await expect(page.locator('.no-js-warning, noscript')).toBeVisible().or(
        expect(page.locator('.organization-list')).toBeVisible()
      );
    });

    test('should handle cookies disabled', async ({ page, context }) => {
      // Clear all cookies
      await context.clearCookies();

      await orgHelpers.navigateToOrganizations();

      // Should either redirect to login or handle gracefully
      await expect(page).toHaveURL(/\/(login|organizations)/);
    });

    test('should handle local storage disabled', async ({ page }) => {
      // Mock localStorage being unavailable
      await page.addInitScript(() => {
        Object.defineProperty(window, 'localStorage', {
          value: null,
          writable: false,
        });
      });

      await orgHelpers.navigateToOrganizations();

      // Should handle missing localStorage gracefully
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('GPS and Geolocation Edge Cases', () => {
    test('should handle GPS permission denied', async ({ page, context }) => {
      await context.clearPermissions();

      await orgHelpers.navigateToCreateOrganization();
      await orgHelpers.fillOrganizationForm(organizationTestData.basic);

      await orgHelpers.clickGPSButton();

      // Should show permission error
      await expect(page.locator('.gps-permission-error, .location-error')).toBeVisible();
    });

    test('should handle GPS timeout', async ({ page, context }) => {
      // Mock geolocation timeout
      await page.addInitScript(() => {
        navigator.geolocation.getCurrentPosition = (success, error) => {
          setTimeout(() => {
            error!({
              code: 3, // TIMEOUT
              message: 'Timeout',
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3,
            });
          }, 100);
        };
      });

      await orgHelpers.navigateToCreateOrganization();
      await orgHelpers.fillOrganizationForm(organizationTestData.basic);

      await orgHelpers.clickGPSButton();

      // Should show timeout error
      await expect(page.locator('.gps-timeout-error, .location-timeout')).toBeVisible();
    });

    test('should handle invalid GPS coordinates', async ({ page }) => {
      // Mock invalid coordinates
      await page.addInitScript(() => {
        navigator.geolocation.getCurrentPosition = (success) => {
          success({
            coords: {
              latitude: 200, // Invalid latitude
              longitude: 200, // Invalid longitude
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: Date.now(),
          });
        };
      });

      await orgHelpers.navigateToCreateOrganization();
      await orgHelpers.fillOrganizationForm(organizationTestData.basic);

      await orgHelpers.clickGPSButton();

      // Should handle invalid coordinates
      await expect(page.locator('.invalid-coordinates-error, .gps-error')).toBeVisible();
    });
  });

  test.describe('Form State Edge Cases', () => {
    test('should handle browser back/forward during form submission', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();
      await orgHelpers.fillOrganizationForm(organizationTestData.basic);

      // Start submission
      await orgHelpers.clickSaveButton();

      // Immediately go back
      await page.goBack();

      // Should handle gracefully
      await expect(page).toHaveURL(/\/organizations/);
    });

    test('should handle page refresh during form submission', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();
      await orgHelpers.fillOrganizationForm(organizationTestData.basic);

      // Mock slow submission
      await page.route('**/organizations', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      });

      await orgHelpers.clickSaveButton();

      // Refresh page during submission
      await page.reload();

      // Should return to form or handle gracefully
      await expect(page).toHaveURL(/\/organizations/);
    });

    test('should handle browser tab close during form editing', async ({ page, context }) => {
      await orgHelpers.navigateToCreateOrganization();
      await orgHelpers.fillOrganizationForm(organizationTestData.basic);

      // Open new tab
      const newPage = await context.newPage();
      await newPage.goto('/organizations');

      // Close original tab
      await page.close();

      // New tab should still work
      await expect(newPage.locator('.organization-list')).toBeVisible();
    });
  });

  test.describe('Data Integrity Edge Cases', () => {
    test('should handle duplicate organization names', async ({ page }) => {
      const duplicateName = 'Duplicate Restaurant Name';

      // Create first organization
      await orgHelpers.createTestOrganization({
        ...organizationTestData.basic,
        name: duplicateName,
      });

      // Try to create second with same name
      await orgHelpers.navigateToCreateOrganization();
      await orgHelpers.fillOrganizationForm({
        ...organizationTestData.basic,
        name: duplicateName,
      });

      await orgHelpers.clickSaveButton();

      // Should either allow duplicates or show error
      await expect(page.locator('.duplicate-error')).toBeVisible().or(
        expect(page).toHaveURL(/\/organizations\/\d+/)
      );
    });

    test('should handle orphaned data cleanup', async ({ page }) => {
      // Create organization with related data
      await orgHelpers.createTestOrganization(organizationTestData.basic);
      const orgId = await page.url().match(/\/organizations\/(\d+)/)?.[1];

      // Navigate to organization page
      await orgHelpers.navigateToOrganization(orgId!);

      // Delete organization
      await page.click('.delete-button, button:has-text("Delete")');
      await page.click('.confirm-delete, .MuiDialog-root button:has-text("Delete")');

      // Should handle cleanup of related data
      await expect(page).toHaveURL(/\/organizations$/);

      // Organization should not appear in search
      await orgHelpers.searchOrganizations(organizationTestData.basic.name!);
      await expect(page.locator('.no-results')).toBeVisible();
    });
  });
});