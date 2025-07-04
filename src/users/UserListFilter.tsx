// src/users/UserListFilter.tsx
import React from 'react';
import {
    Card,
    CardContent,
    Box,
    Typography,
    Divider,
} from '@/components/ui-kit';
import {
    FilterList,
    FilterListItem,
    FilterLiveSearch,
    useGetIdentity,
} from 'react-admin';
import {
    Person as PersonIcon,
    AdminPanelSettings as AdminIcon,
    SupervisorAccount as ManagerIcon,
    SupportAgent as BrokerIcon,
    CheckCircle as ActiveIcon,
    Block as InactiveIcon,
    Schedule as RecentIcon,
    LocationOn as LocationIcon,
} from '@mui/icons-material';

import { UserRole } from '../types';
import { useBreakpoint } from '../hooks/useBreakpoint';

export const UserListFilter = () => {
    const { identity } = useGetIdentity();
    const isDesktop = useBreakpoint('md');

    if (!isDesktop) {
        return null; // Hide filters on mobile to save space
    }

    return (
        <Card className="order-first mr-4 mt-24 w-64 min-h-fit self-start">
            <CardContent className="pt-2">
                <FilterLiveSearch
                    placeholder="Search users..."
                    className="mb-4"
                />

                <Typography variant="h6" gutterBottom className="text-base">
                    Filter Users
                </Typography>

                <Divider className="mb-4" />

                {/* Role Filters */}
                <Box className="mb-4">
                    <Typography
                        variant="subtitle2"
                        gutterBottom
                        className="text-sm"
                    >
                        Role
                    </Typography>
                    <FilterList label="Role" icon={<PersonIcon />}>
                        <FilterListItem
                            label="Admin"
                            icon={<AdminIcon />}
                            value={{ role: 'admin' }}
                        />
                        <FilterListItem
                            label="Manager"
                            icon={<ManagerIcon />}
                            value={{ role: 'manager' }}
                        />
                        <FilterListItem
                            label="Broker"
                            icon={<BrokerIcon />}
                            value={{ role: 'broker' }}
                        />
                    </FilterList>
                </Box>

                <Divider className="mb-4" />

                {/* Status Filters */}
                <Box className="mb-4">
                    <Typography
                        variant="subtitle2"
                        gutterBottom
                        className="text-sm"
                    >
                        Status
                    </Typography>
                    <FilterList label="Status" icon={<ActiveIcon />}>
                        <FilterListItem
                            label="Active Users"
                            icon={<ActiveIcon />}
                            value={{ isActive: true }}
                        />
                        <FilterListItem
                            label="Inactive Users"
                            icon={<InactiveIcon />}
                            value={{ isActive: false }}
                        />
                    </FilterList>
                </Box>

                <Divider className="mb-4" />

                {/* Activity Filters */}
                <Box className="mb-4">
                    <Typography
                        variant="subtitle2"
                        gutterBottom
                        className="text-sm"
                    >
                        Activity
                    </Typography>
                    <FilterList label="Recent Activity" icon={<RecentIcon />}>
                        <FilterListItem
                            label="Logged in this week"
                            icon={<RecentIcon />}
                            value={{
                                lastLoginAt_gte: new Date(
                                    Date.now() - 7 * 24 * 60 * 60 * 1000
                                ).toISOString(),
                            }}
                        />
                        <FilterListItem
                            label="Logged in this month"
                            icon={<RecentIcon />}
                            value={{
                                lastLoginAt_gte: new Date(
                                    Date.now() - 30 * 24 * 60 * 60 * 1000
                                ).toISOString(),
                            }}
                        />
                        <FilterListItem
                            label="Never logged in"
                            icon={<RecentIcon />}
                            value={{ lastLoginAt: null }}
                        />
                    </FilterList>
                </Box>

                <Divider className="mb-4" />

                {/* Territory Filters */}
                <Box className="mb-4">
                    <Typography
                        variant="subtitle2"
                        gutterBottom
                        className="text-sm"
                    >
                        Territory
                    </Typography>
                    <FilterList
                        label="Territory Assignment"
                        icon={<LocationIcon />}
                    >
                        <FilterListItem
                            label="Has Territory"
                            icon={<LocationIcon />}
                            value={{ hasTerritory: true }}
                        />
                        <FilterListItem
                            label="No Territory"
                            icon={<LocationIcon />}
                            value={{ hasTerritory: false }}
                        />
                    </FilterList>
                </Box>

                <Divider className="mb-4" />

                {/* Quick Stats */}
                <Box className="">
                    <Typography
                        variant="subtitle2"
                        gutterBottom
                        className="text-sm"
                    >
                        Quick Stats
                    </Typography>
                    <Typography variant="caption" className="text-gray-500">
                        Use filters above to view specific user groups and
                        manage access levels.
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};
