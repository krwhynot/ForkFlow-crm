import fakeRestDataProvider from 'ra-data-fakerest';
import {
    CreateParams,
    DataProvider,
    Identifier,
    ResourceCallbacks,
    UpdateParams,
    withLifecycleCallbacks,
} from 'react-admin';
import {
    BrokerDashboardStats,
    BrokerFormData,
    Company,
    Contact,
    Deal,
    GPSCoordinates,
    Interaction,
    Organization,
    Sale,
    SalesFormData,
    Setting,
    SignUpData,
    Task,
    Visit,
} from '../../types';
import { getActivityLog } from '../commons/activity';
import { getCompanyAvatar } from '../commons/getCompanyAvatar';
import { getContactAvatar } from '../commons/getContactAvatar';
import {
    CrmDataProvider,
    OrganizationSearchFilters,
    OrganizationStats,
} from '../types';
import { authProvider, USER_STORAGE_KEY } from './authProvider';
import generateData from './dataGenerator';
import { withSupabaseFilterAdapter } from './internal/supabaseAdapter';
import { organizationFilterEngine } from './internal/organizationFilters';
import { organizationValidator } from './organizationValidator';
import { interactionValidator } from './interactionValidator';
import { offlineService, gpsService, fileUploadService } from '../mobile';
import { performanceMonitor } from '../monitoring/performanceMonitor';
import { createReportingProvider } from '../reporting/reportingProvider';

const baseDataProvider = fakeRestDataProvider(generateData(), true, 300);

// Performance tracking wrapper for API calls
const withPerformanceTracking = (
    operation: () => Promise<any>,
    operationName: string
) => {
    const startTime = Date.now();

    return operation()
        .then(result => {
            performanceMonitor.trackApiCall(
                operationName,
                'GET', // Default method, will be overridden for specific operations
                startTime,
                true
            );
            return result;
        })
        .catch(error => {
            performanceMonitor.trackApiCall(
                operationName,
                'GET',
                startTime,
                false,
                error.message
            );
            throw error;
        });
};

const TASK_MARKED_AS_DONE = 'TASK_MARKED_AS_DONE';
const TASK_MARKED_AS_UNDONE = 'TASK_MARKED_AS_UNDONE';
const TASK_DONE_NOT_CHANGED = 'TASK_DONE_NOT_CHANGED';
let taskUpdateType = TASK_DONE_NOT_CHANGED;

const processCompanyLogo = async (params: any) => {
    let logo = params.data.logo;

    if (typeof logo !== 'object' || logo === null || !logo.src) {
        logo = await getCompanyAvatar(params.data);
    } else if (logo.rawFile instanceof File) {
        const base64Logo = await convertFileToBase64(logo);
        logo = { src: base64Logo, title: logo.title };
    }

    return {
        ...params,
        data: {
            ...params.data,
            logo,
        },
    };
};

async function processContactAvatar(
    params: UpdateParams<Contact>
): Promise<UpdateParams<Contact>>;

async function processContactAvatar(
    params: CreateParams<Contact>
): Promise<CreateParams<Contact>>;

async function processContactAvatar(
    params: CreateParams<Contact> | UpdateParams<Contact>
): Promise<CreateParams<Contact> | UpdateParams<Contact>> {
    const { data } = params;
    if ((data as any).avatar?.src || !data.email || data.email.trim() === '') {
        return params;
    }
    const avatarUrl = await getContactAvatar(data);

    // Clone the data and modify the clone
    const newData = { ...data, avatar: { src: avatarUrl || undefined } };

    return { ...params, data: newData };
}

async function fetchAndUpdateCompanyData(
    params: UpdateParams<Contact>,
    dataProvider: DataProvider
): Promise<UpdateParams<Contact>>;

async function fetchAndUpdateCompanyData(
    params: CreateParams<Contact>,
    dataProvider: DataProvider
): Promise<CreateParams<Contact>>;

async function fetchAndUpdateCompanyData(
    params: CreateParams<Contact> | UpdateParams<Contact>,
    dataProvider: DataProvider
): Promise<CreateParams<Contact> | UpdateParams<Contact>> {
    const { data } = params;
    const newData = { ...data };

    if (!newData.organizationId) {
        return params;
    }

    const { data: company } = await dataProvider.getOne('companies', {
        id: newData.organizationId,
    });

    if (!company) {
        return params;
    }

    newData.organization = { ...company };
    return { ...params, data: newData };
}

