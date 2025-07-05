// src/providers/supabase/dataProvider.ts
import { supabaseDataProvider } from 'ra-supabase-core';

import {
    CreateParams,
    DataProvider,
    GetListParams,
    GetListResult,
    Identifier,
    UpdateParams,
    withLifecycleCallbacks,
} from 'react-admin';
import {
    Broker,
    BrokerDashboardStats,
    BrokerFormData,
    GPSCoordinates,
    Organization,
    RAFile,
    SignUpData,
    Visit,
    Interaction,
} from '../../types';
import { getActivityLog } from '../commons/activity';
import { getIsInitialized } from './authProvider';
import { supabase } from './supabase';
import { logAuditEvent } from '../../utils/auditLogging';
import {
    getCurrentLocation as getInteractionLocation,
    validateFileAttachment,
    compressImageForMobile,
    createImageThumbnail,
    uploadInteractionAttachment,
    deleteInteractionAttachment,
    processInteractionLocation,
    addLocationToInteraction,
    getInteractionTimeline,
    getFollowUpReminders,
    completeInteraction,
    scheduleFollowUp,
    getOfflineStatus,
    storeOfflineInteraction,
    getOfflineInteractions,
    syncOfflineInteractions,
    clearOfflineData,
    type FileAttachment,
    type SyncResult,
} from './interactionExtensions';
import {
    searchOrganizations,
    findNearbyOrganizations,
    importOrganizationsFromCSV,
    getOrganizationSummary,
    type OrganizationSearchResult,
    type OrganizationAnalytics,
    type BulkImportResult,
    type OrganizationSummary,
} from './organizationExtensions';
import { authDataProviderMethods } from '../../api/auth/authAPI';

if (import.meta.env.VITE_SUPABASE_URL === undefined) {
    throw new Error('Please set the VITE_SUPABASE_URL environment variable');
}
if (import.meta.env.VITE_SUPABASE_ANON_KEY === undefined) {
    throw new Error(
        'Please set the VITE_SUPABASE_ANON_KEY environment variable'
    );
}

const baseDataProvider = supabaseDataProvider({
    instanceUrl: import.meta.env.VITE_SUPABASE_URL,
    apiKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    supabaseClient: supabase,
    sortOrder: 'asc,desc.nullslast' as any,
});

// GPS Utilities for Food Broker CRM
const getCurrentLocation = (): Promise<GPSCoordinates> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date().toISOString(),
                });
            },
            error => {
                reject(new Error(`Geolocation error: ${error.message}`));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000, // Cache for 1 minute
            }
        );
    });
};

// Process visit data to auto-capture GPS if needed
async function processVisitLocation(
    params: CreateParams<Visit>
): Promise<CreateParams<Visit>>;
async function processVisitLocation(
    params: UpdateParams<Visit>
): Promise<UpdateParams<Visit>>;
async function processVisitLocation(
    params: CreateParams<Visit> | UpdateParams<Visit>
): Promise<CreateParams<Visit> | UpdateParams<Visit>> {
    const { data } = params;

    // Auto-capture GPS coordinates if not provided
    if (!data.latitude || !data.longitude) {
        try {
            const location = await getCurrentLocation();
            return {
                ...params,
                data: {
                    ...data,
                    latitude: location.latitude,
                    longitude: location.longitude,
                },
            };
        } catch (error) {
            console.warn('Could not get GPS location:', error);
            // Continue without GPS coordinates
        }
    }

    return params;
}

