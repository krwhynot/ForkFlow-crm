/**
 * User Profile Management Page
 * Allows users to update their profile information and change password
 */

import React, { useState } from 'react';
import {
    Paper,
    Stack,
    Typography,
    Box,
    Tabs,
} from '@/components/ui-kit';
import { useAuthProvider, useDataProvider, useNotify } from 'react-admin';
import { useBreakpoint } from '../hooks/useBreakpoint';
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
            {value === index && <Box className="p-6">{children}</Box>}
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
    const isMobile = useBreakpoint('sm');

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
            <div className="max-w-4xl mx-auto py-8 px-4">
                <Paper className="p-6">
                    <Typography>Loading profile...</Typography>
                </Paper>
            </div>
        );
    }

    if (error || !currentUser) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4">
                <Paper className="p-6">
                    <Typography className="text-red-600">
                        Failed to load profile information. Please try
                        refreshing the page.
                    </Typography>
                </Paper>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <Stack spacing={6}>
                <Box>
                    <Typography
                        variant={isMobile ? 'h5' : 'h4'}
                        component="h1"
                        className="font-semibold mb-2"
                    >
                        My Profile
                    </Typography>
                    <Typography variant="body1" className="text-gray-600">
                        Manage your profile information and account settings
                    </Typography>
                </Box>

                <Paper className="w-full">
                    <Box className="border-b border-gray-200">
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            orientation={isMobile ? 'horizontal' : 'horizontal'}
                            variant={isMobile ? 'scrollable' : 'fullWidth'}
                        >
                            <Tabs.Tab
                                label="Profile"
                                className={`min-h-12 ${isMobile ? 'text-sm' : 'text-base'}`}
                                {...a11yProps(0)}
                            />
                            <Tabs.Tab
                                label="Password"
                                className={`min-h-12 ${isMobile ? 'text-sm' : 'text-base'}`}
                                {...a11yProps(1)}
                            />
                            <Tabs.Tab
                                label="Security"
                                className={`min-h-12 ${isMobile ? 'text-sm' : 'text-base'}`}
                                {...a11yProps(2)}
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
        </div>
    );
};

UserProfilePage.path = '/profile';
