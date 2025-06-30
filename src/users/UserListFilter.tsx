// src/users/UserListFilter.tsx
import React from 'react';
import {
    Card,
    CardContent,
    Box,
    Typography,
    Divider,
    useMediaQuery,
    useTheme,
} from '@mui/material';
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

export const UserListFilter = () => {
    const { identity } = useGetIdentity();
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

    if (!isDesktop) {
        return null; // Hide filters on mobile to save space
    }

    return (
        <Card
            sx={{
                order: -1,
                mr: 2,
                mt: 9,
                width: 250,
                minHeight: 'fit-content',
                alignSelf: 'flex-start',
            }}
        >
            <CardContent sx={{ pt: 1 }}>
                <FilterLiveSearch 
                    placeholder="Search users..."
                    sx={{ mb: 2 }}
                />

                <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
                    Filter Users
                </Typography>

                <Divider sx={{ mb: 2 }} />

                {/* Role Filters */}
                <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.875rem' }}>
                        Role
                    </Typography>
                    <FilterList
                        label="Role"
                        icon={<PersonIcon />}
                    >
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

                <Divider sx={{ mb: 2 }} />

                {/* Status Filters */}
                <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.875rem' }}>
                        Status
                    </Typography>
                    <FilterList
                        label="Status"
                        icon={<ActiveIcon />}
                    >
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

                <Divider sx={{ mb: 2 }} />

                {/* Activity Filters */}
                <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.875rem' }}>
                        Activity
                    </Typography>
                    <FilterList
                        label="Recent Activity"
                        icon={<RecentIcon />}
                    >
                        <FilterListItem
                            label="Logged in this week"
                            icon={<RecentIcon />}
                            value={{ 
                                lastLoginAt_gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() 
                            }}
                        />
                        <FilterListItem
                            label="Logged in this month"
                            icon={<RecentIcon />}
                            value={{ 
                                lastLoginAt_gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() 
                            }}
                        />
                        <FilterListItem
                            label="Never logged in"
                            icon={<RecentIcon />}
                            value={{ lastLoginAt: null }}
                        />
                    </FilterList>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Territory Filters */}
                <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.875rem' }}>
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

                <Divider sx={{ mb: 2 }} />

                {/* Quick Stats */}
                <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.875rem' }}>
                        Quick Stats
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Use filters above to view specific user groups and manage access levels.
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

