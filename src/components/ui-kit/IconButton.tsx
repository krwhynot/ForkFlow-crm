/**
 * IconButton Component
 * Button component specifically for icons with proper touch targets
 */

import React from 'react';
import { cn } from '../../utils/cn';

interface IconButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    variant?: 'contained' | 'outlined' | 'text';
    className?: string;
    title?: string;
    type?: 'button' | 'submit' | 'reset';
    'aria-label'?: string;
}

const SIZE_VARIANTS = {
    xs: 'h-6 w-6 p-1',
    sm: 'h-8 w-8 p-1.5',
    md: 'h-10 w-10 p-2',
    lg: 'h-12 w-12 p-2.5',
};

const COLOR_VARIANTS = {
    contained: {
        default: 'bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-500',
        primary: 'bg-blue-100 text-blue-600 hover:bg-blue-200 focus:ring-blue-500',
        secondary: 'bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-500',
        success: 'bg-green-100 text-green-600 hover:bg-green-200 focus:ring-green-500',
        warning: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200 focus:ring-yellow-500',
        error: 'bg-red-100 text-red-600 hover:bg-red-200 focus:ring-red-500',
    },
    outlined: {
        default: 'border border-gray-300 text-gray-600 hover:bg-gray-50 focus:ring-gray-500',
        primary: 'border border-blue-300 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
        secondary: 'border border-gray-300 text-gray-600 hover:bg-gray-50 focus:ring-gray-500',
        success: 'border border-green-300 text-green-600 hover:bg-green-50 focus:ring-green-500',
        warning: 'border border-yellow-300 text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500',
        error: 'border border-red-300 text-red-600 hover:bg-red-50 focus:ring-red-500',
    },
    text: {
        default: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
        primary: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
        secondary: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
        success: 'text-green-600 hover:bg-green-50 focus:ring-green-500',
        warning: 'text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500',
        error: 'text-red-600 hover:bg-red-50 focus:ring-red-500',
    },
};

/**
 * IconButton component for icon-only buttons with proper accessibility
 */
export const IconButton: React.FC<IconButtonProps> = ({
    children,
    onClick,
    disabled = false,
    size = 'md',
    color = 'default',
    variant = 'text',
    className,
    title,
    type = 'button',
    'aria-label': ariaLabel,
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            title={title}
            aria-label={ariaLabel || title}
            className={cn(
                'inline-flex items-center justify-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
                SIZE_VARIANTS[size],
                COLOR_VARIANTS[variant][color],
                disabled && 'opacity-50 cursor-not-allowed',
                'touch-target-interactive', // Ensures 44px minimum touch target
                className
            )}
        >
            {React.cloneElement(children as React.ReactElement, {
                className: cn(
                    size === 'xs' && 'h-3 w-3',
                    size === 'sm' && 'h-4 w-4',
                    size === 'md' && 'h-5 w-5',
                    size === 'lg' && 'h-6 w-6',
                    (children as React.ReactElement).props.className
                ),
            })}
        </button>
    );
};

export default IconButton;