import { describe, it, beforeAll, afterAll } from 'vitest';
import { Page, Browser, chromium, expect } from '@playwright/test';

// E2E tests for the complete interaction tracking workflow
// These tests require the development server to be running

describe('Interaction Tracking E2E Workflow', () => {
    let browser: Browser;
    let page: Page;
    const baseURL = 'http://localhost:5173';

    beforeAll(async () => {
        browser = await chromium.launch({
            headless: process.env.CI === 'true', // Run headless in CI
        });
        page = await browser.newPage();

        // Mock geolocation for testing
        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'geolocation', {
                value: {
                    getCurrentPosition: (success: PositionCallback) => {
                        success({
                            coords: {
                                latitude: 37.7749,
                                longitude: -122.4194,
                                accuracy: 10,
                                altitude: null,
                                altitudeAccuracy: null,
                                heading: null,
                                speed: null,
                            },
                            timestamp: Date.now(),
                        } as GeolocationPosition);
                    },
                    watchPosition: () => 1,
                    clearWatch: () => {},
                },
            });
        });

        // Navigate to the application
        await page.goto(baseURL);

        // Wait for the app to load
        await page.waitForSelector(
            '[data-testid="dashboard"], .RaLayout-content',
            { timeout: 10000 }
        );
    });

    afterAll(async () => {
        await browser.close();
    });

    describe('Complete Interaction Creation Workflow', () => {
        it('should create a new interaction with GPS location', async () => {
            // Navigate to interactions page
            await page.click('text=Interactions', { timeout: 5000 });
            await page.waitForURL('**/interactions');

            // Click create new interaction
            await page.click('text=Create', { timeout: 5000 });
            await page.waitForURL('**/interactions/create');

            // Verify the form is loaded
            await expect(
                page.locator('text=Interaction Details')
            ).toBeVisible();

            // Fill out the organization field
            await page.click('[data-testid="organizationId-input"] input');
            await page.type(
                '[data-testid="organizationId-input"] input',
                'Acme Corp'
            );
            await page.click('text=Acme Corp'); // Select from dropdown

            // Fill out interaction type
            await page.click('[data-testid="typeId-input"]');
            await page.click('text=In Person'); // This should trigger GPS recommendation

            // Fill out subject
            await page.fill(
                '[data-testid="subject-input"] input',
                'Product demonstration meeting'
            );

            // Fill out description
            await page.fill(
                '[data-testid="description-input"] textarea',
                'Demonstrated our new product line to the customer team'
            );

            // Verify GPS section appears for in-person interaction
            await expect(
                page.locator('text=Location (Recommended)')
            ).toBeVisible();

            // Enable GPS capture
            const gpsSwitch = page.locator(
                '[data-testid="gps-enabled-switch"]'
            );
            if (!(await gpsSwitch.isChecked())) {
                await gpsSwitch.click();
            }

            // Click get current location
            await page.click('text=Get Current Location');

            // Verify location is captured
            await expect(page.locator('text=Location captured')).toBeVisible();
            await expect(page.locator('text=37.7749, -122.4194')).toBeVisible();

            // Set scheduled date
            await page.fill(
                '[data-testid="scheduledDate-input"] input',
                '2024-01-15T14:30'
            );

            // Set duration
            await page.fill('[data-testid="duration-input"] input', '60');

            // Save the interaction
            await page.click('text=Save');

            // Verify success
            await page.waitForURL('**/interactions/**', { timeout: 10000 });
            await expect(
                page.locator('text=Product demonstration meeting')
            ).toBeVisible();

            // Verify GPS coordinates are saved
            await expect(page.locator('text=37.7749')).toBeVisible();
            await expect(page.locator('text=-122.4194')).toBeVisible();
        });

        it('should handle offline interaction creation', async () => {
            // Simulate going offline
            await page.context().setOffline(true);

            // Navigate to create interaction
            await page.goto(`${baseURL}/interactions/create`);

            // Verify offline indicator
            await expect(page.locator('text=Offline Mode')).toBeVisible();

            // Fill out minimal form
            await page.click('[data-testid="organizationId-input"] input');
            await page.type(
                '[data-testid="organizationId-input"] input',
                'Beta Inc'
            );
            await page.click('text=Beta Inc');

            await page.click('[data-testid="typeId-input"]');
            await page.click('text=Call');

            await page.fill(
                '[data-testid="subject-input"] input',
                'Offline follow-up call'
            );
            await page.fill(
                '[data-testid="description-input"] textarea',
                'Follow-up call scheduled while offline'
            );

            // Save the interaction
            await page.click('text=Save');

            // Verify offline save notification
            await expect(page.locator('text=saved offline')).toBeVisible();

            // Go back online
            await page.context().setOffline(false);

            // Verify sync happens automatically
            await expect(
                page.locator('text=synced successfully')
            ).toBeVisible();
        });

        it('should upload file attachments', async () => {
            // Create a new interaction first
            await page.goto(`${baseURL}/interactions/create`);

            // Fill out basic info
            await page.click('[data-testid="organizationId-input"] input');
            await page.type(
                '[data-testid="organizationId-input"] input',
                'Gamma Ltd'
            );
            await page.click('text=Gamma Ltd');

            await page.click('[data-testid="typeId-input"]');
            await page.click('text=Demo/Sampled');

            await page.fill(
                '[data-testid="subject-input"] input',
                'Product sample with documentation'
            );

            // Expand advanced options
            await page.click('text=Show Advanced Options');

            // Verify file upload section
            await expect(page.locator('text=Attachments')).toBeVisible();

            // Create a test file
            const fileInput = page.locator('input[type="file"]');
            await fileInput.setInputFiles({
                name: 'product-spec.pdf',
                mimeType: 'application/pdf',
                buffer: Buffer.from('Mock PDF content'),
            });

            // Verify file is selected
            await expect(page.locator('text=product-spec.pdf')).toBeVisible();

            // Save interaction
            await page.click('text=Save');

            // Verify file was uploaded
            await page.waitForURL('**/interactions/**');
            await expect(page.locator('text=product-spec.pdf')).toBeVisible();
        });

        it('should handle form validation errors', async () => {
            await page.goto(`${baseURL}/interactions/create`);

            // Try to save without required fields
            await page.click('text=Save');

            // Verify validation errors
            await expect(
                page.locator('text=Organization is required') ||
                    page.locator('text=Required')
            ).toBeVisible();
            await expect(
                page.locator('text=Subject is required') ||
                    page.locator('text=Required')
            ).toBeVisible();
        });

        it('should show GPS accuracy warnings', async () => {
            // Mock low accuracy GPS
            await page.addInitScript(() => {
                Object.defineProperty(navigator, 'geolocation', {
                    value: {
                        getCurrentPosition: (success: PositionCallback) => {
                            success({
                                coords: {
                                    latitude: 37.7749,
                                    longitude: -122.4194,
                                    accuracy: 150, // Low accuracy
                                    altitude: null,
                                    altitudeAccuracy: null,
                                    heading: null,
                                    speed: null,
                                },
                                timestamp: Date.now(),
                            } as GeolocationPosition);
                        },
                        watchPosition: () => 1,
                        clearWatch: () => {},
                    },
                });
            });

            await page.goto(`${baseURL}/interactions/create`);

            // Select in-person interaction to trigger GPS
            await page.click('[data-testid="typeId-input"]');
            await page.click('text=In Person');

            // Enable GPS
            const gpsSwitch = page.locator(
                '[data-testid="gps-enabled-switch"]'
            );
            if (!(await gpsSwitch.isChecked())) {
                await gpsSwitch.click();
            }

            // Get location
            await page.click('text=Get Current Location');

            // Verify accuracy warning
            await expect(
                page.locator('text=Consider moving to an open area')
            ).toBeVisible();
        });

        it('should handle GPS permission denied', async () => {
            // Mock GPS permission denied
            await page.addInitScript(() => {
                Object.defineProperty(navigator, 'geolocation', {
                    value: {
                        getCurrentPosition: (
                            success: PositionCallback,
                            error: PositionErrorCallback
                        ) => {
                            error({
                                code: 1, // PERMISSION_DENIED
                                message:
                                    'User denied the request for Geolocation.',
                            } as GeolocationPositionError);
                        },
                        watchPosition: () => 1,
                        clearWatch: () => {},
                    },
                });
            });

            await page.goto(`${baseURL}/interactions/create`);

            // Select in-person interaction
            await page.click('[data-testid="typeId-input"]');
            await page.click('text=In Person');

            // Try to get location
            const gpsSwitch = page.locator(
                '[data-testid="gps-enabled-switch"]'
            );
            if (!(await gpsSwitch.isChecked())) {
                await gpsSwitch.click();
            }

            await page.click('text=Get Current Location');

            // Verify error message
            await expect(
                page.locator('text=Location access denied') ||
                    page.locator('text=GPS error')
            ).toBeVisible();
        });
    });

    describe('Interaction List and Management', () => {
        it('should display interactions in list view', async () => {
            await page.goto(`${baseURL}/interactions`);

            // Wait for list to load
            await expect(page.locator('.RaList-content')).toBeVisible();

            // Verify interactions are displayed
            await expect(
                page.locator('[data-testid="interaction-row"]').first()
            ).toBeVisible();
        });

        it('should filter interactions by type', async () => {
            await page.goto(`${baseURL}/interactions`);

            // Open filter
            await page.click('text=Filters');

            // Select interaction type filter
            await page.click('[data-testid="type-filter"]');
            await page.click('text=In Person');

            // Apply filter
            await page.click('text=Apply');

            // Verify filtered results
            await expect(page.locator('text=In Person')).toBeVisible();
        });

        it('should search interactions by text', async () => {
            await page.goto(`${baseURL}/interactions`);

            // Use search
            await page.fill(
                '[data-testid="search-input"]',
                'Product demonstration'
            );
            await page.press('[data-testid="search-input"]', 'Enter');

            // Verify search results
            await expect(
                page.locator('text=Product demonstration')
            ).toBeVisible();
        });
    });

    describe('Performance Monitoring', () => {
        it('should show performance dashboard', async () => {
            // Navigate to settings or performance page
            await page.goto(`${baseURL}/settings/interactions`);

            // Expand performance section
            await page.click('text=Performance Monitoring');

            // Verify performance dashboard is visible
            await expect(page.locator('text=API Performance')).toBeVisible();
            await expect(page.locator('text=GPS Performance')).toBeVisible();
            await expect(page.locator('text=Upload Performance')).toBeVisible();
        });

        it('should export performance metrics', async () => {
            await page.goto(`${baseURL}/settings/interactions`);

            // Open performance section
            await page.click('text=Performance Monitoring');

            // Click export
            const downloadPromise = page.waitForEvent('download');
            await page.click('text=Export CSV');
            const download = await downloadPromise;

            // Verify download
            expect(download.suggestedFilename()).toMatch(
                /performance-metrics.*\.csv/
            );
        });
    });

    describe('Mobile Responsiveness', () => {
        it('should work on mobile viewport', async () => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });

            await page.goto(`${baseURL}/interactions/create`);

            // Verify mobile-optimized layout
            await expect(page.locator('.RaCreate-main')).toHaveClass(
                /RaCreate-main/
            );

            // Verify touch targets are large enough (44px minimum)
            const buttons = page.locator('button');
            const firstButton = buttons.first();
            const buttonBox = await firstButton.boundingBox();

            if (buttonBox) {
                expect(buttonBox.height).toBeGreaterThanOrEqual(44);
            }

            // Test GPS functionality on mobile
            await page.click('[data-testid="typeId-input"]');
            await page.click('text=In Person');

            const gpsButton = page.locator('text=Get Current Location');
            await expect(gpsButton).toBeVisible();

            const gpsButtonBox = await gpsButton.boundingBox();
            if (gpsButtonBox) {
                expect(gpsButtonBox.height).toBeGreaterThanOrEqual(44);
            }
        });

        it('should handle touch interactions', async () => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto(`${baseURL}/interactions/create`);

            // Test touch tap on form elements
            await page.tap('[data-testid="organizationId-input"] input');
            await expect(
                page.locator('[data-testid="organizationId-input"] input')
            ).toBeFocused();

            // Test swipe/scroll behavior
            await page.evaluate(() => {
                window.scrollTo(0, 500);
            });

            // Verify form is still functional after scroll
            await page.tap('[data-testid="subject-input"] input');
            await expect(
                page.locator('[data-testid="subject-input"] input')
            ).toBeFocused();
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA labels and roles', async () => {
            await page.goto(`${baseURL}/interactions/create`);

            // Verify form has proper role
            await expect(page.locator('form')).toHaveAttribute('role', 'form');

            // Verify inputs have labels
            const inputs = page.locator('input');
            const inputCount = await inputs.count();

            for (let i = 0; i < inputCount; i++) {
                const input = inputs.nth(i);
                const hasLabel = await input.evaluate(el => {
                    const id = el.id;
                    return (
                        !!document.querySelector(`label[for="${id}"]`) ||
                        !!el.getAttribute('aria-label')
                    );
                });
                expect(hasLabel).toBe(true);
            }
        });

        it('should be keyboard navigable', async () => {
            await page.goto(`${baseURL}/interactions/create`);

            // Test keyboard navigation
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');

            // Verify focus is visible
            const focusedElement = page.locator(':focus');
            await expect(focusedElement).toBeVisible();
        });
    });
});
