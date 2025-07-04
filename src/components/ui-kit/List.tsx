/**
 * List Components
 * Simple list components for displaying items
 */

import React from 'react';
import { cn } from '../../utils/cn';

interface ListProps {
    children: React.ReactNode;
    dense?: boolean;
    className?: string;
}

interface ListItemProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

interface ListItemIconProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

interface ListItemTextProps {
    primary: React.ReactNode;
    secondary?: React.ReactNode;
    className?: string;
}

interface ListItemButtonProps {
    children: React.ReactNode;
    className?: string;
    component?: React.ElementType;
    to?: string;
    state?: any;
    onClick?: () => void;
    disablePadding?: boolean;
}

interface ListItemAvatarProps {
    children: React.ReactNode;
    className?: string;
}

interface ListItemSecondaryActionProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * List container component
 */
export const List: React.FC<ListProps> = ({
    children,
    dense = false,
    className,
}) => {
    return (
        <ul
            className={cn('list-none p-0 m-0', dense && 'space-y-1', className)}
        >
            {children}
        </ul>
    );
};

/**
 * List item component
 */
export const ListItem: React.FC<ListItemProps> = ({
    children,
    className,
    style,
}) => {
    return (
        <li className={cn('flex items-center py-2', className)} style={style}>
            {children}
        </li>
    );
};

/**
 * List item button component
 */
export const ListItemButton: React.FC<ListItemButtonProps> = ({
    children,
    className,
    component = 'button',
    to,
    state,
    onClick,
    disablePadding = false,
}) => {
    const Component = component;
    const baseClasses = cn(
        'flex items-center w-full text-left',
        disablePadding ? 'p-0' : 'px-4 py-2',
        'hover:bg-gray-50 focus:bg-gray-50',
        'transition-colors duration-200',
        className
    );

    return (
        <Component
            className={baseClasses}
            to={to}
            state={state}
            onClick={onClick}
        >
            {children}
        </Component>
    );
};

/**
 * List item icon component
 */
export const ListItemIcon: React.FC<ListItemIconProps> = ({
    children,
    className,
    style,
}) => {
    return (
        <div className={cn('mr-3 flex-shrink-0', className)} style={style}>
            {children}
        </div>
    );
};

/**
 * List item text component
 */
export const ListItemText: React.FC<ListItemTextProps> = ({
    primary,
    secondary,
    className,
}) => {
    return (
        <div className={cn('flex-grow', className)}>
            <div className="text-sm font-medium text-gray-900">{primary}</div>
            {secondary && (
                <div className="text-xs text-gray-500">{secondary}</div>
            )}
        </div>
    );
};

/**
 * List item avatar component
 */
export const ListItemAvatar: React.FC<ListItemAvatarProps> = ({
    children,
    className,
}) => {
    return (
        <div className={cn('mr-3 flex-shrink-0', className)}>{children}</div>
    );
};

/**
 * List item secondary action component
 */
export const ListItemSecondaryAction: React.FC<
    ListItemSecondaryActionProps
> = ({ children, className }) => {
    return (
        <div className={cn('ml-auto flex-shrink-0', className)}>{children}</div>
    );
};

export default List;
