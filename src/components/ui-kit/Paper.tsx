/**
 * Paper Component
 * Provides elevation and background for content (similar to Material-UI Paper)
 */

import React from 'react';
import { cn } from '../../utils/cn';

interface PaperProps {
    elevation?: number;
    variant?: 'elevation' | 'outlined';
    component?: keyof JSX.IntrinsicElements;
    className?: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

const ELEVATION_STYLES = {
    0: 'shadow-none',
    1: 'shadow-sm',
    2: 'shadow',
    3: 'shadow-md',
    4: 'shadow-lg',
    5: 'shadow-xl',
    6: 'shadow-2xl',
};

/**
 * Paper component for elevated content containers
 */
export const Paper: React.FC<PaperProps> = ({
    elevation = 1,
    variant = 'elevation',
    component = 'div',
    className,
    children,
    style,
    onClick,
    onMouseEnter,
    onMouseLeave,
}) => {
    const Component = component;

    const elevationClass = variant === 'elevation' 
        ? ELEVATION_STYLES[Math.min(elevation, 6) as keyof typeof ELEVATION_STYLES]
        : '';

    const borderClass = variant === 'outlined' 
        ? 'border border-gray-200'
        : '';

    return (
        <Component
            className={cn(
                'bg-white rounded-lg',
                elevationClass,
                borderClass,
                onClick && 'cursor-pointer',
                className
            )}
            style={style}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {children}
        </Component>
    );
};

export default Paper;