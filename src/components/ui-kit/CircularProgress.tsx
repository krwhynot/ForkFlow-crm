/**
 * CircularProgress Component
 * Loading spinner component similar to Material-UI CircularProgress
 */

import React from 'react';
import { cn } from '../../utils/cn';

interface CircularProgressProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    color?:
        | 'primary'
        | 'secondary'
        | 'success'
        | 'warning'
        | 'error'
        | 'inherit';
    thickness?: number;
    value?: number; // For determinate progress (0-100)
    variant?: 'determinate' | 'indeterminate';
    className?: string;
}

const SIZE_VARIANTS = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
};

const COLOR_VARIANTS = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    inherit: 'text-current',
};

/**
 * CircularProgress component for loading states
 */
export const CircularProgress: React.FC<CircularProgressProps> = ({
    size = 'md',
    color = 'primary',
    thickness = 4,
    value,
    variant = 'indeterminate',
    className,
}) => {
    const isIndeterminate = variant === 'indeterminate' || value === undefined;
    const progressValue =
        value !== undefined ? Math.min(100, Math.max(0, value)) : 0;

    const sizeClass =
        typeof size === 'number'
            ? ''
            : SIZE_VARIANTS[size as keyof typeof SIZE_VARIANTS];

    const sizeStyle =
        typeof size === 'number'
            ? { width: `${size}px`, height: `${size}px` }
            : {};

    // Calculate circle properties
    const radius = 16; // Fixed radius for SVG viewBox of 40x40
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = isIndeterminate
        ? 0
        : circumference - (progressValue / 100) * circumference;

    return (
        <div
            className={cn(
                'inline-flex items-center justify-center',
                sizeClass,
                className
            )}
            style={sizeStyle}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            {...(!isIndeterminate && { 'aria-valuenow': progressValue })}
        >
            <svg
                className={cn(
                    COLOR_VARIANTS[color],
                    isIndeterminate && 'animate-spin'
                )}
                viewBox="0 0 40 40"
                width="100%"
                height="100%"
            >
                {/* Background circle */}
                <circle
                    cx="20"
                    cy="20"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={thickness}
                    className="opacity-20"
                />

                {/* Progress circle */}
                <circle
                    cx="20"
                    cy="20"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={thickness}
                    strokeLinecap="round"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className={cn(
                        'transition-all duration-300 ease-in-out',
                        isIndeterminate && 'animate-pulse'
                    )}
                    style={{
                        transformOrigin: '50% 50%',
                        transform: 'rotate(-90deg)',
                    }}
                />
            </svg>
        </div>
    );
};

/**
 * Simple spinner variant (alias for CircularProgress)
 */
export const Spinner: React.FC<
    Omit<CircularProgressProps, 'variant' | 'value'>
> = props => {
    return <CircularProgress {...props} variant="indeterminate" />;
};

export default CircularProgress;
