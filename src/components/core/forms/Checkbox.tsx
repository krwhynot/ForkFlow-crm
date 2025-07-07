import React from 'react';
import { twMerge } from 'tailwind-merge';
import { CheckIcon } from '@heroicons/react/24/outline';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    error?: string;
    helperText?: string;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    size?: 'small' | 'medium' | 'large';
    indeterminate?: boolean;
}

/**
 * Checkbox component for form fields
 * Provides consistent styling and behavior for checkboxes
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({
    label,
    error,
    helperText,
    color = 'primary',
    size = 'medium',
    indeterminate = false,
    className,
    ...props
}, ref) => {
    const sizeClasses = {
        small: 'h-4 w-4',
        medium: 'h-5 w-5',
        large: 'h-6 w-6'
    };
    
    const colorClasses = {
        primary: 'text-blue-600 focus:ring-blue-500',
        secondary: 'text-gray-600 focus:ring-gray-500',
        success: 'text-green-600 focus:ring-green-500',
        warning: 'text-yellow-600 focus:ring-yellow-500',
        error: 'text-red-600 focus:ring-red-500'
    };
    
    const errorClasses = error ? 'border-red-500 focus:ring-red-500' : '';
    
    return (
        <div className="flex flex-col">
            <div className="flex items-center">
                <div className="relative">
                    <input
                        ref={ref}
                        type="checkbox"
                        className={twMerge(
                            'border-gray-300 rounded focus:ring-2 focus:ring-offset-2',
                            sizeClasses[size],
                            colorClasses[color],
                            errorClasses,
                            className
                        )}
                        {...props}
                    />
                    
                    {indeterminate && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-2 h-0.5 bg-current rounded" />
                        </div>
                    )}
                </div>
                
                {label && (
                    <label className="ml-2 text-sm text-gray-700">
                        {label}
                    </label>
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