import React from 'react';

interface TextFieldProps {
    id?: string;
    label?: string;
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    error?: boolean;
    helperText?: string;
    required?: boolean;
    disabled?: boolean;
    multiline?: boolean;
    rows?: number;
    variant?: 'standard' | 'outlined' | 'filled';
    size?: 'small' | 'medium';
    fullWidth?: boolean;
    className?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
    id,
    label,
    placeholder,
    value,
    defaultValue,
    onChange,
    onBlur,
    error = false,
    helperText,
    required = false,
    disabled = false,
    multiline = false,
    rows = 4,
    variant = 'outlined',
    size = 'medium',
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseClasses = `
    block rounded-md border-gray-300 shadow-sm
    focus:border-blue-500 focus:ring-blue-500
    disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
    ${size === 'small' ? 'text-sm py-1 px-2' : 'text-base py-2 px-3'}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

    const Component = multiline ? 'textarea' : 'input';

    return (
        <div className={fullWidth ? 'w-full' : ''}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <Component
                id={id}
                placeholder={placeholder}
                value={value}
                defaultValue={defaultValue}
                onChange={onChange}
                onBlur={onBlur}
                required={required}
                disabled={disabled}
                rows={multiline ? rows : undefined}
                className={baseClasses}
                {...props}
            />
            {helperText && (
                <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
                    {helperText}
                </p>
            )}
        </div>
    );
};

export default TextField; 