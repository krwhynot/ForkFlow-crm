// src/utils/territoryFilter.ts
import { GetListParams } from 'react-admin';
import { User, UserRole } from '../types';

export interface TerritoryBoundary {
    states?: string[];
    cities?: string[];
    zipCodes?: string[];
    coordinates?: {
        lat: number;
        lng: number;
        radiusKm: number;
    }[];
}

export interface TerritoryFilterOptions {
    user: User;
    resource: string;
    params: GetListParams;
}

/**
 * Apply territory-based filtering for broker users
 * Admins and managers see all data, brokers only see their territory
 */
export function applyTerritoryFilter(
    options: TerritoryFilterOptions
): GetListParams {
    const { user, resource, params } = options;

    // Admins and managers see all data
    if (user.role === 'admin' || user.role === 'manager') {
        return params;
    }

    // Brokers see only their territory
    if (user.role === 'broker') {
        return applyBrokerTerritoryFilter(user, resource, params);
    }

    return params;
}

/**
 * Apply territory filtering specifically for broker users
 */
function applyBrokerTerritoryFilter(
    user: User,
    resource: string,
    params: GetListParams
): GetListParams {
    const { filter = {} } = params;

    // If user has no territory defined, they see no data
    if (!user.territory || user.territory.length === 0) {
        return {
            ...params,
            filter: {
                ...filter,
                id: -1, // Force no results
            },
        };
    }

    // Territory filtering logic based on resource type
    const territoryFilter = buildTerritoryFilter(user.territory, resource);

    return {
        ...params,
        filter: {
            ...filter,
            ...territoryFilter,
        },
    };
}

/**
 * Build territory filter based on resource type
 */
function buildTerritoryFilter(
    territory: string[],
    resource: string
): Record<string, any> {
    const territoryFilter: Record<string, any> = {};

    // Parse territory configuration
    const states: string[] = [];
    const cities: string[] = [];
    const zipCodes: string[] = [];

    territory.forEach(area => {
        if (area.match(/^[A-Z]{2}$/)) {
            // State code (e.g., "CA", "NY")
            states.push(area);
        } else if (area.match(/^\d{5}(-\d{4})?$/)) {
            // ZIP code (e.g., "90210", "90210-1234")
            zipCodes.push(area.split('-')[0]); // Use 5-digit ZIP
        } else {
            // City name
            cities.push(area);
        }
    });

    // Apply appropriate filters based on resource
    switch (resource) {
        case 'organizations':
        case 'customers':
            if (states.length > 0) {
                territoryFilter['state@in'] = states;
            }
            if (cities.length > 0) {
                territoryFilter['city@in'] = cities;
            }
            if (zipCodes.length > 0) {
                territoryFilter['zipCode@in'] = zipCodes;
            }
            break;

        case 'contacts':
            // Filter contacts through their organization's territory
            if (states.length > 0 || cities.length > 0 || zipCodes.length > 0) {
                // This would require a JOIN query in production
                // For now, we'll apply a simplified filter
                territoryFilter['organization.state@in'] = states;
                territoryFilter['organization.city@in'] = cities;
                territoryFilter['organization.zipCode@in'] = zipCodes;
            }
            break;

        case 'interactions':
        case 'deals':
        case 'visits':
        case 'reminders':
            // Filter through organization relationship
            if (states.length > 0 || cities.length > 0 || zipCodes.length > 0) {
                territoryFilter['organization.state@in'] = states;
                territoryFilter['organization.city@in'] = cities;
                territoryFilter['organization.zipCode@in'] = zipCodes;
            }
            break;

        case 'users':
            // Only show users in same territory for brokers
            // This might be too restrictive - could be adjusted based on business rules
            if (territory.length > 0) {
                territoryFilter['territory@overlap'] = territory;
            }
            break;

        default:
            // For other resources, no territory filtering
            break;
    }

    return territoryFilter;
}

/**
 * Check if user can access a specific record based on territory
 */
export function canAccessRecord(
    user: User,
    record: any,
    resourceType: string
): boolean {
    // Admins and managers can access all records
    if (user.role === 'admin' || user.role === 'manager') {
        return true;
    }

    // Brokers need territory validation
    if (user.role === 'broker') {
        return isRecordInTerritory(user.territory || [], record, resourceType);
    }

    return false;
}

/**
 * Check if a record is within the user's territory
 */
function isRecordInTerritory(
    territory: string[],
    record: any,
    resourceType: string
): boolean {
    if (territory.length === 0) {
        return false;
    }

    // Extract location data from record
    let state: string | undefined;
    let city: string | undefined;
    let zipCode: string | undefined;

    switch (resourceType) {
        case 'organizations':
        case 'customers':
            state = record.state;
            city = record.city;
            zipCode = record.zipCode;
            break;

        case 'contacts':
            // Check through organization
            state = record.organization?.state;
            city = record.organization?.city;
            zipCode = record.organization?.zipCode;
            break;

        case 'interactions':
        case 'deals':
        case 'visits':
        case 'reminders':
            // Check through organization relationship
            state = record.organization?.state;
            city = record.organization?.city;
            zipCode = record.organization?.zipCode;
            break;

        default:
            return true; // Allow access to other resource types
    }

    // Check if record location matches any territory area
    return territory.some(area => {
        if (area.match(/^[A-Z]{2}$/)) {
            // State match
            return state === area;
        } else if (area.match(/^\d{5}(-\d{4})?$/)) {
            // ZIP code match (5-digit comparison)
            const territoryZip = area.split('-')[0];
            const recordZip = zipCode?.split('-')[0];
            return recordZip === territoryZip;
        } else {
            // City match (case-insensitive)
            return city?.toLowerCase() === area.toLowerCase();
        }
    });
}

/**
 * Get territory display name for UI
 */
export function getTerritoryDisplayName(territory: string[]): string {
    if (territory.length === 0) {
        return 'No Territory Assigned';
    }

    if (territory.length === 1) {
        return territory[0];
    }

    if (territory.length <= 3) {
        return territory.join(', ');
    }

    return `${territory.slice(0, 2).join(', ')} +${territory.length - 2} more`;
}

/**
 * Validate territory configuration
 */
export function validateTerritory(territory: string[]): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    territory.forEach((area, index) => {
        if (!area || area.trim().length === 0) {
            errors.push(`Territory area ${index + 1} is empty`);
        } else if (
            !area.match(/^[A-Z]{2}$/) && // State code
            !area.match(/^\d{5}(-\d{4})?$/) && // ZIP code
            !area.match(/^[a-zA-Z\s'-]+$/) // City name
        ) {
            errors.push(`Territory area "${area}" has invalid format`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Parse territory string into structured format
 */
export function parseTerritory(territoryString: string): {
    states: string[];
    cities: string[];
    zipCodes: string[];
} {
    const areas = territoryString
        .split(',')
        .map(area => area.trim())
        .filter(area => area.length > 0);

    const states: string[] = [];
    const cities: string[] = [];
    const zipCodes: string[] = [];

    areas.forEach(area => {
        if (area.match(/^[A-Z]{2}$/)) {
            states.push(area);
        } else if (area.match(/^\d{5}(-\d{4})?$/)) {
            zipCodes.push(area);
        } else {
            cities.push(area);
        }
    });

    return { states, cities, zipCodes };
}
