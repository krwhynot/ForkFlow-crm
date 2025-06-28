import { expect, test } from '@playwright/test';
import { OrganizationTestHelpers } from '../helpers/organizationHelpers';
import { TestUtils, setupTestContext } from '../helpers/testUtils';

test.describe('Organization Form Validation', () => {
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

    await orgHelpers.navigateToCreateOrganization();
  });

  test.describe('Required Field Validation', () => {
    test('should require organization name', async ({ page }) => {
      await orgHelpers.fillOrganizationForm({
        address: '123 Test Street',
        city: 'Test City',
        state: 'CA',
      });

      await orgHelpers.clickSaveButton();

      await orgHelpers.expectValidationError('name', 'Required');
      await expect(page).toHaveURL(/\/organizations\/create/);
    });

    test('should allow minimal required fields only', async ({ page }) => {
      await orgHelpers.fillOrganizationForm({
        name: 'Minimal Test Restaurant',
      });

      await orgHelpers.clickSaveButton();

      // Should succeed with just the name
      await expect(page).toHaveURL(/\/organizations\/\d+/);
    });

    test('should highlight required fields on focus', async ({ page }) => {
      const nameInput = page.locator('input[name="name"]');

      // Focus and blur without entering data
      await nameInput.focus();
      await nameInput.blur();

      // Should show required indicator
      await expect(nameInput).toHaveAttribute('required');
      await expect(page.locator('label[for="name"] .required-indicator, .MuiFormLabel-asterisk')).toBeVisible();
    });
  });

  test.describe('Format Validation', () => {
    test('should validate phone number formats', async ({ page }) => {
      const phoneInput = page.locator('input[name="phone"]');

      // Test invalid formats
      const invalidPhones = [
        'abc123',
        '123',
        '123-45',
        'not-a-phone',
        '++1234567890',
      ];

      for (const invalidPhone of invalidPhones) {
        await phoneInput.fill(invalidPhone);
        await phoneInput.blur();
        await orgHelpers.expectValidationError('phone', 'Must be a valid phone number');
        await phoneInput.clear();
      }

      // Test valid formats
      const validPhones = [
        '(415) 555-1234',
        '415-555-1234',
        '+1 415 555 1234',
        '4155551234',
      ];

      for (const validPhone of validPhones) {
        await phoneInput.fill(validPhone);
        await phoneInput.blur();
        await orgHelpers.expectNoValidationErrors();
        await phoneInput.clear();
      }
    });

    test('should validate email format for account manager', async ({ page }) => {
      const emailInput = page.locator('input[name="accountManager"]');

      // Test invalid emails
      const invalidEmails = [
        'not-an-email',
        '@domain.com',
        'user@',
        'user@domain',
        'user.domain.com',
      ];

      for (const invalidEmail of invalidEmails) {
        await emailInput.fill(invalidEmail);
        await emailInput.blur();
        await orgHelpers.expectValidationError('accountManager', 'Must be a valid email address');
        await emailInput.clear();
      }

      // Test valid emails
      const validEmails = [
        'user@domain.com',
        'john.smith@forkflow.com',
        'test+tag@example.co.uk',
      ];

      for (const validEmail of validEmails) {
        await emailInput.fill(validEmail);
        await emailInput.blur();
        await orgHelpers.expectNoValidationErrors();
        await emailInput.clear();
      }
    });

    test('should validate website URL format', async ({ page }) => {
      const websiteInput = page.locator('input[name="website"]');

      // Test invalid URLs
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'just-text',
        'http://',
        'example',
      ];

      for (const invalidUrl of invalidUrls) {
        await websiteInput.fill(invalidUrl);
        await websiteInput.blur();
        await orgHelpers.expectValidationError('website', 'Must be a valid URL');
        await websiteInput.clear();
      }

      // Test valid URLs
      const validUrls = [
        'https://example.com',
        'http://test.org',
        'www.restaurant.com',
        'restaurant.com',
      ];

      for (const validUrl of validUrls) {
        await websiteInput.fill(validUrl);
        await websiteInput.blur();
        await orgHelpers.expectNoValidationErrors();
        await websiteInput.clear();
      }
    });

    test('should validate ZIP code format', async ({ page }) => {
      const zipInput = page.locator('input[name="zipCode"]');

      // Test invalid ZIP codes
      const invalidZips = [
        '123',
        '12345-',
        '12345-123',
        'abcde',
        '123456',
      ];

      for (const invalidZip of invalidZips) {
        await zipInput.fill(invalidZip);
        await zipInput.blur();
        await orgHelpers.expectValidationError('zipCode', 'Must be a valid ZIP code');
        await zipInput.clear();
      }

      // Test valid ZIP codes
      const validZips = [
        '12345',
        '12345-6789',
        '94102',
        '10001-1234',
      ];

      for (const validZip of validZips) {
        await zipInput.fill(validZip);
        await zipInput.blur();
        await orgHelpers.expectNoValidationErrors();
        await zipInput.clear();
      }
    });
  });

  test.describe('Field Length Validation', () => {
    test('should enforce maximum length for notes', async ({ page }) => {
      const notesInput = page.locator('textarea[name="notes"]');

      // Fill with text exceeding maximum length (500 characters)
      const longText = 'A'.repeat(501);
      await notesInput.fill(longText);

      // Should be truncated to max length
      const actualValue = await notesInput.inputValue();
      expect(actualValue.length).toBeLessThanOrEqual(500);

      // Character counter should show limit
      await expect(page.locator('.character-count, .MuiFormHelperText-root')).toContainText('500');
    });

    test('should enforce maximum length for name', async ({ page }) => {
      const nameInput = page.locator('input[name="name"]');

      // Fill with very long name
      const longName = 'Very Long Restaurant Name That Exceeds The Maximum Allowed Length For Organization Names In The System';
      await nameInput.fill(longName);

      // Should be limited to reasonable length (100 characters)
      const actualValue = await nameInput.inputValue();
      expect(actualValue.length).toBeLessThanOrEqual(100);
    });

    test('should show character count for notes field', async ({ page }) => {
      const notesInput = page.locator('textarea[name="notes"]');

      await notesInput.fill('Test notes');

      // Should show character count
      await expect(page.locator('.character-count, .MuiFormHelperText-root')).toContainText('10/500');
    });
  });

  test.describe('Real-time Validation', () => {
    test('should validate fields as user types', async ({ page }) => {
      const phoneInput = page.locator('input[name="phone"]');

      // Start typing invalid phone
      await phoneInput.type('abc');

      // Should show validation error immediately
      await orgHelpers.expectValidationError('phone');

      // Clear and type valid phone
      await phoneInput.clear();
      await phoneInput.type('(415) 555-1234');

      // Error should clear
      await orgHelpers.expectNoValidationErrors();
    });

    test('should update validation on blur', async ({ page }) => {
      const websiteInput = page.locator('input[name="website"]');

      await websiteInput.fill('invalid-url');
      await websiteInput.blur();

      await orgHelpers.expectValidationError('website');

      await websiteInput.focus();
      await websiteInput.clear();
      await websiteInput.fill('https://valid-url.com');
      await websiteInput.blur();

      await orgHelpers.expectNoValidationErrors();
    });
  });

  test.describe('GPS Validation', () => {
    test('should validate GPS coordinates', async ({ page }) => {
      await orgHelpers.mockGPSLocation(37.7749, -122.4194);

      await orgHelpers.fillOrganizationForm({
        name: 'GPS Test Restaurant',
        address: '123 GPS Street',
        city: 'San Francisco',
        state: 'CA',
      });

      await orgHelpers.clickGPSButton();
      await orgHelpers.waitForGPSCapture();

      // Should accept valid coordinates
      await orgHelpers.clickSaveButton();
      await expect(page).toHaveURL(/\/organizations\/\d+/);
    });

    test('should handle GPS permission denied', async ({ page }) => {
      // Deny geolocation permission
      await page.context().clearPermissions();

      await orgHelpers.fillOrganizationForm({
        name: 'GPS Test Restaurant',
        address: '123 GPS Street',
        city: 'San Francisco',
        state: 'CA',
      });

      await orgHelpers.clickGPSButton();

      // Should show error message about GPS permission
      await expect(page.locator('.gps-error, .MuiAlert-error')).toBeVisible();
    });

    test('should validate coordinate ranges', async ({ page }) => {
      // Mock invalid coordinates (latitude > 90)
      await orgHelpers.mockGPSLocation(200, -122.4194);

      await orgHelpers.fillOrganizationForm({
        name: 'Invalid GPS Restaurant',
      });

      await orgHelpers.clickGPSButton();

      // Should handle invalid coordinates gracefully
      await expect(page.locator('.gps-error, .coordinate-error')).toBeVisible();
    });
  });

  test.describe('Dropdown Validation', () => {
    test('should validate priority selection', async ({ page }) => {
      await orgHelpers.fillOrganizationForm({
        name: 'Priority Test Restaurant',
      });

      // Select priority
      await orgHelpers.selectOption('priorityId', 'high-priority-setting-id');

      await orgHelpers.clickSaveButton();
      await expect(page).toHaveURL(/\/organizations\/\d+/);

      // Verify priority was saved
      await expect(page.locator('.priority-info, .organization-priority')).toBeVisible();
    });

    test('should validate segment selection', async ({ page }) => {
      await orgHelpers.fillOrganizationForm({
        name: 'Segment Test Restaurant',
      });

      await orgHelpers.selectOption('segmentId', 'fine-dining-segment-id');

      await orgHelpers.clickSaveButton();
      await expect(page).toHaveURL(/\/organizations\/\d+/);
    });

    test('should handle empty dropdown selections', async ({ page }) => {
      await orgHelpers.fillOrganizationForm({
        name: 'Empty Selection Restaurant',
      });

      // Don't select any dropdowns - should still be valid
      await orgHelpers.clickSaveButton();
      await expect(page).toHaveURL(/\/organizations\/\d+/);
    });
  });

  test.describe('Form Accessibility', () => {
    test('should have proper labels for all fields', async ({ page }) => {
      await orgHelpers.checkFormAccessibility();
    });

    test('should have proper ARIA attributes', async ({ page }) => {
      // Check that required fields have proper ARIA attributes
      const nameInput = page.locator('input[name="name"]');
      await expect(nameInput).toHaveAttribute('aria-required', 'true');

      // Check that validation errors have proper ARIA attributes
      await nameInput.focus();
      await nameInput.blur();

      const errorId = await page.locator('.MuiFormHelperText-root.Mui-error').getAttribute('id');
      if (errorId) {
        await expect(nameInput).toHaveAttribute('aria-describedby', errorId);
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Tab through form fields
      await page.keyboard.press('Tab'); // Name field
      await expect(page.locator('input[name="name"]')).toBeFocused();

      await page.keyboard.press('Tab'); // Website field
      await expect(page.locator('input[name="website"]')).toBeFocused();

      await page.keyboard.press('Tab'); // Phone field
      await expect(page.locator('input[name="phone"]')).toBeFocused();
    });
  });

  test.describe('Form Submission', () => {
    test('should prevent duplicate submissions', async ({ page }) => {
      await orgHelpers.fillOrganizationForm({
        name: 'Duplicate Test Restaurant',
        address: '123 Test Street',
        city: 'Test City',
        state: 'CA',
      });

      // Click save button multiple times quickly
      const saveButton = page.locator('button[type="submit"], .ra-save-button');
      await saveButton.click();
      await saveButton.click();
      await saveButton.click();

      // Should only create one organization
      await expect(page).toHaveURL(/\/organizations\/\d+/);

      // Verify only one organization was created
      await orgHelpers.navigateToOrganizations();
      await orgHelpers.searchOrganizations('Duplicate Test Restaurant');

      const rowCount = await orgHelpers.getOrganizationRowCount();
      expect(rowCount).toBe(1);
    });

    test('should disable save button during submission', async ({ page }) => {
      await orgHelpers.fillOrganizationForm({
        name: 'Button State Test Restaurant',
      });

      const saveButton = page.locator('button[type="submit"], .ra-save-button');

      // Click save and check button state
      await saveButton.click();

      // Button should be disabled during submission
      await expect(saveButton).toBeDisabled();
    });
  });
});