import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/test-results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Capture video on failure */
    video: 'retain-on-failure',

    /* Ignore HTTPS errors for development */
    ignoreHTTPSErrors: true,

    /* Custom test timeout - increased for better reliability */
    actionTimeout: 15000,
    navigationTimeout: 20000,

    /* Extra HTTP headers for test identification */
    extraHTTPHeaders: {
      'X-Test-Mode': 'true',
      'X-Test-Environment': 'playwright'
    },

    /* Bypass CSP for better test reliability */
    bypassCSP: true,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 }
      },
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 }
      },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        extraHTTPHeaders: {
          'X-Test-Mode': 'true',
          'X-Test-Environment': 'playwright-mobile'
        },
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        extraHTTPHeaders: {
          'X-Test-Mode': 'true',
          'X-Test-Environment': 'playwright-mobile'
        },
      },
    },
    {
      name: 'Tablet Chrome',
      use: {
        ...devices['iPad Pro'],
        extraHTTPHeaders: {
          'X-Test-Mode': 'true',
          'X-Test-Environment': 'playwright-tablet'
        },
      },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      VITE_TEST_MODE: 'true'
    }
  },

  /* Global setup and teardown */
  // globalSetup: './tests/setup/global-setup.ts',
  // globalTeardown: './tests/setup/global-teardown.ts',

  /* Test output directory */
  outputDir: './test-results/',

  /* Expect timeout */
  expect: {
    timeout: 10000,
    toMatchSnapshot: {
      mode: 'strict',
      threshold: 0.2
    }
  }
});