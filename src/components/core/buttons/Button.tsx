import React from 'react';
import { twMerge } from 'tailwind-merge';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'danger' | 'contained' | 'outlined' | 'text' | 'icon';
    size?: 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg';
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    fullWidth?: boolean;
    component?: React.ElementType;
    loading?: boolean;
};

const getVariantClasses = (variant: string, color: string) => {
    const colorMap = {
        primary: {
            contained: 'bg-primary-500 hover:bg-primary-600 text-white shadow-sm hover:shadow-md',
            outlined: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 bg-transparent',
            text: 'text-primary-600 hover:bg-primary-50 bg-transparent',
        },
        secondary: {
            contained: 'bg-gray-500 hover:bg-gray-600 text-white shadow-sm hover:shadow-md',
            outlined: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent',
            text: 'text-gray-600 hover:bg-gray-50 bg-transparent',
        },
        success: {
            contained: 'bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md',
            outlined: 'border-2 border-green-500 text-green-600 hover:bg-green-50 bg-transparent',
            text: 'text-green-600 hover:bg-green-50 bg-transparent',
        },
        error: {
            contained: 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md',
            outlined: 'border-2 border-red-500 text-red-600 hover:bg-red-50 bg-transparent',
            text: 'text-red-600 hover:bg-red-50 bg-transparent',
        },
        warning: {
            contained: 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm hover:shadow-md',
            outlined: 'border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 bg-transparent',
            text: 'text-yellow-600 hover:bg-yellow-50 bg-transparent',
        },
        info: {
            contained: 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md',
            outlined: 'border-2 border-blue-500 text-blue-600 hover:bg-blue-50 bg-transparent',
            text: 'text-blue-600 hover:bg-blue-50 bg-transparent',
        },
    };

    // Handle legacy variants
    if (variant === 'primary') return colorMap.primary.contained;
    if (variant === 'secondary') return colorMap.secondary.outlined;
    if (variant === 'danger') return colorMap.error.contained;
    if (variant === 'icon') return 'bg-primary-500 hover:bg-primary-600 text-white shadow-md hover:shadow-lg rounded-full';

    return colorMap[color as keyof typeof colorMap]?.[variant as keyof typeof colorMap.primary] || colorMap.primary.contained;
};

const getSizeClasses = (size: string, variant: string) => {
    // Handle legacy size names
    const normalizedSize = size === 'small' ? 'sm' : size === 'medium' ? 'md' : size === 'large' ? 'lg' : size;

    if (variant === 'icon') {
        return 'p-3 min-h-[44px] min-w-[44px]';
    }

    switch (normalizedSize) {
        case 'sm':
            return 'px-4 py-2 text-sm rounded-lg min-h-[44px] min-w-[44px]';
        case 'md':
            return 'px-6 py-3 text-base rounded-lg min-h-[44px] min-w-[44px]';
        case 'lg':
            return 'px-8 py-4 text-lg rounded-lg min-h-[44px] min-w-[44px]';
        default:
            return 'px-6 py-3 text-base rounded-lg min-h-[44px] min-w-[44px]';
    }
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className,
        variant = 'primary',
        size = 'medium',
        color = 'primary',
        startIcon,
        endIcon,
        fullWidth = false,
        component,
        loading = false,
        children,
        disabled,
        ...props
    }, ref) => {
        const Component = component || 'button';

        const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500';
        const variantClasses = getVariantClasses(variant, color);
        const sizeClasses = getSizeClasses(size, variant);
        const fullWidthClass = fullWidth ? 'w-full' : '';

        return (
            <Component
                ref={ref}
                className={twMerge(
                    baseClasses,
                    variantClasses,
                    sizeClasses,
                    fullWidthClass,
                    className
                )}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {startIcon && !loading && <span className="mr-2">{startIcon}</span>}
                {children}
                {endIcon && <span className="ml-2">{endIcon}</span>}
            </Component>
        );
    }
);

Button.displayName = 'Button';
