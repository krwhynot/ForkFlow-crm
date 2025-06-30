import { Page, expect } from '@playwright/test';
import { Organization } from '../../src/types';
import { OrganizationFactory, organizationTestData } from '../fixtures/organizationFactory';

/**
 * Interface for organization form data.
 */
export interface OrganizationFormData extends Partial<Organization> { }

/**
 * Page Object Model helpers for organization E2E tests.
 */
export class OrganizationHelpers {
  constructor(private page: Page) { }

  /** Navigate to the organization list page. */
  async goToList() {
    await this.page.goto('/organizations');
    await this.page.waitForLoadState('networkidle');
  }

  /** Navigate to the create organization page. */
  async goToCreate() {
    await this.page.goto('/organizations/create');
    await this.page.waitForLoadState('networkidle');
  }

  /** Navigate to the edit page for a specific organization by ID. */
  async goToEdit(id: number | string) {
    await this.page.goto(`/organizations/${id}/edit`);
    await this.page.waitForLoadState('networkidle');
  }

  /** Fill the organization form with provided data. */
  async fillForm(data: OrganizationFormData) {
    if (data.name !== undefined) await this.page.fill('input[name="name"]', data.name);
    if (data.address !== undefined) await this.page.fill('input[name="address"]', data.address);
    if (data.city !== undefined) await this.page.fill('input[name="city"]', data.city);
    if (data.state !== undefined) await this.page.fill('input[name="state"]', data.state);
    if (data.zipCode !== undefined) await this.page.fill('input[name="zipCode"]', data.zipCode);
    if (data.phone !== undefined) await this.page.fill('input[name="phone"]', data.phone);
    if (data.website !== undefined) await this.page.fill('input[name="website"]', data.website);
    if (data.accountManager !== undefined) await this.page.fill('input[name="accountManager"]', data.accountManager);
    if (data.notes !== undefined) await this.page.fill('textarea[name="notes"]', data.notes);
    if (data.priorityId !== undefined) await this.selectOption('priorityId', String(data.priorityId));
    if (data.segmentId !== undefined) await this.selectOption('segmentId', String(data.segmentId));
    if (data.distributorId !== undefined) await this.selectOption('distributorId', String(data.distributorId));
  }

  /** Submit the organization form. */
  async submit() {
    await this.page.click('button[type="submit"], .MuiButton-contained:has-text("Save")');
    await this.page.waitForLoadState('networkidle');
  }

  /** Select an option in a dropdown/select field. */
  async selectOption(field: string, value: string) {
    const selector = `[data-testid="${field}-select"], .MuiSelect-root[name="${field}"], input[name="${field}"] + div`;
    await this.page.click(selector);
    await this.page.waitForSelector('.MuiMenu-list, .MuiPopover-paper');
    await this.page.click(`[data-value="${value}"], li:has-text("${value}")`);
  }

  /** Create a test organization via the UI. Returns the created org's name. */
  async createTestOrg(data: OrganizationFormData = {}): Promise<string> {
    await this.goToCreate();
    await this.fillForm(data);
    await this.submit();
    // Wait for redirect and return the org name
    await this.page.waitForSelector('.MuiAlert-root, .ra-notification, .organization-details');
    return data.name || OrganizationFactory.create().name || 'Test Org';
  }

  /** Bulk create organizations via the UI. Returns array of created org names. */
  async bulkCreateOrgs(dataArray: OrganizationFormData[]): Promise<string[]> {
    const names: string[] = [];
    for (const data of dataArray) {
      const name = await this.createTestOrg(data);
      names.push(name);
    }
    return names;
  }

  /** Mock browser geolocation for GPS fields. */
  async mockLocation(lat: number, lng: number) {
    await this.page.context().grantPermissions(['geolocation']);
    await this.page.context().setGeolocation({ latitude: lat, longitude: lng });
  }

  /** Click the GPS button in the form. */
  async clickGpsBtn() {
    await this.page.click('button:has-text("GPS"), .gps-button');
  }

  /** Wait for GPS capture to complete. */
  async waitForGps() {
    await this.page.waitForSelector('.gps-success, .MuiAlert-success', { timeout: 10000 });
  }

  /** Assert that a validation error is shown for a field. */
  async expectError(field: string) {
    const errorSelector = `[data-testid="${field}-error"], .MuiFormHelperText-root.Mui-error`;
    await expect(this.page.locator(errorSelector)).toBeVisible();
  }

  /** Assert that no validation errors are present. */
  async expectNoErrors() {
    const errorSelector = '.MuiFormHelperText-root.Mui-error, .field-error';
    await expect(this.page.locator(errorSelector)).toHaveCount(0);
  }

  /** Returns true if the current viewport is mobile. */
  async isMobile(): Promise<boolean> {
    const width = (await this.page.viewportSize())?.width || 1024;
    return width < 768;
  }

