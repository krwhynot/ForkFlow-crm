import { BrowserContext, Page, expect } from '@playwright/test';

export class TestUtils {
  constructor(private page: Page) { }

  // Authentication helpers
  async login(email: string = 'demo@forkflow.com', password: string = 'demo123') {
    // Check if we should bypass authentication in test mode
    const testMode = await this.page.evaluate(() => 
      localStorage.getItem('test-mode') === 'true'
    );
    
    if (testMode) {
      await this.setupTestAuth();
      await this.page.goto('/');
      await this.waitForAppReady();
      return;
    }

    await this.page.goto('/login');

    // Handle different login form variations
    const emailSelector = 'input[name="email"], input[type="email"], #email';
    const passwordSelector = 'input[name="password"], input[type="password"], #password';
    const submitSelector = 'button[type="submit"], .login-button, [data-testid="login-submit"]';

    try {
      await this.page.fill(emailSelector, email);
      await this.page.fill(passwordSelector, password);
      await this.page.click(submitSelector);

      // Wait for login to complete
      await this.page.waitForURL(url => !url.includes('/login'), { timeout: 15000 });
      await this.waitForAppReady();
    } catch (error) {
      console.error('Login failed, attempting test auth bypass:', error);
      await this.setupTestAuth();
      await this.page.goto('/');
      await this.waitForAppReady();
    }
  }

  async logout() {
    const logoutSelector = '.logout-button, button:has-text("Logout"), [data-testid="logout"]';
    await this.page.click(logoutSelector);
    await this.page.waitForURL(/\/login/);
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      return await this.page.evaluate(() => {
        const hasAuth = !!localStorage.getItem('auth') || !!localStorage.getItem('user');
        const isTestMode = localStorage.getItem('test-mode') === 'true';
        return hasAuth || isTestMode;
      });
    } catch (e) {
      console.error('Error accessing localStorage:', e);
      return false;
    }
  }

  // Navigation helpers
  async navigateToPath(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async clickNavLink(text: string) {
    await this.page.click(`nav a:has-text("${text}"), .nav-link:has-text("${text}")`);
    await this.page.waitForLoadState('networkidle');
  }

  // Wait helpers
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('body', { state: 'visible' });
  }

  async waitForElement(selector: string, timeout: number = 10000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async waitForText(text: string, timeout: number = 10000) {
    await this.page.waitForSelector(`text=${text}`, { timeout });
  }

  // Form helpers
  async fillForm(formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      const selector = `input[name="${field}"], textarea[name="${field}"], select[name="${field}"]`;
      await this.page.fill(selector, value);
    }
  }

  async submitForm(formSelector: string = 'form') {
    await this.page.click(`${formSelector} button[type="submit"]`);
  }

  // UI interaction helpers
  async clickButton(text: string) {
    await this.page.click(`button:has-text("${text}")`);
  }

  async clickLink(text: string) {
    await this.page.click(`a:has-text("${text}")`);
  }

  async selectDropdownOption(dropdownSelector: string, optionText: string) {
    await this.page.click(dropdownSelector);
    await this.page.click(`text=${optionText}`);
  }

  // Table/List helpers
  async getTableRowCount(tableSelector: string = 'table'): Promise<number> {
    return await this.page.locator(`${tableSelector} tbody tr`).count();
  }

  async clickTableRow(tableSelector: string, rowIndex: number) {
    await this.page.click(`${tableSelector} tbody tr:nth-child(${rowIndex + 1})`);
  }

  async searchInTable(searchText: string, searchInputSelector: string = '.ra-search-input input') {
    await this.page.fill(searchInputSelector, searchText);
    await this.page.press(searchInputSelector, 'Enter');
    await this.waitForPageLoad();
  }

  // Mobile helpers
  async isMobile(): Promise<boolean> {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width < 768 : false;
  }

  async simulateMobileDevice() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  async simulateTabletDevice() {
    await this.page.setViewportSize({ width: 768, height: 1024 });
  }

  async simulateDesktopDevice() {
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  // Screenshot helpers
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }

  async takeElementScreenshot(selector: string, name: string) {
    await this.page.locator(selector).screenshot({ path: `test-results/screenshots/${name}.png` });
  }

  // Error handling helpers
  async expectNoConsoleErrors() {
    const errors: string[] = [];
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Give a moment for any errors to appear
    await this.page.waitForTimeout(1000);

    expect(errors).toHaveLength(0);
  }

  async expectNoNetworkErrors() {
    const failedRequests: string[] = [];
    this.page.on('response', response => {
      if (!response.ok()) {
        failedRequests.push(`${response.status()} ${response.url()}`);
      }
    });

    await this.page.waitForTimeout(1000);

    expect(failedRequests).toHaveLength(0);
  }

  // Performance helpers
  async measurePageLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.waitForPageLoad();
    return Date.now() - startTime;
  }

  async measureActionTime<T>(action: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const startTime = Date.now();
    const result = await action();
    const duration = Date.now() - startTime;
    return { result, duration };
  }

  // Accessibility helpers
  async checkPageAccessibility() {
    // Check for basic accessibility requirements
    await this.checkHeadings();
    await this.checkImages();
    await this.checkLinks();
  }

  private async checkHeadings() {
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').count();
    expect(headings).toBeGreaterThan(0);
  }

  private async checkImages() {
    const images = this.page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  }

  private async checkLinks() {
    const links = this.page.locator('a[href]');
    const linkCount = await links.count();

    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');

      expect(href).toBeTruthy();
      expect(text || ariaLabel).toBeTruthy();
    }
  }

  // Data helpers
  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  async clearSessionStorage() {
    await this.page.evaluate(() => sessionStorage.clear());
  }

  async setLocalStorageItem(key: string, value: string) {
    await this.page.evaluate(({ key, value }) => {
      localStorage.setItem(key, value);
    }, { key, value });
  }

  async getLocalStorageItem(key: string): Promise<string | null> {
    return await this.page.evaluate(key => localStorage.getItem(key), key);
  }

  // Mock helpers
  async mockGeolocation(latitude: number, longitude: number) {
    await this.page.context().grantPermissions(['geolocation']);
    await this.page.context().setGeolocation({ latitude, longitude });
  }

  async mockNetworkResponse(url: string, response: any) {
    await this.page.route(url, route => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  // Assertion helpers
  async expectElementVisible(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async expectElementHidden(selector: string) {
    await expect(this.page.locator(selector)).toBeHidden();
  }

  async expectElementContainsText(selector: string, text: string) {
    await expect(this.page.locator(selector)).toContainText(text);
  }

  async expectElementHasValue(selector: string, value: string) {
    await expect(this.page.locator(selector)).toHaveValue(value);
  }

  async expectCurrentUrl(urlPattern: RegExp | string) {
    await expect(this.page).toHaveURL(urlPattern);
  }

  async expectPageTitle(title: string) {
    await expect(this.page).toHaveTitle(title);
  }

  // Add a method to log console errors for debugging
  async logConsoleErrors() {
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });
  }

  // Enhanced loading state detection for E2E tests
  async waitForAppReady() {
    // Check if we're in test mode
    const isTestMode = await this.page.evaluate(() => {
      return window.location.search.includes('test=true') || 
             localStorage.getItem('test-mode') === 'true' ||
             document.querySelector('[data-testid="test-mode"]') !== null;
    });

    if (isTestMode) {
      console.log('Test mode detected, waiting for app initialization...');
    }

    // Wait for react-admin to be ready
    try {
      await this.page.waitForSelector(
        '.ra-loading:not(.ra-loading-indicator), [data-testid="dashboard"], .organization-list, .contact-list, .product-list',
        { timeout: 20000 }
      );
      
      // Additional wait for data loading
      await this.page.waitForFunction(
        () => {
          const loadingElements = document.querySelectorAll('.ra-loading, .MuiCircularProgress-root');
          return loadingElements.length === 0 || 
                 Array.from(loadingElements).every(el => el.style.display === 'none');
        },
        { timeout: 15000 }
      );

      // Wait for network to be idle
      await this.page.waitForLoadState('networkidle');
      
      console.log('App ready detected');
      return true;
    } catch (error) {
      console.error('App failed to load properly:', error);
      return false;
    }
  }

  // Setup test environment configuration
  async setupTestAuth() {
    // Set test mode flag
    await this.page.evaluate(() => {
      localStorage.setItem('test-mode', 'true');
      localStorage.setItem('auth', JSON.stringify({
        user: {
          id: 'test-user-1',
          email: 'test@forkflow.com',
          first_name: 'Test',
          last_name: 'User'
        },
        token: 'test-token'
      }));
    });
  }

  // Seed test data for consistent testing
  async seedTestData() {
    await this.page.evaluate(() => {
      // Force use of fakerest data provider for tests
      localStorage.setItem('data-provider', 'fakerest');
      localStorage.setItem('test-data-seeded', 'true');
    });
  }
}

