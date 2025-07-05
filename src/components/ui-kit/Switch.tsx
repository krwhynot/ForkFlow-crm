import React from 'react';
import { Switch as HeadlessSwitch } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';

export interface SwitchProps {
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
    label?: string;
    labelPlacement?: 'start' | 'end' | 'top' | 'bottom';
    className?: string;
    name?: string;
    value?: string;
    required?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
    checked,
    defaultChecked = false,
    onChange,
    disabled = false,
    size = 'medium',
    color = 'primary',
    label,
    labelPlacement = 'end',
    className,
    name,
    value,
    required = false,
}) => {
    const sizeClasses = {
        small: {
            switch: 'h-5 w-9',
            thumb: 'h-4 w-4',
            translate: 'translate-x-4',
        },
        medium: {
            switch: 'h-6 w-11',
            thumb: 'h-5 w-5',
            translate: 'translate-x-5',
        },
        large: {
            switch: 'h-7 w-14',
            thumb: 'h-6 w-6',
            translate: 'translate-x-7',
        },
    };

    const colorClasses = {
        primary: 'bg-blue-600',
        secondary: 'bg-gray-600',
        success: 'bg-green-600',
        error: 'bg-red-600',
        warning: 'bg-yellow-600',
        info: 'bg-cyan-600',
    };

    const isControlled = checked !== undefined;
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
    const isChecked = isControlled ? checked : internalChecked;

    const handleChange = (newChecked: boolean) => {
        if (!isControlled) {
            setInternalChecked(newChecked);
        }
        onChange?.(newChecked);
    };

    const switchClasses = twMerge(
        'relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2',
        sizeClasses[size].switch,
        isChecked ? colorClasses[color] : 'bg-gray-200',
        isChecked ? 'focus:ring-blue-500' : 'focus:ring-gray-500',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-pointer'
    );

    const thumbClasses = twMerge(
        'inline-block rounded-full bg-white shadow transform transition duration-200 ease-in-out',
        sizeClasses[size].thumb,
        isChecked ? sizeClasses[size].translate : 'translate-x-0.5'
    );

    const labelClasses = twMerge(
        'text-sm font-medium',
        disabled ? 'text-gray-400' : 'text-gray-700',
        labelPlacement === 'start' && 'mr-3',
        labelPlacement === 'end' && 'ml-3',
        labelPlacement === 'top' && 'mb-1',
        labelPlacement === 'bottom' && 'mt-1'
    );

    const containerClasses = twMerge(
        'inline-flex',
        (labelPlacement === 'top' || labelPlacement === 'bottom') && 'flex-col',
        (labelPlacement === 'start' || labelPlacement === 'end') && 'items-center',
        className
    );

    const switchElement = (
        <>
            <HeadlessSwitch
                checked={isChecked}
                onChange={handleChange}
                disabled={disabled}
                className={switchClasses}
                name={name}
                value={value}
            >
                <span className="sr-only">
                    {label || 'Toggle switch'}
                </span>
                <span className={thumbClasses} />
            </HeadlessSwitch>
            {/* Hidden input for form compatibility */}
            {name && (
                <input
                    type="checkbox"
                    name={name}
                    value={value || 'on'}
                    checked={isChecked}
                    onChange={() => {}}
                    required={required}
                    className="sr-only"
                    aria-hidden="true"
                />
            )}
        </>
    );

    if (!label) {
        return switchElement;
    }

    return (
        <label className={containerClasses}>
            {(labelPlacement === 'start' || labelPlacement === 'top') && (
                <span className={labelClasses}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </span>
            )}
            {switchElement}
            {(labelPlacement === 'end' || labelPlacement === 'bottom') && (
                <span className={labelClasses}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </span>
            )}
        </label>
    );
};

// FormControlLabel compatibility wrapper
export interface FormControlLabelProps {
    control: React.ReactElement;
    label: string;
    labelPlacement?: 'start' | 'end' | 'top' | 'bottom';
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

export const FormControlLabel: React.FC<FormControlLabelProps> = ({
    control,
    label,
    labelPlacement = 'end',
    disabled = false,
    required = false,
    className,
}) => {
    // Clone the control element and add the label props
    const controlWithLabel = React.cloneElement(control, {
        label,
        labelPlacement,
        disabled: disabled || control.props.disabled,
        required: required || control.props.required,
        className: twMerge(control.props.className, className),
    });

    return controlWithLabel;
};