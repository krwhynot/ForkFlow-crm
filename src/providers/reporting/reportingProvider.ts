import { DataProvider } from 'react-admin';
import { Contact, Interaction, Organization, Setting, Deal } from '../../types';
import {
    arrayToCSV,
    generateCSVFilename,
    CSV_COLUMN_CONFIGS,
} from '../../utils/csvExporter';

// Reporting-specific types
export interface DashboardSummary {
    totalInteractions: number;
    totalOrganizations: number;
    totalContacts: number;
    totalOpportunities: number;
    pipelineValue: number;
    conversionRate: number;
    trends: {
        daily: number;
        weekly: number;
        monthly: number;
    };
}

export interface InteractionMetrics {
    byType: Array<{
        type: string;
        count: number;
        percentage: number;
    }>;
    byPrincipal: Array<{
        principal: string;
        count: number;
        conversionRate: number;
    }>;
    bySegment: Array<{
        segment: string;
        count: number;
        averageValue: number;
    }>;
    timeline: Array<{
        date: string;
        count: number;
        completed: number;
    }>;
}

export interface OrganizationNeedsVisit {
    id: number;
    name: string;
    segment: string;
    priority: string;
    lastContactDate: string | null;
    daysSinceContact: number;
    urgencyScore: number;
    contactCount: number;
    accountManager?: string;
}

// CSV Export types
export interface CSVExportData {
    data: string; // CSV content as string
    filename: string;
    mimeType: string;
}

/**
 * Extends the base data provider with reporting-specific functionality
 */
