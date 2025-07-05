// src/providers/supabase/organizationExtensions.ts
/**
 * Supabase Data Provider Extensions for Organizations
 * Adds mobile-optimized organization management with GPS, search, and territory features
 */

import { DataProvider, Identifier } from 'react-admin';
import { GPSCoordinates, Organization } from '../../types';
import { logAuditEvent } from '../../utils/auditLogging';
import { supabase } from './supabase';

// Organization search result interface
export interface OrganizationSearchResult extends Organization {
    distance?: number; // Distance in kilometers for proximity searches
    matchScore?: number; // Search relevance score (0-1)
    matchReasons?: string[]; // What fields matched the search
}

// Territory boundary interface
export interface TerritoryBoundary {
    id: string;
    name: string;
    userId: string;
    boundaries: {
        type: 'polygon' | 'circle';
        coordinates: number[][];
        center?: { lat: number; lng: number };
        radius?: number; // in kilometers for circle type
    };
    organizationCount?: number;
}

// Organization analytics interface
export interface OrganizationAnalytics {
    organizationId: number;
    engagementScore: number; // 0-100 score based on interaction frequency
    lastInteractionDate?: string;
    interactionCount: number;
    interactionTrend: 'increasing' | 'decreasing' | 'stable';
    pipelineHealth: {
        activeDeals: number;
        totalValue: number;
        averageCloseRate: number;
        daysToClose: number;
    };
    riskFactors: string[];
    opportunities: string[];
}

// Bulk import result interface
export interface BulkImportResult {
    success: boolean;
    processed: number;
    created: number;
    updated: number;
    skipped: number;
    errors: Array<{
        row: number;
        field: string;
        message: string;
        data: any;
    }>;
    duplicates: Array<{
        row: number;
        existingId: number;
        reason: string;
    }>;
}

// Organization summary interface
export interface OrganizationSummary extends Organization {
    contactCount: number;
    primaryContact?: {
        id: number;
        name: string;
        email?: string;
        phone?: string;
    };
    recentInteractions: Array<{
        id: number;
        type: string;
        subject: string;
        date: string;
        outcome?: string;
    }>;
    activeDeals: Array<{
        id: number;
        name: string;
        stage: string;
        probability: number;
        amount: number;
    }>;
    analytics: OrganizationAnalytics;
}

/**
 * Advanced organization search with full-text search and ranking
 */
