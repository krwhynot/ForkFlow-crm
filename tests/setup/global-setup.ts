import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
    console.log('🎭 Setting up E2E test environment...');

    // Launch browser for initial setup
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        // Navigate to the application
        console.log(
            '📡 Connecting to application at',
            config.projects[0].use.baseURL
        );
        await page.goto(
            config.projects[0].use.baseURL || 'http://localhost:5173'
        );

        // Setup test environment
        await page.evaluate(() => {
            // Force fakerest data provider for tests
            localStorage.setItem('data-provider', 'fakerest');
            localStorage.setItem('test-mode', 'true');
            localStorage.setItem('test-environment', 'playwright');

            // Set up test authentication
            localStorage.setItem(
                'auth',
                JSON.stringify({
                    user: {
                        id: 'test-user-1',
                        email: 'demo@forkflow.com',
                        first_name: 'Test',
                        last_name: 'User',
                        administrator: true,
                    },
                    token: 'test-token',
                    authenticated: true,
                })
            );

            // Set up user data
            localStorage.setItem(
                'user',
                JSON.stringify({
                    id: 'test-user-1',
                    email: 'demo@forkflow.com',
                    first_name: 'Test',
                    last_name: 'User',
                    administrator: true,
                })
            );

            console.log('✅ Test environment configured');
        });

        // Wait for application to be ready
        console.log('⏳ Waiting for application initialization...');

        // Try to wait for the app to load, but don't fail if it doesn't
        try {
            await page.waitForSelector(
                '.MuiToolbar-root, .ra-layout, [data-testid="dashboard"]',
                {
                    timeout: 30000,
                }
            );
            console.log('✅ Application loaded successfully');
        } catch (error) {
            console.log(
                '⚠️ Application loading timeout (this may be normal in test setup)'
            );
        }
    } catch (error) {
        console.error('❌ Global setup failed:', error);
        // Don't throw - let individual tests handle initialization
    } finally {
        await browser.close();
    }

    console.log('🎯 Global setup completed');
}

export default globalSetup;