  /** Assert that the mobile layout is rendered. */
  async expectMobileLayout() {
    if (await this.isMobile()) {
      await expect(this.page.locator('.mobile-layout, .MuiContainer-maxWidthSm')).toBeVisible();
    }
  }

  /** Check accessibility of the organization form. */
  async checkA11yForm() {
    const inputs = await this.page.locator('input, select, textarea').count();
    const labelsAndAria = await this.page.locator('input[aria-label], input[aria-labelledby], input + label, label input').count();
    expect(labelsAndAria).toBeGreaterThanOrEqual(inputs * 0.9);
  }

  /** Check accessibility of all buttons. */
  async checkA11yButton() {
    const buttons = this.page.locator('button');
    const buttonCount = await buttons.count();
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const hasText = await button.textContent();
      const hasAriaLabel = await button.getAttribute('aria-label');
      expect(hasText || hasAriaLabel).toBeTruthy();
    }
  }

  /** Measure the time to load the organization form. */
  async measureLoad(): Promise<number> {
    const start = Date.now();
    await this.page.waitForSelector('form');
    return Date.now() - start;
  }

  /** Measure the time to submit the organization form. */
  async measureSubmit(): Promise<number> {
    const start = Date.now();
    await this.submit();
    return Date.now() - start;
  }

  /** Cleanup created organizations by IDs. */
  async cleanupTestOrgs(ids: number[]): Promise<void> {
    await OrganizationFactory.cleanupCreated(ids);
  }

  // List page helpers
  async searchOrganizations(query: string) {
    await this.page.fill('input[name="q"], .ra-search-input input', query);
    await this.page.press('input[name="q"], .ra-search-input input', 'Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async applyFilter(filterName: string, value: string) {
    await this.page.click(`.ra-filter-button, button:has-text("Filters")`);
    await this.page.waitForSelector('.ra-filter-form');
    await this.selectOption(filterName, value);
    await this.page.click('button:has-text("Apply"), .ra-filter-apply');
    await this.page.waitForLoadState('networkidle');
  }

  async getOrganizationRowCount(): Promise<number> {
    await this.page.waitForSelector('.MuiDataGrid-row, .ra-datagrid tbody tr');
    const rows = await this.page.locator('.MuiDataGrid-row, .ra-datagrid tbody tr').count();
    return rows;
  }

  async clickOrganizationRow(organizationName: string) {
    await this.page.click(`tr:has-text("${organizationName}"), .MuiDataGrid-row:has-text("${organizationName}")`);
  }

  // Validation helpers
  async expectValidationError(fieldName: string, errorMessage?: string) {
    const errorSelector = `[data-testid="${fieldName}-error"], .MuiFormHelperText-root.Mui-error`;
    await expect(this.page.locator(errorSelector)).toBeVisible();

    if (errorMessage) {
      await expect(this.page.locator(errorSelector)).toContainText(errorMessage);
    }
  }

  async expectNoValidationErrors() {
    const errorSelector = '.MuiFormHelperText-root.Mui-error, .field-error';
    await expect(this.page.locator(errorSelector)).toHaveCount(0);
  }

  // Assertion helpers
  async expectOrganizationDetails(expectedData: Partial<Organization>) {
    if (expectedData.name) {
      await expect(this.page.locator('h1, .organization-name')).toContainText(expectedData.name);
    }

    if (expectedData.address) {
      await expect(this.page.locator('.address, .organization-address')).toContainText(expectedData.address);
    }

    if (expectedData.phone) {
      await expect(this.page.locator('.phone, .organization-phone')).toContainText(expectedData.phone);
    }

    if (expectedData.website) {
      await expect(this.page.locator('a[href*="http"], .website-link')).toContainText(expectedData.website);
    }
  }

  async expectFormValues(expectedData: Partial<Organization>) {
    for (const [field, value] of Object.entries(expectedData)) {
      if (value) {
        const input = this.page.locator(`input[name="${field}"], textarea[name="${field}"]`);
        await expect(input).toHaveValue(String(value));
      }
    }
  }
}

// Test data utilities
export const testOrganizations = {
  valid: organizationTestData.basic,
  complete: organizationTestData.complete,
  minimal: organizationTestData.minimal,
  invalid: organizationTestData.invalid,
};

// Custom matchers and expectations
export async function expectSuccessNotification(page: Page, message?: string) {
  await expect(page.locator('.MuiAlert-success, .ra-notification-success')).toBeVisible();
  if (message) {
    await expect(page.locator('.MuiAlert-success, .ra-notification-success')).toContainText(message);
  }
}

export async function expectErrorNotification(page: Page, message?: string) {
  await expect(page.locator('.MuiAlert-error, .ra-notification-error')).toBeVisible();
  if (message) {
    await expect(page.locator('.MuiAlert-error, .ra-notification-error')).toContainText(message);
  }
}

export type { Organization };
