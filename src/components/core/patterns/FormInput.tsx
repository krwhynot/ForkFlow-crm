import {
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    EyeSlashIcon,
} from '@heroicons/react/24/outline';
import React, { useId, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { CircularProgress } from '../progress/CircularProgress';
import { Typography } from '../typography/Typography';

export interface FormInputProps {
    label: string;
    type?: 'text' | 'email' | 'phone' | 'number' | 'password' | 'url' | 'search';
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    error?: string;
    warning?: string;
    helperText?: string;
    required?: boolean;
    disabled?: boolean;
    loading?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    prefixIcon?: React.ReactNode;
    suffixIcon?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    inputClassName?: string;
    autoComplete?: string;
    autoFocus?: boolean;
    readOnly?: boolean;
    name?: string;
    id?: string;
}

/**
 * Enhanced form input component with comprehensive validation and features
 * Standardizes input patterns across the application
 */
export const FormInput: React.FC<FormInputProps> = ({
    label,
    type = 'text',
    placeholder,
    value,
    defaultValue,
    onChange,
    onBlur,
    onFocus,
    error,
    warning,
    helperText,
    required = false,
    disabled = false,
    loading = false,
    maxLength,
    minLength,
    pattern,
    prefixIcon,
    suffixIcon,
    size = 'md',
    className,
    inputClassName,
    autoComplete,
    autoFocus,
    readOnly,
    name,
    id: providedId,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [characterCount, setCharacterCount] = useState(value?.length || 0);
    const generatedId = useId();
    const inputId = providedId || generatedId;

    // Size classes
    const sizeClasses = {
        sm: 'text-sm px-3 py-2',
        md: 'text-base px-3 py-2.5',
        lg: 'text-lg px-4 py-3',
    };

    // Icon size classes
    const iconSizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };

    // Status styling
    const getInputClasses = () => {
        let classes = twMerge(
            'w-full rounded-lg border bg-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1',
            sizeClasses[size],
            prefixIcon && 'pl-10',
            (suffixIcon || type === 'password' || loading) && 'pr-10',
            disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
            readOnly && 'bg-gray-50 cursor-not-allowed'
        );

        if (error) {
            classes = twMerge(classes, 'border-red-300 focus:border-red-500 focus:ring-red-500');
        } else if (warning) {
            classes = twMerge(classes, 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500');
        } else {
            classes = twMerge(classes, 'border-gray-300 focus:border-blue-500 focus:ring-blue-500');
        }

        return twMerge(classes, inputClassName);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setCharacterCount(newValue.length);
        onChange?.(newValue);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
        <div className={twMerge('space-y-2', className)}>
            {/* Label */}
            <label
                htmlFor={inputId}
                className="block text-sm font-medium text-gray-700"
            >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* Input Container */}
            <div className="relative">
                {/* Prefix Icon */}
                {prefixIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <div className={twMerge('text-gray-400', iconSizeClasses[size])}>
                            {prefixIcon}
                        </div>
                    </div>
                )}

                {/* Input */}
                <input
                    id={inputId}
                    name={name}
                    type={inputType}
                    value={value}
                    defaultValue={defaultValue}
                    placeholder={placeholder}
                    onChange={handleInputChange}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    disabled={disabled || loading}
                    readOnly={readOnly}
                    required={required}
                    maxLength={maxLength}
                    minLength={minLength}
                    pattern={pattern}
                    autoComplete={autoComplete}
                    autoFocus={autoFocus}
                    className={getInputClasses()}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={twMerge(
                        error && `${inputId}-error`,
                        warning && `${inputId}-warning`,
                        helperText && `${inputId}-helper`
                    )}
                />

                {/* Suffix Icons */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
                    {loading && (
                        <CircularProgress size="sm" className="text-gray-400" />
                    )}

                    {type === 'password' && !loading && (
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className={twMerge(
                                'text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600',
                                iconSizeClasses[size]
                            )}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                        </button>
                    )}

                    {suffixIcon && !loading && type !== 'password' && (
                        <div className={twMerge('text-gray-400', iconSizeClasses[size])}>
                            {suffixIcon}
                        </div>
                    )}
                </div>
            </div>

            {/* Helper/Error Text */}
            <div className="space-y-1">
                {error && (
                    <div id={`${inputId}-error`} className="flex items-center space-x-1 text-red-600">
                        <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0" />
                        <Typography variant="caption" className="text-red-600">
                            {error}
                        </Typography>
                    </div>
                )}

                {warning && !error && (
                    <div id={`${inputId}-warning`} className="flex items-center space-x-1 text-yellow-600">
                        <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
                        <Typography variant="caption" className="text-yellow-600">
                            {warning}
                        </Typography>
                    </div>
                )}

                {helperText && !error && !warning && (
                    <Typography id={`${inputId}-helper`} variant="caption" className="text-gray-500">
                        {helperText}
                    </Typography>
                )}

                {/* Character Count */}
                {maxLength && (
                    <div className="flex justify-end">
                        <Typography
                            variant="caption"
                            className={twMerge(
                                'text-gray-500',
                                characterCount > maxLength * 0.9 && 'text-yellow-600',
                                characterCount >= maxLength && 'text-red-600'
                            )}
                        >
                            {characterCount}/{maxLength}
                        </Typography>
                    </div>
                )}
            </div>
        </div>
    );
}; 