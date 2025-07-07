import React, { useState, useRef, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface DropdownItemProps {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    className?: string;
}

export interface DropdownProps {
    trigger: React.ReactNode;
    items?: DropdownItemProps[];
    children?: React.ReactNode;
    placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
    className?: string;
    menuClassName?: string;
}

/**
 * Dropdown menu component
 * Provides a dropdown menu with trigger and menu items
 */
export const Dropdown: React.FC<DropdownProps> = ({
    trigger,
    items = [],
    children,
    placement = 'bottom-start',
    className,
    menuClassName,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const placementClasses = {
        'bottom-start': 'top-full left-0 mt-1',
        'bottom-end': 'top-full right-0 mt-1',
        'top-start': 'bottom-full left-0 mb-1',
        'top-end': 'bottom-full right-0 mb-1',
    };

    return (
        <div className={twMerge('relative inline-block', className)} ref={dropdownRef}>
            <button
                type="button"
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
                onClick={() => setIsOpen(!isOpen)}
            >
                {trigger}
                <ChevronDownIcon className="h-4 w-4" />
            </button>

            {isOpen && (
                <div
                    className={twMerge(
                        'absolute z-50 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
                        placementClasses[placement],
                        menuClassName
                    )}
                >
                    <div className="py-1">
                        {children || items.map((item, index) => (
                            <DropdownItem
                                key={index}
                                {...item}
                                onClick={() => {
                                    item.onClick?.();
                                    setIsOpen(false);
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Individual dropdown item component
 */
export const DropdownItem: React.FC<DropdownItemProps> = ({
    label,
    onClick,
    href,
    icon,
    disabled = false,
    className,
}) => {
    const baseClasses = 'flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900';
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    const content = (
        <>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span>{label}</span>
        </>
    );

    if (href && !disabled) {
        return (
            <a
                href={href}
                className={twMerge(baseClasses, disabledClasses, className)}
                onClick={onClick}
            >
                {content}
            </a>
        );
    }

    return (
        <button
            type="button"
            className={twMerge(baseClasses, disabledClasses, 'w-full text-left', className)}
            onClick={onClick}
            disabled={disabled}
        >
            {content}
        </button>
    );
}; 