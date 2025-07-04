// src/users/UserEmpty.tsx
import React from 'react';
import { CreateButton, useGetIdentity } from 'react-admin';
import { People as PeopleIcon } from '@mui/icons-material';
import { Box, Typography } from '../components/ui-kit';

export const UserEmpty = () => {
    const { identity } = useGetIdentity();

    return (
        <Box className="text-center mx-auto p-4 max-w-md">
            <PeopleIcon className="text-8xl text-gray-500 mb-2" />

            <Typography variant="h5" component="h2" className="mb-2">
                No Users Yet
            </Typography>

            <Typography variant="body1" className="text-gray-500 mb-4">
                Start building your team by adding the first user to your
                ForkFlow CRM system.
            </Typography>

            <Typography variant="body2" className="text-gray-500 mb-4">
                Users can be assigned different roles:
            </Typography>

            <Box className="mb-6">
                <Typography variant="body2" component="div" className="text-left">
                    • <strong>Admin:</strong> Full system access and user
                    management
                </Typography>
                <Typography variant="body2" component="div" className="text-left">
                    • <strong>Manager:</strong> Team oversight and reporting
                    access
                </Typography>
                <Typography variant="body2" component="div" className="text-left">
                    • <strong>Broker:</strong> Field sales with territory-based
                    access
                </Typography>
            </Box>

            {identity && (
                <CreateButton
                    variant="contained"
                    label="Add First User"
                    className="min-h-12 px-4 text-lg font-semibold"
                />
            )}
        </Box>
    );
};
