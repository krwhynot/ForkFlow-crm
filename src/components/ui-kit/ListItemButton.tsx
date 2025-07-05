import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface ListItemButtonProps {
    children?: React.ReactNode;
    component?: React.ComponentType<any> | string;
    to?: string;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    sx?: any; // For compatibility during migration
    [key: string]: any;
}

/**
 * ListItemButton component - Material-UI compatible list item button
 * Built with Tailwind CSS for ForkFlow-CRM
 */
export const ListItemButton: React.FC<ListItemButtonProps> = ({
    children,
    component,
    to,
    href,
    onClick,
    disabled = false,
    className,
    sx,
    ...props
}) => {
    const baseClasses = cn(
        'w-full flex items-center px-4 py-2 text-left transition-colors duration-200',
        'hover:bg-gray-50 focus:bg-gray-50 focus:outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Touch-friendly minimum height
        'min-h-[48px]',
        className
    );

    // Handle sx prop for migration compatibility
    const sxStyles = sx ? {
        minHeight: sx.minHeight || sx.minH || undefined,
        padding: sx.p ? `${sx.p * 8}px` : undefined,
        paddingX: sx.px ? `${sx.px * 8}px` : undefined,
        paddingY: sx.py ? `${sx.py * 8}px` : undefined,
    } : {};

    if (component === Link && to) {
        return (
            <Link
                to={to}
                className={baseClasses}
                style={sxStyles}
                onClick={onClick}
                {...props}
            >
                {children}
            </Link>
        );
    }

    if (href) {
        return (
            <a
                href={href}
                className={baseClasses}
                style={sxStyles}
                onClick={onClick}
                {...props}
            >
                {children}
            </a>
        );
    }

    return (
        <button
            className={baseClasses}
            style={sxStyles}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default ListItemButton;