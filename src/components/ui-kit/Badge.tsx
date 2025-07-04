/**
 * Badge Component
 * Displays a small indicator badge, typically used for counts or status indicators
 */

import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
    children: React.ReactNode;
    badgeContent?: React.ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    variant?: 'dot' | 'standard';
    invisible?: boolean;
    className?: string;
}

const COLOR_VARIANTS = {
    primary: 'bg-blue-500 text-white',
    secondary: 'bg-gray-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    error: 'bg-red-500 text-white',
};

/**
 * Badge component for displaying count indicators or status dots
 */
export const Badge: React.FC<BadgeProps> = ({
    children,
    badgeContent,
    color = 'primary',
    variant = 'standard',
    invisible = false,
    className,
}) => {
    const showBadge =
        !invisible &&
        (variant === 'dot' ||
            (badgeContent !== null &&
                badgeContent !== undefined &&
                badgeContent !== 0));

    return (
        <div className={cn('relative inline-flex', className)}>
            {children}
            {showBadge && (
                <div
                    className={cn(
                        'absolute -top-2 -right-2 flex items-center justify-center rounded-full text-xs font-medium',
                        COLOR_VARIANTS[color],
                        variant === 'dot' ? 'h-2 w-2' : 'min-h-5 min-w-5 px-1'
                    )}
                >
                    {variant === 'standard' && badgeContent}
                </div>
            )}
        </div>
    );
};

export default Badge;
