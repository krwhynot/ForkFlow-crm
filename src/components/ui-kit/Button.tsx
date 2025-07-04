import React from 'react';
import { Button as HeadlessButton } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?:
        | 'contained'
        | 'outlined'
        | 'text'
        | 'primary'
        | 'secondary'
        | 'icon';
    size?: 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg';
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    fullWidth?: boolean;
    component?: React.ElementType;
    children: React.ReactNode;
}

const getVariantClasses = (variant: string, color: string) => {
    const colorMap = {
        primary: {
            contained:
                'bg-primary-500 hover:bg-primary-600 text-white shadow-sm hover:shadow-md',
            outlined:
                'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 bg-transparent',
            text: 'text-primary-600 hover:bg-primary-50 bg-transparent',
        },
        secondary: {
            contained:
                'bg-gray-500 hover:bg-gray-600 text-white shadow-sm hover:shadow-md',
            outlined:
                'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent',
            text: 'text-gray-600 hover:bg-gray-50 bg-transparent',
        },
        success: {
            contained:
                'bg-success-500 hover:bg-success-600 text-white shadow-sm hover:shadow-md',
            outlined:
                'border-2 border-success-500 text-success-600 hover:bg-success-50 bg-transparent',
            text: 'text-success-600 hover:bg-success-50 bg-transparent',
        },
        error: {
            contained:
                'bg-error-500 hover:bg-error-600 text-white shadow-sm hover:shadow-md',
            outlined:
                'border-2 border-error-500 text-error-600 hover:bg-error-50 bg-transparent',
            text: 'text-error-600 hover:bg-error-50 bg-transparent',
        },
        warning: {
            contained:
                'bg-warning-500 hover:bg-warning-600 text-white shadow-sm hover:shadow-md',
            outlined:
                'border-2 border-warning-500 text-warning-600 hover:bg-warning-50 bg-transparent',
            text: 'text-warning-600 hover:bg-warning-50 bg-transparent',
        },
        info: {
            contained:
                'bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md',
            outlined:
                'border-2 border-blue-500 text-blue-600 hover:bg-blue-50 bg-transparent',
            text: 'text-blue-600 hover:bg-blue-50 bg-transparent',
        },
    };

    // Handle legacy variants
    if (variant === 'primary') return colorMap.primary.contained;
    if (variant === 'secondary') return colorMap.secondary.outlined;
    if (variant === 'icon')
        return 'bg-primary-500 hover:bg-primary-600 text-white shadow-md hover:shadow-lg rounded-full';

    return (
        colorMap[color as keyof typeof colorMap]?.[
            variant as keyof typeof colorMap.primary
        ] || colorMap.primary.contained
    );
};

const getSizeClasses = (size: string, variant: string) => {
    // Handle legacy size names
    const normalizedSize =
        size === 'small'
            ? 'sm'
            : size === 'medium'
              ? 'md'
              : size === 'large'
                ? 'lg'
                : size;

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
    (
        {
            variant = 'contained',
            size = 'medium',
            color = 'primary',
            startIcon,
            endIcon,
            fullWidth = false,
            component,
            children,
            className,
            ...props
        },
        ref
    ) => {
        const Component = component || HeadlessButton;

        const baseClasses =
            'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500';
        const variantClasses = getVariantClasses(variant, color);
        const sizeClasses = getSizeClasses(size, variant);
        const fullWidthClass = fullWidth ? 'w-full' : '';

        const buttonClasses = twMerge(
            baseClasses,
            variantClasses,
            sizeClasses,
            fullWidthClass,
            className
        );

        return (
            <Component ref={ref} className={buttonClasses} {...props}>
                {startIcon && <span className="mr-2">{startIcon}</span>}
                {children}
                {endIcon && <span className="ml-2">{endIcon}</span>}
            </Component>
        );
    }
);

Button.displayName = 'Button';
