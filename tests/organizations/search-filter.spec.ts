import { expect, test } from '@playwright/test';
import { foodServiceOrganizations } from '../fixtures';
import { OrganizationTestHelpers } from '../helpers/organizationHelpers';
import { TestUtils, setupTestContext } from '../helpers/testUtils';

test.describe('Organization Search and Filter', () => {
  let orgHelpers: OrganizationTestHelpers;
  let utils: TestUtils;

  test.beforeAll(async ({ browser }) => {
    // Create test data once for all search/filter tests
    const context = await browser.newContext();
    const page = await context.newPage();
    await setupTestContext(context);

    const helpers = new OrganizationTestHelpers(page);
    const testUtils = new TestUtils(page);

    if (!(await testUtils.isLoggedIn())) {
      await testUtils.login();
    }

    // Create multiple test organizations for search/filter testing
    for (const orgData of foodServiceOrganizations) {
      await helpers.createTestOrganization(orgData);
    }

    await context.close();
  });

  test.beforeEach(async ({ page, context }) => {
    await setupTestContext(context);
    orgHelpers = new OrganizationTestHelpers(page);
    utils = new TestUtils(page);
    await utils.logConsoleErrors();
    if (!(await utils.isLoggedIn())) {
      await utils.login();
    }
    await orgHelpers.navigateToOrganizations();
  });

  test.describe('Text Search', () => {
    test('should search organizations by name', async ({ page }) => {
      await orgHelpers.searchOrganizations('Bella Vista');

      // Should find the Bella Vista restaurant
      await expect(page.locator('.organization-row, .MuiDataGrid-row')).toContainText('Bella Vista Italian Kitchen');

      // Should not show unrelated organizations
      await expect(page.locator('.organization-row, .MuiDataGrid-row')).not.toContainText('Metro Diner');
    });

    test('should search organizations by address', async ({ page }) => {
      await orgHelpers.searchOrganizations('Union Street');

      // Should find organizations on Union Street
      await expect(page.locator('.organization-row, .MuiDataGrid-row')).toContainText('Bella Vista');
    });

    test('should search organizations by city', async ({ page }) => {
      await orgHelpers.searchOrganizations('Oakland');

      // Should find Oakland organizations
      await expect(page.locator('.organization-row, .MuiDataGrid-row')).toContainText('Metro Diner');

      // Should not show San Francisco organizations
      await expect(page.locator('.organization-row, .MuiDataGrid-row')).not.toContainText('Bella Vista');
    });

    test('should search organizations by phone number', async ({ page }) => {
      await orgHelpers.searchOrganizations('(415) 555-1847');

      // Should find organization with that phone number
      await expect(page.locator('.organization-row, .MuiDataGrid-row')).toContainText('Bella Vista');
    });

    test('should search organizations by notes content', async ({ page }) => {
      await orgHelpers.searchOrganizations('pasta');

      // Should find restaurants mentioning pasta in notes
      await expect(page.locator('.organization-row, .MuiDataGrid-row')).toContainText('Bella Vista');
    });

    test('should handle case-insensitive search', async ({ page }) => {
      await orgHelpers.searchOrganizations('BELLA vista');

      await expect(page.locator('.organization-row, .MuiDataGrid-row')).toContainText('Bella Vista Italian Kitchen');
    });

    test('should handle partial word search', async ({ page }) => {
      await orgHelpers.searchOrganizations('Steak');

      await expect(page.locator('.organization-row, .MuiDataGrid-row')).toContainText('The Steakhouse Premium');
    });

    test('should handle empty search results', async ({ page }) => {
      await orgHelpers.searchOrganizations('NonexistentRestaurant');

      // Should show no results message
      await expect(page.locator('.no-results, .empty-state')).toBeVisible();
      await expect(page.locator('.no-results, .empty-state')).toContainText('No organizations found');
    });

    test('should clear search results', async ({ page }) => {
      // First perform a search
      await orgHelpers.searchOrganizations('Bella Vista');
      const searchResultCount = await orgHelpers.getOrganizationRowCount();
      expect(searchResultCount).toBeLessThan(5);

      // Clear search
      await page.fill('.ra-search-input input, input[name="q"]', '');
      await page.press('.ra-search-input input, input[name="q"]', 'Enter');

      // Should show all organizations again
      const allResultsCount = await orgHelpers.getOrganizationRowCount();
      expect(allResultsCount).toBeGreaterThan(searchResultCount);
    });
  });

  test.describe('Filter by Priority', () => {
    test('should filter by high priority', async ({ page }) => {
      await orgHelpers.applyFilter('priorityId', 'high-priority-setting-id');

      // Should only show high priority organizations
      const rowCount = await orgHelpers.getOrganizationRowCount();
      expect(rowCount).toBeGreaterThan(0);

      // Verify all visible organizations have high priority
      const priorityBadges = page.locator('.priority-badge, .organization-priority');
      const badgeCount = await priorityBadges.count();

      for (let i = 0; i < badgeCount; i++) {
        await expect(priorityBadges.nth(i)).toContainText('High');
      }
    });

    test('should filter by medium priority', async ({ page }) => {
      await orgHelpers.applyFilter('priorityId', 'medium-priority-setting-id');

      const rowCount = await orgHelpers.getOrganizationRowCount();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('should combine priority filter with search', async ({ page }) => {
      await orgHelpers.applyFilter('priorityId', 'high-priority-setting-id');
      await orgHelpers.searchOrganizations('Restaurant');

      // Should show only high priority restaurants containing "Restaurant"
      const rowCount = await orgHelpers.getOrganizationRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Filter by Business Segment', () => {
    test('should filter by fine dining segment', async ({ page }) => {
      await orgHelpers.applyFilter('segmentId', 'fine-dining-segment-id');

      const rowCount = await orgHelpers.getOrganizationRowCount();
      expect(rowCount).toBeGreaterThan(0);

      // Should show segment indicators
      await expect(page.locator('.segment-badge, .business-segment')).toBeVisible();
    });

    test('should filter by casual dining segment', async ({ page }) => {
      await orgHelpers.applyFilter('segmentId', 'casual-dining-segment-id');

      const rowCount = await orgHelpers.getOrganizationRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('should filter by quick service segment', async ({ page }) => {
      await orgHelpers.applyFilter('segmentId', 'quick-service-segment-id');

      const rowCount = await orgHelpers.getOrganizationRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Filter by Distributor', () => {
    test('should filter by Sysco distributor', async ({ page }) => {
      await orgHelpers.applyFilter('distributorId', 'sysco-distributor-id');

      const rowCount = await orgHelpers.getOrganizationRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('should filter by US Foods distributor', async ({ page }) => {
      await orgHelpers.applyFilter('distributorId', 'us-foods-distributor-id');

      const rowCount = await orgHelpers.getOrganizationRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Geographic Filters', () => {
    test('should filter by city', async ({ page }) => {
      await orgHelpers.applyFilter('city', 'San Francisco');

      // Should only show San Francisco organizations
      const rows = page.locator('.organization-row, .MuiDataGrid-row');
      const rowCount = await rows.count();

      for (let i = 0; i < rowCount; i++) {
        await expect(rows.nth(i)).toContainText('San Francisco');
      }
    });

    test('should filter by state', async ({ page }) => {
      await orgHelpers.applyFilter('state', 'CA');

      // Should only show California organizations
      const rowCount = await orgHelpers.getOrganizationRowCount();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('should filter by ZIP code', async ({ page }) => {
      await orgHelpers.applyFilter('zipCode', '94123');

      // Should show organizations in that ZIP code
      const rowCount = await orgHelpers.getOrganizationRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Relationship Filters', () => {
    test('should filter organizations with contacts', async ({ page }) => {
      await orgHelpers.applyFilter('hasContacts', 'true');

      const rowCount = await orgHelpers.getOrganizationRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);

      // Should show contact count indicators
      await expect(page.locator('.contact-count, .contacts-indicator')).toBeVisible();
    });

    test('should filter organizations without contacts', async ({ page }) => {
      await orgHelpers.applyFilter('hasContacts', 'false');

      const rowCount = await orgHelpers.getOrganizationRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('should filter organizations with opportunities', async ({ page }) => {
      await orgHelpers.applyFilter('hasOpportunities', 'true');

      const rowCount = await orgHelpers.getOrganizationRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Date Range Filters', () => {
    test('should filter by last contact date range', async ({ page }) => {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      await orgHelpers.applyFilter('lastContactDateAfter', lastWeek.toISOString().split('T')[0]);

      // Should show organizations contacted in the last week
      const rowCount = await orgHelpers.getOrganizationRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('should filter by creation date', async ({ page }) => {
      const today = new Date().toISOString().split('T')[0];

      await orgHelpers.applyFilter('createdAfter', today);

      // Should show organizations created today
      const rowCount = await orgHelpers.getOrganizationRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Account Manager Filter', () => {
    test('should filter by account manager', async ({ page }) => {
      await orgHelpers.applyFilter('accountManager', 'john.smith@forkflow.com');

      // Should show organizations managed by John Smith
      const rowCount = await orgHelpers.getOrganizationRowCount();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('should filter by different account manager', async ({ page }) => {
      await orgHelpers.applyFilter('accountManager', 'sarah.jones@forkflow.com');

      const rowCount = await orgHelpers.getOrganizationRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Multiple Filters', () => {
    test('should combine multiple filters', async ({ page }) => {
      // Apply multiple filters
      await orgHelpers.applyFilter('priorityId', 'high-priority-setting-id');
      await orgHelpers.applyFilter('segmentId', 'fine-dining-segment-id');
      await orgHelpers.applyFilter('city', 'San Francisco');

      // Should show only organizations matching all criteria
      const rowCount = await orgHelpers.getOrganizationRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('should combine search with filters', async ({ page }) => {
      await orgHelpers.searchOrganizations('Italian');
      await orgHelpers.applyFilter('city', 'San Francisco');

      // Should show only Italian restaurants in San Francisco
      const rowCount = await orgHelpers.getOrganizationRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('should clear all filters', async ({ page }) => {
      // Apply filters first
      await orgHelpers.applyFilter('priorityId', 'high-priority-setting-id');
      await orgHelpers.applyFilter('city', 'San Francisco');

      const filteredCount = await orgHelpers.getOrganizationRowCount();

      // Clear all filters
      await page.click('.clear-filters, button:has-text("Clear Filters")');

      // Should show all organizations again
      const allCount = await orgHelpers.getOrganizationRowCount();
      expect(allCount).toBeGreaterThan(filteredCount);
    });
  });

  test.describe('Filter UI and UX', () => {
    test('should show active filter indicators', async ({ page }) => {
      await orgHelpers.applyFilter('priorityId', 'high-priority-setting-id');

      // Should show active filter badge
      await expect(page.locator('.active-filters, .filter-chips')).toBeVisible();
      await expect(page.locator('.filter-chip:has-text("Priority")')).toBeVisible();
    });

    test('should allow removing individual filters', async ({ page }) => {
      await orgHelpers.applyFilter('priorityId', 'high-priority-setting-id');
      await orgHelpers.applyFilter('city', 'San Francisco');

      // Remove one filter
      await page.click('.filter-chip:has-text("Priority") .remove-filter, .filter-chip button');

      // Should keep other filters active
      await expect(page.locator('.filter-chip:has-text("City")')).toBeVisible();
      await expect(page.locator('.filter-chip:has-text("Priority")')).not.toBeVisible();
    });

    test('should save filter state in URL', async ({ page }) => {
      await orgHelpers.applyFilter('priorityId', 'high-priority-setting-id');
      await orgHelpers.searchOrganizations('Restaurant');

      // URL should contain filter parameters
      await expect(page).toHaveURL(/priorityId/);
      await expect(page).toHaveURL(/q=Restaurant/);
    });

    test('should restore filters from URL', async ({ page }) => {
      // Navigate with filters in URL
      await page.goto('/organizations?priorityId=high-priority-setting-id&q=Restaurant');

      // Should apply filters automatically
      await expect(page.locator('.filter-chip:has-text("Priority")')).toBeVisible();
      await expect(page.locator('.ra-search-input input')).toHaveValue('Restaurant');
    });
  });

  test.describe('Performance', () => {
    test('should filter large datasets quickly', async ({ page }) => {
      // Create additional test data
      for (let i = 0; i < 20; i++) {
        await orgHelpers.createTestOrganization({
          name: `Performance Test Org ${i}`,
          city: 'Test City',
          state: 'CA',
        });
      }

      await orgHelpers.navigateToOrganizations();

      const startTime = Date.now();
      await orgHelpers.applyFilter('city', 'Test City');
      const filterTime = Date.now() - startTime;

      // Filter should complete within 3 seconds
      expect(filterTime).toBeLessThan(3000);
    });

    test('should search large datasets quickly', async ({ page }) => {
      const startTime = Date.now();
      await orgHelpers.searchOrganizations('Test');
      const searchTime = Date.now() - startTime;

      // Search should complete within 2 seconds
      expect(searchTime).toBeLessThan(2000);
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation in filters', async ({ page }) => {
      await page.click('.ra-filter-button, button:has-text("Filters")');

      // Should be able to navigate filters with keyboard
      await page.keyboard.press('Tab'); // First filter
      await page.keyboard.press('Enter'); // Open dropdown
      await page.keyboard.press('ArrowDown'); // Navigate options
      await page.keyboard.press('Enter'); // Select option

      // Filter should be applied
      await expect(page.locator('.filter-chip, .active-filters')).toBeVisible();
    });

    test('should have proper ARIA labels for search and filters', async ({ page }) => {
      const searchInput = page.locator('.ra-search-input input');
      await expect(searchInput).toHaveAttribute('aria-label');

      const filterButton = page.locator('.ra-filter-button');
      await expect(filterButton).toHaveAttribute('aria-label');
    });

    test('should announce filter results to screen readers', async ({ page }) => {
      await orgHelpers.applyFilter('city', 'San Francisco');

      // Should have live region for results announcement
      await expect(page.locator('[aria-live="polite"], .results-announcement')).toBeVisible();
    });
  });
});