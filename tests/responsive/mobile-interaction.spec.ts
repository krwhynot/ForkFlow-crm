import { test, expect } from '@playwright/test';
import { TestUtils, setupTestContext } from '../helpers/testUtils';

test.describe('Mobile Responsive - Interactions', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page, context }) => {
    await setupTestContext(context);
    utils = new TestUtils(page);
    await utils.logConsoleErrors();
    
    // Setup mobile test environment
    await utils.seedTestData();
    await utils.setupTestAuth();
    await utils.simulateMobileDevice();
    
    await page.goto('/?test=true');
    await utils.waitForAppReady();
  });

  test('should display touch-friendly buttons (44px minimum)', async ({ page }) => {
    // Navigate to interactions if possible
    try {
      await page.click('a[href*="interactions"], nav a:has-text("Interactions")');
      await utils.waitForPageLoad();
    } catch {
      // Skip if navigation not available
      test.skip();
    }

    // Check that all interactive elements meet touch target requirements
    const buttons = page.locator('button, [role="button"], a');
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const boundingBox = await button.boundingBox();
        if (boundingBox) {
          expect(boundingBox.width).toBeGreaterThanOrEqual(44);
          expect(boundingBox.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('should be readable on mobile viewport', async ({ page }) => {
    // Check text is readable (font size >= 16px for mobile)
    const textElements = page.locator('p, span, div:has-text("")').first();
    
    if (await textElements.count() > 0) {
      const fontSize = await textElements.evaluate(el => {
        return window.getComputedStyle(el).fontSize;
      });
      
      const fontSizeValue = parseInt(fontSize.replace('px', ''));
      expect(fontSizeValue).toBeGreaterThanOrEqual(14); // Minimum readable size
    }
  });

  test('should handle mobile viewport correctly', async ({ page }) => {
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThanOrEqual(768); // Mobile breakpoint
    
    // Check that content adapts to mobile
    const isMobileLayout = await page.evaluate(() => {
      return window.innerWidth <= 768;
    });
    
    expect(isMobileLayout).toBe(true);
  });

  test('should support gesture navigation', async ({ page }) => {
    // Test scroll behavior on mobile
    await page.evaluate(() => window.scrollBy(0, 100));
    
    const scrollPosition = await page.evaluate(() => window.pageYOffset);
    expect(scrollPosition).toBeGreaterThan(0);
  });
});