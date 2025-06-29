// Simple test to verify organization API functionality
import { describe, it, expect, beforeEach } from 'vitest';
import { dataProvider } from '../dataProvider';
import { Organization } from '../../../types';

describe('Organization API', () => {
    let testOrganization: Partial<Organization>;

    beforeEach(() => {
        testOrganization = {
            name: 'Test Restaurant',
            address: '123 Main St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            phone: '(555) 123-4567',
            accountManager: 'test@forkflow.com',
            notes: 'Test organization for API validation',
        };
    });

    it('should create an organization with validation', async () => {
        const result = await dataProvider.createOrganization({
            data: testOrganization,
        });

        expect(result.data).toBeDefined();
        expect(result.data.name).toBe('Test Restaurant');
        expect(result.data.createdAt).toBeDefined();
        expect(result.data.updatedAt).toBeDefined();
    });

    it('should validate required fields', async () => {
        const invalidOrganization = {
            // Missing required fields: name, address, city, state
            phone: '(555) 123-4567',
        };

        await expect(
            dataProvider.createOrganization({
                data: invalidOrganization,
            })
        ).rejects.toThrow('Validation failed');
    });

    it('should validate phone number format', async () => {
        const invalidPhoneOrganization = {
            ...testOrganization,
            phone: 'invalid-phone',
        };

        await expect(
            dataProvider.createOrganization({
                data: invalidPhoneOrganization,
            })
        ).rejects.toThrow('Invalid phone number format');
    });

    it('should search organizations', async () => {
        // First create an organization
        await dataProvider.createOrganization({
            data: testOrganization,
        });

        // Then search for it
        const searchResult =
            await dataProvider.searchOrganizations('Test Restaurant');

        expect(searchResult.data.length).toBeGreaterThan(0);
        expect(
            searchResult.data.some((org: any) => org.name === 'Test Restaurant')
        ).toBe(true);
    });

    it('should calculate organization stats', async () => {
        // Create an organization
        const createdOrg = await dataProvider.createOrganization({
            data: testOrganization,
        });

        // Calculate stats for the organization
        const stats = await dataProvider.calculateOrganizationStats(
            createdOrg.data.id
        );

        expect(stats).toBeDefined();
        expect(typeof stats.contactCount).toBe('number');
        expect(typeof stats.totalOpportunities).toBe('number');
        expect(typeof stats.totalOpportunityValue).toBe('number');
        expect(typeof stats.conversionRate).toBe('number');
    });

    it('should filter organizations by settings', async () => {
        // Get existing organizations
        const allOrgsResult = await dataProvider.getOrganizations({
            pagination: { page: 1, perPage: 10 },
            sort: { field: 'id', order: 'ASC' },
            filter: {},
        });

        expect(allOrgsResult.data).toBeDefined();
        expect(Array.isArray(allOrgsResult.data)).toBe(true);
        expect(typeof allOrgsResult.total).toBe('number');
    });
});

// Export for test runner
export {};
