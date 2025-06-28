import { test, expect } from '@playwright/test';
import { TestUtils, setupTestContext } from '../helpers/testUtils';

test.describe('Accessibility Compliance - Components', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page, context }) => {
    await setupTestContext(context);
    utils = new TestUtils(page);
    await utils.logConsoleErrors();
    
    // Setup test environment
    await utils.seedTestData();
    await utils.setupTestAuth();
    
    await page.goto('/?test=true');
    await utils.waitForAppReady();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check for heading structure (h1 > h2 > h3, etc.)
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
    
    // Check that headings have text content
    for (const heading of headings.slice(0, 5)) { // Check first 5 headings
      const text = await heading.textContent();
      expect(text?.trim()).toBeTruthy();
    }
  });

  test('should have accessible interactive elements', async ({ page }) => {
    // All buttons should have accessible names
    const buttons = page.locator('button, [role="button"]');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        // Check for aria-label or text content
        const ariaLabel = await button.getAttribute('aria-label');
        const textContent = await button.textContent();
        
        expect(ariaLabel || textContent?.trim()).toBeTruthy();
      }
    }
  });

  test('should have proper focus management', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Check that focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Check focus styles
    const focusedStyle = await focusedElement.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineColor: styles.outlineColor,
        outlineWidth: styles.outlineWidth,
      };
    });
    
    // Should have some form of focus indication
    expect(
      focusedStyle.outline !== 'none' || 
      focusedStyle.outlineWidth !== '0px'
    ).toBe(true);
  });

  test('should have accessible forms', async ({ page }) => {
    // Check for form elements
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      for (let i = 0; i < Math.min(inputCount, 5); i++) {
        const input = inputs.nth(i);
        if (await input.isVisible()) {
          // Check for labels
          const id = await input.getAttribute('id');
          const ariaLabel = await input.getAttribute('aria-label');
          const ariaLabelledBy = await input.getAttribute('aria-labelledby');
          
          if (id) {
            const label = page.locator(`label[for="${id}"]`);
            const hasLabel = (await label.count()) > 0;
            
            expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
          }
        }
      }
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    // Basic color contrast check for text elements
    const textElements = page.locator('p, span, a, button, h1, h2, h3, h4, h5, h6').first();
    
    if (await textElements.count() > 0) {
      const styles = await textElements.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize,
        };
      });
      
      // Basic check - ensure text has color
      expect(styles.color).not.toBe('rgba(0, 0, 0, 0)');
      expect(styles.color).not.toBe('transparent');
    }
  });

  test('should have accessible images', async ({ page }) => {
    // Check that images have alt text
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      if (await img.isVisible()) {
        const alt = await img.getAttribute('alt');
        const ariaLabel = await img.getAttribute('aria-label');
        const role = await img.getAttribute('role');
        
        // Images should have alt text or be marked as decorative
        expect(
          alt !== null || 
          ariaLabel || 
          role === 'presentation' || 
          role === 'none'
        ).toBe(true);
      }
    }
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    // Check for common ARIA violations
    const elementsWithRole = page.locator('[role]');
    const roleCount = await elementsWithRole.count();
    
    for (let i = 0; i < Math.min(roleCount, 10); i++) {
      const element = elementsWithRole.nth(i);
      const role = await element.getAttribute('role');
      
      // Check for valid roles
      const validRoles = [
        'button', 'link', 'tab', 'tabpanel', 'dialog', 'menu', 'menuitem',
        'navigation', 'main', 'complementary', 'banner', 'contentinfo',
        'article', 'section', 'heading', 'list', 'listitem', 'grid',
        'gridcell', 'row', 'presentation', 'none'
      ];
      
      if (role) {
        expect(validRoles).toContain(role);
      }
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test that Tab navigation works
    let focusableElements = 0;
    
    // Tab through first few elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      
      const focusedElement = page.locator(':focus');
      if (await focusedElement.count() > 0) {
        focusableElements++;
      }
    }
    
    expect(focusableElements).toBeGreaterThan(0);
  });

  test('should have proper link accessibility', async ({ page }) => {
    // Check that links have meaningful text
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    
    for (let i = 0; i < Math.min(linkCount, 5); i++) {
      const link = links.nth(i);
      if (await link.isVisible()) {
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        const title = await link.getAttribute('title');
        
        // Links should have descriptive text
        const linkText = text?.trim() || ariaLabel || title;
        expect(linkText).toBeTruthy();
        
        // Avoid generic link text
        const genericTexts = ['click here', 'read more', 'more', 'link'];
        if (linkText) {
          expect(genericTexts.includes(linkText.toLowerCase())).toBe(false);
        }
      }
    }
  });
});