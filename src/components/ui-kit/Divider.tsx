/**
 * Divider Component
 * Visual separator line for horizontal or vertical division
 */

import React from 'react';
import { cn } from '../../utils/cn';

interface DividerProps {
    orientation?: 'horizontal' | 'vertical';
    variant?: 'fullWidth' | 'inset' | 'middle';
    component?: keyof JSX.IntrinsicElements;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Divider component for visual separation
 */
export const Divider: React.FC<DividerProps> = ({
    orientation = 'horizontal',
    variant = 'fullWidth',
    component = 'hr',
    className,
    style,
}) => {
    const Component = component;

    const baseClasses = orientation === 'horizontal'
        ? 'border-t border-gray-200'
        : 'border-l border-gray-200';

    const variantClasses = {
        fullWidth: orientation === 'horizontal' ? 'w-full' : 'h-full',
        inset: orientation === 'horizontal' ? 'ml-4 w-auto' : 'mt-4 h-auto',
        middle: orientation === 'horizontal' ? 'mx-4 w-auto' : 'my-4 h-auto',
    };

    return (
        <Component
            className={cn(
                baseClasses,
                variantClasses[variant],
                orientation === 'horizontal' ? 'my-2' : 'mx-2',
                className
            )}
            style={style}
            role="separator"
            aria-orientation={orientation}
        />
    );
};

export default Divider;