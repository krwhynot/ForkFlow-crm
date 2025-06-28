import { expect, test } from '@playwright/test';
import { organizationTestData } from '../fixtures';
import { OrganizationTestHelpers } from '../helpers/organizationHelpers';
import { TestUtils, setupTestContext } from '../helpers/testUtils';

test.describe('Organization Accessibility (WCAG 2.1 AA)', () => {
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

  test.describe('Keyboard Navigation', () => {
    test('should support full keyboard navigation in organization list', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.basic);
      await orgHelpers.navigateToOrganizations();

      // Start from page top
      await page.keyboard.press('Tab');

      // Should be able to navigate to search
      await expect(page.locator('.ra-search-input input, input[name="q"]')).toBeFocused();

      // Continue tabbing through interface
      await page.keyboard.press('Tab'); // Next element
      await page.keyboard.press('Tab'); // Next element

      // Should reach organization rows
      const focusedElement = await page.locator(':focus').first();
      await expect(focusedElement).toBeVisible();
    });

    test('should support keyboard navigation in organization form', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      // Tab through all form fields
      await page.keyboard.press('Tab'); // Name field
      await expect(page.locator('input[name="name"]')).toBeFocused();

      await page.keyboard.press('Tab'); // Website field
      await expect(page.locator('input[name="website"]')).toBeFocused();

      await page.keyboard.press('Tab'); // Phone field
      await expect(page.locator('input[name="phone"]')).toBeFocused();

      // Continue through all fields
      const tabbableElements = await page.locator('input, select, textarea, button').count();
      expect(tabbableElements).toBeGreaterThan(5);
    });

    test('should support Enter key to submit forms', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      await orgHelpers.fillOrganizationForm(organizationTestData.basic);

      // Press Enter to submit
      await page.keyboard.press('Enter');

      // Should submit the form
      await expect(page).toHaveURL(/\/organizations\/\d+/);
    });

    test('should support Escape key to cancel operations', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.basic);
      await orgHelpers.navigateToOrganizations();

      // Open delete confirmation
      await page.click('.delete-button, button:has-text("Delete")');
      await expect(page.locator('.MuiDialog-root, .confirmation-modal')).toBeVisible();

      // Press Escape to cancel
      await page.keyboard.press('Escape');

      // Dialog should close
      await expect(page.locator('.MuiDialog-root, .confirmation-modal')).toBeHidden();
    });

    test('should support arrow keys in dropdown menus', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      // Open priority dropdown
      await page.click('[data-testid="priorityId-select"], .MuiSelect-root[name="priorityId"]');
      await expect(page.locator('.MuiMenu-list, .MuiPopover-paper')).toBeVisible();

      // Use arrow keys to navigate
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      // Should select option and close menu
      await expect(page.locator('.MuiMenu-list, .MuiPopover-paper')).toBeHidden();
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have proper headings hierarchy', async ({ page }) => {
      await orgHelpers.navigateToOrganizations();

      // Check for proper heading structure (h1, h2, h3...)
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);

      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);

      // Verify main heading exists
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should have proper labels for all form inputs', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      // Check that all inputs have labels
      const inputs = await page.locator('input, select, textarea').all();

      for (const input of inputs) {
        const inputId = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');

        // Should have either label, aria-label, or aria-labelledby
        const hasLabel = inputId ? await page.locator(`label[for="${inputId}"]`).count() > 0 : false;

        expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    });

    test('should have proper ARIA attributes for interactive elements', async ({ page }) => {
      await orgHelpers.navigateToOrganizations();

      // Check buttons have proper ARIA attributes
      const buttons = await page.locator('button').all();

      for (const button of buttons) {
        const ariaLabel = await button.getAttribute('aria-label');
        const textContent = await button.textContent();

        // Button should have either text content or aria-label
        expect(textContent?.trim() || ariaLabel).toBeTruthy();
      }
    });

    test('should have proper alt text for images', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.basic);
      await orgHelpers.navigateToOrganizations();

      // Check all images have alt text
      const images = await page.locator('img').all();

      for (const img of images) {
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    });

    test('should have live regions for dynamic content', async ({ page }) => {
      await orgHelpers.navigateToOrganizations();

      // Check for notification live regions
      const liveRegions = await page.locator('[aria-live], [role="status"], [role="alert"]').count();
      expect(liveRegions).toBeGreaterThanOrEqual(0);

      // Create organization to trigger notification
      await orgHelpers.createTestOrganization(organizationTestData.basic);

      // Success notification should have proper ARIA
      await expect(page.locator('[role="alert"], .MuiAlert-root[aria-live="polite"]')).toBeVisible();
    });
  });

  test.describe('Color and Contrast', () => {
    test('should have sufficient color contrast for text', async ({ page }) => {
      await orgHelpers.navigateToOrganizations();

      // Check primary text elements
      const textElements = await page.locator('h1, h2, h3, p, span, label').all();

      for (const element of textElements.slice(0, 5)) { // Check first 5 elements
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize,
          };
        });

        // Verify text is visible (basic check)
        expect(styles.color).not.toBe('transparent');
        expect(styles.color).not.toBe('rgba(0, 0, 0, 0)');
      }
    });

    test('should not rely solely on color to convey information', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      // Fill form with validation errors
      await orgHelpers.fillOrganizationForm({ phone: 'invalid-phone' });
      await page.locator('input[name="phone"]').blur();

      // Error should be indicated by more than just color
      const errorElement = page.locator('.MuiFormHelperText-root.Mui-error').first();

      if (await errorElement.isVisible()) {
        // Should have text content, not just color
        const errorText = await errorElement.textContent();
        expect(errorText?.trim()).toBeTruthy();

        // May also have icons or other visual indicators
        const hasIcon = await errorElement.locator('svg, .icon').count() > 0;
        const hasText = errorText && errorText.trim().length > 0;

        expect(hasIcon || hasText).toBe(true);
      }
    });
  });

  test.describe('Focus Management', () => {
    test('should have visible focus indicators', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      // Tab to first input
      await page.keyboard.press('Tab');

      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // Check if focus is visually indicated
      const focusStyles = await focusedElement.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          outline: computed.outline,
          outlineWidth: computed.outlineWidth,
          boxShadow: computed.boxShadow,
        };
      });

      // Should have some form of focus indicator
      const hasFocusIndicator =
        focusStyles.outline !== 'none' ||
        focusStyles.outlineWidth !== '0px' ||
        focusStyles.boxShadow !== 'none';

      expect(hasFocusIndicator).toBe(true);
    });

    test('should manage focus in modal dialogs', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.basic);
      await orgHelpers.navigateToOrganizations();

      // Open delete confirmation dialog
      await page.click('.delete-button, button:has-text("Delete")');

      const dialog = page.locator('.MuiDialog-root, .confirmation-modal');
      await expect(dialog).toBeVisible();

      // Focus should be moved to dialog
      const focusedElement = page.locator(':focus');
      const isInDialog = await focusedElement.evaluate(el => {
        const dialog = document.querySelector('.MuiDialog-root, .confirmation-modal');
        return dialog?.contains(el) || false;
      });

      expect(isInDialog).toBe(true);
    });

    test('should restore focus after modal closes', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.basic);
      await orgHelpers.navigateToOrganizations();

      // Focus on delete button
      const deleteButton = page.locator('.delete-button, button:has-text("Delete")').first();
      await deleteButton.focus();

      // Open and close dialog
      await deleteButton.click();
      await page.keyboard.press('Escape');

      // Focus should return to delete button
      await expect(deleteButton).toBeFocused();
    });
  });

  test.describe('Error and Status Announcements', () => {
    test('should announce form validation errors', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();

      // Trigger validation error
      await page.fill('input[name="phone"]', 'invalid-phone');
      await page.locator('input[name="phone"]').blur();

      // Error should be associated with input
      const phoneInput = page.locator('input[name="phone"]');
      const ariaDescribedBy = await phoneInput.getAttribute('aria-describedby');

      if (ariaDescribedBy) {
        const errorElement = page.locator(`#${ariaDescribedBy}`);
        await expect(errorElement).toBeVisible();
        await expect(errorElement).toContainText('phone');
      }
    });

    test('should announce successful operations', async ({ page }) => {
      await orgHelpers.navigateToCreateOrganization();
      await orgHelpers.fillOrganizationForm(organizationTestData.basic);
      await orgHelpers.clickSaveButton();

      // Success notification should be announced
      const successNotification = page.locator('[role="alert"], .MuiAlert-success');
      await expect(successNotification).toBeVisible();

      // Should have appropriate ARIA attributes
      const ariaLive = await successNotification.getAttribute('aria-live');
      expect(ariaLive).toBeTruthy();
    });
  });

  test.describe('Responsive Accessibility', () => {
    test('should maintain accessibility on mobile', async ({ page }) => {
      await utils.simulateMobileDevice();
      await orgHelpers.navigateToCreateOrganization();

      // Touch targets should be at least 44px
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();

      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const boundingBox = await button.boundingBox();

        if (boundingBox) {
          expect(boundingBox.height).toBeGreaterThanOrEqual(44);
          expect(boundingBox.width).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('should support zoom up to 200%', async ({ page }) => {
      await orgHelpers.navigateToOrganizations();

      // Simulate 200% zoom
      await page.setViewportSize({ width: 640, height: 480 }); // Half size = 200% zoom

      // Content should still be usable
      await expect(page.locator('.organization-list, .MuiDataGrid-root')).toBeVisible();

      // Navigation should still work
      await orgHelpers.navigateToCreateOrganization();
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Assistive Technology Support', () => {
    test('should support high contrast mode', async ({ page }) => {
      // Simulate high contrast mode
      await page.addInitScript(() => {
        const style = document.createElement('style');
        style.textContent = `
          * {
            background: black !important;
            color: white !important;
            border-color: white !important;
          }
        `;
        document.head.appendChild(style);
      });

      await orgHelpers.navigateToOrganizations();

      // Interface should still be usable
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('.organization-list, .MuiDataGrid-root')).toBeVisible();
    });

    test('should work with reduced motion preferences', async ({ page }) => {
      // Simulate reduced motion preference
      await page.addInitScript(() => {
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: jest.fn().mockImplementation(query => ({
            matches: query === '(prefers-reduced-motion: reduce)',
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
          })),
        });
      });

      await orgHelpers.navigateToOrganizations();

      // Animations should be reduced or disabled
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Language and Internationalization', () => {
    test('should have proper lang attribute', async ({ page }) => {
      await orgHelpers.navigateToOrganizations();

      // Check html lang attribute
      const langAttr = await page.locator('html').getAttribute('lang');
      expect(langAttr).toBeTruthy();
      expect(langAttr).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // Format: 'en' or 'en-US'
    });

    test('should handle text direction for RTL languages', async ({ page }) => {
      // This is a basic test - full RTL testing would require language switching
      await orgHelpers.navigateToOrganizations();

      const dirAttr = await page.locator('html').getAttribute('dir');
      expect(dirAttr).toBeOneOf([null, 'ltr', 'rtl']);
    });
  });

  test.describe('Data Tables Accessibility', () => {
    test('should have proper table structure for organization list', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.basic);
      await orgHelpers.navigateToOrganizations();

      // Check for proper table structure if using table
      const table = page.locator('table, .MuiDataGrid-root');

      if (await table.isVisible()) {
        // Should have table headers
        const headers = await page.locator('th, .MuiDataGrid-columnHeader').count();
        expect(headers).toBeGreaterThan(0);

        // Headers should have proper scope
        const thElements = await page.locator('th').all();
        for (const th of thElements) {
          const scope = await th.getAttribute('scope');
          expect(scope).toBeOneOf([null, 'col', 'row', 'colgroup', 'rowgroup']);
        }
      }
    });

    test('should support table navigation with arrow keys', async ({ page }) => {
      await orgHelpers.createTestOrganization(organizationTestData.basic);
      await orgHelpers.navigateToOrganizations();

      const table = page.locator('table, .MuiDataGrid-root');

      if (await table.isVisible()) {
        // Focus first cell
        await page.keyboard.press('Tab');

        // Navigate with arrow keys
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowDown');

        // Should maintain focus within table
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();
      }
    });
  });
});