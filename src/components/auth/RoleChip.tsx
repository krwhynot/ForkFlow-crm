/**
 * Role Chip Component
 * Visual role indicator with role-specific styling
 */

import React from 'react';
import {
    AdjustmentsHorizontalIcon,
    UserGroupIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import { UserRole } from '../../types';

interface RoleChipProps {
    role: UserRole;
    showIcon?: boolean;
    variant?: 'filled' | 'outlined';
    size?: 'small' | 'medium';
}

const ROLE_CONFIG: Record<UserRole, {
    label: string;
    icon: React.ForwardRefExoticComponent<React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & { title?: string; titleId?: string; } & React.RefAttributes<SVGSVGElement>>;
    color: string;
    description: string;
}> = {
    admin: {
        label: 'Administrator',
        icon: AdjustmentsHorizontalIcon,
        color: 'text-red-500 bg-red-100 border-red-500',
        description: 'Full system access',
    },
    manager: {
        label: 'Manager',
        icon: UserGroupIcon,
        color: 'text-yellow-500 bg-yellow-100 border-yellow-500',
        description: 'Team and territory management',
    },
    broker: {
        label: 'Broker',
        icon: UserIcon,
        color: 'text-blue-500 bg-blue-100 border-blue-500',
        description: 'Field sales representative',
    },
    user: {
        label: 'User',
        icon: UserIcon,
        color: 'text-gray-500 bg-gray-100 border-gray-500',
        description: 'User',
    },
};

/**
 * Displays a user role as a styled chip with optional icon
 */
export const RoleChip: React.FC<RoleChipProps> = ({
    role,
    showIcon = true,
    variant = 'filled',
    size = 'small',
    ...props
}) => {
    const config = ROLE_CONFIG[role];

    if (!config) {
        return (
            <div
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300`}
            >
                Unknown
            </div>
        );
    }

    const Icon = config.icon;

    return (
        <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                variant === 'filled'
                    ? config.color
                    : `border ${config.color.replace(/bg-\w+-\d+/, '')}`
            }`}
            title={config.description}
        >
            {showIcon && <Icon className="h-4 w-4 mr-1.5" />}
            {config.label}
        </div>
    );
};

/**
 * Hook to get role configuration
 */
export const useRoleConfig = (role: UserRole) => {
    return ROLE_CONFIG[role] || null;
};

/**
 * Role indicator with tooltip showing permissions
 */
export const RoleIndicator: React.FC<{
    role: UserRole;
    showLabel?: boolean;
    size?: 'small' | 'medium';
}> = ({ role, showLabel = true, size = 'small' }) => {
    const config = ROLE_CONFIG[role];

    if (!config) return null;

    if (showLabel) {
        return <RoleChip role={role} size={size} />;
    }

    const Icon = config.icon;

    return (
        <div
            className={`inline-flex items-center p-1.5 rounded-full border ${config.color.replace(
                /bg-\w+-\d+/,
                ''
            )}`}
            title={`${config.label} - ${config.description}`}
        >
            <Icon className="h-5 w-5" />
        </div>
    );
};

export default RoleChip;
