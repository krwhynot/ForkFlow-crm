/**
 * Test suite for Reporting API functionality
 * Tests the reporting endpoints and data provider integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createReportingProvider } from '../../providers/reporting/reportingProvider';
import { createReportingApi } from './index';

// Mock data provider
const mockDataProvider = {
    getList: vi.fn(),
    getOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    updateMany: vi.fn(),
    getMany: vi.fn(),
    getManyReference: vi.fn(),
};

// Mock data
const mockOrganizations = [
    {
        id: 1,
        name: 'Test Restaurant',
        priorityId: 1,
        segmentId: 1,
        distributorId: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 2,
        name: 'Another Restaurant',
        priorityId: 2,
        segmentId: 2,
        distributorId: 2,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
    },
];

const mockContacts = [
    {
        id: 1,
        organizationId: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        isPrimary: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

const mockInteractions = [
    {
        id: 1,
        organizationId: 1,
        contactId: 1,
        typeId: 1,
        subject: 'Test Interaction',
        isCompleted: true,
        followUpRequired: false,
        createdAt: '2024-01-01T00:00:00Z',
        completedDate: '2024-01-01T00:00:00Z',
    },
];

const mockDeals = [
    {
        id: 1,
        organizationId: 1,
        amount: 1000,
        stage: 'won',
        createdAt: '2024-01-01T00:00:00Z',
    },
];

const mockSettings = [
    { id: 1, category: 'priority', key: 'high', label: 'High Priority', color: '#ff0000' },
    { id: 2, category: 'segment', key: 'fine_dining', label: 'Fine Dining', color: '#0000ff' },
    { id: 3, category: 'interaction_type', key: 'call', label: 'Phone Call', color: '#00ff00' },
];

describe('Reporting API', () => {
    let reportingProvider: any;
    let reportingApi: any;

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Setup mock responses
        mockDataProvider.getList.mockImplementation((resource) => {
            switch (resource) {
                case 'organizations':
                    return Promise.resolve({ data: mockOrganizations, total: mockOrganizations.length });
                case 'contacts':
                    return Promise.resolve({ data: mockContacts, total: mockContacts.length });
                case 'interactions':
                    return Promise.resolve({ data: mockInteractions, total: mockInteractions.length });
                case 'deals':
                    return Promise.resolve({ data: mockDeals, total: mockDeals.length });
                case 'settings':
                    return Promise.resolve({ data: mockSettings, total: mockSettings.length });
                default:
                    return Promise.resolve({ data: [], total: 0 });
            }
        });

        reportingProvider = createReportingProvider(mockDataProvider);
        reportingApi = createReportingApi(reportingProvider);
    });

    describe('Dashboard Report', () => {
        it('should generate dashboard summary with correct metrics', async () => {
            const result = await reportingApi.dashboard();

            expect(result).toMatchObject({
                totalInteractions: expect.any(Number),
                totalOrganizations: expect.any(Number),
                totalContacts: expect.any(Number),
                totalOpportunities: expect.any(Number),
                pipelineValue: expect.any(Number),
                conversionRate: expect.any(Number),
                trends: {
                    daily: expect.any(Number),
                    weekly: expect.any(Number),
                    monthly: expect.any(Number),
                },
            });

            expect(result.totalOrganizations).toBe(2);
            expect(result.totalContacts).toBe(1);
            expect(result.totalInteractions).toBe(1);
            expect(result.totalOpportunities).toBe(1);
        });

        it('should handle empty data gracefully', async () => {
            mockDataProvider.getList.mockResolvedValue({ data: [], total: 0 });

            const result = await reportingApi.dashboard();

            expect(result.totalInteractions).toBe(0);
            expect(result.totalOrganizations).toBe(0);
            expect(result.conversionRate).toBe(0);
        });
    });

    describe('Interaction Report', () => {
        it('should generate interaction metrics with filtering', async () => {
            const params = {
                start_date: '2024-01-01',
                end_date: '2024-01-31',
            };

            const result = await reportingApi.interactions(params);

            expect(result).toMatchObject({
                byType: expect.any(Array),
                byPrincipal: expect.any(Array),
                bySegment: expect.any(Array),
                timeline: expect.any(Array),
            });

            expect(result.timeline).toHaveLength(30); // 30 days in timeline
        });

        it('should handle date filtering correctly', async () => {
            const params = {
                start_date: '2024-01-01',
                end_date: '2024-01-01',
            };

            const result = await reportingApi.interactions(params);

            expect(result.byType).toBeDefined();
            expect(Array.isArray(result.timeline)).toBe(true);
        });
    });

    describe('Organizations Needs Visit', () => {
        it('should identify organizations needing visits', async () => {
            // Mock data with old interactions
            const oldInteraction = {
                ...mockInteractions[0],
                createdAt: '2023-01-01T00:00:00Z',
                completedDate: '2023-01-01T00:00:00Z',
            };

            mockDataProvider.getList.mockImplementation((resource) => {
                if (resource === 'interactions') {
                    return Promise.resolve({ data: [oldInteraction], total: 1 });
                }
                return Promise.resolve({ data: resource === 'organizations' ? mockOrganizations : [], total: 0 });
            });

            const result = await reportingApi.organizationsNeedsVisit();

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);

            if (result.length > 0) {
                expect(result[0]).toMatchObject({
                    id: expect.any(Number),
                    name: expect.any(String),
                    segment: expect.any(String),
                    priority: expect.any(String),
                    daysSinceContact: expect.any(Number),
                    urgencyScore: expect.any(Number),
                });
            }
        });

        it('should sort by urgency score', async () => {
            const result = await reportingApi.organizationsNeedsVisit();

            if (result.length > 1) {
                for (let i = 0; i < result.length - 1; i++) {
                    expect(result[i].urgencyScore).toBeGreaterThanOrEqual(result[i + 1].urgencyScore);
                }
            }
        });
    });

    describe('CSV Exports', () => {
        it('should export organizations as CSV', async () => {
            const result = await reportingApi.exportOrganizations();

            expect(result).toMatchObject({
                data: expect.any(String),
                filename: expect.stringMatching(/organizations-export-\d{4}-\d{2}-\d{2}\.csv/),
                mimeType: 'text/csv',
            });

            expect(result.data).toContain('ID');
            expect(result.data).toContain('Name');
            expect(result.data).toContain('Test Restaurant');
        });

        it('should export interactions as CSV', async () => {
            const result = await reportingApi.exportInteractions();

            expect(result).toMatchObject({
                data: expect.any(String),
                filename: expect.stringMatching(/interactions-export-\d{4}-\d{2}-\d{2}\.csv/),
                mimeType: 'text/csv',
            });

            expect(result.data).toContain('ID');
            expect(result.data).toContain('Organization');
            expect(result.data).toContain('Test Interaction');
        });

        it('should handle CSV escaping correctly', async () => {
            const orgWithQuotes = {
                ...mockOrganizations[0],
                name: 'Restaurant "The Best" & Co.',
                notes: 'Notes with "quotes" and, commas',
            };

            mockDataProvider.getList.mockImplementation((resource) => {
                if (resource === 'organizations') {
                    return Promise.resolve({ data: [orgWithQuotes], total: 1 });
                }
                return Promise.resolve({ data: [], total: 0 });
            });

            const result = await reportingApi.exportOrganizations();

            // Should escape quotes properly
            expect(result.data).toContain('""The Best""');
        });
    });

    describe('Error Handling', () => {
        it('should handle data provider errors gracefully', async () => {
            mockDataProvider.getList.mockRejectedValue(new Error('Database connection failed'));

            await expect(reportingApi.dashboard()).rejects.toThrow('Failed to generate dashboard report');
        });

        it('should handle missing data gracefully', async () => {
            mockDataProvider.getList.mockResolvedValue({ data: null, total: 0 });

            const result = await reportingApi.dashboard();

            expect(result.totalOrganizations).toBe(0);
            expect(result.totalInteractions).toBe(0);
        });
    });

    describe('Performance', () => {
        it('should complete dashboard report within reasonable time', async () => {
            const startTime = Date.now();
            await reportingApi.dashboard();
            const endTime = Date.now();

            expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
        });

        it('should handle large datasets efficiently', async () => {
            // Generate large mock dataset
            const largeOrganizations = Array.from({ length: 1000 }, (_, i) => ({
                ...mockOrganizations[0],
                id: i + 1,
                name: `Restaurant ${i + 1}`,
            }));

            mockDataProvider.getList.mockImplementation((resource) => {
                if (resource === 'organizations') {
                    return Promise.resolve({ data: largeOrganizations, total: 1000 });
                }
                return Promise.resolve({ data: [], total: 0 });
            });

            const startTime = Date.now();
            const result = await reportingApi.exportOrganizations();
            const endTime = Date.now();

            expect(result.data).toContain('Restaurant 1000');
            expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
        });
    });
});

describe('Data Provider Integration', () => {
    it('should extend base data provider correctly', () => {
        const reportingProvider = createReportingProvider(mockDataProvider);

        expect(typeof reportingProvider.getDashboardReport).toBe('function');
        expect(typeof reportingProvider.getInteractionReport).toBe('function');
        expect(typeof reportingProvider.getOrganizationsNeedingVisit).toBe('function');
        expect(typeof reportingProvider.exportOrganizations).toBe('function');
        expect(typeof reportingProvider.exportInteractions).toBe('function');

        // Should still have base data provider methods
        expect(typeof reportingProvider.getList).toBe('function');
        expect(typeof reportingProvider.getOne).toBe('function');
    });
});