const dataProviderWithCustomMethod = {
    ...baseDataProvider,
    async getList(resource: string, params: any) {
        if (resource === 'customers') {
            return baseDataProvider.getList('customer_summary', params);
        }
        return baseDataProvider.getList(resource, params);
    },
    async getOne(resource: string, params: any) {
        if (resource === 'customers') {
            return baseDataProvider.getOne('customer_summary', params);
        }
        return baseDataProvider.getOne(resource, params);
    },
    // We simulate a remote endpoint that is in charge of returning activity log
    getActivityLog: async (companyId?: Identifier) => {
        return getActivityLog(dataProvider, companyId);
    },
    async signUp({
        email,
        password,
        first_name,
        last_name,
    }: SignUpData): Promise<{ id: string; email: string; password: string }> {
        const user = await baseDataProvider.create('sales', {
            data: {
                email,
                first_name,
                last_name,
            },
        });

        return {
            ...user.data,
            password,
        };
    },
    async isInitialized(): Promise<boolean> {
        const sales = await dataProvider.getList<Sale>('sales', {
            filter: {},
            pagination: { page: 1, perPage: 1 },
            sort: { field: 'id', order: 'ASC' },
        });
        if (sales.data.length === 0) {
            return false;
        }
        return true;
    },
    updatePassword: async (id: Identifier): Promise<true> => {
        const currentUser = await authProvider.getIdentity?.();
        if (!currentUser) {
            throw new Error('User not found');
        }
        const { data: previousData } = await dataProvider.getOne<Sale>(
            'sales',
            {
                id: currentUser.id,
            }
        );

        if (!previousData) {
            throw new Error('User not found');
        }

        await dataProvider.update('sales', {
            id,
            data: {
                password: 'demo_newPassword',
            },
            previousData,
        });

        return true;
    },
    async brokerCreate(body: BrokerFormData) {
        // Mock implementation for fakerest
        const id = Date.now().toString();
        const newBroker = {
            id,
            user_id: id,
            ...body,
        };

        const result = await dataProvider.create('sales', { data: newBroker });
        return result.data;
    },
    async brokerUpdate(
        id: Identifier,
        data: Partial<Omit<BrokerFormData, 'password'>>
    ) {
        const { data: previousData } = await dataProvider.getOne<Sale>(
            'sales',
            { id }
        );
        const result = await dataProvider.update('sales', {
            id,
            data,
            previousData,
        });
        return result.data;
    },
    async getDashboardStats(): Promise<BrokerDashboardStats> {
        // Mock dashboard stats for fakerest
        return {
            total_customers: 150,
            customers_this_month: 12,
            total_visits: 75,
            visits_this_week: 8,
            visits_this_month: 32,
            pending_reminders: 5,
            overdue_reminders: 2,
            customers_needing_attention: 8,
        };
    },
    async findNearbyCustomers(
        latitude: number,
        longitude: number,
        radiusKm: number = 5
    ) {
        // Mock implementation - return some random customers
        const { data: customers } = await dataProvider.getList('customers', {
            filter: {},
            pagination: { page: 1, perPage: 10 },
            sort: { field: 'id', order: 'ASC' },
        });
        return customers.slice(0, 3); // Return first 3 as "nearby"
    },
    async completeReminder(id: Identifier) {
        const { data: previousData } = await dataProvider.getOne('reminders', {
            id,
        });
        return dataProvider.update('reminders', {
            id,
            data: {
                is_completed: true,
                completed_at: new Date().toISOString(),
            },
            previousData,
        });
    },
    async snoozeReminder(id: Identifier, snoozedUntil: string) {
        const { data: previousData } = await dataProvider.getOne('reminders', {
            id,
        });
        return dataProvider.update('reminders', {
            id,
            data: {
                snoozed_until: snoozedUntil,
                snooze_count: (previousData.snooze_count || 0) + 1,
            },
            previousData,
        });
    },

    // Organization-specific API methods
    async getOrganizations(params: any = {}) {
        // Get all organizations and settings for filtering
        const organizationsResult = await baseDataProvider.getList(
            'organizations',
            params
        );
        const settingsResult = await baseDataProvider.getList('settings', {
            filter: {},
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'id', order: 'ASC' },
        });

        // Update validator with current settings
        organizationValidator.updateSettings(settingsResult.data);

        // Apply enhanced filtering and search
        const filterOptions = {
            searchQuery: params.filter?.q,
            filters: params.filter
                ? {
                      priorityId: params.filter.priorityId,
                      segmentId: params.filter.segmentId,
                      distributorId: params.filter.distributorId,
                      accountManager: params.filter.accountManager,
                      city: params.filter.city,
                      state: params.filter.state,
                      zipCode: params.filter.zipCode,
                      hasContacts: params.filter.hasContacts,
                      hasOpportunities: params.filter.hasOpportunities,
                      lastContactDateBefore:
                          params.filter.lastContactDateBefore,
                      lastContactDateAfter: params.filter.lastContactDateAfter,
                  }
                : undefined,
            sort: params.sort
                ? {
                      field: params.sort.field,
                      order: params.sort.order,
                  }
                : undefined,
            pagination: params.pagination
                ? {
                      offset:
                          (params.pagination.page - 1) *
                          params.pagination.perPage,
                      limit: params.pagination.perPage,
                  }
                : undefined,
        };

        const filtered = organizationFilterEngine.applyFilters(
            organizationsResult.data,
            filterOptions
        );

        return {
            data: filtered.data,
            total: filtered.total,
        };
    },

    async getOrganization(params: any) {
        const result = await baseDataProvider.getOne('organizations', params);

        // Calculate computed fields
        const stats =
            await dataProviderWithCustomMethod.calculateOrganizationStats(
                params.id
            );

        return {
            data: {
                ...result.data,
                contactCount: stats.contactCount,
                lastContactDate: stats.lastContactDate,
                totalOpportunities: stats.totalOpportunities,
                totalOpportunityValue: stats.totalOpportunityValue,
            },
        };
    },

    async createOrganization(params: any) {
        // Get settings for validation
        const settingsResult = await baseDataProvider.getList('settings', {
            filter: {},
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'id', order: 'ASC' },
        });

        organizationValidator.updateSettings(settingsResult.data);

        // Sanitize and validate data
        const sanitizedData = organizationValidator.sanitizeOrganization(
            params.data
        );
        const validation =
            organizationValidator.validateOrganization(sanitizedData);

        if (!validation.isValid) {
            throw new Error(
                `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`
            );
        }

        return baseDataProvider.create('organizations', {
            ...params,
            data: {
                ...sanitizedData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        });
    },

    async updateOrganization(params: any) {
        // Get settings for validation
        const settingsResult = await baseDataProvider.getList('settings', {
            filter: {},
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'id', order: 'ASC' },
        });

        organizationValidator.updateSettings(settingsResult.data);

        // Sanitize and validate data
        const sanitizedData = organizationValidator.sanitizeOrganization(
            params.data
        );
        const validation =
            organizationValidator.validateOrganization(sanitizedData);

        if (!validation.isValid) {
            throw new Error(
                `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`
            );
        }

        return baseDataProvider.update('organizations', {
            ...params,
            data: {
                ...sanitizedData,
                updatedAt: new Date().toISOString(),
            },
        });
    },

    async deleteOrganization(params: any) {
        return baseDataProvider.delete('organizations', params);
    },

    async searchOrganizations(query: string, options: any = {}) {
        const organizationsResult = await baseDataProvider.getList(
            'organizations',
            {
                filter: {},
                pagination: { page: 1, perPage: 10000 },
                sort: { field: 'id', order: 'ASC' },
            }
        );

        const filterOptions = {
            searchQuery: query,
            filters: options.filters,
            pagination: {
                offset: options.offset || 0,
                limit: options.limit || 50,
            },
        };

        const filtered = organizationFilterEngine.applyFilters(
            organizationsResult.data,
            filterOptions
        );

        return {
            data: filtered.data,
            total: filtered.total,
        };
    },

    async findNearbyOrganizations(
        latitude: number,
        longitude: number,
        radiusKm: number = 10
    ) {
        const organizationsResult = await baseDataProvider.getList(
            'organizations',
            {
                filter: {},
                pagination: { page: 1, perPage: 10000 },
                sort: { field: 'id', order: 'ASC' },
            }
        );

        return organizationFilterEngine.findNearbyOrganizations(
            organizationsResult.data,
            latitude,
            longitude,
            radiusKm
        );
    },

    async calculateOrganizationStats(
        organizationId: Identifier
    ): Promise<OrganizationStats> {
        // Get contacts for this organization
        const contactsResult = await baseDataProvider.getList('contacts', {
            filter: { organizationId },
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'id', order: 'ASC' },
        });

        // Get deals/opportunities for this organization
        const dealsResult = await baseDataProvider.getList('deals', {
            filter: { organizationId },
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'id', order: 'ASC' },
        });

        // Calculate stats
        const contactCount = contactsResult.data.length;
        const totalOpportunities = dealsResult.data.length;
        const totalOpportunityValue = dealsResult.data.reduce(
            (sum: number, deal: any) => sum + (deal.amount || 0),
            0
        );
        const averageOpportunityValue =
            totalOpportunities > 0
                ? totalOpportunityValue / totalOpportunities
                : 0;

        // Find last contact date from various sources
        const contactDates = contactsResult.data
            .map((c: any) => c.lastInteractionDate)
            .filter(Boolean);
        const dealDates = dealsResult.data
            .map((d: any) => d.updatedAt)
            .filter(Boolean);
        const allDates = [...contactDates, ...dealDates];
        const lastContactDate =
            allDates.length > 0
                ? allDates.reduce((latest, current) =>
                      current > latest ? current : latest
                  )
                : undefined;

        // Calculate conversion rate (won deals / total deals)
        const wonDeals = dealsResult.data.filter(
            (d: any) => d.status === 'won'
        ).length;
        const conversionRate =
            totalOpportunities > 0 ? (wonDeals / totalOpportunities) * 100 : 0;

        return {
            contactCount,
            lastContactDate,
            totalOpportunities,
            totalOpportunityValue,
            interactionCount: 0, // TODO: Calculate from interactions when implemented
            lastInteractionDate: lastContactDate,
            averageOpportunityValue,
            conversionRate,
        };
    },

    async bulkUpdateOrganizations(
        ids: Identifier[],
        data: Partial<Organization>
    ) {
        const results = await Promise.all(
            ids.map(id =>
                dataProviderWithCustomMethod.updateOrganization({
                    id,
                    data,
                    previousData: {}, // Will be fetched by the update method
                })
            )
        );
        return results.map((r: any) => r.data);
    },

    // Interaction-specific API methods
    async getInteractions(params: any = {}) {
        // Get all interactions with enhanced filtering
        const interactionsResult = await baseDataProvider.getList(
            'interactions',
            params
        );
        const settingsResult = await baseDataProvider.getList('settings', {
            filter: { category: 'interaction_type' },
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'id', order: 'ASC' },
        });

        // Enrich interactions with type information and computed fields
        const enrichedInteractions = interactionsResult.data.map(
            (interaction: any) => {
                const type = settingsResult.data.find(
                    (s: any) => s.id === interaction.typeId
                );
                return {
                    ...interaction,
                    type,
                    typeLabel: type?.label || 'Unknown',
                    hasLocation:
                        interaction.latitude != null &&
                        interaction.longitude != null,
                    isOverdue:
                        interaction.followUpDate &&
                        new Date(interaction.followUpDate) < new Date(),
                    formattedDuration: interaction.duration
                        ? `${interaction.duration} min`
                        : undefined,
                };
            }
        );

        return {
            data: enrichedInteractions,
            total: interactionsResult.total,
        };
    },

    async getInteraction(params: any) {
        const result = await baseDataProvider.getOne('interactions', params);

        // Get related entities
        const [
            organizationResult,
            contactResult,
            opportunityResult,
            typeResult,
        ] = await Promise.all([
            result.data.organizationId
                ? baseDataProvider
                      .getOne('organizations', {
                          id: result.data.organizationId,
                      })
                      .catch(() => null)
                : null,
            result.data.contactId
                ? baseDataProvider
                      .getOne('contacts', { id: result.data.contactId })
                      .catch(() => null)
                : null,
            result.data.opportunityId
                ? baseDataProvider
                      .getOne('deals', { id: result.data.opportunityId })
                      .catch(() => null)
                : null,
            baseDataProvider
                .getList('settings', {
                    filter: {
                        category: 'interaction_type',
                        id: result.data.typeId,
                    },
                    pagination: { page: 1, perPage: 1 },
                    sort: { field: 'id', order: 'ASC' },
                })
                .then(r => r.data[0])
                .catch(() => null),
        ]);

        return {
            data: {
                ...result.data,
                organization: organizationResult?.data,
                contact: contactResult?.data,
                opportunity: opportunityResult?.data,
                type: typeResult,
                typeLabel: typeResult?.label || 'Unknown',
                hasLocation:
                    result.data.latitude != null &&
                    result.data.longitude != null,
                isOverdue:
                    result.data.followUpDate &&
                    new Date(result.data.followUpDate) < new Date(),
                formattedDuration: result.data.duration
                    ? `${result.data.duration} min`
                    : undefined,
            },
        };
    },

    async createInteraction(params: any) {
        // Check if we're offline - if so, queue the interaction
        if (!navigator.onLine) {
            console.log('Offline mode: Queueing interaction for later sync');
            const queuedId = await offlineService.queueInteraction(
                'create',
                params.data
            );

            return {
                data: {
                    ...params.data,
                    id: queuedId,
                    _offline: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            };
        }

        // Get settings for validation
        const settingsResult = await baseDataProvider.getList('settings', {
            filter: {},
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'id', order: 'ASC' },
        });

        interactionValidator.updateSettings(settingsResult.data);

        // Sanitize and validate data
        const sanitizedData = interactionValidator.sanitizeInteraction(
            params.data
        );
        const validation =
            interactionValidator.validateInteraction(sanitizedData);

        if (!validation.isValid) {
            throw new Error(
                `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`
            );
        }

        // Log warnings if any
        if (validation.warnings.length > 0) {
            console.warn('Interaction creation warnings:', validation.warnings);
        }

        try {
            const result = await baseDataProvider.create('interactions', {
                ...params,
                data: {
                    ...sanitizedData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isCompleted: sanitizedData.isCompleted || false,
                    followUpRequired: sanitizedData.followUpRequired || false,
                },
            });

            // If we have pending offline actions, try to sync them
            if (offlineService.getPendingCount() > 0) {
                offlineService.syncPendingActions(dataProviderWithCustomMethod);
            }

            return result;
        } catch (error: any) {
            // If the request fails and we detect network issues, queue for offline
            if (
                error.message.includes('network') ||
                error.message.includes('fetch')
            ) {
                console.log(
                    'Network error detected: Queueing interaction for later sync'
                );
                const queuedId = await offlineService.queueInteraction(
                    'create',
                    params.data
                );

                return {
                    data: {
                        ...params.data,
                        id: queuedId,
                        _offline: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                };
            }
            throw error;
        }
    },

    async updateInteraction(params: any) {
        const startTime = Date.now();

        try {
            // Get settings for validation
            const settingsResult = await baseDataProvider.getList('settings', {
                filter: {},
                pagination: { page: 1, perPage: 1000 },
                sort: { field: 'id', order: 'ASC' },
            });

            interactionValidator.updateSettings(settingsResult.data);

            // Sanitize and validate data
            const sanitizedData = interactionValidator.sanitizeInteraction(
                params.data
            );
            const validation =
                interactionValidator.validateInteraction(sanitizedData);

            if (!validation.isValid) {
                throw new Error(
                    `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`
                );
            }

            // Log warnings if any
            if (validation.warnings.length > 0) {
                console.warn(
                    'Interaction update warnings:',
                    validation.warnings
                );
            }

            const result = await baseDataProvider.update('interactions', {
                ...params,
                data: {
                    ...sanitizedData,
                    updatedAt: new Date().toISOString(),
                },
            });

            // Track performance
            performanceMonitor.trackApiCall(
                'updateInteraction',
                'PUT',
                startTime,
                true
            );

            return result;
        } catch (error: any) {
            performanceMonitor.trackApiCall(
                'updateInteraction',
                'PUT',
                startTime,
                false,
                error.message
            );
            throw error;
        }
    },

    async deleteInteraction(params: any) {
        const startTime = Date.now();

        try {
            const result = await baseDataProvider.delete(
                'interactions',
                params
            );

            performanceMonitor.trackApiCall(
                'deleteInteraction',
                'DELETE',
                startTime,
                true
            );

            return result;
        } catch (error: any) {
            performanceMonitor.trackApiCall(
                'deleteInteraction',
                'DELETE',
                startTime,
                false,
                error.message
            );
            throw error;
        }
    },

    async getOrganizationInteractions(
        organizationId: Identifier,
        params: any = {}
    ) {
        const startTime = Date.now();

        try {
            const interactionsResult = await baseDataProvider.getList(
                'interactions',
                {
                    ...params,
                    filter: { ...params.filter, organizationId },
                }
            );

            // Enrich with type information
            const settingsResult = await baseDataProvider.getList('settings', {
                filter: { category: 'interaction_type' },
                pagination: { page: 1, perPage: 1000 },
                sort: { field: 'id', order: 'ASC' },
            });

            const enrichedInteractions = interactionsResult.data.map(
                (interaction: any) => {
                    const type = settingsResult.data.find(
                        (s: any) => s.id === interaction.typeId
                    );
                    return {
                        ...interaction,
                        type,
                        typeLabel: type?.label || 'Unknown',
                        hasLocation:
                            interaction.latitude != null &&
                            interaction.longitude != null,
                        isOverdue:
                            interaction.followUpDate &&
                            new Date(interaction.followUpDate) < new Date(),
                    };
                }
            );

            const result = {
                data: enrichedInteractions,
                total: interactionsResult.total,
            };

            performanceMonitor.trackApiCall(
                'getOrganizationInteractions',
                'GET',
                startTime,
                true
            );

            return result;
        } catch (error: any) {
            performanceMonitor.trackApiCall(
                'getOrganizationInteractions',
                'GET',
                startTime,
                false,
                error.message
            );
            throw error;
        }
    },

    async getContactInteractions(contactId: Identifier, params: any = {}) {
        const interactionsResult = await baseDataProvider.getList(
            'interactions',
            {
                ...params,
                filter: { ...params.filter, contactId },
            }
        );

        // Enrich with type information
        const settingsResult = await baseDataProvider.getList('settings', {
            filter: { category: 'interaction_type' },
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'id', order: 'ASC' },
        });

        const enrichedInteractions = interactionsResult.data.map(
            (interaction: any) => {
                const type = settingsResult.data.find(
                    (s: any) => s.id === interaction.typeId
                );
                return {
                    ...interaction,
                    type,
                    typeLabel: type?.label || 'Unknown',
                    hasLocation:
                        interaction.latitude != null &&
                        interaction.longitude != null,
                };
            }
        );

        return {
            data: enrichedInteractions,
            total: interactionsResult.total,
        };
    },

    async getOpportunityInteractions(
        opportunityId: Identifier,
        params: any = {}
    ) {
        const interactionsResult = await baseDataProvider.getList(
            'interactions',
            {
                ...params,
                filter: { ...params.filter, opportunityId },
            }
        );

        // Enrich with type information
        const settingsResult = await baseDataProvider.getList('settings', {
            filter: { category: 'interaction_type' },
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'id', order: 'ASC' },
        });

        const enrichedInteractions = interactionsResult.data.map(
            (interaction: any) => {
                const type = settingsResult.data.find(
                    (s: any) => s.id === interaction.typeId
                );
                return {
                    ...interaction,
                    type,
                    typeLabel: type?.label || 'Unknown',
                    hasLocation:
                        interaction.latitude != null &&
                        interaction.longitude != null,
                };
            }
        );

        return {
            data: enrichedInteractions,
            total: interactionsResult.total,
        };
    },

    async getInteractionTimeline(params: any = {}) {
        const startTime = Date.now();

        try {
            const { startDate, endDate, organizationId, contactId, typeIds } =
                params;

            let filter: any = {};
            if (organizationId) filter.organizationId = organizationId;
            if (contactId) filter.contactId = contactId;

            const interactionsResult = await baseDataProvider.getList(
                'interactions',
                {
                    filter,
                    pagination: { page: 1, perPage: 10000 },
                    sort: { field: 'scheduledDate', order: 'DESC' },
                }
            );

            // Filter by date range and type if specified
            let filteredInteractions = interactionsResult.data;

            if (startDate || endDate) {
                filteredInteractions = filteredInteractions.filter(
                    (interaction: any) => {
                        const date = new Date(interaction.scheduledDate);
                        if (startDate && date < new Date(startDate))
                            return false;
                        if (endDate && date > new Date(endDate)) return false;
                        return true;
                    }
                );
            }

            if (typeIds && typeIds.length > 0) {
                filteredInteractions = filteredInteractions.filter(
                    (interaction: any) => typeIds.includes(interaction.typeId)
                );
            }

            // Enrich with type information
            const settingsResult = await baseDataProvider.getList('settings', {
                filter: { category: 'interaction_type' },
                pagination: { page: 1, perPage: 1000 },
                sort: { field: 'id', order: 'ASC' },
            });

            const enrichedInteractions = filteredInteractions.map(
                (interaction: any) => {
                    const type = settingsResult.data.find(
                        (s: any) => s.id === interaction.typeId
                    );
                    return {
                        ...interaction,
                        type,
                        typeLabel: type?.label || 'Unknown',
                        hasLocation:
                            interaction.latitude != null &&
                            interaction.longitude != null,
                    };
                }
            );

            const result = {
                data: enrichedInteractions,
                total: enrichedInteractions.length,
            };

            performanceMonitor.trackApiCall(
                'getInteractionTimeline',
                'GET',
                startTime,
                true
            );

            return result;
        } catch (error: any) {
            performanceMonitor.trackApiCall(
                'getInteractionTimeline',
                'GET',
                startTime,
                false,
                error.message
            );
            throw error;
        }
    },

    async getFollowUpReminders(params: any = {}) {
        const startTime = Date.now();

        try {
            const { overdue = false, upcoming = false, days = 7 } = params;

            const interactionsResult = await baseDataProvider.getList(
                'interactions',
                {
                    filter: { followUpRequired: true },
                    pagination: { page: 1, perPage: 10000 },
                    sort: { field: 'followUpDate', order: 'ASC' },
                }
            );

            const now = new Date();
            const futureDate = new Date();
            futureDate.setDate(now.getDate() + days);

            let filteredInteractions = interactionsResult.data.filter(
                (interaction: any) =>
                    interaction.followUpDate && !interaction.isCompleted
            );

            if (overdue) {
                filteredInteractions = filteredInteractions.filter(
                    (interaction: any) =>
                        new Date(interaction.followUpDate) < now
                );
            }

            if (upcoming) {
                filteredInteractions = filteredInteractions.filter(
                    (interaction: any) => {
                        const followUpDate = new Date(interaction.followUpDate);
                        return (
                            followUpDate >= now && followUpDate <= futureDate
                        );
                    }
                );
            }

            // Enrich with type and organization information
            const [settingsResult, organizationsResult] = await Promise.all([
                baseDataProvider.getList('settings', {
                    filter: { category: 'interaction_type' },
                    pagination: { page: 1, perPage: 1000 },
                    sort: { field: 'id', order: 'ASC' },
                }),
                baseDataProvider.getList('organizations', {
                    filter: {},
                    pagination: { page: 1, perPage: 10000 },
                    sort: { field: 'id', order: 'ASC' },
                }),
            ]);

            const enrichedInteractions = filteredInteractions.map(
                (interaction: any) => {
                    const type = settingsResult.data.find(
                        (s: any) => s.id === interaction.typeId
                    );
                    const organization = organizationsResult.data.find(
                        (o: any) => o.id === interaction.organizationId
                    );
                    return {
                        ...interaction,
                        type,
                        organization,
                        typeLabel: type?.label || 'Unknown',
                        isOverdue: new Date(interaction.followUpDate) < now,
                    };
                }
            );

            const result = {
                data: enrichedInteractions,
                total: enrichedInteractions.length,
            };

            performanceMonitor.trackApiCall(
                'getFollowUpReminders',
                'GET',
                startTime,
                true
            );

            return result;
        } catch (error: any) {
            performanceMonitor.trackApiCall(
                'getFollowUpReminders',
                'GET',
                startTime,
                false,
                error.message
            );
            throw error;
        }
    },

    async completeInteraction(id: Identifier, completionData: any = {}) {
        const startTime = Date.now();

        try {
            const { data: previousData } = await baseDataProvider.getOne(
                'interactions',
                { id }
            );

            const result = await baseDataProvider.update('interactions', {
                id,
                data: {
                    isCompleted: true,
                    completedDate: new Date().toISOString(),
                    duration: completionData.duration,
                    outcome: completionData.outcome,
                    updatedAt: new Date().toISOString(),
                    ...completionData,
                },
                previousData,
            });

            performanceMonitor.trackApiCall(
                'completeInteraction',
                'PUT',
                startTime,
                true
            );

            return result;
        } catch (error: any) {
            performanceMonitor.trackApiCall(
                'completeInteraction',
                'PUT',
                startTime,
                false,
                error.message
            );
            throw error;
        }
    },

    async scheduleFollowUp(id: Identifier, followUpData: any) {
        const startTime = Date.now();

        try {
            const { data: previousData } = await baseDataProvider.getOne(
                'interactions',
                { id }
            );

            const result = await baseDataProvider.update('interactions', {
                id,
                data: {
                    followUpRequired: true,
                    followUpDate: followUpData.followUpDate,
                    followUpNotes: followUpData.followUpNotes,
                    updatedAt: new Date().toISOString(),
                },
                previousData,
            });

            performanceMonitor.trackApiCall(
                'scheduleFollowUp',
                'PUT',
                startTime,
                true
            );

            return result;
        } catch (error: any) {
            performanceMonitor.trackApiCall(
                'scheduleFollowUp',
                'PUT',
                startTime,
                false,
                error.message
            );
            throw error;
        }
    },

    async uploadInteractionAttachment(interactionId: Identifier, file: File) {
        const startTime = Date.now();

        try {
            // Validate file attachment
            const validation = interactionValidator.validateAttachment(file);

            if (!validation.isValid) {
                throw new Error(
                    `File validation failed: ${validation.errors.map(e => e.message).join(', ')}`
                );
            }

            // Log warnings if any
            if (validation.warnings.length > 0) {
                console.warn('File upload warnings:', validation.warnings);
            }

            // Mock file upload - in production this would upload to a file storage service
            const fileName = `interaction_${interactionId}_${Date.now()}_${file.name}`;
            const { data: previousData } = await baseDataProvider.getOne(
                'interactions',
                { id: interactionId }
            );

            const attachments = previousData.attachments || [];
            attachments.push(fileName);

            const result = await baseDataProvider.update('interactions', {
                id: interactionId,
                data: {
                    attachments,
                    updatedAt: new Date().toISOString(),
                },
                previousData,
            });

            // Track upload performance
            performanceMonitor.trackFileUpload(file.size, startTime, true);

            return result;
        } catch (error: any) {
            // Track failed upload
            performanceMonitor.trackFileUpload(
                file.size,
                startTime,
                false,
                undefined,
                error.message
            );
            throw error;
        }
    },

    async deleteInteractionAttachment(
        interactionId: Identifier,
        fileName: string
    ) {
        const startTime = Date.now();

        try {
            const { data: previousData } = await baseDataProvider.getOne(
                'interactions',
                { id: interactionId }
            );

            const attachments = (previousData.attachments || []).filter(
                (name: string) => name !== fileName
            );

            const result = await baseDataProvider.update('interactions', {
                id: interactionId,
                data: {
                    attachments,
                    updatedAt: new Date().toISOString(),
                },
                previousData,
            });

            performanceMonitor.trackApiCall(
                'deleteInteractionAttachment',
                'DELETE',
                startTime,
                true
            );

            return result;
        } catch (error: any) {
            performanceMonitor.trackApiCall(
                'deleteInteractionAttachment',
                'DELETE',
                startTime,
                false,
                error.message
            );
            throw error;
        }
    },

    // Mobile-specific methods
    async getCurrentLocation() {
        const startTime = Date.now();
        try {
            const result = await gpsService.getCurrentLocation();

            // Track GPS performance
            if (result.coordinates) {
                performanceMonitor.trackGPSAcquisition(
                    startTime,
                    result.coordinates.accuracy || 0,
                    true
                );
            } else {
                performanceMonitor.trackGPSAcquisition(
                    startTime,
                    0,
                    false,
                    result.error
                );
            }

            return result;
        } catch (error: any) {
            performanceMonitor.trackGPSAcquisition(
                startTime,
                0,
                false,
                error.message
            );
            throw new Error(`GPS error: ${error.message}`);
        }
    },

    async addLocationToInteraction(
        interactionId: Identifier,
        forceRefresh: boolean = false
    ) {
        const startTime = Date.now();

        try {
            // Try to get cached location first unless force refresh
            let coordinates = forceRefresh
                ? null
                : gpsService.getCachedLocation();

            if (!coordinates) {
                const result = await gpsService.getCurrentLocation();
                if (!result.coordinates) {
                    throw new Error(result.error || 'Failed to get location');
                }
                coordinates = result.coordinates;
            }

            const { data: previousData } = await baseDataProvider.getOne(
                'interactions',
                { id: interactionId }
            );

            const result = await baseDataProvider.update('interactions', {
                id: interactionId,
                data: {
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                    locationNotes: `GPS location added ${new Date().toLocaleString()}`,
                    updatedAt: new Date().toISOString(),
                },
                previousData,
            });

            performanceMonitor.trackApiCall(
                'addLocationToInteraction',
                'PUT',
                startTime,
                true
            );

            return result;
        } catch (error: any) {
            performanceMonitor.trackApiCall(
                'addLocationToInteraction',
                'PUT',
                startTime,
                false,
                error.message
            );
            throw new Error(`Failed to add location: ${error.message}`);
        }
    },

    async syncOfflineInteractions() {
        const startTime = Date.now();

        try {
            const result = await offlineService.syncPendingActions(
                dataProviderWithCustomMethod
            );

            performanceMonitor.trackApiCall(
                'syncOfflineInteractions',
                'POST',
                startTime,
                true
            );

            return result;
        } catch (error: any) {
            performanceMonitor.trackApiCall(
                'syncOfflineInteractions',
                'POST',
                startTime,
                false,
                error.message
            );
            throw new Error(`Sync failed: ${error.message}`);
        }
    },

    async getOfflineStatus() {
        return offlineService.getStatus();
    },

    async getOfflineInteractions() {
        return offlineService.getOfflineInteractions();
    },

    async clearOfflineData() {
        return offlineService.clearOfflineData();
    },

    async validateFileAttachment(file: File) {
        return interactionValidator.validateAttachment(file);
    },

    async compressImageForMobile(
        file: File,
        maxWidth: number = 1920,
        maxHeight: number = 1080,
        quality: number = 0.8
    ) {
        try {
            return await fileUploadService.compressImage(
                file,
                maxWidth,
                maxHeight,
                quality
            );
        } catch (error: any) {
            throw new Error(`Image compression failed: ${error.message}`);
        }
    },

    async createImageThumbnail(file: File, size: number = 150) {
        try {
            return await fileUploadService.createThumbnail(file, size);
        } catch (error: any) {
            throw new Error(`Thumbnail creation failed: ${error.message}`);
        }
    },

    // Convenience method for mobile interaction creation with GPS
    async createInteractionWithLocation(
        params: any,
        autoCapture: boolean = true
    ) {
        let interactionData = { ...params.data };

        // If auto-capture is enabled and no GPS coordinates provided, try to get them
        if (
            autoCapture &&
            !interactionData.latitude &&
            !interactionData.longitude
        ) {
            try {
                const cachedLocation = gpsService.getCachedLocation();
                if (cachedLocation) {
                    interactionData = {
                        ...interactionData,
                        latitude: cachedLocation.latitude,
                        longitude: cachedLocation.longitude,
                        locationNotes: `Auto-captured GPS location`,
                    };
                } else {
                    // Try to get current location (non-blocking)
                    const locationResult = await gpsService.getCurrentLocation({
                        timeout: 5000, // Quick timeout for mobile UX
                        enableHighAccuracy: false, // Faster, less battery drain
                    });

                    if (locationResult.coordinates) {
                        interactionData = {
                            ...interactionData,
                            latitude: locationResult.coordinates.latitude,
                            longitude: locationResult.coordinates.longitude,
                            locationNotes: `GPS location captured at interaction time`,
                        };
                    }
                }
            } catch (error) {
                // Don't fail the interaction if GPS fails, just log the warning
                console.warn(
                    'Failed to capture GPS location for interaction:',
                    error
                );
            }
        }

        return this.createInteraction({ ...params, data: interactionData });
    },
};

