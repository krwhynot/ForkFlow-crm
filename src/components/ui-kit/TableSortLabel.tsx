import React from 'react';

interface TableSortLabelProps {
    active?: boolean;
    children?: React.ReactNode;
    className?: string;
    direction?: 'asc' | 'desc';
    disabled?: boolean;
    hideSortIcon?: boolean;
    IconComponent?: React.ComponentType<any>;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const TableSortLabel: React.FC<TableSortLabelProps> = ({
    active = false,
    children,
    className = '',
    direction = 'asc',
    disabled = false,
    hideSortIcon = false,
    IconComponent,
    onClick,
    ...props
}) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!disabled) {
            onClick?.(event);
        }
    };

    const baseClasses = `
    inline-flex items-center space-x-1 cursor-pointer
    font-medium text-gray-900 hover:text-gray-700
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${active ? 'text-blue-600' : ''}
    ${className}
  `;

    const SortIcon = IconComponent || (() => (
        <svg
            className={`w-4 h-4 transition-transform duration-200 ${active && direction === 'desc' ? 'rotate-180' : ''
                }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 11l5-5m0 0l5 5m-5-5v12"
            />
        </svg>
    ));

    return (
        <button
            type="button"
            className={baseClasses.trim()}
            onClick={handleClick}
            disabled={disabled}
            {...props}
        >
            <span>{children}</span>
            {!hideSortIcon && (
                <span className={`transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-0'}`}>
                    <SortIcon />
                </span>
            )}
        </button>
    );
};

export default TableSortLabel; 