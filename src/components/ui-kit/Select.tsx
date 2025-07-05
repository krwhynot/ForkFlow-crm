import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Select Component
 * Replaces Material-UI TextField with select functionality
 * Mobile-friendly dropdown with touch interactions
 */

interface SelectProps {
    value?: string | number;
    onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
    className?: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    size?: 'small' | 'medium' | 'large';
    variant?: 'outlined' | 'filled' | 'standard';
    fullWidth?: boolean;
    select?: boolean; // For compatibility with Material-UI TextField
}

interface SelectItemProps {
    value: string | number;
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
}

export const Select: React.FC<SelectProps> = ({
    value,
    onChange,
    children,
    className,
    label,
    placeholder,
    disabled = false,
    error = false,
    size = 'medium',
    variant = 'outlined',
    fullWidth = false,
    ...props
}) => {
    const getSizeClasses = () => {
        switch (size) {
            case 'small':
                return 'px-3 py-2 text-sm min-h-[44px]';
            case 'medium':
                return 'px-4 py-3 text-base min-h-[44px]';
            case 'large':
                return 'px-5 py-4 text-lg min-h-[44px]';
            default:
                return 'px-4 py-3 text-base min-h-[44px]';
        }
    };

    const getVariantClasses = () => {
        switch (variant) {
            case 'outlined':
                return 'border-2 border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200';
            case 'filled':
                return 'border-0 bg-gray-100 hover:bg-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-200';
            case 'standard':
                return 'border-0 border-b-2 border-gray-300 bg-transparent hover:border-gray-400 focus:border-blue-500 focus:ring-0 rounded-none';
            default:
                return 'border-2 border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200';
        }
    };

    const baseClasses = twMerge(
        'w-full rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'appearance-none cursor-pointer',
        getSizeClasses(),
        getVariantClasses(),
        error && 'border-red-500 focus:border-red-500 focus:ring-red-200',
        fullWidth && 'w-full',
        className
    );

    return (
        <div className={twMerge('relative', fullWidth && 'w-full')}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={baseClasses}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {children}
                </select>
                {/* Dropdown arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export const SelectItem: React.FC<SelectItemProps> = ({
    value,
    children,
    disabled = false,
    className,
}) => {
    return (
        <option
            value={value}
            disabled={disabled}
            className={twMerge(
                'py-2 px-4 text-gray-900 bg-white hover:bg-gray-50',
                disabled && 'text-gray-400 cursor-not-allowed',
                className
            )}
        >
            {children}
        </option>
    );
};

// Alias for compatibility with Material-UI
export const MenuItem = SelectItem;

export default Select;