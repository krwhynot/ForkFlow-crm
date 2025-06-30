/**
 * QueryClient Configuration for ForkFlow CRM
 * 
 * Optimized TanStack Query configuration specifically designed for CRM applications
 * with appropriate caching, retry, and performance settings.
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Creates and configures a QueryClient instance optimized for CRM usage patterns.
 * 
 * Configuration rationale:
 * - staleTime: 5 minutes - Good balance for CRM data freshness vs performance
 * - gcTime: 30 minutes - Keep data in cache long enough for typical workflows
 * - retry: 2 - Handle transient network issues without being too aggressive
 * - refetchOnWindowFocus: false - Prevent unnecessary refetches when switching tabs
 * - refetchOnReconnect: true - Ensure data freshness after network issues
 * 
 * @returns {QueryClient} Configured QueryClient instance
 */
export const createQueryClient = (): QueryClient => {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Data is considered fresh for 5 minutes
                // Perfect for CRM data that doesn't change frequently
                staleTime: 5 * 60 * 1000, // 5 minutes
                
                // Keep data in cache for 30 minutes after becoming unused
                // Allows for quick navigation between related records
                gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
                
                // Retry failed requests twice to handle transient network issues
                // Not too aggressive to avoid overwhelming the server
                retry: 2,
                
                // Disable refetch on window focus to prevent unnecessary API calls
                // CRM users often switch between multiple applications
                refetchOnWindowFocus: false,
                
                // Refetch when network reconnects to ensure data consistency
                refetchOnReconnect: true,
                
                // Refetch when component mounts if data is stale
                refetchOnMount: true,
                
                // Retry delay with exponential backoff
                retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
            },
            mutations: {
                // Single retry for mutations to avoid duplicate operations
                retry: 1,
                
                // Shorter retry delay for mutations
                retryDelay: 1000,
            },
        },
    });
};

/**
 * Pre-configured QueryClient instance for the ForkFlow CRM application.
 * This instance should be used throughout the application to ensure consistency.
 */
export const queryClient = createQueryClient();

/**
 * Default query options that can be used for specific queries that need different settings.
 * These can be spread into useQuery calls for consistent configuration.
 */
export const crmQueryOptions = {
    // For frequently changing data (like notifications, real-time updates)
    realTime: {
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 2 * 60 * 1000, // 2 minutes
        refetchInterval: 60 * 1000, // 1 minute
    },
    
    // For rarely changing data (like settings, user preferences)
    static: {
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 60 * 60 * 1000, // 1 hour
        retry: 1,
    },
    
    // For expensive or slow queries (like reports, analytics)
    expensive: {
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 60 * 60 * 1000, // 1 hour
        retry: 3,
        retryDelay: (attemptIndex: number) => Math.min(2000 * 2 ** attemptIndex, 30000),
    },
} as const;

export default queryClient;