export const searchOrganizations = async (
    dataProvider: DataProvider,
    query: string,
    options: {
        limit?: number;
        includeInactive?: boolean;
        filters?: Record<string, any>;
        location?: GPSCoordinates;
        radiusKm?: number;
        sortBy?: 'relevance' | 'distance' | 'name' | 'lastActivity';
    } = {}
): Promise<{ data: OrganizationSearchResult[]; total: number }> => {
    try {
        // Build the search query
        let searchQuery = supabase.from('organizations').select(`
                *,
                priority:settings!priorityId(id, label, color),
                segment:settings!segmentId(id, label, color),
                distributor:settings!distributorId(id, label, color)
            `);

        // Apply full-text search if query provided
        if (query.trim()) {
            // Use PostgreSQL full-text search with ranking
            searchQuery = searchQuery.or(`
                name.ilike.%${query}%,
                address.ilike.%${query}%,
                city.ilike.%${query}%,
                notes.ilike.%${query}%,
                phone.ilike.%${query}%,
                website.ilike.%${query}%
            `);
        }

        // Apply filters
        if (options.filters) {
            Object.entries(options.filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchQuery = searchQuery.eq(key, value);
                }
            });
        }

        // Apply proximity filter if location provided
        if (options.location && options.radiusKm) {
            // Using PostGIS for radius search (assuming PostGIS extension is enabled)
            const radiusMeters = options.radiusKm * 1000;
            searchQuery = searchQuery
                .not('latitude', 'is', null)
                .not('longitude', 'is', null);
            // Note: This would need PostGIS function in production
            // For now, we'll filter after retrieval
        }

        // Apply ordering
        switch (options.sortBy) {
            case 'name':
                searchQuery = searchQuery.order('name');
                break;
            case 'lastActivity':
                searchQuery = searchQuery.order('updatedAt', {
                    ascending: false,
                });
                break;
            default:
                searchQuery = searchQuery.order('name');
        }

        // Apply limit
        const limit = options.limit || 50;
        searchQuery = searchQuery.limit(limit);

        const { data, error, count } = await searchQuery;

        if (error) {
            throw new Error(`Organization search failed: ${error.message}`);
        }

        // Post-process results for proximity and ranking
        let results: OrganizationSearchResult[] = (data || []).map(org => {
            const result: OrganizationSearchResult = { ...org };

            // Calculate distance if location provided
            if (options.location && org.latitude && org.longitude) {
                result.distance = calculateDistance(
                    options.location.latitude,
                    options.location.longitude,
                    org.latitude,
                    org.longitude
                );
            }

            // Calculate match score
            if (query.trim()) {
                result.matchScore = calculateMatchScore(org, query);
                result.matchReasons = getMatchReasons(org, query);
            }

            return result;
        });

        // Filter by radius if needed (client-side for now)
        if (options.location && options.radiusKm) {
            results = results.filter(
                org =>
                    org.distance !== undefined &&
                    org.distance <= options.radiusKm!
            );
        }

        // Sort by distance if proximity search
        if (options.location && options.sortBy === 'distance') {
            results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }

        // Sort by relevance if text search
        if (query.trim() && options.sortBy === 'relevance') {
            results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        }

        // Log audit event
        await logAuditEvent(
            'data.read',
            {
                resource: 'organizations',
                action: 'search',
                query: query,
                resultCount: results.length,
                filters: options.filters,
                location: options.location ? 'proximity_search' : 'text_search',
            },
            {
                outcome: 'success',
                message: `Organization search completed: ${results.length} results`,
            }
        );

        return {
            data: results,
            total: count || results.length,
        };
    } catch (error: any) {
        // Log audit event for failure
        await logAuditEvent(
            'data.read',
            {
                resource: 'organizations',
                action: 'search_failed',
                query: query,
                error: error.message,
            },
            {
                outcome: 'failure',
                message: 'Organization search failed',
            }
        );

        throw error;
    }
};

/**
 * Find nearby organizations using GPS coordinates
 */
export const findNearbyOrganizations = async (
    dataProvider: DataProvider,
    location: GPSCoordinates,
    radiusKm: number = 10,
    options: {
        limit?: number;
        includeDistance?: boolean;
        sortByDistance?: boolean;
        filters?: Record<string, any>;
    } = {}
): Promise<{ data: OrganizationSearchResult[]; total: number }> => {
    return searchOrganizations(dataProvider, '', {
        location,
        radiusKm,
        sortBy: options.sortByDistance ? 'distance' : 'name',
        limit: options.limit,
        filters: options.filters,
    });
};

/**
 * Get organizations within a user's territory
 */
export const getTerritoryOrganizations = async (
    dataProvider: DataProvider,
    userId: string,
    territory?: TerritoryBoundary,
    options: {
        limit?: number;
        includeInactive?: boolean;
        filters?: Record<string, any>;
    } = {}
): Promise<{ data: Organization[]; total: number }> => {
    // For now, implement basic territory logic
    // In production, this would use PostGIS geometric queries

    if (!territory) {
        // Get all organizations assigned to user
        const result = await dataProvider.getList('organizations', {
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'name', order: 'ASC' },
            filter: { accountManager: userId },
        });

        return {
            data: result.data,
            total: result.total ?? 0,
        };
    }

    // Get organizations within territory boundaries
    let query = supabase
        .from('organizations')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

    if (territory.boundaries.type === 'circle' && territory.boundaries.center) {
        // Simple circle-based territory (would use PostGIS in production)
        const { lat, lng } = territory.boundaries.center;
        const radiusKm = territory.boundaries.radius || 50;

        // This is a simplified implementation
        // Production would use: ST_DWithin(ST_Point(longitude, latitude), ST_Point(lng, lat), radius)
        query = query
            .gte('latitude', lat - radiusKm * 0.009)
            .lte('latitude', lat + radiusKm * 0.009)
            .gte('longitude', lng - radiusKm * 0.009)
            .lte('longitude', lng + radiusKm * 0.009);
    }

    const { data, error } = await query.order('name');

    if (error) {
        throw new Error(
            `Territory organizations query failed: ${error.message}`
        );
    }

    return {
        data: data || [],
        total: data?.length || 0,
    };
};