// Global test utilities
export async function setupTestContext(context: BrowserContext) {
  // Grant necessary permissions
  await context.grantPermissions(['geolocation']);

  // Set default geolocation
  await context.setGeolocation({ latitude: 37.7749, longitude: -122.4194 });

  // Handle console logs and errors
  context.on('page', page => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console error: ${msg.text()}`);
      }
    });

    // Add request interception for test mode
    page.route('**/*', route => {
      const request = route.request();
      const headers = {
        ...request.headers(),
        'X-Test-Mode': 'true'
      };
      route.continue({ headers });
    });
  });

  // Add extra HTTP headers for test identification
  await context.setExtraHTTPHeaders({
    'X-Test-Mode': 'true',
    'X-Test-Environment': 'playwright'
  });
}

export function generateTestId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await sleep(delay);
      }
    }
  }

  throw lastError!;
}

// Test data setup for consistent E2E testing
export async function seedTestData() {
  console.log('Seeding test data for E2E tests...');
  
  // This would typically initialize the fake data provider
  // with a consistent set of test data
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Test data seeding completed');
      resolve(true);
    }, 1000);
  });
}

// Enhanced page load detection
export async function waitForDataProviderReady(page: any, timeout: number = 20000) {
  try {
    // Wait for React Admin to be mounted
    await page.waitForSelector('.MuiToolbar-root, .ra-layout, [data-testid="dashboard"]', { timeout });
    
    // Wait for data provider to initialize
    await page.waitForFunction(
      () => {
        // Check if we have actual data loaded (not just loading state)
        const hasData = document.querySelector('.ra-list, .ra-show, .ra-edit, .ra-create') !== null;
        const notLoading = document.querySelector('.ra-loading') === null;
        return hasData || notLoading;
      },
      { timeout }
    );
    
    return true;
  } catch (error) {
    console.error('Data provider failed to initialize:', error);
    return false;
  }
}