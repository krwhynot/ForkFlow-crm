/**
 * Chip Component
 * Displays a compact element with optional icon and label
 */

import React from 'react';
import { cn } from '../../utils/cn';

interface ChipProps {
    label: React.ReactNode;
    icon?: React.ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    variant?: 'filled' | 'outlined';
    size?: 'small' | 'medium';
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}

const COLOR_VARIANTS = {
    filled: {
        primary: 'bg-blue-100 text-blue-800 border-blue-200',
        secondary: 'bg-gray-100 text-gray-800 border-gray-200',
        success: 'bg-green-100 text-green-800 border-green-200',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        error: 'bg-red-100 text-red-800 border-red-200',
    },
    outlined: {
        primary: 'bg-transparent text-blue-600 border-blue-300 hover:bg-blue-50',
        secondary: 'bg-transparent text-gray-600 border-gray-300 hover:bg-gray-50',
        success: 'bg-transparent text-green-600 border-green-300 hover:bg-green-50',
        warning: 'bg-transparent text-yellow-600 border-yellow-300 hover:bg-yellow-50',
        error: 'bg-transparent text-red-600 border-red-300 hover:bg-red-50',
    },
};

const SIZE_VARIANTS = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
};

/**
 * Chip component for displaying compact information with optional icon
 */
export const Chip: React.FC<ChipProps> = ({
    label,
    icon,
    color = 'primary',
    variant = 'filled',
    size = 'medium',
    onClick,
    className,
    disabled = false,
}) => {
    const isClickable = onClick && !disabled;
    
    const Component = isClickable ? 'button' : 'div';

    return (
        <Component
            onClick={isClickable ? onClick : undefined}
            disabled={disabled}
            className={cn(
                'inline-flex items-center rounded-full border font-medium transition-colors',
                COLOR_VARIANTS[variant][color],
                SIZE_VARIANTS[size],
                isClickable && 'cursor-pointer hover:scale-105 active:scale-95',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
        >
            {icon && (
                <span className={cn(
                    'inline-flex items-center justify-center',
                    size === 'small' ? 'mr-1' : 'mr-1.5'
                )}>
                    {React.cloneElement(icon as React.ReactElement, {
                        className: cn(
                            size === 'small' ? 'h-3 w-3' : 'h-4 w-4',
                            (icon as React.ReactElement).props.className
                        ),
                    })}
                </span>
            )}
            <span>{label}</span>
        </Component>
    );
};

export default Chip;