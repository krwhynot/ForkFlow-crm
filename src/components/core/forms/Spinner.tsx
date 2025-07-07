import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface SpinnerProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    color?: 'primary' | 'secondary' | 'white' | 'gray';
    className?: string;
}

/**
 * Spinner component for loading states
 * Provides consistent loading indicators
 */
export const Spinner: React.FC<SpinnerProps> = ({
    size = 'md',
    color = 'primary',
    className,
}) => {
    const sizeClasses = {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12'
    };
    
    const colorClasses = {
        primary: 'text-blue-600',
        secondary: 'text-gray-600',
        white: 'text-white',
        gray: 'text-gray-400'
    };
    
    return (
        <div
            className={twMerge(
                'animate-spin rounded-full border-2 border-current border-t-transparent',
                sizeClasses[size],
                colorClasses[color],
                className
            )}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
}; 