/**
 * Import organizations from CSV data
 */
export const importOrganizationsFromCSV = async (
    dataProvider: DataProvider,
    csvData: any[],
    options: {
        skipDuplicates?: boolean;
        updateExisting?: boolean;
        validateAddresses?: boolean;
        userId: string;
    }
): Promise<BulkImportResult> => {
    const result: BulkImportResult = {
        success: false,
        processed: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        errors: [],
        duplicates: [],
    };

    for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        result.processed++;

        try {
            // Validate required fields
            if (!row.name || !row.name.trim()) {
                result.errors.push({
                    row: i + 1,
                    field: 'name',
                    message: 'Organization name is required',
                    data: row,
                });
                continue;
            }

            // Check for duplicates
            const existingOrg = await findDuplicateOrganization(row);
            if (existingOrg) {
                if (options.skipDuplicates) {
                    result.duplicates.push({
                        row: i + 1,
                        existingId: existingOrg.id,
                        reason: 'Name and address match existing organization',
                    });
                    result.skipped++;
                    continue;
                } else if (options.updateExisting) {
                    // Update existing organization
                    await dataProvider.update('organizations', {
                        id: existingOrg.id,
                        data: {
                            ...row,
                            updatedAt: new Date().toISOString(),
                        },
                        previousData: existingOrg,
                    });
                    result.updated++;
                    continue;
                }
            }

            // Geocode address if validation enabled
            if (options.validateAddresses && row.address) {
                try {
                    const coordinates = await geocodeAddress(
                        `${row.address}, ${row.city || ''}, ${row.state || ''} ${row.zipCode || ''}`
                    );
                    row.latitude = coordinates.latitude;
                    row.longitude = coordinates.longitude;
                } catch (geocodeError) {
                    // Log but don't fail import
                    console.warn(
                        `Geocoding failed for row ${i + 1}:`,
                        geocodeError
                    );
                }
            }

            // Create new organization
            await dataProvider.create('organizations', {
                data: {
                    ...row,
                    createdBy: options.userId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            });

            result.created++;
        } catch (error: any) {
            result.errors.push({
                row: i + 1,
                field: 'general',
                message: error.message,
                data: row,
            });
        }
    }

    result.success = result.errors.length === 0;

    // Log audit event
    await logAuditEvent(
        'data.import',
        {
            resource: 'organizations',
            totalRows: csvData.length,
            processed: result.processed,
            created: result.created,
            updated: result.updated,
            errors: result.errors.length,
            duplicates: result.duplicates.length,
        },
        {
            outcome: result.success ? 'success' : 'warning',
            message: `CSV import completed: ${result.created} created, ${result.updated} updated, ${result.errors.length} errors`,
        }
    );

    return result;
};

/**
 * Get comprehensive organization summary for dashboard
 */
export const getOrganizationSummary = async (
    dataProvider: DataProvider,
    organizationId: Identifier
): Promise<OrganizationSummary> => {
    // Get organization with relationships
    const orgResult = await dataProvider.getOne('organizations', {
        id: organizationId,
    });

    const organization = orgResult.data;

    // Get contacts count and primary contact
    const contactsResult = await dataProvider.getList('contacts', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'isPrimary', order: 'DESC' },
        filter: { organizationId },
    });

    const contacts = contactsResult.data || [];
    const primaryContact = contacts.find(c => c.isPrimary);

    // Get recent interactions
    const interactionsResult = await dataProvider.getList('interactions', {
        pagination: { page: 1, perPage: 5 },
        sort: { field: 'scheduledDate', order: 'DESC' },
        filter: { organizationId },
    });

    // Calculate analytics
    const analytics = await calculateOrganizationAnalytics(
        organizationId,
        interactionsResult.data || [],
        []
    );

    const summary: OrganizationSummary = {
        ...organization,
        contactCount: contacts.length,
        primaryContact: primaryContact
            ? {
                id: primaryContact.id,
                name: `${primaryContact.firstName} ${primaryContact.lastName}`,
                email: primaryContact.email,
                phone: primaryContact.phone,
            }
            : undefined,
        recentInteractions: (interactionsResult.data || []).map(
            interaction => ({
                id: interaction.id,
                type: interaction.typeId ? 'Unknown' : interaction.typeId, // Would lookup type label
                subject: interaction.subject,
                date: interaction.scheduledDate || interaction.createdAt,
                outcome: interaction.outcome,
            })
        ),
        activeDeals: [],
        analytics,
    };

    return summary;
};

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 */
const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Calculate search match score based on query relevance
 */
