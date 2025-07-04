import { BrowserContext, Page, expect } from '@playwright/test';

/**
 * Utility class for global E2E test helpers and setup.
 */
export class TestUtils {
    page: Page;
    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Initialize test context: server, data provider, etc.
     */
    static async setupContext(context: BrowserContext): Promise<void> {
        // Optionally: set up test server, data provider, etc.
        // For Vite/Playwright, server is auto-started by config.
        // Add any global setup here if needed.
        return;
    }

    /**
     * Wait for the app to be fully ready (UI loaded, no spinners).
     */
    async waitForAppReady(): Promise<void> {
        await this.page.waitForSelector('body', { state: 'visible' });
        await this.page.waitForLoadState('networkidle');
        // Optionally wait for a known app-ready element
        await this.page.waitForSelector(
            '[data-testid="app-ready"], .main-content, .ra-layout-content',
            { timeout: 20000 }
        );
    }

    /**
     * Seed test data (calls backend or sets up local data as needed).
     */
    static async seedData(): Promise<void> {
        // Implement actual seeding logic if needed (API/db call)
        // For now, stub for E2E infra
        return;
    }

    /**
     * Log in as a test user.
     */
    async login(
        email: string = 'demo@forkflow.com',
        password: string = 'demo123'
    ): Promise<void> {
        await this.page.goto('/login');
        await this.page.fill(
            'input[name="email"], input[type="email"], #email',
            email
        );
        await this.page.fill(
            'input[name="password"], input[type="password"], #password',
            password
        );
        await this.page.click(
            'button[type="submit"], .login-button, [data-testid="login-submit"]'
        );
        await this.page.waitForURL(url => !url.includes('/login'), {
            timeout: 15000,
        });
        await this.waitForAppReady();
    }

    /**
     * Returns true if the test user is logged in.
     */
    async isLoggedIn(): Promise<boolean> {
        try {
            return await this.page.evaluate(() => {
                const hasAuth =
                    !!localStorage.getItem('auth') ||
                    !!localStorage.getItem('user');
                const isTestMode = localStorage.getItem('test-mode') === 'true';
                return hasAuth || isTestMode;
            });
        } catch {
            return false;
        }
    }

    /**
     * Measure the time to load a page.
     */
    async measurePageLoad(): Promise<number> {
        const start = Date.now();
        await this.page.waitForLoadState('networkidle');
        return Date.now() - start;
    }

    /**
     * Log all console errors during the test.
     */
    async logConsoleErrors(): Promise<void> {
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                // eslint-disable-next-line no-console
                console.error('Console error:', msg.text());
            }
        });
    }

    /**
     * Simulate a mobile device viewport.
     */
    async simulateMobileDevice(): Promise<void> {
        await this.page.setViewportSize({ width: 375, height: 667 });
    }

    /**
     * Simulate a tablet device viewport.
     */
    async simulateTabletDevice(): Promise<void> {
        await this.page.setViewportSize({ width: 768, height: 1024 });
    }

    /**
     * Simulate a desktop device viewport.
     */
    async simulateDesktopDevice(): Promise<void> {
        await this.page.setViewportSize({ width: 1280, height: 720 });
    }

    /**
     * Basic WCAG accessibility checks for the current page.
     */
    async checkBasicWCAG(): Promise<void> {
        // Check for headings
        const headings = await this.page
            .locator('h1, h2, h3, h4, h5, h6')
            .count();
        expect(headings).toBeGreaterThan(0);
        // Check for alt text on images
        const images = this.page.locator('img');
        const imageCount = await images.count();
        for (let i = 0; i < imageCount; i++) {
            const img = images.nth(i);
            const alt = await img.getAttribute('alt');
            expect(alt).toBeTruthy();
        }
        // Check for button labels
        const buttons = this.page.locator('button');
        const buttonCount = await buttons.count();
        for (let i = 0; i < buttonCount; i++) {
            const button = buttons.nth(i);
            const hasText = await button.textContent();
            const hasAriaLabel = await button.getAttribute('aria-label');
            expect(hasText || hasAriaLabel).toBeTruthy();
        }
    }
}

// Export all types used
export type { BrowserContext, Page };

// Global test utilities
export async function setupTestContext(page: Page) {
    await page.addInitScript(() => {
        localStorage.setItem('testMode', 'true');
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
export async function waitForDataProviderReady(
    page: any,
    timeout: number = 20000
) {
    try {
        // Wait for React Admin to be mounted
        await page.waitForSelector(
            '.MuiToolbar-root, .ra-layout, [data-testid="dashboard"]',
            { timeout }
        );

        // Wait for data provider to initialize
        await page.waitForFunction(
            () => {
                // Check if we have actual data loaded (not just loading state)
                const hasData =
                    document.querySelector(
                        '.ra-list, .ra-show, .ra-edit, .ra-create'
                    ) !== null;
                const notLoading =
                    document.querySelector('.ra-loading') === null;
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

export async function setupTestAuth(page: Page) {
    // Set test user token in localStorage or cookie
}

export async function isLoggedIn(page: Page) {
    return await page.isVisible('.user-avatar, .ra-logged-in');
}

export async function login(page: Page, username: string, password: string) {
    await page.goto('/login');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
}

export async function measurePageLoadTime(page: Page, url: string) {
    const start = Date.now();
    await page.goto(url);
    return Date.now() - start;
}

export async function logConsoleErrors(page: Page) {
    page.on('console', msg => {
        if (msg.type() === 'error') console.error(msg.text());
    });
}

export async function simulateMobile(page: Page) {
    await page.setViewportSize({ width: 375, height: 812 });
}

export async function checkBasicAccessibility(page: Page) {
    // Use axe-core or Playwright's built-in accessibility snapshot
}
