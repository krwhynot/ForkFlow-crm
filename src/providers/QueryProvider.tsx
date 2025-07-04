/**
 * QueryProvider Component for ForkFlow CRM
 *
 * A wrapper component that provides QueryClient context to the entire application.
 * This enables React Query functionality throughout the CRM application.
 */

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '../utils/queryClient';

interface QueryProviderProps {
    children: React.ReactNode;
    /**
     * Whether to show React Query DevTools in development.
     * Defaults to true in development, false in production.
     */
    showDevtools?: boolean;
}

/**
 * QueryProvider wraps the application with QueryClientProvider and optionally
 * includes React Query DevTools for development debugging.
 *
 * This component provides:
 * - QueryClient context for all React Query hooks
 * - Optional DevTools for debugging queries and mutations
 * - Centralized query configuration management
 *
 * @param {React.ReactNode} children - The application components to wrap
 * @param {boolean} showDevtools - Whether to show DevTools (dev only)
 * @returns {JSX.Element} The wrapped application with QueryClient context
 *
 * @example
 * ```tsx
 * // Basic usage
 * <QueryProvider>
 *   <App />
 * </QueryProvider>
 *
 * // With DevTools disabled
 * <QueryProvider showDevtools={false}>
 *   <App />
 * </QueryProvider>
 * ```
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({
    children,
    showDevtools = process.env.NODE_ENV === 'development',
}) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {showDevtools && (
                <ReactQueryDevtools initialIsOpen={false} position="bottom" />
            )}
        </QueryClientProvider>
    );
};

/**
 * Higher-order component that wraps any component with QueryProvider.
 * Useful for testing or creating isolated query contexts.
 *
 * @param {React.ComponentType<P>} Component - Component to wrap
 * @returns {React.ComponentType<P>} Wrapped component with QueryProvider
 *
 * @example
 * ```tsx
 * const ComponentWithQueries = withQueryProvider(MyComponent);
 * ```
 */
export const withQueryProvider = <P extends object>(
    Component: React.ComponentType<P>
): React.ComponentType<P> => {
    const WrappedComponent = (props: P) => (
        <QueryProvider>
            <Component {...props} />
        </QueryProvider>
    );

    WrappedComponent.displayName = `withQueryProvider(${Component.displayName || Component.name})`;

    return WrappedComponent;
};

export default QueryProvider;
