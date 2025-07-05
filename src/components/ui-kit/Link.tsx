import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface LinkProps {
    children: React.ReactNode;
    href?: string;
    to?: string;
    className?: string;
    component?: React.ElementType;
    underline?: 'none' | 'hover' | 'always';
    color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
    target?: '_blank' | '_self' | '_parent' | '_top';
    rel?: string;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const Link: React.FC<LinkProps> = ({
    children,
    href,
    to,
    className,
    component: Component = 'a',
    underline = 'hover',
    color = 'primary',
    target,
    rel,
    onClick,
}) => {
    const colorClasses = {
        inherit: 'text-inherit',
        primary: 'text-blue-600 hover:text-blue-800',
        secondary: 'text-gray-600 hover:text-gray-800',
        error: 'text-red-600 hover:text-red-800',
        warning: 'text-yellow-600 hover:text-yellow-800',
        info: 'text-blue-500 hover:text-blue-700',
        success: 'text-green-600 hover:text-green-800',
    };

    const underlineClasses = {
        none: 'no-underline',
        hover: 'no-underline hover:underline',
        always: 'underline',
    };

    const linkClasses = twMerge(
        'transition-colors duration-200',
        colorClasses[color],
        underlineClasses[underline],
        className
    );

    const linkProps = {
        className: linkClasses,
        href: href || to,
        target,
        rel,
        onClick,
    };

    return (
        <Component {...linkProps}>
            {children}
        </Component>
    );
};