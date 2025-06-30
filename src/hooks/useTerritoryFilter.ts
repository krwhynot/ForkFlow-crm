// src/hooks/useTerritoryFilter.ts
import { useMemo } from 'react';
import { useGetIdentity, GetListParams } from 'react-admin';
import { User } from '../types';
import { applyTerritoryFilter, canAccessRecord, getTerritoryDisplayName } from '../utils/territoryFilter';

export interface UseTerritoryFilterResult {
    /**
     * Apply territory filtering to list parameters
     */
    applyFilter: (resource: string, params: GetListParams) => GetListParams;
    
    /**
     * Check if user can access a specific record
     */
    canAccess: (record: any, resourceType: string) => boolean;
    
    /**
     * Get territory display name for UI
     */
    territoryDisplayName: string;
    
    /**
     * Check if user has territory restrictions
     */
    hasRestrictions: boolean;
    
    /**
     * Current user
     */
    user?: User;
    
    /**
     * Loading state
     */
    isLoading: boolean;
}

/**
 * Hook to manage territory-based filtering for the current user
 */
export function useTerritoryFilter(): UseTerritoryFilterResult {
    const { data: identity, isPending } = useGetIdentity();
    
    const result = useMemo(() => {
        if (isPending || !identity) {
            return {
                applyFilter: (resource: string, params: GetListParams) => params,
                canAccess: () => false,
                territoryDisplayName: 'Loading...',
                hasRestrictions: false,
                user: undefined,
                isLoading: true,
            };
        }

        const user = identity as User;
        const hasRestrictions = user.role === 'broker' && (user.territory?.length || 0) > 0;
        
        return {
            applyFilter: (resource: string, params: GetListParams) => {
                return applyTerritoryFilter({ user, resource, params });
            },
            canAccess: (record: any, resourceType: string) => {
                return canAccessRecord(user, record, resourceType);
            },
            territoryDisplayName: getTerritoryDisplayName(user.territory || []),
            hasRestrictions,
            user,
            isLoading: false,
        };
    }, [identity, isPending]);

    return result;
}

/**
 * Hook specifically for checking record access permissions
 */
export function useRecordAccess(record: any, resourceType: string): {
    canAccess: boolean;
    reason?: string;
} {
    const { canAccess, user, isLoading } = useTerritoryFilter();
    
    return useMemo(() => {
        if (isLoading || !user) {
            return { canAccess: false, reason: 'Loading user permissions...' };
        }

        const hasAccess = canAccess(record, resourceType);
        
        if (!hasAccess && user.role === 'broker') {
            return { 
                canAccess: false, 
                reason: 'Record is outside your assigned territory' 
            };
        }

        return { canAccess: hasAccess };
    }, [canAccess, record, resourceType, user, isLoading]);
}

/**
 * Hook for territory-aware list filtering
 */
export function useTerritoryAwareList(resource: string) {
    const { applyFilter, hasRestrictions, territoryDisplayName } = useTerritoryFilter();
    
    return useMemo(() => ({
        /**
         * Apply territory filter to list parameters
         */
        filterParams: (params: GetListParams) => applyFilter(resource, params),
        
        /**
         * Whether the current user has territory restrictions
         */
        hasRestrictions,
        
        /**
         * Display name for current territory
         */
        territoryDisplayName,
        
        /**
         * Helper to create territory-aware list component props
         */
        getListProps: (baseParams: Partial<GetListParams> = {}) => ({
            ...baseParams,
            filter: applyFilter(resource, { 
                pagination: { page: 1, perPage: 25 },
                sort: { field: 'id', order: 'ASC' as const },
                filter: {},
                ...baseParams 
            } as GetListParams).filter,
        }),
    }), [applyFilter, resource, hasRestrictions, territoryDisplayName]);
}