const calculateMatchScore = (org: Organization, query: string): number => {
    const queryLower = query.toLowerCase();
    let score = 0;

    // Exact name match gets highest score
    if (org.name.toLowerCase() === queryLower) return 1.0;

    // Name starts with query gets high score
    if (org.name.toLowerCase().startsWith(queryLower)) score += 0.8;

    // Name contains query gets medium score
    if (org.name.toLowerCase().includes(queryLower)) score += 0.6;

    // Address matches get lower scores
    if (org.address?.toLowerCase().includes(queryLower)) score += 0.3;
    if (org.city?.toLowerCase().includes(queryLower)) score += 0.3;

    // Phone or website matches
    if (org.phone?.includes(query)) score += 0.4;
    if (org.website?.toLowerCase().includes(queryLower)) score += 0.3;

    // Notes match gets lowest score
    if (org.notes?.toLowerCase().includes(queryLower)) score += 0.2;

    return Math.min(score, 1.0);
};

/**
 * Get reasons why organization matched search
 */
const getMatchReasons = (org: Organization, query: string): string[] => {
    const queryLower = query.toLowerCase();
    const reasons: string[] = [];

    if (org.name.toLowerCase().includes(queryLower)) {
        reasons.push('Organization name');
    }
    if (org.address?.toLowerCase().includes(queryLower)) {
        reasons.push('Address');
    }
    if (org.city?.toLowerCase().includes(queryLower)) {
        reasons.push('City');
    }
    if (org.phone?.includes(query)) {
        reasons.push('Phone number');
    }
    if (org.website?.toLowerCase().includes(queryLower)) {
        reasons.push('Website');
    }
    if (org.notes?.toLowerCase().includes(queryLower)) {
        reasons.push('Notes');
    }

    return reasons;
};

/**
 * Find duplicate organization based on name and address similarity
 */
const findDuplicateOrganization = async (
    row: any
): Promise<Organization | null> => {
    if (!row.name) return null;

    const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .ilike('name', `%${row.name.trim()}%`)
        .limit(10);

    if (error || !data) return null;

    // Simple duplicate detection - in production would use fuzzy matching
    for (const org of data) {
        const nameMatch =
            org.name.toLowerCase().trim() === row.name.toLowerCase().trim();
        const addressMatch =
            org.address &&
            row.address &&
            org.address
                .toLowerCase()
                .includes(row.address.toLowerCase().substring(0, 20));

        if (nameMatch && (addressMatch || !row.address)) {
            return org;
        }
    }

    return null;
};

/**
 * Geocode address to GPS coordinates (mock implementation)
 */
const geocodeAddress = async (
    address: string
): Promise<{ latitude: number; longitude: number }> => {
    // This would integrate with Google Maps Geocoding API in production
    // For now, return mock coordinates
    throw new Error('Geocoding service not implemented yet');
};

/**
 * Calculate organization analytics
 */
