// src/users/UserShow.tsx
import React from 'react';
import {
    Show,
    SimpleShowLayout,
    TextField,
    DateField,
    BooleanField,
    EmailField,
    ArrayField,
    SingleFieldList,
    ChipField,
    useRecordContext,
    TopToolbar,
    EditButton,
    ListButton,
    DeleteButton,
} from 'react-admin';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Chip,
    Stack,
    Divider,
    Grid,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Security as SecurityIcon,
    LocationOn as LocationIcon,
    Business as BusinessIcon,
    History as HistoryIcon,
    Login as LoginIcon,
    Schedule as ScheduleIcon,
} from '@mui/icons-material';

import { User } from '../types';
import { RoleChip } from '../components/auth/RoleChip';
import { TerritoryDisplay, TerritoryBadge } from '../components/TerritoryDisplay';

export const UserShow = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Show
            title={<UserShowTitle />}
            actions={<UserShowActions />}
            sx={{
                '& .RaShow-main': {
                    maxWidth: isMobile ? '100%' : 1000,
                    margin: '0 auto',
                },
            }}
        >
            <UserShowLayout />
        </Show>
    );
};

const UserShowTitle = () => {
    const record = useRecordContext<User>();
    if (!record) return null;
    
    return (
        <span>
            User: {record.firstName} {record.lastName}
        </span>
    );
};

const UserShowActions = () => (
    <TopToolbar>
        <EditButton />
        <ListButton />
        <DeleteButton />
    </TopToolbar>
);

const UserShowLayout = () => {
    const record = useRecordContext<User>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (!record) return null;

    return (
        <Box>
            {/* User Header */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box display="flex" alignItems="center" gap={3}>
                        <Avatar
                            src={record.avatar}
                            sx={{ 
                                width: isMobile ? 80 : 120, 
                                height: isMobile ? 80 : 120,
                                fontSize: isMobile ? '2rem' : '3rem'
                            }}
                        >
                            {record.firstName[0]}{record.lastName[0]}
                        </Avatar>
                        
                        <Box flex={1}>
                            <Typography variant="h4" component="h1" gutterBottom>
                                {record.firstName} {record.lastName}
                            </Typography>
                            
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <EmailIcon color="action" fontSize="small" />
                                <Typography variant="h6" color="text.secondary">
                                    {record.email}
                                </Typography>
                            </Box>
                            
                            <Box display="flex" gap={1} flexWrap="wrap">
                                <RoleChip role={record.role} />
                                
                                <Chip
                                    icon={record.isActive ? <LoginIcon /> : <SecurityIcon />}
                                    label={record.isActive ? 'Active' : 'Inactive'}
                                    color={record.isActive ? 'success' : 'error'}
                                    variant="outlined"
                                />
                                
                                {record.territory && record.territory.length > 0 && (
                                    <Chip
                                        icon={<LocationIcon />}
                                        label={`${record.territory.length} territory area${record.territory.length !== 1 ? 's' : ''}`}
                                        color="primary"
                                        variant="outlined"
                                    />
                                )}
                            </Box>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                {/* Account Information */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Account Information
                            </Typography>
                            
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Full Name
                                    </Typography>
                                    <Typography variant="body1">
                                        {record.firstName} {record.lastName}
                                    </Typography>
                                </Box>
                                
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Email Address
                                    </Typography>
                                    <Typography variant="body1">
                                        {record.email}
                                    </Typography>
                                </Box>
                                
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Role
                                    </Typography>
                                    <RoleChip role={record.role} />
                                </Box>
                                
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Status
                                    </Typography>
                                    <Chip
                                        label={record.isActive ? 'Active' : 'Inactive'}
                                        color={record.isActive ? 'success' : 'error'}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Activity Information */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Activity Information
                            </Typography>
                            
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Account Created
                                    </Typography>
                                    <Typography variant="body1">
                                        {new Date(record.createdAt).toLocaleDateString()} at {new Date(record.createdAt).toLocaleTimeString()}
                                    </Typography>
                                </Box>
                                
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Last Updated
                                    </Typography>
                                    <Typography variant="body1">
                                        {new Date(record.updatedAt).toLocaleDateString()} at {new Date(record.updatedAt).toLocaleTimeString()}
                                    </Typography>
                                </Box>
                                
                                {record.lastLoginAt && (
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Last Login
                                        </Typography>
                                        <Typography variant="body1">
                                            {new Date(record.lastLoginAt).toLocaleDateString()} at {new Date(record.lastLoginAt).toLocaleTimeString()}
                                        </Typography>
                                    </Box>
                                )}
                                
                                {!record.lastLoginAt && (
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Login Status
                                        </Typography>
                                        <Chip
                                            label="Never logged in"
                                            color="warning"
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Territory Information - Only for brokers */}
                {record.role === 'broker' && (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Sales Territory
                                </Typography>
                                
                                {record.territory && record.territory.length > 0 ? (
                                    <Box>
                                        <TerritoryDisplay 
                                            territory={record.territory}
                                            showTooltip={true}
                                            size="medium"
                                        />
                                        
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Assigned Areas:
                                            </Typography>
                                            <TerritoryBadge territory={record.territory} maxItems={10} />
                                        </Box>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No territory assigned to this broker.
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Principals Information - Only for brokers */}
                {record.role === 'broker' && record.principals && record.principals.length > 0 && (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Principals & Brands
                                </Typography>
                                
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {record.principals.map((principal) => (
                                        <Chip
                                            key={principal}
                                            label={principal}
                                            color="secondary"
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* System Information */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                System Information
                            </Typography>
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        User ID
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                        {record.id}
                                    </Typography>
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Account Type
                                    </Typography>
                                    <Typography variant="body1">
                                        {record.role.charAt(0).toUpperCase() + record.role.slice(1)} User
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};