export function createReportingProvider(baseDataProvider: DataProvider) {
    return {
        ...baseDataProvider,

        /**
         * GET /api/reports/dashboard
         * Returns dashboard summary with key metrics and trends
         */
        async getDashboardReport(): Promise<DashboardSummary> {
            try {
                // Fetch all required data
                const [
                    organizationsResult,
                    contactsResult,
                    interactionsResult,
                    dealsResult,
                    settingsResult,
                ] = await Promise.all([
                    baseDataProvider.getList('organizations', {
                        pagination: { page: 1, perPage: 10000 },
                        sort: { field: 'id', order: 'ASC' },
                        filter: {},
                    }),
                    baseDataProvider.getList('contacts', {
                        pagination: { page: 1, perPage: 10000 },
                        sort: { field: 'id', order: 'ASC' },
                        filter: {},
                    }),
                    baseDataProvider.getList('interactions', {
                        pagination: { page: 1, perPage: 10000 },
                        sort: { field: 'id', order: 'ASC' },
                        filter: {},
                    }),
                    baseDataProvider.getList('deals', {
                        pagination: { page: 1, perPage: 10000 },
                        sort: { field: 'id', order: 'ASC' },
                        filter: {},
                    }),
                    baseDataProvider.getList('settings', {
                        pagination: { page: 1, perPage: 1000 },
                        sort: { field: 'id', order: 'ASC' },
                        filter: {},
                    }),
                ]);

                const organizations = (organizationsResult.data ||
                    []) as Organization[];
                const contacts = (contactsResult.data || []) as Contact[];
                const interactions = (interactionsResult.data ||
                    []) as Interaction[];
                const deals = (dealsResult.data || []) as Deal[];

                // Calculate basic counts
                const totalInteractions = interactions.length;
                const totalOrganizations = organizations.length;
                const totalContacts = contacts.length;
                const totalOpportunities = deals.length;

                // Calculate pipeline value (sum of all deal amounts)
                const pipelineValue = deals.reduce(
                    (sum, deal) => sum + (deal.amount || 0),
                    0
                );

                // Calculate conversion rate (won deals / total deals)
                const wonDeals = deals.filter(
                    deal => deal.stage === 'won' || deal.stage === 'closed-won'
                ).length;
                const conversionRate =
                    totalOpportunities > 0
                        ? (wonDeals / totalOpportunities) * 100
                        : 0;

                // Calculate trends (comparing recent periods)
                const now = new Date();
                const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                const oneWeekAgo = new Date(
                    now.getTime() - 7 * 24 * 60 * 60 * 1000
                );
                const oneMonthAgo = new Date(
                    now.getTime() - 30 * 24 * 60 * 60 * 1000
                );

                const dailyInteractions = interactions.filter(
                    i => new Date(i.createdAt) >= oneDayAgo
                ).length;
                const weeklyInteractions = interactions.filter(
                    i => new Date(i.createdAt) >= oneWeekAgo
                ).length;
                const monthlyInteractions = interactions.filter(
                    i => new Date(i.createdAt) >= oneMonthAgo
                ).length;

                return {
                    totalInteractions,
                    totalOrganizations,
                    totalContacts,
                    totalOpportunities,
                    pipelineValue,
                    conversionRate,
                    trends: {
                        daily: dailyInteractions,
                        weekly: weeklyInteractions,
                        monthly: monthlyInteractions,
                    },
                };
            } catch (error) {
                console.error('Error generating dashboard report:', error);
                throw new Error('Failed to generate dashboard report');
            }
        },

        /**
         * GET /api/reports/interactions?start_date&end_date
         * Returns detailed interaction analytics with filtering
         */
        async getInteractionReport(
            startDate?: string,
            endDate?: string,
            filters?: Record<string, any>
        ): Promise<InteractionMetrics> {
            try {
                // Fetch interactions and settings
                const [interactionsResult, settingsResult] = await Promise.all([
                    baseDataProvider.getList('interactions', {
                        pagination: { page: 1, perPage: 10000 },
                        sort: { field: 'createdAt', order: 'DESC' },
                        filter: {},
                    }),
                    baseDataProvider.getList('settings', {
                        pagination: { page: 1, perPage: 1000 },
                        sort: { field: 'id', order: 'ASC' },
                        filter: {},
                    }),
                ]);

                let interactions = interactionsResult.data as Interaction[];
                const settings = settingsResult.data as Setting[];

                // Apply date filtering
                if (startDate) {
                    interactions = interactions.filter(
                        i => new Date(i.createdAt) >= new Date(startDate)
                    );
                }
                if (endDate) {
                    interactions = interactions.filter(
                        i => new Date(i.createdAt) <= new Date(endDate)
                    );
                }

                // Apply additional filters
                if (filters) {
                    if (filters.organizationId) {
                        interactions = interactions.filter(
                            i => i.organizationId === filters.organizationId
                        );
                    }
                    if (filters.typeId) {
                        interactions = interactions.filter(
                            i => i.typeId === filters.typeId
                        );
                    }
                }

                // Get interaction types from settings
                const interactionTypes = settings.filter(
                    s => s.category === 'interaction_type'
                );
                const principals = settings.filter(
                    s => s.category === 'principal'
                );
                const segments = settings.filter(s => s.category === 'segment');

                // Calculate metrics by type
                const byType = interactionTypes.map(type => {
                    const count = interactions.filter(
                        i => i.typeId === type.id
                    ).length;
                    const percentage =
                        interactions.length > 0
                            ? (count / interactions.length) * 100
                            : 0;
                    return {
                        type: type.label,
                        count,
                        percentage: Math.round(percentage * 100) / 100,
                    };
                });

                // Calculate metrics by principal (simplified - would need product/deal relationships)
                const byPrincipal = principals.map(principal => ({
                    principal: principal.label,
                    count: Math.floor(Math.random() * 20), // Placeholder - implement actual logic
                    conversionRate: Math.floor(Math.random() * 100),
                }));

                // Calculate metrics by segment (simplified - would need organization relationships)
                const bySegment = segments.map(segment => ({
                    segment: segment.label,
                    count: Math.floor(Math.random() * 15), // Placeholder - implement actual logic
                    averageValue: Math.floor(Math.random() * 50000),
                }));

                // Create timeline data (last 30 days)
                const timeline = [];
                for (let i = 29; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];

                    const dayInteractions = interactions.filter(interaction => {
                        const interactionDate = new Date(interaction.createdAt)
                            .toISOString()
                            .split('T')[0];
                        return interactionDate === dateStr;
                    });

                    timeline.push({
                        date: dateStr,
                        count: dayInteractions.length,
                        completed: dayInteractions.filter(i => i.isCompleted)
                            .length,
                    });
                }

                return {
                    byType,
                    byPrincipal,
                    bySegment,
                    timeline,
                };
            } catch (error) {
                console.error('Error generating interaction report:', error);
                throw new Error('Failed to generate interaction report');
            }
        },

        /**
         * GET /api/reports/organizations/needs-visit
         * Returns organizations that haven't been contacted in 30+ days
         */
        async getOrganizationsNeedingVisit(): Promise<
            OrganizationNeedsVisit[]
        > {
            try {
                // Fetch organizations, contacts, interactions, and settings
                const [
                    organizationsResult,
                    contactsResult,
                    interactionsResult,
                    settingsResult,
                ] = await Promise.all([
                    baseDataProvider.getList('organizations', {
                        pagination: { page: 1, perPage: 10000 },
                        sort: { field: 'id', order: 'ASC' },
                        filter: {},
                    }),
                    baseDataProvider.getList('contacts', {
                        pagination: { page: 1, perPage: 10000 },
                        sort: { field: 'id', order: 'ASC' },
                        filter: {},
                    }),
                    baseDataProvider.getList('interactions', {
                        pagination: { page: 1, perPage: 10000 },
                        sort: { field: 'createdAt', order: 'DESC' },
                        filter: {},
                    }),
                    baseDataProvider.getList('settings', {
                        pagination: { page: 1, perPage: 1000 },
                        sort: { field: 'id', order: 'ASC' },
                        filter: {},
                    }),
                ]);

                const organizations =
                    organizationsResult.data as Organization[];
                const contacts = contactsResult.data as Contact[];
                const interactions = interactionsResult.data as Interaction[];
                const settings = settingsResult.data as Setting[];

                const prioritySettings = settings.filter(
                    s => s.category === 'priority'
                );
                const segmentSettings = settings.filter(
                    s => s.category === 'segment'
                );

                const now = new Date();
                const thirtyDaysAgo = new Date(
                    now.getTime() - 30 * 24 * 60 * 60 * 1000
                );

                const needsVisit: OrganizationNeedsVisit[] = [];

                organizations.forEach(org => {
                    // Find last interaction for this organization
                    const orgInteractions = interactions.filter(
                        i => i.organizationId === org.id
                    );
                    const lastInteraction =
                        orgInteractions.length > 0 ? orgInteractions[0] : null;
                    const lastContactDate = lastInteraction
                        ? lastInteraction.createdAt
                        : null;

                    // Calculate days since last contact
                    const daysSinceContact = lastContactDate
                        ? Math.floor(
                              (now.getTime() -
                                  new Date(lastContactDate).getTime()) /
                                  (1000 * 60 * 60 * 24)
                          )
                        : 999; // Large number for organizations never contacted

                    // Only include organizations that need attention (30+ days or never contacted)
                    if (daysSinceContact >= 30) {
                        // Get organization contacts count
                        const orgContacts = contacts.filter(
                            c => c.organizationId === org.id
                        );

                        // Get priority and segment labels
                        const priority = prioritySettings.find(
                            p => p.id === org.priorityId
                        );
                        const segment = segmentSettings.find(
                            s => s.id === org.segmentId
                        );

                        // Calculate urgency score (higher = more urgent)
                        // Factors: days since contact, priority level, number of contacts
                        let urgencyScore = daysSinceContact;
                        if (priority?.key === 'high') urgencyScore += 50;
                        else if (priority?.key === 'medium') urgencyScore += 25;
                        urgencyScore += orgContacts.length * 5; // More contacts = higher priority

                        needsVisit.push({
                            id: org.id,
                            name: org.name,
                            segment: segment?.label || 'Unknown',
                            priority: priority?.label || 'Unknown',
                            lastContactDate,
                            daysSinceContact,
                            urgencyScore,
                            contactCount: orgContacts.length,
                            accountManager: org.accountManager,
                        });
                    }
                });

                // Sort by urgency score (highest first)
                return needsVisit.sort(
                    (a, b) => b.urgencyScore - a.urgencyScore
                );
            } catch (error) {
                console.error(
                    'Error finding organizations needing visits:',
                    error
                );
                throw new Error('Failed to find organizations needing visits');
            }
        },

        /**
         * GET /api/exports/organizations
         * Exports organizations data as CSV
         */
        async exportOrganizations(
            filters?: Record<string, any>
        ): Promise<CSVExportData> {
            try {
                const [organizationsResult, settingsResult] = await Promise.all(
                    [
                        baseDataProvider.getList('organizations', {
                            pagination: { page: 1, perPage: 10000 },
                            sort: { field: 'name', order: 'ASC' },
                            filter: filters || {},
                        }),
                        baseDataProvider.getList('settings', {
                            pagination: { page: 1, perPage: 1000 },
                            sort: { field: 'id', order: 'ASC' },
                            filter: {},
                        }),
                    ]
                );

                const organizations =
                    organizationsResult.data as Organization[];
                const settings = settingsResult.data as Setting[];

                // Create lookup maps for settings
                const priorityMap = new Map(
                    settings
                        .filter(s => s.category === 'priority')
                        .map(s => [s.id, s])
                );
                const segmentMap = new Map(
                    settings
                        .filter(s => s.category === 'segment')
                        .map(s => [s.id, s])
                );
                const distributorMap = new Map(
                    settings
                        .filter(s => s.category === 'distributor')
                        .map(s => [s.id, s])
                );

                // Enrich organizations with setting objects for CSV export
                const enrichedOrganizations = organizations.map(org => ({
                    ...org,
                    priority: org.priorityId
                        ? priorityMap.get(org.priorityId)
                        : undefined,
                    segment: org.segmentId
                        ? segmentMap.get(org.segmentId)
                        : undefined,
                    distributor: org.distributorId
                        ? distributorMap.get(org.distributorId)
                        : undefined,
                }));

                // Generate CSV using utility
                const csvContent = arrayToCSV(enrichedOrganizations, {
                    columns: CSV_COLUMN_CONFIGS.organizations,
                });

                return {
                    data: csvContent,
                    filename: generateCSVFilename('organizations-export'),
                    mimeType: 'text/csv',
                };
            } catch (error) {
                console.error('Error exporting organizations:', error);
                throw new Error('Failed to export organizations');
            }
        },

        /**
         * GET /api/exports/interactions
         * Exports interactions data as CSV
         */
        async exportInteractions(
            filters?: Record<string, any>
        ): Promise<CSVExportData> {
            try {
                const [
                    interactionsResult,
                    organizationsResult,
                    contactsResult,
                    settingsResult,
                ] = await Promise.all([
                    baseDataProvider.getList('interactions', {
                        pagination: { page: 1, perPage: 10000 },
                        sort: { field: 'createdAt', order: 'DESC' },
                        filter: filters || {},
                    }),
                    baseDataProvider.getList('organizations', {
                        pagination: { page: 1, perPage: 10000 },
                        sort: { field: 'id', order: 'ASC' },
                        filter: {},
                    }),
                    baseDataProvider.getList('contacts', {
                        pagination: { page: 1, perPage: 10000 },
                        sort: { field: 'id', order: 'ASC' },
                        filter: {},
                    }),
                    baseDataProvider.getList('settings', {
                        pagination: { page: 1, perPage: 1000 },
                        sort: { field: 'id', order: 'ASC' },
                        filter: {},
                    }),
                ]);

                const interactions = interactionsResult.data as Interaction[];
                const organizations =
                    organizationsResult.data as Organization[];
                const contacts = contactsResult.data as Contact[];
                const settings = settingsResult.data as Setting[];

                // Create lookup maps
                const organizationMap = new Map(
                    organizations.map(o => [o.id, o])
                );
                const contactMap = new Map(contacts.map(c => [c.id, c]));
                const typeMap = new Map(
                    settings
                        .filter(s => s.category === 'interaction_type')
                        .map(s => [s.id, s])
                );

                // Enrich interactions with related objects for CSV export
                const enrichedInteractions = interactions.map(interaction => ({
                    ...interaction,
                    organization: organizationMap.get(
                        interaction.organizationId
                    ),
                    contact: contactMap.get(interaction.contactId || 0),
                    type: typeMap.get(interaction.typeId),
                }));

                // Generate CSV using utility
                const csvContent = arrayToCSV(enrichedInteractions, {
                    columns: CSV_COLUMN_CONFIGS.interactions,
                });

                return {
                    data: csvContent,
                    filename: generateCSVFilename('interactions-export'),
                    mimeType: 'text/csv',
                };
            } catch (error) {
                console.error('Error exporting interactions:', error);
                throw new Error('Failed to export interactions');
            }
        },
    };
}
