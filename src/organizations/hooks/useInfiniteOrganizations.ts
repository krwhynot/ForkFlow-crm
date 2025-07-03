import { useState, useEffect, useCallback, useMemo } from 'react';
import { useInfiniteGetList, useListContext } from 'react-admin';
import { Organization } from '../../types';

interface UseInfiniteOrganizationsOptions {
    enabled?: boolean;
    pageSize?: number;
    threshold?: number; // Number of items from end to trigger next page load
}

/**
 * Custom hook for infinite scrolling organizations with performance optimization
 * Integrates with react-admin's useInfiniteGetList for seamless data fetching
 */
export const useInfiniteOrganizations = (options: UseInfiniteOrganizationsOptions = {}) => {
    const {
        enabled = true,
        pageSize = 25,
        threshold = 10
    } = options;

    const { filterValues, sort } = useListContext();
    const [hasTriggeredLoad, setHasTriggeredLoad] = useState(false);

    // Use react-admin's infinite list hook
    const {
        data: organizations,
        total,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isPending,
        error,
        refetch
    } = useInfiniteGetList<Organization>(
        'organizations',
        {
            pagination: { page: 1, perPage: pageSize },
            sort: sort || { field: 'name', order: 'ASC' },
            filter: filterValues || {}
        },
        {
            enabled,
        }
    );

    // Flatten paginated data into single array
    const flattenedData = useMemo(() => {
        if (!organizations) return [];
        return organizations.flat();
    }, [organizations]);

    // Check if we should load more data based on scroll position
    const shouldLoadMore = useCallback((visibleRange: { startIndex: number; stopIndex: number }) => {
        if (!enabled || isFetchingNextPage || !hasNextPage) return false;
        
        const { stopIndex } = visibleRange;
        const totalLoaded = flattenedData.length;
        
        // Trigger load when we're within threshold items of the end
        return stopIndex >= totalLoaded - threshold;
    }, [enabled, isFetchingNextPage, hasNextPage, flattenedData.length, threshold]);

    // Handle infinite scroll trigger
    const handleItemsRendered = useCallback((visibleRange: { startIndex: number; stopIndex: number }) => {
        if (shouldLoadMore(visibleRange) && !hasTriggeredLoad) {
            setHasTriggeredLoad(true);
            fetchNextPage();
        } else if (!shouldLoadMore(visibleRange)) {
            setHasTriggeredLoad(false);
        }
    }, [shouldLoadMore, hasTriggeredLoad, fetchNextPage]);

    // Reset trigger when filters change
    useEffect(() => {
        setHasTriggeredLoad(false);
    }, [filterValues, sort]);

    // Calculate loading state and metrics
    const metrics = useMemo(() => ({
        totalItems: total || 0,
        loadedItems: flattenedData.length,
        loadingProgress: total ? (flattenedData.length / total) * 100 : 0,
        hasMore: hasNextPage,
        isLoading: isPending || isFetchingNextPage,
    }), [total, flattenedData.length, hasNextPage, isPending, isFetchingNextPage]);

    return {
        // Data
        organizations: flattenedData,
        metrics,
        
        // Loading states
        isPending,
        isFetchingNextPage,
        error,
        
        // Actions
        fetchNextPage,
        refetch,
        handleItemsRendered,
        
        // Utility
        hasNextPage,
        shouldLoadMore,
    };
};