const calculateOrganizationAnalytics = async (
    organizationId: Identifier,
    interactions: any[],
    deals: any[]
): Promise<OrganizationAnalytics> => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Calculate interaction trends
    const recentInteractions = interactions.filter(
        i => new Date(i.scheduledDate || i.createdAt) >= thirtyDaysAgo
    );
    const previousInteractions = interactions.filter(i => {
        const date = new Date(i.scheduledDate || i.createdAt);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    });

    let interactionTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentInteractions.length > previousInteractions.length * 1.2) {
        interactionTrend = 'increasing';
    } else if (recentInteractions.length < previousInteractions.length * 0.8) {
        interactionTrend = 'decreasing';
    }

    // Calculate engagement score (0-100)
    const daysSinceLastInteraction =
        interactions.length > 0
            ? Math.floor(
                (now.getTime() -
                    new Date(
                        interactions[0].scheduledDate ||
                        interactions[0].createdAt
                    ).getTime()) /
                (1000 * 60 * 60 * 24)
            )
            : 365;

    let engagementScore = Math.max(0, 100 - daysSinceLastInteraction * 2);
    engagementScore += Math.min(30, interactions.length * 2); // Bonus for interaction count
    engagementScore = Math.min(100, engagementScore);

    // Calculate pipeline health
    const activeDeals = deals.filter(d => d.status === 'active');
    const totalValue = activeDeals.reduce(
        (sum, deal) => sum + (deal.amount || 0),
        0
    );
    const averageCloseRate =
        activeDeals.length > 0
            ? activeDeals.reduce(
                (sum, deal) => sum + (deal.probability || 0),
                0
            ) / activeDeals.length
            : 0;

    // Identify risk factors
    const riskFactors: string[] = [];
    if (daysSinceLastInteraction > 30)
        riskFactors.push('No recent interactions');
    if (activeDeals.length === 0) riskFactors.push('No active deals');
    if (averageCloseRate < 25) riskFactors.push('Low deal probability');
    if (interactionTrend === 'decreasing')
        riskFactors.push('Declining engagement');

    // Identify opportunities
    const opportunities: string[] = [];
    if (interactionTrend === 'increasing')
        opportunities.push('Increasing engagement');
    if (averageCloseRate > 75) opportunities.push('High probability deals');
    if (totalValue > 50000) opportunities.push('High value pipeline');
    if (interactions.filter(i => i.outcome === 'positive').length > 3) {
        opportunities.push('Positive interaction history');
    }

    return {
        organizationId: Number(organizationId),
        engagementScore,
        lastInteractionDate:
            interactions[0]?.scheduledDate || interactions[0]?.createdAt,
        interactionCount: interactions.length,
        interactionTrend,
        pipelineHealth: {
            activeDeals: activeDeals.length,
            totalValue,
            averageCloseRate,
            daysToClose: 30, // Would calculate from historical data
        },
        riskFactors,
        opportunities,
    };
};

/**
 * Calculate engagement score with detailed factors
 */
export const calculateDetailedEngagementScore = async (
    organizationId: Identifier
): Promise<{
    score: number;
    riskLevel: 'low' | 'medium' | 'high';
    trend: 'improving' | 'declining' | 'stable';
    factors: {
        daysSinceLastInteraction: number;
        recentInteractionCount: number;
        positiveOutcomes: number;
        totalInteractions: number;
    };
    lastInteractionDate?: string;
}> => {
    const { data: interactions } = await supabase
        .from('interactions')
        .select('*')
        .eq('organizationId', organizationId)
        .order('scheduledDate', { ascending: false })
        .limit(50);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const lastInteraction = interactions?.[0];
    const daysSinceLastInteraction = lastInteraction
        ? Math.floor(
            (now.getTime() -
                new Date(
                    lastInteraction.scheduledDate || lastInteraction.createdAt
                ).getTime()) /
            (1000 * 60 * 60 * 24)
        )
        : 365;

    // Base score calculation
    let score = Math.max(0, 100 - daysSinceLastInteraction * 2);

    // Activity bonus
    const recentInteractions = (interactions || []).filter(
        i => new Date(i.scheduledDate || i.createdAt) >= thirtyDaysAgo
    );
    const previousInteractions = (interactions || []).filter(i => {
        const date = new Date(i.scheduledDate || i.createdAt);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    });

    score += Math.min(20, recentInteractions.length * 5);

    // Quality bonus
    const positiveOutcomes = (interactions || []).filter(
        i => i.outcome === 'positive'
    ).length;
    score += Math.min(10, positiveOutcomes * 2);

    score = Math.min(100, score);

    // Determine trend
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentInteractions.length > previousInteractions.length * 1.2) {
        trend = 'improving';
    } else if (recentInteractions.length < previousInteractions.length * 0.8) {
        trend = 'declining';
    }

    // Risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (score < 30) riskLevel = 'high';
    else if (score < 60) riskLevel = 'medium';

    return {
        score,
        riskLevel,
        trend,
        factors: {
            daysSinceLastInteraction,
            recentInteractionCount: recentInteractions.length,
            positiveOutcomes,
            totalInteractions: interactions?.length || 0,
        },
        lastInteractionDate:
            lastInteraction?.scheduledDate || lastInteraction?.createdAt,
    };
};

