import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface BreadcrumbsProps {
    children: React.ReactNode;
    separator?: React.ReactNode;
    className?: string;
    'aria-label'?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
    children,
    separator = '/',
    className,
    'aria-label': ariaLabel,
}) => {
    const breadcrumbsClasses = twMerge(
        'flex items-center flex-wrap gap-1',
        className
    );

    const childrenArray = React.Children.toArray(children);

    return (
        <nav className={breadcrumbsClasses} aria-label={ariaLabel || 'breadcrumbs'}>
            {childrenArray.map((child, index) => (
                <React.Fragment key={index}>
                    {child}
                    {index < childrenArray.length - 1 && (
                        <span className="breadcrumb-separator text-gray-400 text-sm mx-1">
                            {separator}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export interface BreadcrumbProps {
    children: React.ReactNode;
    href?: string;
    className?: string;
    onClick?: () => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
    children,
    href,
    className,
    onClick,
}) => {
    const breadcrumbClasses = twMerge(
        'text-sm text-gray-600 hover:text-gray-900 transition-colors',
        href && 'cursor-pointer hover:underline',
        className
    );

    if (href) {
        return (
            <a href={href} className={breadcrumbClasses} onClick={onClick}>
                {children}
            </a>
        );
    }

    return (
        <span className={breadcrumbClasses} onClick={onClick}>
            {children}
        </span>
    );
};