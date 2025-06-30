/**
 * Role-Specific Dashboard Components
 * Customized dashboard experience based on user role
 */

import React from 'react';
import { Grid, Stack, Typography, Card, CardContent, Alert } from '@mui/material';
import {
    AdminPanelSettings as AdminIcon,
    SupervisorAccount as ManagerIcon,
    Person as BrokerIcon,
} from '@mui/icons-material';
import { useGetIdentity } from 'react-admin';
import { User } from '../types';
import { RoleChip } from '../components/auth/RoleChip';
import { DealsChart } from './DealsChart';
import { HotContacts } from './HotContacts';
import { TasksList } from './TasksList';
import { DashboardActivityLog } from './DashboardActivityLog';

/**
 * Admin Dashboard - System overview and management tools
 */
export const AdminDashboard: React.FC = () => {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <AdminIcon color="error" />
                            <Typography variant="h5">
                                Administrator Dashboard
                            </Typography>
                            <RoleChip role="admin" />
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Complete system access and management capabilities
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
                <DealsChart />
            </Grid>
            
            <Grid item xs={12} md={6}>
                <HotContacts />
            </Grid>
            
            <Grid item xs={12} md={6}>
                <TasksList />
            </Grid>
            
            <Grid item xs={12} md={6}>
                <DashboardActivityLog />
            </Grid>
            
            <Grid item xs={12}>
                <Alert severity="info">
                    <Typography variant="body2">
                        <strong>Admin Features:</strong> User management, system settings, 
                        global analytics, and full data access across all territories.
                    </Typography>
                </Alert>
            </Grid>
        </Grid>
    );
};

/**
 * Manager Dashboard - Team management and analytics
 */
export const ManagerDashboard: React.FC = () => {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <ManagerIcon color="warning" />
                            <Typography variant="h5">
                                Manager Dashboard
                            </Typography>
                            <RoleChip role="manager" />
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Team performance monitoring and territory management
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
                <DealsChart />
            </Grid>
            
            <Grid item xs={12} md={4}>
                <HotContacts />
            </Grid>
            
            <Grid item xs={12} md={6}>
                <TasksList />
            </Grid>
            
            <Grid item xs={12} md={6}>
                <DashboardActivityLog />
            </Grid>
            
            <Grid item xs={12}>
                <Alert severity="info">
                    <Typography variant="body2">
                        <strong>Manager Features:</strong> Team analytics, territory performance, 
                        user creation, and cross-territory visibility.
                    </Typography>
                </Alert>
            </Grid>
        </Grid>
    );
};

/**
 * Broker Dashboard - Personal metrics and field tools
 */
export const BrokerDashboard: React.FC = () => {
    const { data: identity } = useGetIdentity<User>();
    
    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <BrokerIcon color="primary" />
                            <Typography variant="h5">
                                Field Sales Dashboard
                            </Typography>
                            <RoleChip role="broker" />
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Personal performance and territory management
                        </Typography>
                        {identity?.territory && identity.territory.length > 0 && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                <strong>Territory:</strong> {identity.territory.join(', ')}
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
                <HotContacts />
            </Grid>
            
            <Grid item xs={12} md={6}>
                <TasksList />
            </Grid>
            
            <Grid item xs={12} md={6}>
                <DealsChart />
            </Grid>
            
            <Grid item xs={12} md={6}>
                <DashboardActivityLog />
            </Grid>
            
            <Grid item xs={12}>
                <Alert severity="info">
                    <Typography variant="body2">
                        <strong>Broker Features:</strong> Territory-specific contacts and deals, 
                        visit tracking, personal task management, and mobile field tools.
                    </Typography>
                </Alert>
            </Grid>
        </Grid>
    );
};

/**
 * Role-based dashboard wrapper that renders appropriate dashboard
 */
export const RoleDashboard: React.FC = () => {
    const { data: identity, isPending } = useGetIdentity<User>();
    
    if (isPending) {
        return (
            <Card>
                <CardContent>
                    <Typography>Loading dashboard...</Typography>
                </CardContent>
            </Card>
        );
    }
    
    if (!identity) {
        return (
            <Card>
                <CardContent>
                    <Alert severity="error">
                        Unable to load user information
                    </Alert>
                </CardContent>
            </Card>
        );
    }
    
    switch (identity.role) {
        case 'admin':
            return <AdminDashboard />;
        case 'manager':
            return <ManagerDashboard />;
        case 'broker':
            return <BrokerDashboard />;
        default:
            return (
                <Card>
                    <CardContent>
                        <Alert severity="warning">
                            Unknown user role: {identity.role}
                        </Alert>
                    </CardContent>
                </Card>
            );
    }
};