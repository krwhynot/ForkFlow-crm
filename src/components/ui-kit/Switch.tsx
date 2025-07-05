import { Switch as HeadlessSwitch } from '@headlessui/react';
import React from 'react';
import { cn } from '../../utils/cn';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    id?: string;
    name?: string;
}

/**
 * Switch component – accessible toggle using Headless UI
 * API kept close to @mui/material Switch (checked / onChange / disabled)
 */
export const Switch: React.FC<SwitchProps> = ({
    checked,
    onChange,
    disabled = false,
    className,
    id,
    name,
}) => {
    return (
        <HeadlessSwitch
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                checked ? 'bg-blue-600' : 'bg-gray-200',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
            id={id}
            name={name}
        >
            <span
                className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    checked ? 'translate-x-5' : 'translate-x-1'
                )}
            />
        </HeadlessSwitch>
    );
};

export default Switch; 