import React from 'react';

export interface StatusBadgeProps {
    status: 'Ready' | 'In Development' | 'Coming Soon' | 'Planned' | 'active' | 'inactive' | 'pending';
    variant?: 'default' | 'small' | 'large';
    className?: string;
}

/**
 * Standardized status badge component to replace inline status styling patterns
 * Reduces duplicate class usage across high-complexity components
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    variant = 'default',
    className = ''
}) => {
    const getStatusStyles = (status: string) => {
        const statusMap = {
            Ready: 'bg-success-100 text-success-700',
            'In Development': 'bg-warning-100 text-warning-700',
            'Coming Soon': 'bg-primary-100 text-primary-700',
            Planned: 'bg-secondary-100 text-secondary-700',
            active: 'bg-success-100 text-success-700',
            inactive: 'bg-gray-100 text-gray-700',
            pending: 'bg-warning-100 text-warning-700',
        };
        return statusMap[status as keyof typeof statusMap] || 'bg-gray-100 text-gray-700';
    };

    const getSizeStyles = (variant: string) => {
        const sizeMap = {
            small: 'px-2 py-0.5 text-xs',
            default: 'px-2 py-1 text-xs',
            large: 'px-3 py-1.5 text-sm',
        };
        return sizeMap[variant as keyof typeof sizeMap] || sizeMap.default;
    };

    return (
        <div
            className={`
                inline-flex items-center rounded font-medium
                ${getStatusStyles(status)}
                ${getSizeStyles(variant)}
                ${className}
            `.trim()}
        >
            {status}
        </div>
    );
};