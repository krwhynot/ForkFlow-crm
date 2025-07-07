import React from 'react';
import { Box, Stack } from '../components/core/layout';
import { CircularProgress } from '../components/core/progress';
import { Typography } from '../components/core/typography';
import { useBreakpoint } from '../hooks/useBreakpoint';

interface LoadingComponentProps {
    variant?: 'spinner' | 'skeleton' | 'minimal';
    message?: string;
    height?: number | string;
    fullScreen?: boolean;
}

export const LoadingComponent: React.FC<LoadingComponentProps> = ({
    variant = 'spinner',
    message = 'Loading...',
    height = '200px',
    fullScreen = false,
}) => {
    const isMobile = useBreakpoint('sm');

    const containerClass = `flex justify-center items-center w-full p-4 ${
        fullScreen ? 'min-h-screen' : ''
    }`;
    const containerStyle = fullScreen ? {} : { minHeight: height };

    if (variant === 'minimal') {
        return (
            <Box className={containerClass} style={containerStyle}>
                <CircularProgress className="w-6 h-6" />
            </Box>
        );
    }

    if (variant === 'skeleton') {
        return (
            <Box className="p-4 w-full">
                <Stack spacing={1}>
                    <div className="animate-pulse bg-gray-300 h-6 w-full rounded" />
                    <div className="animate-pulse bg-gray-300 h-15 w-full rounded" />
                    <div className="animate-pulse bg-gray-300 h-4 w-full rounded" />
                    <div className="animate-pulse bg-gray-300 h-4 w-4/5 rounded" />
                    {!isMobile && (
                        <>
                            <div className="animate-pulse bg-gray-300 h-30 w-full rounded" />
                            <Stack direction="row" spacing={1}>
                                <div className="animate-pulse bg-gray-300 w-10 h-10 rounded-full" />
                                <Stack className="flex-1">
                                    <div className="animate-pulse bg-gray-300 h-4 w-full rounded" />
                                    <div className="animate-pulse bg-gray-300 h-3 w-3/5 rounded" />
                                </Stack>
                            </Stack>
                        </>
                    )}
                </Stack>
            </Box>
        );
    }

    return (
        <Box className={containerClass} style={containerStyle}>
            <Stack spacing={2} className="items-center">
                <CircularProgress
                    className={`text-blue-600 ${
                        isMobile ? 'w-8 h-8' : 'w-12 h-12'
                    }`}
                />
                <Typography
                    variant={isMobile ? 'body2' : 'body1'}
                    className="text-gray-500 text-center"
                >
                    {message}
                </Typography>
            </Stack>
        </Box>
    );
};

export const LoadingFallback: React.FC<{ message?: string }> = ({
    message = 'Loading module...',
}) => <LoadingComponent variant="spinner" message={message} height="300px" />;

export const SkeletonFallback: React.FC = () => (
    <LoadingComponent variant="skeleton" />
);

export const MinimalLoader: React.FC = () => (
    <LoadingComponent variant="minimal" height="80px" />
);

export const FullScreenLoader: React.FC<{ message?: string }> = ({
    message = 'Loading application...',
}) => <LoadingComponent variant="spinner" message={message} fullScreen />;

export default LoadingComponent;
