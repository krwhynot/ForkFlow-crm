// Comprehensive organization API tests for Supabase integration
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Organization } from '../../../types';

// Mock Supabase functions endpoint
const ORGANIZATIONS_API_URL =
    'http://127.0.0.1:54321/functions/v1/organizations';

describe('Organization API - Supabase Integration', () => {
    let testOrganization: Partial<Organization>;
    let createdOrganizationIds: number[] = [];
    let authToken: string;

    beforeEach(() => {
        // Mock auth token for testing
        authToken = 'test-auth-token';

        testOrganization = {
            name: 'Test Restaurant',
            address: '123 Main St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            phone: '(555) 123-4567',
            accountManager: 'test@forkflow.com',
            notes: 'Test organization for API validation',
            website: 'https://testrestaurant.com',
            latitude: 40.7128,
            longitude: -74.006,
        };
    });

    afterEach(async () => {
        // Clean up created organizations
        for (const id of createdOrganizationIds) {
            try {
                await fetch(`${ORGANIZATIONS_API_URL}/${id}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
            } catch (error) {
                console.warn(`Failed to cleanup organization ${id}:`, error);
            }
        }
        createdOrganizationIds = [];
    });

    describe('CREATE Operations', () => {
        it('should create an organization with all fields', async () => {
            const response = await fetch(ORGANIZATIONS_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testOrganization),
            });

            expect(response.status).toBe(201);
            const result = await response.json();

            expect(result.data).toBeDefined();
            expect(result.data.name).toBe('Test Restaurant');
            expect(result.data.address).toBe('123 Main St');
            expect(result.data.createdAt).toBeDefined();
            expect(result.data.updatedAt).toBeDefined();
            expect(result.data.id).toBeDefined();

            createdOrganizationIds.push(result.data.id);
        });

        it('should validate required fields on creation', async () => {
            const invalidOrganization = {
                // Missing required name field
                address: '123 Main St',
                phone: '(555) 123-4567',
            };

            const response = await fetch(ORGANIZATIONS_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(invalidOrganization),
            });

            expect(response.status).toBe(400);
            const result = await response.json();
            expect(result.error).toContain('Organization name is required');
        });

        it('should validate phone number format', async () => {
            const invalidPhoneOrganization = {
                ...testOrganization,
                phone: 'invalid-phone-format',
            };

            const response = await fetch(ORGANIZATIONS_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(invalidPhoneOrganization),
            });

            expect(response.status).toBe(400);
            const result = await response.json();
            expect(result.error).toContain('phone');
        });

        it('should validate website URL format', async () => {
            const invalidWebsiteOrganization = {
                ...testOrganization,
                website: 'not-a-valid-url',
            };

            const response = await fetch(ORGANIZATIONS_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(invalidWebsiteOrganization),
            });

            expect(response.status).toBe(400);
            const result = await response.json();
            expect(result.error).toContain('website');
        });
    });

    describe('READ Operations', () => {
        it('should get organization by ID', async () => {
            // First create an organization
            const createResponse = await fetch(ORGANIZATIONS_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testOrganization),
            });
            const created = await createResponse.json();
            createdOrganizationIds.push(created.data.id);

            // Then get it by ID
            const response = await fetch(
                `${ORGANIZATIONS_API_URL}/${created.data.id}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            expect(response.status).toBe(200);
            const result = await response.json();
            expect(result.data.id).toBe(created.data.id);
            expect(result.data.name).toBe('Test Restaurant');
        });

        it('should return 404 for non-existent organization', async () => {
            const response = await fetch(`${ORGANIZATIONS_API_URL}/999999`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            expect(response.status).toBe(404);
        });

        it('should get organizations with pagination', async () => {
            const response = await fetch(
                `${ORGANIZATIONS_API_URL}?page=1&limit=10`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            expect(response.status).toBe(200);
            const result = await response.json();
            expect(result.data).toBeDefined();
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.pagination).toBeDefined();
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(10);
        });

        it('should filter organizations by priority', async () => {
            const response = await fetch(
                `${ORGANIZATIONS_API_URL}?priorityId=1`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            expect(response.status).toBe(200);
            const result = await response.json();
            expect(result.data).toBeDefined();
            expect(Array.isArray(result.data)).toBe(true);
        });
    });

    describe('UPDATE Operations', () => {
        it('should update organization', async () => {
            // First create an organization
            const createResponse = await fetch(ORGANIZATIONS_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testOrganization),
            });
            const created = await createResponse.json();
            createdOrganizationIds.push(created.data.id);

            // Then update it
            const updateData = {
                name: 'Updated Restaurant Name',
                notes: 'Updated notes',
            };

            const response = await fetch(
                `${ORGANIZATIONS_API_URL}/${created.data.id}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData),
                }
            );

            expect(response.status).toBe(200);
            const result = await response.json();
            expect(result.data.name).toBe('Updated Restaurant Name');
            expect(result.data.notes).toBe('Updated notes');
            expect(result.data.updatedAt).not.toBe(created.data.updatedAt);
        });

        it('should validate updates', async () => {
            // First create an organization
            const createResponse = await fetch(ORGANIZATIONS_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testOrganization),
            });
            const created = await createResponse.json();
            createdOrganizationIds.push(created.data.id);

            // Try to update with invalid data
            const invalidUpdate = {
                name: '', // Empty name should fail
            };

            const response = await fetch(
                `${ORGANIZATIONS_API_URL}/${created.data.id}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(invalidUpdate),
                }
            );

            expect(response.status).toBe(400);
        });
    });

    describe('DELETE Operations', () => {
        it('should delete organization', async () => {
            // First create an organization
            const createResponse = await fetch(ORGANIZATIONS_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testOrganization),
            });
            const created = await createResponse.json();

            // Then delete it
            const response = await fetch(
                `${ORGANIZATIONS_API_URL}/${created.data.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            expect(response.status).toBe(200);

            // Verify it's deleted
            const getResponse = await fetch(
                `${ORGANIZATIONS_API_URL}/${created.data.id}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );
            expect(getResponse.status).toBe(404);
        });

        it('should return 404 when deleting non-existent organization', async () => {
            const response = await fetch(`${ORGANIZATIONS_API_URL}/999999`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            expect(response.status).toBe(404);
        });
    });

    describe('SEARCH Operations', () => {
        it('should search organizations by name', async () => {
            // First create an organization
            const createResponse = await fetch(ORGANIZATIONS_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...testOrganization,
                    name: 'Unique Search Test Restaurant',
                }),
            });
            const created = await createResponse.json();
            createdOrganizationIds.push(created.data.id);

            // Then search for it
            const response = await fetch(
                `${ORGANIZATIONS_API_URL}/search?q=Unique Search Test`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            expect(response.status).toBe(200);
            const result = await response.json();
            expect(result.data.length).toBeGreaterThan(0);
            expect(
                result.data.some((org: any) =>
                    org.name.includes('Unique Search Test')
                )
            ).toBe(true);
        });

        it('should search organizations with multiple filters', async () => {
            const response = await fetch(
                `${ORGANIZATIONS_API_URL}/search?q=restaurant&city=Test City&limit=5`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            expect(response.status).toBe(200);
            const result = await response.json();
            expect(result.data).toBeDefined();
            expect(Array.isArray(result.data)).toBe(true);
        });
    });

    describe('NEARBY Operations', () => {
        it('should find nearby organizations', async () => {
            // Create an organization with GPS coordinates
            const createResponse = await fetch(ORGANIZATIONS_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testOrganization),
            });
            const created = await createResponse.json();
            createdOrganizationIds.push(created.data.id);

            // Search for nearby organizations
            const response = await fetch(
                `${ORGANIZATIONS_API_URL}/nearby?lat=40.7128&lng=-74.0060&radius=10`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            expect(response.status).toBe(200);
            const result = await response.json();
            expect(result.data).toBeDefined();
            expect(Array.isArray(result.data)).toBe(true);
        });
    });

    describe('ANALYTICS Operations', () => {
        it('should get organization analytics', async () => {
            // First create an organization
            const createResponse = await fetch(ORGANIZATIONS_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testOrganization),
            });
            const created = await createResponse.json();
            createdOrganizationIds.push(created.data.id);

            // Get analytics
            const response = await fetch(
                `${ORGANIZATIONS_API_URL}/${created.data.id}/analytics`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            expect(response.status).toBe(200);
            const result = await response.json();
            expect(result.data).toBeDefined();
            expect(result.data.organizationId).toBe(created.data.id);
            expect(typeof result.data.engagementScore).toBe('number');
            expect(typeof result.data.interactionCount).toBe('number');
            expect(result.data.pipelineHealth).toBeDefined();
        });
    });

    describe('GEOCODING Operations', () => {
        it('should geocode organization address', async () => {
            // First create an organization
            const createResponse = await fetch(ORGANIZATIONS_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...testOrganization,
                    latitude: undefined,
                    longitude: undefined,
                }),
            });
            const created = await createResponse.json();
            createdOrganizationIds.push(created.data.id);

            // Geocode the address
            const response = await fetch(
                `${ORGANIZATIONS_API_URL}/${created.data.id}/geocode`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            // Note: This may return an error if geocoding service is not implemented
            // but should not return 500 errors
            expect(response.status).toBeOneOf([200, 400, 501]);
        });
    });

    describe('BULK IMPORT Operations', () => {
        it('should handle bulk import', async () => {
            const bulkData = [
                {
                    name: 'Bulk Import Restaurant 1',
                    address: '100 Import St',
                    city: 'Import City',
                    state: 'IC',
                    zipCode: '12345',
                },
                {
                    name: 'Bulk Import Restaurant 2',
                    address: '200 Import St',
                    city: 'Import City',
                    state: 'IC',
                    zipCode: '12346',
                },
            ];

            const response = await fetch(
                `${ORGANIZATIONS_API_URL}/bulk-import`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ organizations: bulkData }),
                }
            );

            expect(response.status).toBeOneOf([200, 201]);
            const result = await response.json();
            expect(result.data).toBeDefined();
            expect(result.data.processed).toBeGreaterThanOrEqual(2);
        });
    });

    describe('ERROR Handling', () => {
        it('should return 401 for missing authorization', async () => {
            const response = await fetch(ORGANIZATIONS_API_URL, {
                method: 'GET',
                // No Authorization header
            });

            expect(response.status).toBe(401);
        });

        it('should return 400 for invalid organization ID', async () => {
            const response = await fetch(
                `${ORGANIZATIONS_API_URL}/invalid-id`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            expect(response.status).toBe(400);
        });

        it('should handle malformed JSON in requests', async () => {
            const response = await fetch(ORGANIZATIONS_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: 'invalid-json',
            });

            expect(response.status).toBe(400);
        });
    });
});

// Export for test runner
export {};