const dataProviderWithCustomMethods = {
    ...baseDataProvider,
    async getList(resource: string, params: GetListParams) {
        if (resource === 'customers') {
            return baseDataProvider.getList('customer_summary', params);
        }

        // Handle users resource via auth API
        if (resource === 'users') {
            const result = await authDataProviderMethods.getList(
                resource,
                params
            );
            return result as any; // Type assertion to satisfy DataProvider interface
        }

        return baseDataProvider.getList(resource, params);
    },
    async getOne(resource: string, params: any) {
        if (resource === 'customers') {
            return baseDataProvider.getOne('customer_summary', params);
        }

        // Handle users resource via auth API
        if (resource === 'users') {
            const result = await authDataProviderMethods.getOne(
                resource,
                params
            );
            return result as any; // Type assertion to satisfy DataProvider interface
        }

        return baseDataProvider.getOne(resource, params);
    },
    async create(resource: string, params: any) {
        // Handle users resource via auth API
        if (resource === 'users') {
            const result = await authDataProviderMethods.create(
                resource,
                params
            );
            return result as any; // Type assertion to satisfy DataProvider interface
        }

        return baseDataProvider.create(resource, params);
    },
    async update(resource: string, params: any) {
        // Handle users resource via auth API
        if (resource === 'users') {
            const result = await authDataProviderMethods.update(
                resource,
                params
            );
            return result as any; // Type assertion to satisfy DataProvider interface
        }

        return baseDataProvider.update(resource, params);
    },
    async delete(resource: string, params: any) {
        // Handle users resource via auth API
        if (resource === 'users') {
            const result = await authDataProviderMethods.delete(
                resource,
                params
            );
            return result as any; // Type assertion to satisfy DataProvider interface
        }

        return baseDataProvider.delete(resource, params);
    },

    async signUp({ email, password, first_name, last_name }: SignUpData) {
        const response = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name,
                    last_name,
                },
            },
        });

        if (!response.data?.user || response.error) {
            console.error('signUp.error', response.error);
            throw new Error('Failed to create account');
        }

        // Update the is initialized cache
        getIsInitialized._is_initialized_cache = true;

        return {
            id: response.data.user.id,
            email,
            password,
        };
    },
    async brokerCreate(body: BrokerFormData) {
        const { data, error } = await supabase.functions.invoke<Broker>(
            'users',
            {
                method: 'POST',
                body,
            }
        );

        if (!data || error) {
            console.error('brokerCreate.error', error);
            throw new Error('Failed to create broker account');
        }

        return data;
    },
    async brokerUpdate(
        id: Identifier,
        data: Partial<Omit<BrokerFormData, 'password'>>
    ) {
        const {
            email,
            first_name,
            last_name,
            administrator,
            avatar,
            disabled,
        } = data;

        const { data: broker, error } = await supabase.functions.invoke<Broker>(
            'users',
            {
                method: 'PATCH',
                body: {
                    broker_id: id,
                    email,
                    first_name,
                    last_name,
                    administrator,
                    disabled,
                    avatar,
                },
            }
        );

        if (!broker || error) {
            console.error('brokerUpdate.error', error);
            throw new Error('Failed to update broker account');
        }

        return data;
    },
    async updatePassword(id: Identifier) {
        const { data: passwordUpdated, error } =
            await supabase.functions.invoke<boolean>('updatePassword', {
                method: 'PATCH',
                body: {
                    broker_id: id,
                },
            });

        if (!passwordUpdated || error) {
            console.error('passwordUpdate.error', error);
            throw new Error('Failed to update password');
        }

        return passwordUpdated;
    },
    async getDashboardStats(): Promise<BrokerDashboardStats> {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user?.id) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase.rpc(
            'get_broker_dashboard_stats',
            {
                broker_uuid: user.user.id,
            }
        );

        if (error) {
            console.error('getDashboardStats.error', error);
            throw new Error('Failed to get dashboard statistics');
        }

        return (
            data[0] || {
                total_customers: 0,
                customers_this_month: 0,
                total_visits: 0,
                visits_this_week: 0,
                visits_this_month: 0,
                pending_reminders: 0,
                overdue_reminders: 0,
                customers_needing_attention: 0,
            }
        );
    },
    async findNearbyCustomers(
        latitude: number,
        longitude: number,
        radiusKm: number = 10
    ) {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user?.id) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase.rpc('customers_near_location', {
            broker_uuid: user.user.id,
            center_lat: latitude,
            center_lon: longitude,
            radius_km: radiusKm,
        });

        if (error) {
            console.error('findNearbyCustomers.error', error);
            throw new Error('Failed to find nearby customers');
        }

        return data || [];
    },
    async completeReminder(reminderId: Identifier) {
        return baseDataProvider.update('reminders', {
            id: reminderId,
            data: { is_completed: true },
            previousData: {} as any,
        });
    },
    async snoozeReminder(reminderId: Identifier, snoozeUntil: string) {
        const { data: reminder } = await baseDataProvider.getOne('reminders', {
            id: reminderId,
        });

        return baseDataProvider.update('reminders', {
            id: reminderId,
            data: {
                snoozed_until: snoozeUntil,
                snooze_count: (reminder.snooze_count || 0) + 1,
            },
            previousData: reminder,
        });
    },
    async isInitialized() {
        return getIsInitialized();
    },
    // We simulate a remote endpoint that is in charge of returning activity log
    getActivityLog: async (companyId?: Identifier) => {
        return getActivityLog(dataProviderWithCustomMethods, companyId);
    },

    // ===========================================
    // Interaction Management Methods (Mobile-Optimized)
    // ===========================================

    /**
     * Create interaction with automatic GPS capture
     */
    async createInteractionWithLocation(
        params: { data: Partial<Interaction> },
        autoCapture: boolean = true
    ) {
        const processedParams = await processInteractionLocation(
            { data: params.data } as CreateParams<Interaction>,
            autoCapture
        );

        const { data: user } = await supabase.auth.getUser();

        // Handle offline mode
        if (!navigator.onLine) {
            await storeOfflineInteraction({
                ...processedParams.data,
                createdBy: user?.user?.id,
                createdAt: new Date().toISOString(),
            });

            return {
                data: {
                    ...processedParams.data,
                    id: `offline_${Date.now()}`,
                    _offline: true,
                },
            };
        }

        return baseDataProvider.create('interactions', {
            data: {
                ...processedParams.data,
                createdBy: user?.user?.id,
                createdAt: new Date().toISOString(),
            },
        });
    },

    /**
     * Get current GPS location
     */
    getCurrentLocation: getInteractionLocation,

    /**
     * Add location to existing interaction
     */
    async addLocationToInteraction(
        interactionId: Identifier,
        forceRefresh: boolean = false
    ) {
        return addLocationToInteraction(this, interactionId, forceRefresh);
    },

    /**
     * Validate file attachment
     */
    validateFileAttachment,

    /**
     * Compress image for mobile upload
     */
    compressImageForMobile,

    /**
     * Create image thumbnail
     */
    createImageThumbnail,

    /**
     * Upload interaction attachment
     */
    async uploadInteractionAttachment(interactionId: Identifier, file: File) {
        const attachment = await uploadInteractionAttachment(
            interactionId,
            file
        );

        // Update interaction with new attachment
        const { data: interaction } = await baseDataProvider.getOne(
            'interactions',
            {
                id: interactionId,
            }
        );

        const existingAttachments = interaction.attachments || [];
        const updatedAttachments = [...existingAttachments, attachment];

        await baseDataProvider.update('interactions', {
            id: interactionId,
            data: { attachments: updatedAttachments },
            previousData: interaction,
        });

        return attachment;
    },

    /**
     * Delete interaction attachment
     */
    async deleteInteractionAttachment(
        interactionId: Identifier,
        filename: string
    ) {
        await deleteInteractionAttachment(interactionId, filename);

        // Update interaction to remove attachment
        const { data: interaction } = await baseDataProvider.getOne(
            'interactions',
            {
                id: interactionId,
            }
        );

        const updatedAttachments = (interaction.attachments || []).filter(
            (att: FileAttachment) => att.filename !== filename
        );

        await baseDataProvider.update('interactions', {
            id: interactionId,
            data: { attachments: updatedAttachments },
            previousData: interaction,
        });

        return true;
    },

    /**
     * Get interaction timeline
     */
    async getInteractionTimeline(params: {
        startDate?: string;
        endDate?: string;
        organizationId?: Identifier;
        contactId?: Identifier;
        typeIds?: Identifier[];
    }) {
        return getInteractionTimeline(this, params);
    },

    /**
     * Get follow-up reminders
     */
    async getFollowUpReminders(params: {
        overdue?: boolean;
        upcoming?: boolean;
        days?: number;
    }) {
        return getFollowUpReminders(this, params);
    },

    /**
     * Complete interaction
     */
    async completeInteraction(
        id: Identifier,
        completionData: {
            duration?: number;
            outcome?: string;
            [key: string]: any;
        }
    ) {
        return completeInteraction(this, id, completionData);
    },

    /**
     * Schedule follow-up
     */
    async scheduleFollowUp(
        id: Identifier,
        followUpData: { followUpDate: string; followUpNotes?: string }
    ) {
        return scheduleFollowUp(this, id, followUpData);
    },

    /**
     * Get offline status
     */
    getOfflineStatus,

    /**
     * Get offline interactions
     */
    getOfflineInteractions,

    /**
     * Sync offline interactions
     */
    async syncOfflineInteractions() {
        return syncOfflineInteractions(this);
    },

    /**
     * Clear offline data
     */
    clearOfflineData,

    // ===========================================
    // Organization Management Methods (Mobile-Optimized)
    // ===========================================

    /**
     * Advanced organization search with full-text search and GPS proximity
     */
    async searchOrganizations(
        query: string,
        options: {
            limit?: number;
            includeInactive?: boolean;
            filters?: Record<string, any>;
            location?: GPSCoordinates;
            radiusKm?: number;
            sortBy?: 'relevance' | 'distance' | 'name' | 'lastActivity';
        } = {}
    ) {
        return searchOrganizations(this, query, options);
    },

    /**
     * Find nearby organizations using GPS coordinates
     */
    async findNearbyOrganizations(
        location: GPSCoordinates,
        radiusKm: number = 10,
        options: {
            limit?: number;
            includeDistance?: boolean;
            sortByDistance?: boolean;
            filters?: Record<string, any>;
        } = {}
    ) {
        return findNearbyOrganizations(this, location, radiusKm, options);
    },

    /**
     * Import organizations from CSV data with validation
     */
    async importOrganizationsFromCSV(
        csvData: any[],
        options: {
            skipDuplicates?: boolean;
            updateExisting?: boolean;
            validateAddresses?: boolean;
            userId: string;
        }
    ) {
        return importOrganizationsFromCSV(this, csvData, options);
    },

    /**
     * Get comprehensive organization summary for dashboard
     */
    async getOrganizationSummary(organizationId: Identifier) {
        return getOrganizationSummary(this, organizationId);
    },

    /**
     * Enhanced organization finder with autocomplete support
     */
    async findOrganizationsAutocomplete(
        query: string,
        limit: number = 10
    ): Promise<{
        data: Array<{
            id: number;
            name: string;
            address?: string;
            distance?: number;
        }>;
    }> {
        const result = await this.searchOrganizations(query, {
            limit,
            sortBy: 'relevance',
        });

        return {
            data: result.data.map((org: OrganizationSearchResult) => ({
                id: org.id,
                name: org.name,
                address: org.address,
                distance: org.distance,
            })),
        };
    },

    /**
     * Get organizations needing attention (no recent interactions)
     */
    async getOrganizationsNeedingAttention(
        daysSinceLastInteraction: number = 30,
        userId?: string
    ): Promise<GetListResult<Organization>> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastInteraction);

        // This would be implemented with a more complex query in production
        // For now, we'll get organizations and filter
        const orgsResult = await this.getList('organizations', {
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'updatedAt', order: 'ASC' },
            filter: userId ? { accountManager: userId } : {},
        });

        // In production, this would be a JOIN query with interactions table
        const needsAttention = orgsResult.data.filter(org => {
            const lastUpdate = new Date(org.updatedAt);
            return lastUpdate < cutoffDate;
        });

        return {
            data: needsAttention,
            total: needsAttention.length,
        };
    },

    /**
     * Geocode organization address to GPS coordinates
     */
    async geocodeOrganizationAddress(
        organizationId: Identifier,
        address?: string
    ): Promise<{ latitude: number; longitude: number }> {
        // Get organization if address not provided
        if (!address) {
            const org = await this.getOne('organizations', {
                id: organizationId,
            });
            address =
                `${org.data.address || ''}, ${org.data.city || ''}, ${org.data.state || ''} ${org.data.zipCode || ''}`.trim();
        }

        if (!address) {
            throw new Error('No address available for geocoding');
        }

        // This would integrate with Google Maps Geocoding API in production
        // For now, return mock coordinates based on US center
        const mockLat = 39.8283 + (Math.random() - 0.5) * 20; // Rough US latitude range
        const mockLng = -98.5795 + (Math.random() - 0.5) * 40; // Rough US longitude range

        // Update organization with coordinates
        await this.update('organizations', {
            id: organizationId,
            data: {
                latitude: mockLat,
                longitude: mockLng,
            },
            previousData: {} as Organization,
        });

        // Log audit event
        await logAuditEvent(
            'data.update',
            {
                resource: 'organization',
                organizationId,
                action: 'geocoded',
                address,
                latitude: mockLat,
                longitude: mockLng,
            },
            {
                outcome: 'success',
                message: 'Organization address geocoded successfully',
            }
        );

        return {
            latitude: mockLat,
            longitude: mockLng,
        };
    },

    // ===========================================
    // Authentication Methods (API Integration)
    // ===========================================

    /**
     * Authentication login method
     */
    async authLogin(credentials: any) {
        return authDataProviderMethods.login(credentials);
    },

    /**
     * Authentication logout method
     */
    async authLogout() {
        return authDataProviderMethods.logout();
    },

    /**
     * Get current authenticated user
     */
    async authGetCurrentUser() {
        return authDataProviderMethods.getCurrentUser();
    },

    /**
     * Check authentication status
     */
    async authCheckAuth() {
        return authDataProviderMethods.checkAuth();
    },

    /**
     * Refresh authentication token
     */
    async authRefreshToken() {
        return authDataProviderMethods.refreshToken();
    },

    /**
     * Get user permissions
     */
    async authGetUserPermissions(userId?: any) {
        return authDataProviderMethods.getUserPermissions(userId);
    },

    /**
     * Request password reset (legacy method name)
     */
    async authRequestPasswordReset(email: string) {
        return authDataProviderMethods.requestPasswordReset({ email });
    },

    /**
     * Update password
     */
    async authUpdatePassword(newPassword: string) {
        return authDataProviderMethods.updatePassword(newPassword);
    },

    /**
     * Request password reset
     */
    async requestPasswordReset(data: any) {
        return authDataProviderMethods.requestPasswordReset(data);
    },

    /**
     * Confirm password reset with token
     */
    async confirmPasswordReset(data: any) {
        return authDataProviderMethods.confirmPasswordReset(data);
    },

    /**
     * Update user profile
     */
    async updateUserProfile(userId: any, data: any) {
        return authDataProviderMethods.updateUserProfile(userId, data);
    },

    /**
     * Force password reset (admin only)
     */
    async authForcePasswordReset(userId: any) {
        return authDataProviderMethods.forcePasswordReset(userId);
    },
} satisfies DataProvider;

