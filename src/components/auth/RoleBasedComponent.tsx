/**
 * Role-Based Component Wrapper
 * Conditionally renders content based on user role and permissions
 */

import React from 'react';
import { useGetIdentity } from 'react-admin';
import { User, UserRole } from '../../types';

interface RoleBasedComponentProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    requireAll?: boolean;
    fallback?: React.ReactNode;
    className?: string;
}

/**
 * Renders children only if the current user has the required role(s)
 */
export const RoleBasedComponent: React.FC<RoleBasedComponentProps> = ({
    children,
    allowedRoles = [],
    requireAll = false,
    fallback = null,
    className,
}) => {
    const { data: identity, isPending } = useGetIdentity();

    // Show nothing while loading
    if (isPending) {
        return null;
    }

    // If no identity or no allowed roles specified, show fallback
    if (!identity || allowedRoles.length === 0) {
        return <>{fallback}</>;
    }

    const userRole = identity.role;
    const hasAccess = requireAll
        ? allowedRoles.every(role => role === userRole)
        : allowedRoles.includes(userRole);

    return hasAccess ? (
        <div className={className}>{children}</div>
    ) : (
        <>{fallback}</>
    );
};

/**
 * Higher-order component for role-based rendering
 */
export const withRoleAccess = <P extends object>(
    Component: React.ComponentType<P>,
    allowedRoles: UserRole[],
    fallback?: React.ReactNode
) => {
    return (props: P) => (
        <RoleBasedComponent allowedRoles={allowedRoles} fallback={fallback}>
            <Component {...props} />
        </RoleBasedComponent>
    );
};

/**
 * Hook to check if current user has specific role
 */
export const useUserRole = () => {
    const { data: identity, isPending } = useGetIdentity();
    
    return {
        role: identity?.role,
        isAdmin: identity?.role === 'admin',
        isManager: identity?.role === 'manager',
        isBroker: identity?.role === 'broker',
        isPending,
        hasRole: (role: UserRole) => identity?.role === role,
        hasAnyRole: (roles: UserRole[]) => roles.includes(identity?.role || '' as UserRole),
    };
};

/**
 * Convenience components for specific roles
 */
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
    children,
    fallback,
}) => (
    <RoleBasedComponent allowedRoles={['admin']} fallback={fallback}>
        {children}
    </RoleBasedComponent>
);

export const ManagerOrAdmin: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
    children,
    fallback,
}) => (
    <RoleBasedComponent allowedRoles={['admin', 'manager']} fallback={fallback}>
        {children}
    </RoleBasedComponent>
);

export const BrokerOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
    children,
    fallback,
}) => (
    <RoleBasedComponent allowedRoles={['broker']} fallback={fallback}>
        {children}
    </RoleBasedComponent>
);