async function updateCompany(
    companyId: Identifier,
    updateFn: (company: Company) => Partial<Company>
) {
    const { data: company } = await dataProvider.getOne<Company>('companies', {
        id: companyId,
    });

    return await dataProvider.update('companies', {
        id: companyId,
        data: {
            ...updateFn(company),
        },
        previousData: company,
    });
}

// Defensive: Ensure all required resources are initialized
const requiredResources = [
    'organizations',
    'contacts',
    'settings',
    'companies',
    'tasks',
    'deals',
    'dealNotes',
    'contactNotes',
    'interactions',
];
export const ensureDbResources = (db: any) => {
    requiredResources.forEach(res => {
        if (!db[res]) {
            db[res] = [];
        }
    });
};

// Apply reporting extensions to the dataProvider
const reportingDataProvider = createReportingProvider(
    dataProviderWithCustomMethod
);

export const dataProvider = withLifecycleCallbacks(
    withSupabaseFilterAdapter(reportingDataProvider),
    [
        {
            resource: 'sales',
            beforeCreate: async params => {
                const { data } = params;
                // If administrator role is not set, we simply set it to false
                if (data.administrator == null) {
                    data.administrator = false;
                }
                return params;
            },
            afterSave: async data => {
                // Since the current user is stored in localStorage in fakerest authProvider
                // we need to update it to keep information up to date in the UI
                const currentUser = await authProvider.getIdentity?.();
                if (currentUser?.id === data.id) {
                    localStorage.setItem(
                        USER_STORAGE_KEY,
                        JSON.stringify(data)
                    );
                }
                return data;
            },
            beforeDelete: async params => {
                if (params.meta?.identity?.id == null) {
                    throw new Error('Identity MUST be set in meta');
                }

                const newSaleId = params.meta.identity.id as Identifier;

                const [companies, contacts, contactNotes, deals] =
                    await Promise.all([
                        dataProvider.getList('companies', {
                            filter: { salesId: params.id },
                            pagination: {
                                page: 1,
                                perPage: 10_000,
                            },
                            sort: { field: 'id', order: 'ASC' },
                        }),
                        dataProvider.getList('contacts', {
                            filter: { salesId: params.id },
                            pagination: {
                                page: 1,
                                perPage: 10_000,
                            },
                            sort: { field: 'id', order: 'ASC' },
                        }),
                        dataProvider.getList('contactNotes', {
                            filter: { salesId: params.id },
                            pagination: {
                                page: 1,
                                perPage: 10_000,
                            },
                            sort: { field: 'id', order: 'ASC' },
                        }),
                        dataProvider.getList('deals', {
                            filter: { salesId: params.id },
                            pagination: {
                                page: 1,
                                perPage: 10_000,
                            },
                            sort: { field: 'id', order: 'ASC' },
                        }),
                    ]);

                await Promise.all([
                    dataProvider.updateMany('companies', {
                        ids: companies.data.map(company => company.id),
                        data: {
                            salesId: newSaleId,
                        },
                    }),
                    dataProvider.updateMany('contacts', {
                        ids: contacts.data.map(company => company.id),
                        data: {
                            salesId: newSaleId,
                        },
                    }),
                    dataProvider.updateMany('contactNotes', {
                        ids: contactNotes.data.map(company => company.id),
                        data: {
                            salesId: newSaleId,
                        },
                    }),
                    dataProvider.updateMany('deals', {
                        ids: deals.data.map(company => company.id),
                        data: {
                            salesId: newSaleId,
                        },
                    }),
                ]);

                return params;
            },
        } satisfies ResourceCallbacks<Sale>,
        {
            resource: 'contacts',
            beforeCreate: async (params, dataProvider) => {
                const newParams = await processContactAvatar(params);
                return fetchAndUpdateCompanyData(newParams, dataProvider);
            },
            afterCreate: async result => {
                if (result.data.organizationId != null) {
                    await updateCompany(
                        result.data.organizationId,
                        company => ({
                            nb_contacts: (company.nb_contacts ?? 0) + 1,
                        })
                    );
                }

                return result;
            },
            beforeUpdate: async params => {
                const newParams = await processContactAvatar(params);
                return fetchAndUpdateCompanyData(newParams, dataProvider);
            },
            afterDelete: async result => {
                if (result.data.organizationId != null) {
                    await updateCompany(
                        result.data.organizationId,
                        company => ({
                            nb_contacts: (company.nb_contacts ?? 1) - 1,
                        })
                    );
                }

                return result;
            },
        } satisfies ResourceCallbacks<Contact>,
        {
            resource: 'tasks',
            afterCreate: async (result, dataProvider) => {
                // update the task count in the related contact
                const { contact_id } = result.data;
                const { data: contact } = await dataProvider.getOne(
                    'contacts',
                    { id: contact_id }
                );
                await dataProvider.update('contacts', {
                    id: contact_id,
                    data: {
                        nb_tasks: (contact.nb_tasks ?? 0) + 1,
                    },
                    previousData: contact,
                });
                return result;
            },
            beforeUpdate: async params => {
                const { data, previousData } = params;
                if (previousData.completed_at !== data.completed_at) {
                    taskUpdateType = data.completed_at
                        ? TASK_MARKED_AS_DONE
                        : TASK_MARKED_AS_UNDONE;
                } else {
                    taskUpdateType = TASK_DONE_NOT_CHANGED;
                }
                return params;
            },
            afterUpdate: async (result, dataProvider) => {
                // update the contact: if the task is done, decrement the nb tasks, otherwise increment it
                const { contact_id } = result.data;
                const { data: contact } = await dataProvider.getOne(
                    'contacts',
                    { id: contact_id }
                );
                if (taskUpdateType !== TASK_DONE_NOT_CHANGED) {
                    await dataProvider.update('contacts', {
                        id: contact_id,
                        data: {
                            nb_tasks:
                                taskUpdateType === TASK_MARKED_AS_DONE
                                    ? (contact.nb_tasks ?? 0) - 1
                                    : (contact.nb_tasks ?? 0) + 1,
                        },
                        previousData: contact,
                    });
                }
                return result;
            },
            afterDelete: async (result, dataProvider) => {
                // update the task count in the related contact
                const { contact_id } = result.data;
                const { data: contact } = await dataProvider.getOne(
                    'contacts',
                    { id: contact_id }
                );
                await dataProvider.update('contacts', {
                    id: contact_id,
                    data: {
                        nb_tasks: (contact.nb_tasks ?? 0) - 1,
                    },
                    previousData: contact,
                });
                return result;
            },
        } satisfies ResourceCallbacks<Task>,
        {
            resource: 'companies',
            beforeCreate: async params => {
                const createParams = await processCompanyLogo(params);

                return {
                    ...createParams,
                    data: {
                        ...createParams.data,
                        created_at: new Date().toISOString(),
                    },
                };
            },
            beforeUpdate: async params => {
                return await processCompanyLogo(params);
            },
            afterUpdate: async (result, dataProvider) => {
                // get all contacts of the company and for each contact, update the company_name
                const { id, name } = result.data;
                const { data: contacts } = await dataProvider.getList(
                    'contacts',
                    {
                        filter: { organizationId: id },
                        pagination: { page: 1, perPage: 1000 },
                        sort: { field: 'id', order: 'ASC' },
                    }
                );

                const contactIds = contacts.map(contact => contact.id);
                await dataProvider.updateMany('contacts', {
                    ids: contactIds,
                    data: { organization: { name } },
                });
                return result;
            },
        } satisfies ResourceCallbacks<Company>,
        {
            resource: 'deals',
            beforeCreate: async params => {
                return {
                    ...params,
                    data: {
                        ...params.data,
                        created_at: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                };
            },
            afterCreate: async result => {
                await updateCompany(result.data.organizationId, company => ({
                    nb_deals: (company.nb_deals ?? 0) + 1,
                }));

                return result;
            },
            beforeUpdate: async params => {
                return {
                    ...params,
                    data: {
                        ...params.data,
                        updatedAt: new Date().toISOString(),
                    },
                };
            },
            afterDelete: async result => {
                await updateCompany(result.data.organizationId, company => ({
                    nb_deals: (company.nb_deals ?? 1) - 1,
                }));

                return result;
            },
        } satisfies ResourceCallbacks<Deal>,
        {
            resource: 'organizations',
            beforeCreate: async params => {
                // Get settings for validation
                const settingsResult = await dataProvider.getList('settings', {
                    filter: {},
                    pagination: { page: 1, perPage: 1000 },
                    sort: { field: 'id', order: 'ASC' },
                });

                organizationValidator.updateSettings(settingsResult.data);

                // Sanitize and validate data
                const sanitizedData =
                    organizationValidator.sanitizeOrganization(params.data);
                const validation =
                    organizationValidator.validateOrganization(sanitizedData);

                if (!validation.isValid) {
                    throw new Error(
                        `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`
                    );
                }

                return {
                    ...params,
                    data: {
                        ...sanitizedData,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                };
            },
            beforeUpdate: async params => {
                // Get settings for validation
                const settingsResult = await dataProvider.getList('settings', {
                    filter: {},
                    pagination: { page: 1, perPage: 1000 },
                    sort: { field: 'id', order: 'ASC' },
                });

                organizationValidator.updateSettings(settingsResult.data);

                // Sanitize and validate data
                const sanitizedData =
                    organizationValidator.sanitizeOrganization(params.data);
                const validation =
                    organizationValidator.validateOrganization(sanitizedData);

                if (!validation.isValid) {
                    throw new Error(
                        `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`
                    );
                }

                return {
                    ...params,
                    data: {
                        ...sanitizedData,
                        updatedAt: new Date().toISOString(),
                    },
                };
            },
            afterCreate: async result => {
                // Log organization creation activity
                console.log(
                    `Organization created: ${result.data.name} (ID: ${result.data.id})`
                );
                return result;
            },
            afterUpdate: async result => {
                // Log organization update activity
                console.log(
                    `Organization updated: ${result.data.name} (ID: ${result.data.id})`
                );
                return result;
            },
            afterDelete: async result => {
                // Log organization deletion activity
                console.log(
                    `Organization deleted: ${result.data.name} (ID: ${result.data.id})`
                );
                // TODO: Handle cleanup of related records (contacts, deals, etc.)
                return result;
            },
        } satisfies ResourceCallbacks<Organization>,
        {
            resource: 'interactions',
            beforeCreate: async params => {
                // Get settings for validation
                const settingsResult = await baseDataProvider.getList(
                    'settings',
                    {
                        filter: {},
                        pagination: { page: 1, perPage: 1000 },
                        sort: { field: 'id', order: 'ASC' },
                    }
                );

                interactionValidator.updateSettings(settingsResult.data);

                // Sanitize and validate data
                const sanitizedData = interactionValidator.sanitizeInteraction(
                    params.data
                );
                const validation =
                    interactionValidator.validateInteraction(sanitizedData);

                if (!validation.isValid) {
                    throw new Error(
                        `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`
                    );
                }

                // Log warnings if any
                if (validation.warnings.length > 0) {
                    console.warn(
                        'Interaction creation warnings:',
                        validation.warnings
                    );
                }

                return {
                    ...params,
                    data: {
                        ...sanitizedData,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        isCompleted: sanitizedData.isCompleted || false,
                        followUpRequired:
                            sanitizedData.followUpRequired || false,
                    },
                };
            },
            beforeUpdate: async params => {
                // Get settings for validation
                const settingsResult = await baseDataProvider.getList(
                    'settings',
                    {
                        filter: {},
                        pagination: { page: 1, perPage: 1000 },
                        sort: { field: 'id', order: 'ASC' },
                    }
                );

                interactionValidator.updateSettings(settingsResult.data);

                // Sanitize and validate data
                const sanitizedData = interactionValidator.sanitizeInteraction(
                    params.data
                );
                const validation =
                    interactionValidator.validateInteraction(sanitizedData);

                if (!validation.isValid) {
                    throw new Error(
                        `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`
                    );
                }

                // Log warnings if any
                if (validation.warnings.length > 0) {
                    console.warn(
                        'Interaction update warnings:',
                        validation.warnings
                    );
                }

                return {
                    ...params,
                    data: {
                        ...sanitizedData,
                        updatedAt: new Date().toISOString(),
                    },
                };
            },
            afterCreate: async result => {
                // Update organization's last contact date
                if (result.data.organizationId) {
                    const { data: organization } = await dataProvider.getOne(
                        'organizations',
                        {
                            id: result.data.organizationId,
                        }
                    );

                    await dataProvider.update('organizations', {
                        id: result.data.organizationId,
                        data: {
                            lastContactDate:
                                result.data.scheduledDate ||
                                result.data.createdAt,
                        },
                        previousData: organization,
                    });
                }

                // Update contact's last interaction date if contact is specified
                if (result.data.contactId) {
                    const { data: contact } = await dataProvider.getOne(
                        'contacts',
                        {
                            id: result.data.contactId,
                        }
                    );

                    await dataProvider.update('contacts', {
                        id: result.data.contactId,
                        data: {
                            lastInteractionDate:
                                result.data.scheduledDate ||
                                result.data.createdAt,
                            interactionCount:
                                (contact.interactionCount || 0) + 1,
                        },
                        previousData: contact,
                    });
                }

                console.log(
                    `Interaction created: ${result.data.subject} (ID: ${result.data.id})`
                );
                return result;
            },
            afterUpdate: async result => {
                // If completion status changed, update related entities
                if (result.data.isCompleted && result.data.completedDate) {
                    // Update organization's last contact date if this is the most recent interaction
                    if (result.data.organizationId) {
                        const { data: organization } =
                            await dataProvider.getOne('organizations', {
                                id: result.data.organizationId,
                            });

                        const currentLastContact = organization.lastContactDate;
                        const thisInteractionDate =
                            result.data.completedDate ||
                            result.data.scheduledDate;

                        if (
                            !currentLastContact ||
                            (thisInteractionDate &&
                                new Date(thisInteractionDate) >
                                    new Date(currentLastContact))
                        ) {
                            await dataProvider.update('organizations', {
                                id: result.data.organizationId,
                                data: {
                                    lastContactDate: thisInteractionDate,
                                },
                                previousData: organization,
                            });
                        }
                    }
                }

                console.log(
                    `Interaction updated: ${result.data.subject} (ID: ${result.data.id})`
                );
                return result;
            },
            afterDelete: async result => {
                // Update contact's interaction count if contact was specified
                if (result.data.contactId) {
                    const { data: contact } = await dataProvider.getOne(
                        'contacts',
                        {
                            id: result.data.contactId,
                        }
                    );

                    await dataProvider.update('contacts', {
                        id: result.data.contactId,
                        data: {
                            interactionCount: Math.max(
                                (contact.interactionCount || 1) - 1,
                                0
                            ),
                        },
                        previousData: contact,
                    });
                }

                console.log(
                    `Interaction deleted: ${result.data.subject} (ID: ${result.data.id})`
                );
                return result;
            },
        } satisfies ResourceCallbacks<Interaction>,
    ]
);

/**
 * Convert a `File` object returned by the upload input into a base 64 string.
 * That's not the most optimized way to store images in production, but it's
 * enough to illustrate the idea of dataprovider decoration.
 */
const convertFileToBase64 = (file: { rawFile: Blob }) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file.rawFile);
    });
