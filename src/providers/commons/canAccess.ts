// FIXME: This should be exported from the ra-core package
type CanAccessParams<
    RecordType extends Record<string, any> = Record<string, any>,
> = {
    action: string;
    resource: string;
    record?: RecordType;
};

// Role-based permission matrix for ForkFlow CRM
const ROLE_PERMISSIONS = {
    admin: {
        // Admins have full access to everything
        '*': true,
    },
    manager: {
        // Managers can access most features but have limited user management
        settings: ['list', 'show'],
        users: ['list', 'show', 'create'], // Can create users but not delete
        sales: ['list', 'show', 'edit'],
        organizations: ['list', 'show', 'create', 'edit'],
        contacts: ['list', 'show', 'create', 'edit', 'delete'],
        interactions: ['list', 'show', 'create', 'edit'],
        opportunities: ['list', 'show', 'create', 'edit'],
        products: ['list', 'show', 'create', 'edit'],
        deals: ['list', 'show', 'create', 'edit'],
        analytics: ['list', 'show'],
        reports: ['list', 'show', 'create'],
    },
    broker: {
        // Brokers have limited access focused on their territory
        organizations: ['list', 'show', 'edit'], // Territory-filtered
        contacts: ['list', 'show', 'create', 'edit'], // Territory-filtered
        interactions: ['list', 'show', 'create', 'edit'], // Own interactions only
        opportunities: ['list', 'show', 'create', 'edit'], // Territory-filtered
        deals: ['list', 'show', 'create', 'edit'], // Territory-filtered
        visits: ['list', 'show', 'create', 'edit'], // Own visits only
        reminders: ['list', 'show', 'create', 'edit'], // Own reminders only
        products: ['list', 'show'], // Read-only access
        tasks: ['list', 'show', 'create', 'edit'], // Own tasks only
    },
};

export const canAccess = <
    RecordType extends Record<string, any> = Record<string, any>,
>(
    role: string,
    params: CanAccessParams<RecordType>
) => {
    // Admin has access to everything
    if (role === 'admin') {
        return true;
    }

    // Check if role exists in permission matrix
    const rolePermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];
    if (!rolePermissions) {
        return false; // Unknown role, deny access
    }

    // Check wildcard permission for admin
    if (rolePermissions['*']) {
        return true;
    }

    // Check specific resource permissions
    const resourcePermissions = rolePermissions[params.resource as keyof typeof rolePermissions];
    if (!resourcePermissions) {
        return false; // Resource not in permission matrix, deny access
    }

    // Check if action is allowed for this resource
    if (Array.isArray(resourcePermissions)) {
        return resourcePermissions.includes(params.action);
    }

    return false;
};

/**
 * Helper function to check if a user can access admin features
 */
export const isAdmin = (role: string): boolean => {
    return role === 'admin';
};

/**
 * Helper function to check if a user can manage users
 */
export const canManageUsers = (role: string): boolean => {
    return role === 'admin' || role === 'manager';
};

/**
 * Helper function to check if a user can view analytics
 */
export const canViewAnalytics = (role: string): boolean => {
    return role === 'admin' || role === 'manager';
};

/**
 * Helper function to check if data should be territory-filtered
 */
export const needsTerritoryFilter = (role: string): boolean => {
    return role === 'broker';
};
