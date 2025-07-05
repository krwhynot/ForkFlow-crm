import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    helperText?: string;
    error?: boolean;
    fullWidth?: boolean;
    multiline?: boolean;
    rows?: number;
    variant?: 'outlined' | 'filled' | 'standard';
    size?: 'small' | 'medium' | 'large';
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;
    required?: boolean;
    InputProps?: {
        startAdornment?: React.ReactNode;
        endAdornment?: React.ReactNode;
    };
    InputLabelProps?: {
        shrink?: boolean;
    };
    FormHelperTextProps?: {
        className?: string;
    };
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
    (
        {
            label,
            helperText,
            error = false,
            fullWidth = false,
            multiline = false,
            rows = 4,
            variant = 'outlined',
            size = 'medium',
            startAdornment,
            endAdornment,
            required = false,
            className,
            disabled = false,
            InputProps,
            InputLabelProps,
            FormHelperTextProps,
            ...props
        },
        ref
    ) => {
        const sizeClasses = {
            small: 'h-10 text-sm',
            medium: 'h-11 text-base',
            large: 'h-12 text-lg',
        };

        const variantClasses = {
            outlined: `border rounded-lg ${
                error
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`,
            filled: `border-0 border-b-2 bg-gray-100 rounded-t-lg ${
                error
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500'
            }`,
            standard: `border-0 border-b ${
                error
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500'
            }`,
        };

        const baseInputClasses = `
            w-full px-3 py-2 
            placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            transition-colors duration-200
        `;

        const inputClasses = twMerge(
            baseInputClasses,
            !multiline && sizeClasses[size],
            variantClasses[variant],
            fullWidth && 'w-full',
            (startAdornment || InputProps?.startAdornment) && 'pl-10',
            (endAdornment || InputProps?.endAdornment) && 'pr-10',
            className
        );

        const labelClasses = twMerge(
            'block text-sm font-medium mb-1',
            error ? 'text-red-600' : 'text-gray-700',
            disabled && 'text-gray-400'
        );

        const helperTextClasses = twMerge(
            'mt-1 text-sm',
            error ? 'text-red-600' : 'text-gray-500',
            FormHelperTextProps?.className
        );

        const containerClasses = twMerge(
            'relative',
            fullWidth && 'w-full'
        );

        const adornmentClasses = 'absolute top-1/2 -translate-y-1/2 text-gray-400';

        return (
            <div className={containerClasses}>
                {label && (
                    <label className={labelClasses}>
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                
                <div className="relative">
                    {(startAdornment || InputProps?.startAdornment) && (
                        <div className={twMerge(adornmentClasses, 'left-3')}>
                            {startAdornment || InputProps?.startAdornment}
                        </div>
                    )}
                    
                    {multiline ? (
                        <textarea
                            ref={ref as any}
                            rows={rows}
                            className={inputClasses}
                            disabled={disabled}
                            required={required}
                            {...(props as any)}
                        />
                    ) : (
                        <input
                            ref={ref}
                            className={inputClasses}
                            disabled={disabled}
                            required={required}
                            {...props}
                        />
                    )}
                    
                    {(endAdornment || InputProps?.endAdornment || error) && (
                        <div className={twMerge(adornmentClasses, 'right-3')}>
                            {error && !endAdornment && !InputProps?.endAdornment ? (
                                <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
                            ) : (
                                endAdornment || InputProps?.endAdornment
                            )}
                        </div>
                    )}
                </div>
                
                {helperText && (
                    <p className={helperTextClasses}>
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

TextField.displayName = 'TextField';

// Compatibility wrapper for TextInput
export const TextInput = TextField;