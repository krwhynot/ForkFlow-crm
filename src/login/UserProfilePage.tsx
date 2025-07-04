/**
 * User Profile Management Page
 * Allows users to update their profile information and change password
 */

import React, { useState } from 'react';
import {
    Container,
    Paper,
    Stack,
    Typography,
    Box,
    Tab,
    Tabs,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useAuthProvider, useDataProvider, useNotify } from 'react-admin';
import { useQuery } from '@tanstack/react-query';
import { CrmDataProvider } from '../providers/types';
import { User } from '../types';
import { ProfileForm } from './components/ProfileForm';
import { PasswordChangeForm } from './components/PasswordChangeForm';
import { SecuritySettings } from './components/SecuritySettings';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`profile-tabpanel-${index}`}
            aria-labelledby={`profile-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `profile-tab-${index}`,
        'aria-controls': `profile-tabpanel-${index}`,
    };
}

export const UserProfilePage = () => {
    const [tabValue, setTabValue] = useState(0);
    const authProvider = useAuthProvider();
    const dataProvider = useDataProvider<CrmDataProvider>();
    const notify = useNotify();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Get current user information
    const {
        data: currentUser,
        isPending,
        error,
        refetch,
    } = useQuery({
        queryKey: ['current-user'],
        queryFn: async (): Promise<User> => {
            try {
                if (authProvider && 'getCurrentUser' in authProvider) {
                    return await (authProvider as any).getCurrentUser();
                }
                throw new Error('getCurrentUser not available');
            } catch (err) {
                console.error('Failed to get current user:', err);
                throw err;
            }
        },
        retry: 2,
        refetchOnWindowFocus: false,
    });

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleProfileUpdate = () => {
        // Refetch user data after successful update
        refetch();
        notify('Profile updated successfully', { type: 'success' });
    };

    const handlePasswordChange = () => {
        notify('Password changed successfully', { type: 'success' });
    };

    if (isPending) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography>Loading profile...</Typography>
                </Paper>
            </Container>
        );
    }

    if (error || !currentUser) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography color="error">
                        Failed to load profile information. Please try
                        refreshing the page.
                    </Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack spacing={3}>
                <Box>
                    <Typography
                        variant={isMobile ? 'h5' : 'h4'}
                        component="h1"
                        gutterBottom
                        sx={{ fontWeight: 600 }}
                    >
                        My Profile
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your profile information and account settings
                    </Typography>
                </Box>

                <Paper sx={{ width: '100%' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            aria-label="profile tabs"
                            variant={isMobile ? 'scrollable' : 'standard'}
                            scrollButtons={isMobile ? 'auto' : false}
                        >
                            <Tab
                                label="Profile"
                                {...a11yProps(0)}
                                sx={{
                                    minHeight: 48,
                                    fontSize: isMobile ? '0.875rem' : '1rem',
                                }}
                            />
                            <Tab
                                label="Password"
                                {...a11yProps(1)}
                                sx={{
                                    minHeight: 48,
                                    fontSize: isMobile ? '0.875rem' : '1rem',
                                }}
                            />
                            <Tab
                                label="Security"
                                {...a11yProps(2)}
                                sx={{
                                    minHeight: 48,
                                    fontSize: isMobile ? '0.875rem' : '1rem',
                                }}
                            />
                        </Tabs>
                    </Box>

                    <TabPanel value={tabValue} index={0}>
                        <ProfileForm
                            user={currentUser}
                            onSuccess={handleProfileUpdate}
                        />
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <PasswordChangeForm
                            user={currentUser}
                            onSuccess={handlePasswordChange}
                        />
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
                        <SecuritySettings user={currentUser} />
                    </TabPanel>
                </Paper>
            </Stack>
        </Container>
    );
};

UserProfilePage.path = '/profile';
