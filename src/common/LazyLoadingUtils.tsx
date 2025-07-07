import React, { Suspense, ComponentType, ReactElement } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Box, Stack } from '../components/core/layout';
import { Button } from '../components/core/buttons';
import { Typography } from '../components/core/typography';
import { Alert } from '../components/ui-kit'; // Alert doesn't exist in core yet, keep ui-kit
import {
    ArrowPathIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { LoadingFallback, SkeletonFallback } from './LoadingComponent';

interface LazyLoadErrorProps {
    error: Error;
    resetErrorBoundary: () => void;
}

const LazyLoadError: React.FC<LazyLoadErrorProps> = ({
    error,
    resetErrorBoundary,
}) => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
            padding: 3,
            textAlign: 'center',
        }}
    >
        <Alert
            severity="error"
            icon={<ExclamationTriangleIcon className="w-5 h-5" />}
            sx={{ mb: 2, width: '100%', maxWidth: 600 }}
        >
            <Typography variant="h6" gutterBottom>
                Failed to load module
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {error.message || 'An error occurred while loading this module'}
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                    variant="contained"
                    startIcon={<ArrowPathIcon className="w-4 h-4" />}
                    onClick={resetErrorBoundary}
                    size="small"
                >
                    Retry
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => window.location.reload()}
                    size="small"
                >
                    Reload Page
                </Button>
            </Stack>
        </Alert>
    </Box>
);

interface LazyWrapperProps {
    children: ReactElement;
    fallback?: ReactElement;
    errorFallback?: ComponentType<LazyLoadErrorProps>;
    onError?: (error: Error, errorInfo: any) => void;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
    children,
    fallback = <LoadingFallback />,
    errorFallback = LazyLoadError,
    onError,
}) => (
    <ErrorBoundary
        FallbackComponent={errorFallback}
        onError={onError}
        onReset={() => window.location.reload()}
    >
        <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
);

export interface LazyResourceConfig {
    loader: () => Promise<{ default: ComponentType<any> }>;
    fallback?: ReactElement;
    chunkName?: string;
    preload?: boolean;
}

export const createLazyResource = (config: LazyResourceConfig) => {
    const LazyComponent = React.lazy(config.loader);

    const WrappedComponent = (props: any) => (
        <LazyWrapper fallback={config.fallback || <SkeletonFallback />}>
            <LazyComponent {...props} />
        </LazyWrapper>
    );

    if (config.preload) {
        config.loader().catch(() => {});
    }

    WrappedComponent.displayName = `LazyResource(${config.chunkName || 'Unknown'})`;
    WrappedComponent.preload = config.loader;

    return WrappedComponent;
};

export const createLazyComponent = <T extends ComponentType<any>>(
    loader: () => Promise<{ default: T }>,
    fallback?: ReactElement
) => {
    const LazyComponent = React.lazy(loader);

    return (props: React.ComponentProps<T>) => (
        <Suspense fallback={fallback || <LoadingFallback />}>
            <LazyComponent {...props} />
        </Suspense>
    );
};

export const preloadResource = async (loader: () => Promise<any>) => {
    try {
        await loader();
    } catch (error) {
        console.warn('Failed to preload resource:', error);
    }
};

export interface RoutePreloadConfig {
    route: string;
    loader: () => Promise<any>;
    priority: 'high' | 'medium' | 'low';
}

export class ResourcePreloader {
    private static preloadQueue: RoutePreloadConfig[] = [];
    private static isPreloading = false;

    static addToQueue(config: RoutePreloadConfig) {
        this.preloadQueue.push(config);
        this.processQueue();
    }

    static async processQueue() {
        if (this.isPreloading || this.preloadQueue.length === 0) return;

        this.isPreloading = true;

        const highPriority = this.preloadQueue.filter(
            c => c.priority === 'high'
        );
        const mediumPriority = this.preloadQueue.filter(
            c => c.priority === 'medium'
        );
        const lowPriority = this.preloadQueue.filter(c => c.priority === 'low');

        try {
            for (const config of [
                ...highPriority,
                ...mediumPriority,
                ...lowPriority,
            ]) {
                await preloadResource(config.loader);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } catch (error) {
            console.warn('Preloading error:', error);
        } finally {
            this.preloadQueue = [];
            this.isPreloading = false;
        }
    }
}

export const withLazyLoading = <P extends object>(
    Component: ComponentType<P>,
    fallback?: ReactElement
) => {
    const WrappedComponent = (props: P) => (
        <Suspense fallback={fallback || <LoadingFallback />}>
            <Component {...props} />
        </Suspense>
    );

    WrappedComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`;
    return WrappedComponent;
};

export default LazyWrapper;
