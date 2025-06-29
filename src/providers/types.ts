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
import { Organization, Interaction } from '../types';

export type { CrmDataProvider } from './supabase/dataProvider';

// Extended CrmDataProvider that includes Organization and Interaction API methods
export interface ExtendedCrmDataProvider extends OrganizationApiProvider, InteractionApiProvider {
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

// Interaction API Interface
export interface InteractionApiProvider {
    // Standard CRUD operations
    getInteractions: (
        params?: GetListParams
    ) => Promise<GetListResult<Interaction>>;
    getInteraction: (
        params: GetOneParams
    ) => Promise<GetOneResult<Interaction>>;
    createInteraction: (
        params: CreateParams<Interaction>
    ) => Promise<CreateResult<Interaction>>;
    updateInteraction: (
        params: UpdateParams<Interaction>
    ) => Promise<UpdateResult<Interaction>>;
    deleteInteraction: (
        params: DeleteParams<Interaction>
    ) => Promise<DeleteResult<Interaction>>;

    // Relationship-based operations
    getOrganizationInteractions: (
        organizationId: Identifier,
        params?: GetListParams
    ) => Promise<GetListResult<Interaction>>;
    getContactInteractions: (
        contactId: Identifier,
        params?: GetListParams
    ) => Promise<GetListResult<Interaction>>;
    getOpportunityInteractions: (
        opportunityId: Identifier,
        params?: GetListParams
    ) => Promise<GetListResult<Interaction>>;

    // Specialized operations
    getInteractionTimeline: (
        params?: InteractionTimelineParams
    ) => Promise<GetListResult<Interaction>>;
    getFollowUpReminders: (
        params?: FollowUpReminderParams
    ) => Promise<GetListResult<Interaction>>;

    // Action operations
    completeInteraction: (
        id: Identifier,
        completionData?: InteractionCompletionData
    ) => Promise<UpdateResult<Interaction>>;
    scheduleFollowUp: (
        id: Identifier,
        followUpData: InteractionFollowUpData
    ) => Promise<UpdateResult<Interaction>>;

    // File operations
    uploadInteractionAttachment: (
        interactionId: Identifier,
        file: File
    ) => Promise<UpdateResult<Interaction>>;
    deleteInteractionAttachment: (
        interactionId: Identifier,
        fileName: string
    ) => Promise<UpdateResult<Interaction>>;
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

// Interaction parameter types
export interface InteractionTimelineParams {
    startDate?: string;
    endDate?: string;
    organizationId?: Identifier;
    contactId?: Identifier;
    typeIds?: Identifier[];
}

export interface FollowUpReminderParams {
    overdue?: boolean;
    upcoming?: boolean;
    days?: number;
}

export interface InteractionCompletionData {
    duration?: number;
    outcome?: string;
    [key: string]: any;
}

export interface InteractionFollowUpData {
    followUpDate: string;
    followUpNotes?: string;
}