export type CrmDataProvider = typeof dataProviderWithCustomMethods;

export const dataProvider = withLifecycleCallbacks(
    dataProviderWithCustomMethods,
    [
        {
            resource: 'customers',
            beforeGetList: async params => {
                return applyFullTextSearch([
                    'business_name',
                    'contact_person',
                    'email',
                    'phone',
                    'address',
                    'notes',
                ])(params);
            },
            beforeCreate: async params => {
                const { data: user } = await supabase.auth.getUser();
                return {
                    ...params,
                    data: {
                        ...params.data,
                        broker_id: user?.user?.id,
                        created_at: new Date().toISOString(),
                    },
                };
            },
        },
        {
            resource: 'customer_summary',
            beforeGetList: async params => {
                return applyFullTextSearch(['business_name', 'contact_person'])(
                    params
                );
            },
        },
        {
            resource: 'organizations',
            beforeGetList: async params => {
                // Apply full text search first
                let processedParams = applyFullTextSearch([
                    'name',
                    'accountManager',
                    'address',
                    'city',
                    'state',
                    'phone',
                    'website',
                    'notes',
                ])(params);

                return processedParams;
            },
            beforeCreate: async params => {
                const { data: user } = await supabase.auth.getUser();
                return {
                    ...params,
                    data: {
                        ...params.data,
                        createdBy: user?.user?.id,
                        createdAt: new Date().toISOString(),
                    },
                };
            },
        },
        {
            resource: 'contacts',
            beforeGetList: async params => {
                // Apply full text search first
                let processedParams = applyFullTextSearch([
                    'firstName',
                    'lastName',
                    'email',
                    'phone',
                    'notes',
                ])(params);

                return processedParams;
            },
            beforeCreate: async params => {
                const { data: user } = await supabase.auth.getUser();

                // Handle primary contact designation
                if (params.data.isPrimary && params.data.organizationId) {
                    // Unset any existing primary contact for this organization
                    await supabase
                        .from('contacts')
                        .update({ isPrimary: false })
                        .eq('organizationId', params.data.organizationId)
                        .eq('isPrimary', true);
                }

                return {
                    ...params,
                    data: {
                        ...params.data,
                        createdBy: user?.user?.id,
                        createdAt: new Date().toISOString(),
                    },
                };
            },
            beforeUpdate: async params => {
                // Handle primary contact designation
                if (params.data.isPrimary && params.data.organizationId) {
                    // Unset any existing primary contact for this organization (except current record)
                    await supabase
                        .from('contacts')
                        .update({ isPrimary: false })
                        .eq('organizationId', params.data.organizationId)
                        .eq('isPrimary', true)
                        .neq('id', params.id);
                }

                return params;
            },
        },
        {
            resource: 'settings',
            beforeGetList: async params => {
                return applyFullTextSearch(['label', 'key', 'category'])(
                    params
                );
            },
        },
        {
            resource: 'visits',
            beforeCreate: async params => {
                const processedParams = await processVisitLocation(params);
                const { data: user } = await supabase.auth.getUser();

                return {
                    ...processedParams,
                    data: {
                        ...processedParams.data,
                        broker_id: user?.user?.id,
                        visit_date:
                            processedParams.data.visit_date ||
                            new Date().toISOString(),
                    },
                };
            },
            beforeUpdate: async params => {
                return (await processVisitLocation(
                    params
                )) as UpdateParams<Visit>;
            },
            beforeGetList: async params => {
                return applyFullTextSearch(['notes', 'visit_type'])(params);
            },
        },
        {
            resource: 'reminders',
            beforeCreate: async params => {
                const { data: user } = await supabase.auth.getUser();

                return {
                    ...params,
                    data: {
                        ...params.data,
                        broker_id: user?.user?.id,
                    },
                };
            },
            beforeGetList: async params => {
                return applyFullTextSearch(['title', 'notes'])(params);
            },
        },
        {
            resource: 'products',
            beforeGetList: async params => {
                return applyFullTextSearch([
                    'name',
                    'category',
                    'subcategory',
                    'description',
                    'sku',
                ])(params);
            },
        },
        {
            resource: 'orders',
            beforeCreate: async params => {
                const { data: user } = await supabase.auth.getUser();

                return {
                    ...params,
                    data: {
                        ...params.data,
                        broker_id: user?.user?.id,
                        order_date:
                            params.data.order_date || new Date().toISOString(),
                    },
                };
            },
            beforeGetList: async params => {
                return applyFullTextSearch(['notes', 'internal_notes'])(params);
            },
        },
        {
            resource: 'interactions',
            beforeGetList: async params => {
                // Apply full text search first
                let processedParams = applyFullTextSearch([
                    'subject',
                    'description',
                    'outcome',
                    'followUpNotes',
                    'locationNotes',
                ])(params);

                return processedParams;
            },
            beforeCreate: async params => {
                const processedParams = await processInteractionLocation(
                    params,
                    true
                );
                const { data: user } = await supabase.auth.getUser();

                return {
                    ...processedParams,
                    data: {
                        ...processedParams.data,
                        createdBy: user?.user?.id,
                        createdAt: new Date().toISOString(),
                        isCompleted: processedParams.data.isCompleted || false,
                        followUpRequired:
                            processedParams.data.followUpRequired || false,
                    },
                };
            },
            beforeUpdate: async params => {
                // Handle completion logic
                if (params.data.isCompleted && !params.data.completedDate) {
                    return {
                        ...params,
                        data: {
                            ...params.data,
                            completedDate: new Date().toISOString(),
                        },
                    };
                }

                return params;
            },
        },
        {
            resource: 'deals',
            beforeGetList: async params => {
                // Apply full text search first
                let processedParams = applyFullTextSearch([
                    'name',
                    'description',
                    'notes',
                    'stage',
                ])(params);

                return processedParams;
            },
            beforeCreate: async params => {
                const { data: user } = await supabase.auth.getUser();

                return {
                    ...params,
                    data: {
                        ...params.data,
                        createdBy: user?.user?.id,
                        createdAt: new Date().toISOString(),
                        stage: params.data.stage || 'lead_discovery',
                        status: params.data.status || 'active',
                        probability: params.data.probability || 0,
                        amount: params.data.amount || 0,
                        index: params.data.index || 0,
                    },
                };
            },
            beforeUpdate: async params => {
                // Handle archiving logic for won/lost deals
                if (
                    (params.data.status === 'won' ||
                        params.data.status === 'lost') &&
                    !params.data.archivedAt
                ) {
                    return {
                        ...params,
                        data: {
                            ...params.data,
                            archivedAt: new Date().toISOString(),
                        },
                    };
                }

                return params;
            },
        },
        {
            resource: 'users',
            beforeGetList: async params => {
                return applyFullTextSearch([
                    'firstName',
                    'lastName',
                    'email',
                    'role',
                ])(params);
            },
            beforeCreate: async params => {
                const { data: currentUser } = await supabase.auth.getUser();

                // Log user creation attempt
                await logAuditEvent(
                    'users.create_attempt',
                    {
                        createdBy: currentUser?.user?.id,
                        newUserEmail: params.data.email,
                        newUserRole: params.data.administrator
                            ? 'admin'
                            : 'broker',
                    },
                    {
                        userId: currentUser?.user?.id,
                        outcome: 'success',
                        message: 'User creation initiated',
                    }
                );

                return params;
            },
            beforeUpdate: async params => {
                const { data: currentUser } = await supabase.auth.getUser();

                // Log user update attempt
                await logAuditEvent(
                    'users.update_attempt',
                    {
                        updatedBy: currentUser?.user?.id,
                        targetUserId: params.id,
                        changes: Object.keys(params.data),
                    },
                    {
                        userId: currentUser?.user?.id,
                        outcome: 'success',
                        message: 'User update initiated',
                    }
                );

                return params;
            },
            beforeDelete: async params => {
                const { data: currentUser } = await supabase.auth.getUser();

                // Log user deletion attempt
                await logAuditEvent(
                    'users.delete_attempt',
                    {
                        deletedBy: currentUser?.user?.id,
                        targetUserId: params.id,
                    },
                    {
                        userId: currentUser?.user?.id,
                        outcome: 'warning',
                        severity: 'high',
                        message: 'User deletion initiated',
                    }
                );

                return params;
            },
        },
    ]
);

const applyFullTextSearch = (columns: string[]) => (params: GetListParams) => {
    if (!params.filter?.q) {
        return params;
    }
    const { q, ...filter } = params.filter;
    return {
        ...params,
        filter: {
            ...filter,
            '@or': columns.reduce((acc, column) => {
                return {
                    ...acc,
                    [`${column}@ilike`]: `%${q}%`,
                };
            }, {}),
        },
    };
};

const uploadToBucket = async (fi: RAFile) => {
    if (!fi.src.startsWith('blob:') && !fi.src.startsWith('data:')) {
        // Sign URL check if path exists in the bucket
        if (fi.path) {
            const { error } = await supabase.storage
                .from('attachments')
                .createSignedUrl(fi.path, 60);

            if (!error) {
                return;
            }
        }
    }

    const dataContent = fi.src
        ? await fetch(fi.src).then(res => res.blob())
        : fi.rawFile;

    const file = fi.rawFile;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;
    const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, dataContent);

    if (uploadError) {
        console.error('uploadError', uploadError);
        throw new Error('Failed to upload attachment');
    }

    const { data } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);

    fi.path = filePath;
    fi.src = data.publicUrl;

    // save MIME type
    const mimeType = file.type;
    fi.type = mimeType;

    return fi;
};
