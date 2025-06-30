/**
 * Role Chip Component
 * Visual role indicator with role-specific styling
 */

import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import {
    AdminPanelSettings as AdminIcon,
    SupervisorAccount as ManagerIcon,
    Person as BrokerIcon,
} from '@mui/icons-material';
import { UserRole } from '../../types';

interface RoleChipProps extends Omit<ChipProps, 'label' | 'color'> {
    role: UserRole;
    showIcon?: boolean;
    variant?: 'filled' | 'outlined';
}

const ROLE_CONFIG = {
    admin: {
        label: 'Administrator',
        color: 'error' as const,
        icon: <AdminIcon />,
        description: 'Full system access',
    },
    manager: {
        label: 'Manager',
        color: 'warning' as const,
        icon: <ManagerIcon />,
        description: 'Team and territory management',
    },
    broker: {
        label: 'Broker',
        color: 'primary' as const,
        icon: <BrokerIcon />,
        description: 'Field sales representative',
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
            <Chip
                label="Unknown"
                color="default"
                size={size}
                variant={variant}
                {...props}
            />
        );
    }

    return (
        <Chip
            label={config.label}
            color={config.color}
            size={size}
            variant={variant}
            icon={showIcon ? config.icon : undefined}
            title={config.description}
            {...props}
        />
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

    return (
        <Chip
            icon={config.icon}
            color={config.color}
            size={size}
            variant="outlined"
            title={`${config.label} - ${config.description}`}
        />
    );
};

export default RoleChip;