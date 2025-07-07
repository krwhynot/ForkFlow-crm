import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
    variant?: 'outlined' | 'filled' | 'standard';
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
}

/**
 * Input component for form fields
 * Provides consistent styling and behavior for text inputs
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    helperText,
    fullWidth = false,
    variant = 'outlined',
    startIcon,
    endIcon,
    className,
    ...props
}, ref) => {
    const baseClasses = 'transition-colors duration-200 focus:outline-none';

    const variantClasses = {
        outlined: 'border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        filled: 'bg-gray-100 border-0 border-b-2 border-gray-300 rounded-t-md px-3 py-2 focus:bg-white focus:border-blue-500',
        standard: 'border-0 border-b border-gray-300 px-0 py-2 focus:border-blue-500'
    };

    const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';

    return (
        <div className={twMerge('flex flex-col', fullWidth && 'w-full')}>
            {label && (
                <label className="text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}

            <div className="relative">
                {startIcon && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {startIcon}
                    </div>
                )}

                <input
                    ref={ref}
                    className={twMerge(
                        baseClasses,
                        variantClasses[variant],
                        errorClasses,
                        startIcon && 'pl-10',
                        endIcon && 'pr-10',
                        fullWidth && 'w-full',
                        className
                    )}
                    {...props}
                />

                {endIcon && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {endIcon}
                    </div>
                )}
            </div>

            {(error || helperText) && (
                <p className={twMerge(
                    'text-sm mt-1',
                    error ? 'text-red-500' : 'text-gray-500'
                )}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
}); 