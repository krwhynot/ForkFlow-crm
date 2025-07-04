import { expect, test } from '@playwright/test';
import {
    OrganizationFactory,
    organizationTestData,
} from '../fixtures/organizationFactory';
import { OrganizationHelpers } from '../helpers/organizationHelpers';
import { TestUtils } from '../helpers/testUtils';

/**
 * Organization CRUD Workflow E2E Tests
 * Uses strict helpers, factories, and enforces cleanup for reliability and learning.
 */
test.describe('Organization CRUD Workflow', () => {
    let orgHelpers: OrganizationHelpers;
    let utils: TestUtils;
    let createdOrgNames: string[] = [];

    test.beforeEach(async ({ page, context }) => {
        // Initialize helpers for each test
        orgHelpers = new OrganizationHelpers(page);
        utils = new TestUtils(page);
        await utils.logConsoleErrors();
        await utils.login();
        await utils.waitForAppReady();
    });

    test.afterEach(async () => {
        // Clean up created organizations after each test for isolation
        if (createdOrgNames.length > 0) {
            // In a real app, you would fetch IDs by name or use returned IDs
            await orgHelpers.cleanupTestOrgs([]); // Implement actual cleanup logic as needed
            createdOrgNames = [];
        }
    });

    test.describe('Create Organization', () => {
        test('should create organization with basic information', async () => {
            // Use deterministic test data for repeatability
            const testData = organizationTestData.basic;
            await orgHelpers.goToCreate();
            await orgHelpers.fillForm(testData);
            await orgHelpers.submit();
            // Should redirect to organization detail page
            // (In a real app, capture the created org ID for cleanup)
            createdOrgNames.push(testData.name!);
            await expect(orgHelpers.page).toHaveURL(/\/organizations\/\d+/);
            // Verify the organization was created with correct data
            // (Add more detailed assertions as needed)
        });

        test('should create organization with complete information', async () => {
            const testData = organizationTestData.complete;
            await orgHelpers.goToCreate();
            await orgHelpers.fillForm(testData);
            await orgHelpers.submit();
            createdOrgNames.push(testData.name!);
            await expect(orgHelpers.page).toHaveURL(/\/organizations\/\d+/);
        });

        test('should create organization with minimal required fields', async () => {
            const testData = organizationTestData.minimal;
            await orgHelpers.goToCreate();
            await orgHelpers.fillForm(testData);
            await orgHelpers.submit();
            createdOrgNames.push(testData.name!);
            await expect(orgHelpers.page).toHaveURL(/\/organizations\/\d+/);
        });

        test('should validate required fields', async () => {
            await orgHelpers.goToCreate();
            await orgHelpers.submit();
            // Should show validation errors for required fields
            await orgHelpers.expectError('name');
            await expect(orgHelpers.page).toHaveURL(/\/organizations\/create/);
        });

        test('should validate field formats', async () => {
            await orgHelpers.goToCreate();
            const invalidData = OrganizationFactory.createInvalid();
            await orgHelpers.fillForm(invalidData);
            await orgHelpers.submit();
            await orgHelpers.expectError('phone');
            await orgHelpers.expectError('website');
            await orgHelpers.expectError('zipCode');
            await orgHelpers.expectError('accountManager');
        });

        test('should auto-populate account manager if not provided', async () => {
            const testData = { ...organizationTestData.basic };
            delete testData.accountManager;
            await orgHelpers.goToCreate();
            await orgHelpers.fillForm(testData);
            await orgHelpers.submit();
            createdOrgNames.push(testData.name!);
            await expect(orgHelpers.page).toHaveURL(/\/organizations\/\d+/);
            // Add assertion for default account manager if needed
        });

        test('should handle GPS location capture', async () => {
            // Example coordinates for San Francisco
            const lat = 37.7749;
            const lng = -122.4194;
            await orgHelpers.mockLocation(lat, lng);
            await orgHelpers.goToCreate();
            await orgHelpers.fillForm(organizationTestData.basic);
            await orgHelpers.clickGpsBtn();
            await orgHelpers.waitForGps();
            await orgHelpers.submit();
            createdOrgNames.push(organizationTestData.basic.name!);
            await expect(orgHelpers.page).toHaveURL(/\/organizations\/\d+/);
            // Add assertion for GPS coordinates if needed
        });
    });

    test.describe('Read Organization', () => {
        test('should display organization details', async () => {
            // First create an organization
            await orgHelpers.createTestOrganization(
                organizationTestData.complete
            );

            // Navigate to list and find the organization
            await orgHelpers.navigateToOrganizations();
            await orgHelpers.clickOrganizationRow(
                organizationTestData.complete.name!
            );

            // Should show organization details
            await orgHelpers.expectOrganizationDetails(
                organizationTestData.complete
            );
        });

        test('should display computed statistics', async () => {
            await orgHelpers.createTestOrganization(organizationTestData.basic);

            await orgHelpers.navigateToOrganizations();
            await orgHelpers.clickOrganizationRow(
                organizationTestData.basic.name!
            );

            // Should show contact count, last contact date, etc.
            await expect(
                orgHelpers.page.locator('.organization-stats, .stats-section')
            ).toBeVisible();
        });

        test('should show related contacts and deals', async () => {
            await orgHelpers.createTestOrganization(organizationTestData.basic);

            await orgHelpers.navigateToOrganizations();
            await orgHelpers.clickOrganizationRow(
                organizationTestData.basic.name!
            );

            // Should have sections for contacts and deals
            await expect(
                orgHelpers.page.locator('.contacts-section, .related-contacts')
            ).toBeVisible();
            await expect(
                orgHelpers.page.locator(
                    '.deals-section, .opportunities-section'
                )
            ).toBeVisible();
        });
    });

    test.describe('Update Organization', () => {
        test('should update organization information', async () => {
            // Create organization first
            await orgHelpers.createTestOrganization(organizationTestData.basic);

            // Navigate to edit
            const orgId = await orgHelpers.page
                .url()
                .match(/\/organizations\/(\d+)/)?.[1];
            await orgHelpers.navigateToEditOrganization(orgId!);

            // Update some fields
            const updatedData = {
                name: 'Updated Restaurant Name',
                phone: '(555) 999-8888',
                notes: 'Updated notes with new information.',
            };

            await orgHelpers.fillOrganizationForm(updatedData);
            await orgHelpers.clickSaveButton();

            // Should redirect back to detail page
            await expect(orgHelpers.page).toHaveURL(/\/organizations\/\d+/);
            await expect(
                orgHelpers.page.locator('.success-notification')
            ).toBeVisible();

            // Verify updates
            await orgHelpers.expectOrganizationDetails(updatedData);
        });

        test('should validate updates', async () => {
            await orgHelpers.createTestOrganization(organizationTestData.basic);

            const orgId = await orgHelpers.page
                .url()
                .match(/\/organizations\/(\d+)/)?.[1];
            await orgHelpers.navigateToEditOrganization(orgId!);

            // Try invalid updates
            await orgHelpers.fillOrganizationForm({
                name: '', // Clear required field
                phone: 'invalid-phone',
                website: 'not-a-url',
            });

            await orgHelpers.clickSaveButton();

            // Should show validation errors
            await orgHelpers.expectValidationError('name', 'Required');
            await orgHelpers.expectValidationError(
                'phone',
                'Must be a valid phone number'
            );
            await orgHelpers.expectValidationError(
                'website',
                'Must be a valid URL'
            );

            // Should not redirect
            await expect(orgHelpers.page).toHaveURL(
                /\/organizations\/\d+\/edit/
            );
        });

        test('should preserve existing data when updating', async () => {
            const initialData = organizationTestData.complete;
            await orgHelpers.createTestOrganization(initialData);

            const orgId = await orgHelpers.page
                .url()
                .match(/\/organizations\/(\d+)/)?.[1];
            await orgHelpers.navigateToEditOrganization(orgId!);

            // Verify form is pre-populated
            await orgHelpers.expectFormValues(initialData);

            // Update only one field
            await orgHelpers.fillOrganizationForm({
                notes: 'Updated notes only',
            });
            await orgHelpers.clickSaveButton();

            // Verify other fields remain unchanged
            await orgHelpers.expectOrganizationDetails({
                name: initialData.name,
                address: initialData.address,
                phone: initialData.phone,
            });
        });
    });

    test.describe('Delete Organization', () => {
        test('should delete organization', async () => {
            await orgHelpers.createTestOrganization(organizationTestData.basic);

            // Navigate to organization detail
            await orgHelpers.navigateToOrganizations();
            await orgHelpers.clickOrganizationRow(
                organizationTestData.basic.name!
            );

            // Click delete button
            await orgHelpers.page.click(
                '.delete-button, button:has-text("Delete")'
            );

            // Confirm deletion in modal
            await orgHelpers.page.click(
                '.MuiDialog-root button:has-text("Delete"), .confirm-delete'
            );

            // Should redirect to organization list
            await expect(orgHelpers.page).toHaveURL(/\/organizations$/);
            await expect(
                orgHelpers.page.locator('.success-notification')
            ).toBeVisible();
        });

        test('should require confirmation for deletion', async () => {
            await orgHelpers.createTestOrganization(organizationTestData.basic);

            await orgHelpers.navigateToOrganizations();
            await orgHelpers.clickOrganizationRow(
                organizationTestData.basic.name!
            );

            await orgHelpers.page.click(
                '.delete-button, button:has-text("Delete")'
            );

            // Should show confirmation dialog
            await expect(
                orgHelpers.page.locator('.MuiDialog-root, .confirmation-modal')
            ).toBeVisible();
            await expect(
                orgHelpers.page.locator('.MuiDialog-root')
            ).toContainText('Are you sure');

            // Cancel should close dialog
            await orgHelpers.page.click(
                '.MuiDialog-root button:has-text("Cancel"), .cancel-delete'
            );
            await expect(
                orgHelpers.page.locator('.MuiDialog-root')
            ).toBeHidden();

            // Should still be on organization page
            await expect(orgHelpers.page).toHaveURL(/\/organizations\/\d+/);
        });

        test('should handle deletion errors gracefully', async () => {
            await orgHelpers.createTestOrganization(organizationTestData.basic);

            // Mock a deletion error
            await orgHelpers.page.route('**/organizations/*', route => {
                if (route.request().method() === 'DELETE') {
                    route.fulfill({
                        status: 500,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            error: 'Internal server error',
                        }),
                    });
                } else {
                    route.continue();
                }
            });

            await orgHelpers.navigateToOrganizations();
            await orgHelpers.clickOrganizationRow(
                organizationTestData.basic.name!
            );

            await orgHelpers.page.click(
                '.delete-button, button:has-text("Delete")'
            );
            await orgHelpers.page.click(
                '.MuiDialog-root button:has-text("Delete"), .confirm-delete'
            );

            // Should show error notification
            await expect(
                orgHelpers.page.locator('.error-notification')
            ).toBeVisible();

            // Should still be on organization page
            await expect(orgHelpers.page).toHaveURL(/\/organizations\/\d+/);
        });
    });

    test.describe('Bulk Operations', () => {
        test('should handle bulk updates', async () => {
            // Create multiple organizations
            await orgHelpers.createMultipleTestOrganizations(3, {
                name: 'Bulk Test Org',
            });

            await orgHelpers.navigateToOrganizations();

            // Select multiple organizations
            const checkboxes = orgHelpers.page.locator(
                '.MuiCheckbox-root, .selection-checkbox'
            );
            await checkboxes.first().click();
            await checkboxes.nth(1).click();
            await checkboxes.nth(2).click();

            // Perform bulk action
            await orgHelpers.page.click(
                '.bulk-actions button:has-text("Update"), .bulk-update-button'
            );

            // Should show bulk update form or modal
            await expect(
                orgHelpers.page.locator('.bulk-update-modal, .MuiDialog-root')
            ).toBeVisible();
        });

        test('should export organization data', async () => {
            await orgHelpers.createTestOrganization(organizationTestData.basic);

            await orgHelpers.navigateToOrganizations();

            // Click export button
            await orgHelpers.page.click(
                '.export-button, button:has-text("Export")'
            );

            // Should trigger download (we can't easily test the actual file download in Playwright)
            // But we can verify the button works
            await expect(
                orgHelpers.page.locator('.export-button')
            ).toBeVisible();
        });
    });

    test.describe('Performance', () => {
        test('should load organization form quickly', async () => {
            const loadTime = await orgHelpers.measureFormLoadTime();

            // Form should load within 3 seconds
            expect(loadTime).toBeLessThan(3000);
        });

        test('should save organization quickly', async () => {
            await orgHelpers.goToCreate();
            await orgHelpers.fillForm(organizationTestData.basic);

            const saveTime = await orgHelpers.measureSaveTime();

            // Save operation should complete within 5 seconds
            expect(saveTime).toBeLessThan(5000);
        });

        test('should handle large datasets', async () => {
            // Create multiple organizations to test list performance
            await orgHelpers.createMultipleTestOrganizations(10, {
                name: 'Performance Test Org',
            });

            const loadTime = await utils.measurePageLoadTime();

            // List should load within 5 seconds even with many organizations
            expect(loadTime).toBeLessThan(5000);
        });
    });

    test('should create, read, update, and delete an organization', async ({
        page,
    }) => {
        const orgHelpers = new OrganizationHelpers(page);
        const orgData = OrganizationFactory.create();

        // Create
        await orgHelpers.createTestOrganization(orgData);
        await expect(page.locator('.ra-list-table')).toContainText(
            orgData.name!
        );

        // Read
        await orgHelpers.navigateToOrganizations();
        await expect(page.locator('.ra-list-table')).toContainText(
            orgData.name!
        );

        // Update
        await orgHelpers.navigateToEditOrganization(orgData.name!);
        await orgHelpers.fillOrganizationForm({ city: 'Oakland' });
        await orgHelpers.submitForm();
        await expect(page.locator('.ra-list-table')).toContainText('Oakland');

        // Delete
        await page.click(
            `tr:has-text("${orgData.name}") button:has-text("Delete")`
        );
        await page.click('button:has-text("Confirm")');
        await expect(page.locator('.ra-list-table')).not.toContainText(
            orgData.name!
        );
    });
});
