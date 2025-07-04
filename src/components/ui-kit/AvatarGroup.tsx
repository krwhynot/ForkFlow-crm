/**
 * AvatarGroup Component
 * Displays a group of avatars with optional overflow indicator
 */

import React from 'react';
import { cn } from '../../utils/cn';

interface AvatarGroupProps {
    children: React.ReactNode;
    max?: number;
    total?: number;
    spacing?: 'small' | 'medium' | 'large';
    className?: string;
}

const SPACING_VARIANTS = {
    small: '-space-x-1',
    medium: '-space-x-2',
    large: '-space-x-3',
};

/**
 * AvatarGroup component for displaying multiple avatars with overflow handling
 */
export const AvatarGroup: React.FC<AvatarGroupProps> = ({
    children,
    max = 4,
    total,
    spacing = 'medium',
    className,
}) => {
    const childrenArray = React.Children.toArray(children);
    const visibleChildren = max ? childrenArray.slice(0, max) : childrenArray;
    const hasOverflow = max && childrenArray.length > max;
    const overflowCount = total ? total - max : childrenArray.length - max;

    return (
        <div className={cn(
            'flex items-center',
            SPACING_VARIANTS[spacing],
            className
        )}>
            {visibleChildren.map((child, index) => (
                <div
                    key={index}
                    className="relative ring-2 ring-white rounded-full"
                    style={{ zIndex: visibleChildren.length - index }}
                >
                    {child}
                </div>
            ))}
            
            {hasOverflow && overflowCount > 0 && (
                <div
                    className="relative ring-2 ring-white rounded-full bg-gray-100 text-gray-600 font-medium text-xs flex items-center justify-center h-8 w-8"
                    style={{ zIndex: 0 }}
                >
                    +{overflowCount}
                </div>
            )}
        </div>
    );
};

export default AvatarGroup;