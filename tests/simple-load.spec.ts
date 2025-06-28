import { test, expect } from '@playwright/test';

test('simple app load test', async ({ page }) => {
  console.log('Starting simple load test...');
  
  // Navigate to the application
  await page.goto('http://localhost:5173/?test=true');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Check if we get any content (not stuck in loading)
  const bodyText = await page.textContent('body');
  console.log('Page body contains:', bodyText?.substring(0, 200));
  
  // Basic assertion - page should load something
  expect(bodyText).toBeTruthy();
  expect(bodyText).not.toBe('Loading...');
});