import { Page, Locator, expect } from '@playwright/test';
import { Organization } from '../../src/types';
import { OrganizationFactory, organizationTestData } from '../fixtures/organizationFactory';

export class OrganizationTestHelpers {
  constructor(private page: Page) {}

  // Navigation helpers
  async navigateToOrganizations() {
    await this.page.goto('/organizations');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToCreateOrganization() {
    await this.page.goto('/organizations/create');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToOrganization(id: string) {
    await this.page.goto(`/organizations/${id}`);
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToEditOrganization(id: string) {
    await this.page.goto(`/organizations/${id}/edit`);
    await this.page.waitForLoadState('networkidle');
  }

  // Form interaction helpers
  async fillOrganizationForm(data: Partial<Organization>) {
    if (data.name) {
      await this.page.fill('input[name="name"]', data.name);
    }
    
    if (data.address) {
      await this.page.fill('input[name="address"]', data.address);
    }
    
    if (data.city) {
      await this.page.fill('input[name="city"]', data.city);
    }
    
    if (data.state) {
      await this.page.fill('input[name="state"]', data.state);
    }
    
    if (data.zipCode) {
      await this.page.fill('input[name="zipCode"]', data.zipCode);
    }
    
    if (data.phone) {
      await this.page.fill('input[name="phone"]', data.phone);
    }
    
    if (data.website) {
      await this.page.fill('input[name="website"]', data.website);
    }
    
    if (data.accountManager) {
      await this.page.fill('input[name="accountManager"]', data.accountManager);
    }
    
    if (data.notes) {
      await this.page.fill('textarea[name="notes"]', data.notes);
    }

    // Handle select inputs
    if (data.priorityId) {
      await this.selectOption('priorityId', data.priorityId);
    }
    
    if (data.segmentId) {
      await this.selectOption('segmentId', data.segmentId);
    }
    
    if (data.distributorId) {
      await this.selectOption('distributorId', data.distributorId);
    }
  }

  async selectOption(fieldName: string, optionValue: string) {
    const selector = `[data-testid="${fieldName}-select"], .MuiSelect-root[name="${fieldName}"], input[name="${fieldName}"] + div`;
    await this.page.click(selector);
    await this.page.waitForSelector('.MuiMenu-list, .MuiPopover-paper');
    await this.page.click(`[data-value="${optionValue}"], li:has-text("${optionValue}")`);
  }

  async submitForm() {
    await this.page.click('button[type="submit"], .MuiButton-contained:has-text("Save")');
  }

  async clickSaveButton() {
    await this.page.click('button:has-text("Save"), .ra-save-button');
    await this.waitForFormSubmission();
  }

  async clickCancelButton() {
    await this.page.click('button:has-text("Cancel"), .ra-cancel-button');
  }

  async waitForFormSubmission() {
    // Wait for either success redirect or error message
    await Promise.race([
      this.page.waitForURL(/\/organizations\/\d+/, { timeout: 10000 }),
      this.page.waitForSelector('.MuiAlert-root, .ra-notification', { timeout: 5000 }),
    ]);
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

  // GPS testing helpers
  async mockGPSLocation(latitude: number, longitude: number) {
    await this.page.context().grantPermissions(['geolocation']);
    await this.page.context().setGeolocation({ latitude, longitude });
  }

  async clickGPSButton() {
    await this.page.click('button:has-text("GPS"), .gps-button');
  }

  async waitForGPSCapture() {
    await this.page.waitForSelector('.gps-success, .MuiAlert-success', { timeout: 10000 });
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

  // Mobile-specific helpers
  async isMobileView(): Promise<boolean> {
    const width = await this.page.viewportSize()?.width || 1024;
    return width < 768;
  }

  async expectMobileLayout() {
    if (await this.isMobileView()) {
      // Check for mobile-specific elements
      await expect(this.page.locator('.mobile-layout, .MuiContainer-maxWidthSm')).toBeVisible();
    }
  }

  // Accessibility helpers
  async checkFormAccessibility() {
    // Check that all form inputs have labels
    const inputs = await this.page.locator('input, select, textarea').count();
    const labelsAndAria = await this.page.locator('input[aria-label], input[aria-labelledby], input + label, label input').count();
    
    expect(labelsAndAria).toBeGreaterThanOrEqual(inputs * 0.9); // Allow 10% tolerance
  }

  async checkButtonAccessibility() {
    // Check that buttons have proper attributes
    const buttons = this.page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const hasText = await button.textContent();
      const hasAriaLabel = await button.getAttribute('aria-label');
      
      expect(hasText || hasAriaLabel).toBeTruthy();
    }
  }

  // Data factory helpers
  async createTestOrganization(overrides: Partial<Organization> = {}): Promise<void> {
    const testData = OrganizationFactory.create(overrides);
    await this.navigateToCreateOrganization();
    await this.fillOrganizationForm(testData);
    await this.clickSaveButton();
  }

  async createMultipleTestOrganizations(count: number, overrides: Partial<Organization> = {}): Promise<void> {
    for (let i = 0; i < count; i++) {
      await this.createTestOrganization({
        ...overrides,
        name: `${overrides.name || 'Test Organization'} ${i + 1}`,
      });
      await this.navigateToOrganizations();
    }
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

  // Performance helpers
  async measureFormLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.page.waitForSelector('form', { state: 'visible' });
    await this.page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }

  async measureSaveTime(): Promise<number> {
    const startTime = Date.now();
    await this.clickSaveButton();
    return Date.now() - startTime;
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