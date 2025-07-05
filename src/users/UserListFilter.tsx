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
    UserIcon,
    ShieldCheckIcon,
    UserGroupIcon,
    UserCircleIcon,
    CheckCircleIcon,
    NoSymbolIcon,
    ClockIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline';

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
                    <FilterList label="Role" icon={<UserIcon className="w-5 h-5" />}>
                        <FilterListItem
                            label="Admin"
                            icon={<ShieldCheckIcon className="w-5 h-5" />}
                            value={{ role: 'admin' }}
                        />
                        <FilterListItem
                            label="Manager"
                            icon={<UserGroupIcon className="w-5 h-5" />}
                            value={{ role: 'manager' }}
                        />
                        <FilterListItem
                            label="Broker"
                            icon={<UserCircleIcon className="w-5 h-5" />}
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
                    <FilterList label="Status" icon={<CheckCircleIcon className="w-5 h-5" />}>
                        <FilterListItem
                            label="Active Users"
                            icon={<CheckCircleIcon className="w-5 h-5" />}
                            value={{ isActive: true }}
                        />
                        <FilterListItem
                            label="Inactive Users"
                            icon={<NoSymbolIcon className="w-5 h-5" />}
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
                    <FilterList label="Recent Activity" icon={<ClockIcon className="w-5 h-5" />}>
                        <FilterListItem
                            label="Logged in this week"
                            icon={<ClockIcon className="w-5 h-5" />}
                            value={{
                                lastLoginAt_gte: new Date(
                                    Date.now() - 7 * 24 * 60 * 60 * 1000
                                ).toISOString(),
                            }}
                        />
                        <FilterListItem
                            label="Logged in this month"
                            icon={<ClockIcon className="w-5 h-5" />}
                            value={{
                                lastLoginAt_gte: new Date(
                                    Date.now() - 30 * 24 * 60 * 60 * 1000
                                ).toISOString(),
                            }}
                        />
                        <FilterListItem
                            label="Never logged in"
                            icon={<ClockIcon className="w-5 h-5" />}
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
                        icon={<MapPinIcon className="w-5 h-5" />}
                    >
                        <FilterListItem
                            label="Has Territory"
                            icon={<MapPinIcon className="w-5 h-5" />}
                            value={{ hasTerritory: true }}
                        />
                        <FilterListItem
                            label="No Territory"
                            icon={<MapPinIcon className="w-5 h-5" />}
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
