/**
 * LinearProgress Component
 * Progress bar for showing completion status
 */

import React from 'react';
import { cn } from '../../utils/cn';

interface LinearProgressProps {
    value?: number;
    variant?: 'determinate' | 'indeterminate';
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    className?: string;
    style?: React.CSSProperties;
}

/**
 * LinearProgress component for progress indication
 */
export const LinearProgress: React.FC<LinearProgressProps> = ({
    value = 0,
    variant = 'indeterminate',
    color = 'primary',
    className,
    style,
}) => {
    const colorClasses = {
        primary: 'bg-blue-600',
        secondary: 'bg-gray-600',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        error: 'bg-red-600',
    };

    const backgroundColorClasses = {
        primary: 'bg-blue-200',
        secondary: 'bg-gray-200',
        success: 'bg-green-200',
        warning: 'bg-yellow-200',
        error: 'bg-red-200',
    };

    return (
        <div
            className={cn(
                'w-full h-2 rounded-full overflow-hidden',
                backgroundColorClasses[color],
                className
            )}
            style={style}
            role="progressbar"
            aria-valuenow={variant === 'determinate' ? value : undefined}
            aria-valuemin={0}
            aria-valuemax={100}
        >
            <div
                className={cn(
                    'h-full transition-all duration-300 ease-in-out rounded-full',
                    colorClasses[color],
                    variant === 'indeterminate' && 'animate-pulse'
                )}
                style={{
                    width: variant === 'determinate' ? `${Math.min(100, Math.max(0, value))}%` : '100%',
                }}
            />
        </div>
    );
};

export default LinearProgress;