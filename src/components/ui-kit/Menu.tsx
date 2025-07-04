/**
 * Menu and MenuItem Components
 * Dropdown menu components using Headless UI (extends existing Dropdown)
 */

import React from 'react';
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { cn } from '../../utils/cn';

interface MenuProps {
    button: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

interface MenuItemProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    component?: 'button' | 'div';
}

/**
 * Menu component for dropdown menus
 */
export const Menu: React.FC<MenuProps> = ({
    button,
    children,
    className,
}) => {
    return (
        <HeadlessMenu as="div" className={cn("relative inline-block text-left", className)}>
            <div>
                <HeadlessMenu.Button as="div">{button}</HeadlessMenu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <HeadlessMenu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="px-1 py-1">
                        {children}
                    </div>
                </HeadlessMenu.Items>
            </Transition>
        </HeadlessMenu>
    );
};

/**
 * MenuItem component for individual menu items
 */
export const MenuItem: React.FC<MenuItemProps> = ({
    children,
    onClick,
    disabled = false,
    className,
    component = 'button',
}) => {
    return (
        <HeadlessMenu.Item disabled={disabled}>
            {({ active }) => {
                const Component = component;
                return (
                    <Component
                        onClick={onClick}
                        className={cn(
                            'group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors',
                            active && !disabled
                                ? 'bg-blue-50 text-blue-900'
                                : 'text-gray-700',
                            disabled
                                ? 'opacity-50 cursor-not-allowed'
                                : 'cursor-pointer',
                            className
                        )}
                        disabled={disabled}
                    >
                        {children}
                    </Component>
                );
            }}
        </HeadlessMenu.Item>
    );
};

export default Menu;