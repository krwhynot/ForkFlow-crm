import {
    Identifier,
    GetListParams,
    GetListResult,
    GetOneParams,
    GetOneResult,
    CreateParams,
    CreateResult,
    UpdateParams,
    UpdateResult,
    DeleteParams,
    DeleteResult,
} from 'react-admin';
import { Organization } from '../types';

export type { CrmDataProvider } from './supabase/dataProvider';

// Extended CrmDataProvider that includes Organization API methods
export interface ExtendedCrmDataProvider extends OrganizationApiProvider {
    // All the methods from the base CrmDataProvider will be inherited
}

// Organization API Interface
export interface OrganizationApiProvider {
    // Standard CRUD operations
    getOrganizations: (
        params?: GetListParams
    ) => Promise<GetListResult<Organization>>;
    getOrganization: (
        params: GetOneParams
    ) => Promise<GetOneResult<Organization>>;
    createOrganization: (
        params: CreateParams<Organization>
    ) => Promise<CreateResult<Organization>>;
    updateOrganization: (
        params: UpdateParams<Organization>
    ) => Promise<UpdateResult<Organization>>;
    deleteOrganization: (
        params: DeleteParams<Organization>
    ) => Promise<DeleteResult<Organization>>;

    // Enhanced search functionality
    searchOrganizations: (
        query: string,
        options?: {
            limit?: number;
            offset?: number;
            filters?: OrganizationSearchFilters;
        }
    ) => Promise<GetListResult<Organization>>;

    // Geography-based operations
    findNearbyOrganizations: (
        latitude: number,
        longitude: number,
        radiusKm?: number
    ) => Promise<Organization[]>;

    // Computed fields operations
    calculateOrganizationStats: (
        organizationId: Identifier
    ) => Promise<OrganizationStats>;

    // Bulk operations
    bulkUpdateOrganizations: (
        ids: Identifier[],
        data: Partial<Organization>
    ) => Promise<Organization[]>;
}

// Search and filter types
export interface OrganizationSearchFilters {
    priorityId?: Identifier;
    segmentId?: Identifier;
    distributorId?: Identifier;
    accountManager?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    hasContacts?: boolean;
    hasOpportunities?: boolean;
    lastContactDateBefore?: string;
    lastContactDateAfter?: string;
}

// Organization statistics
export interface OrganizationStats {
    contactCount: number;
    lastContactDate?: string;
    totalOpportunities: number;
    totalOpportunityValue: number;
    interactionCount: number;
    lastInteractionDate?: string;
    averageOpportunityValue: number;
    conversionRate: number;
}

// Validation rules
export interface OrganizationValidationRules {
    requiredFields: (keyof Organization)[];
    maxLengths: {
        name: number;
        notes: number;
        address: number;
        phone: number;
        website: number;
    };
    patterns: {
        phone: RegExp;
        email: RegExp;
        website: RegExp;
        zipCode: RegExp;
    };
    gpsCoordinateRanges: {
        latitude: { min: number; max: number };
        longitude: { min: number; max: number };
    };
}