/**
 * Calculate risk assessment for organization
 */
export const calculateOrganizationRisk = async (
    organizationId: Identifier
): Promise<{
    level: 'low' | 'medium' | 'high';
    score: number;
    factors: string[];
    recommendations: string[];
}> => {
    const [engagementData, { count: contactCount }] =
        await Promise.all([
            calculateDetailedEngagementScore(organizationId),
            supabase
                .from('contacts')
                .select('*', { count: 'exact', head: true })
                .eq('organizationId', organizationId),
        ]);

    let riskScore = 0;
    const factors: string[] = [];
    const recommendations: string[] = [];

    // Time-based risk factors
    if (engagementData.factors.daysSinceLastInteraction > 60) {
        riskScore += 40;
        factors.push('No contact in 60+ days');
        recommendations.push('Schedule immediate follow-up call');
    } else if (engagementData.factors.daysSinceLastInteraction > 30) {
        riskScore += 20;
        factors.push('No recent contact');
        recommendations.push('Plan outreach within 7 days');
    }

    // Engagement trend risk
    if (engagementData.trend === 'declining') {
        riskScore += 25;
        factors.push('Declining engagement');
        recommendations.push('Investigate engagement issues');
    }

    // Contact coverage risk
    if ((contactCount || 0) < 2) {
        riskScore += 10;
        factors.push('Limited contact coverage');
        recommendations.push('Expand contact network within organization');
    }

    let level: 'low' | 'medium' | 'high' = 'low';
    if (riskScore >= 60) level = 'high';
    else if (riskScore >= 30) level = 'medium';

    return {
        level,
        score: riskScore,
        factors,
        recommendations,
    };
};

/**
 * Calculate advanced opportunity score for organization
 */
export const calculateAdvancedOpportunityScore = async (
    organizationId: Identifier
): Promise<{
    score: number;
    factors: string[];
    actions: string[];
    potentialValue: number;
    confidence: 'low' | 'medium' | 'high';
    nextBestAction: string;
}> => {
    const [engagementData, { count: contactCount }] =
        await Promise.all([
            calculateDetailedEngagementScore(organizationId),
            supabase
                .from('contacts')
                .select('*', { count: 'exact', head: true })
                .eq('organizationId', organizationId),
        ]);

    let score = 0;
    const factors: string[] = [];
    const actions: string[] = [];

    // Engagement factors
    if (engagementData.score > 80) {
        score += 30;
        factors.push('High engagement score');
    }

    if (engagementData.trend === 'improving') {
        score += 25;
        factors.push('Increasing engagement trend');
        actions.push('Capitalize on momentum with proposal');
    }

    // Pipeline factors
    const activeDeals = [];
    const avgCloseRate = 0;
    const totalValue = 0;

    if (engagementData.score > 70) {
        score += 30;
        factors.push('High-probability deals in pipeline');
        actions.push('Focus on deal acceleration');
    }

    if (totalValue > 100000) {
        score += 20;
        factors.push('High-value pipeline');
        actions.push('Ensure executive sponsorship');
    }

    // Relationship factors
    if ((contactCount || 0) > 3) {
        score += 15;
        factors.push('Strong contact network');
        actions.push('Leverage champions for expansion');
    }

    // Historical success factors
    if (engagementData.factors.positiveOutcomes > 2) {
        score += 10;
        factors.push('Positive interaction history');
    }

    // Calculate potential value
    const potentialValue = totalValue * (avgCloseRate / 100);

    let nextBestAction = 'Schedule discovery call';
    if (score > 70) nextBestAction = 'Present proposal';
    else if (score > 50) nextBestAction = 'Develop business case';
    else if (score > 30) nextBestAction = 'Qualify opportunity';

    return {
        score: Math.min(100, score),
        factors,
        actions,
        potentialValue,
        confidence: score > 70 ? 'high' : score > 40 ? 'medium' : 'low',
        nextBestAction,
    };
};
