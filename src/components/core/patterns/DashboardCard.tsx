import {
    ArrowDownIcon,
    ArrowUpIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '../buttons/Button';
import { CircularProgress } from '../progress/CircularProgress';
import { Typography } from '../typography/Typography';

interface TrendData {
    value: number;
    direction: 'up' | 'down';
    label?: string;
}

export interface DashboardCardProps {
    title: string;
    subtitle?: string;
    value?: string | number;
    trend?: TrendData;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    loading?: boolean;
    error?: string;
    onRetry?: () => void;
    onClick?: () => void;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'metric' | 'list' | 'chart';
    className?: string;
    children?: React.ReactNode;
}

/**
 * Enhanced dashboard card component for displaying metrics, lists, and charts
 * Replaces and improves upon HomepageCard and MetricCard patterns
 */
export const DashboardCard: React.FC<DashboardCardProps> = ({
    title,
    subtitle,
    value,
    trend,
    icon,
    actions,
    loading = false,
    error,
    onRetry,
    onClick,
    size = 'md',
    variant = 'metric',
    className,
    children,
}) => {
    // Size classes
    const sizeClasses = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    // Trend styling
    const getTrendClasses = (direction: 'up' | 'down') => {
        return direction === 'up'
            ? 'text-green-600 bg-green-50'
            : 'text-red-600 bg-red-50';
    };

    const TrendIcon = trend?.direction === 'up' ? ArrowUpIcon : ArrowDownIcon;

    // Loading skeleton
    const LoadingSkeleton = () => (
        <div className="animate-pulse">
            <div className="flex items-center space-x-4">
                {icon && (
                    <div className="flex-shrink-0 p-3 bg-gray-100 rounded-lg">
                        <div className="h-6 w-6 bg-gray-200 rounded" />
                    </div>
                )}
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
            </div>
        </div>
    );

    // Error state
    const ErrorState = () => (
        <div className="text-center py-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <Typography variant="body2" className="text-gray-600 mb-3">
                {error || 'Failed to load data'}
            </Typography>
            {onRetry && (
                <Button
                    variant="outlined"
                    size="sm"
                    onClick={onRetry}
                >
                    Try Again
                </Button>
            )}
        </div>
    );

    return (
        <div
            className={twMerge(
                'bg-white rounded-lg border shadow-sm transition-all duration-200',
                onClick && 'cursor-pointer hover:shadow-md hover:border-gray-300',
                sizeClasses[size],
                className
            )}
            onClick={onClick}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <Typography
                        variant="subtitle2"
                        className="font-medium text-gray-900 truncate"
                    >
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography
                            variant="caption"
                            className="text-gray-500 mt-1 block"
                        >
                            {subtitle}
                        </Typography>
                    )}
                </div>
                {actions && (
                    <div className="flex-shrink-0 ml-4">
                        {actions}
                    </div>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <LoadingSkeleton />
            ) : error ? (
                <ErrorState />
            ) : (
                <div className="space-y-4">
                    {/* Metric Variant */}
                    {variant === 'metric' && (
                        <div className="flex items-center space-x-4">
                            {icon && (
                                <div className="flex-shrink-0 p-3 bg-gray-50 rounded-lg">
                                    {icon}
                                </div>
                            )}
                            <div className="flex-1">
                                {value !== undefined && (
                                    <div className="flex items-baseline space-x-2">
                                        <Typography
                                            variant="h4"
                                            className="font-semibold text-gray-900"
                                        >
                                            {value}
                                        </Typography>
                                        {trend && (
                                            <div className={twMerge(
                                                'flex items-center px-2 py-1 rounded-full text-xs font-medium',
                                                getTrendClasses(trend.direction)
                                            )}>
                                                <TrendIcon className="h-3 w-3 mr-1" />
                                                {Math.abs(trend.value)}%
                                                {trend.label && (
                                                    <span className="ml-1">{trend.label}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* List/Chart Variants */}
                    {(variant === 'list' || variant === 'chart') && (
                        <div className="space-y-3">
                            {children}
                        </div>
                    )}
                </div>
            )}

            {/* Loading overlay */}
            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
                    <CircularProgress size="sm" />
                </div>
            )}
        </div>
    );
}; 