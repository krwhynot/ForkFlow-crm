// src/users/UserEmpty.tsx
import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { CreateButton, useGetIdentity } from 'react-admin';
import { People as PeopleIcon } from '@mui/icons-material';

export const UserEmpty = () => {
    const { identity } = useGetIdentity();
    
    return (
        <Box
            textAlign="center"
            m="auto"
            p={4}
            sx={{
                maxWidth: 400,
            }}
        >
            <PeopleIcon
                sx={{
                    fontSize: 80,
                    color: 'text.secondary',
                    mb: 2,
                }}
            />
            
            <Typography variant="h5" component="h2" gutterBottom>
                No Users Yet
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
                Start building your team by adding the first user to your ForkFlow CRM system.
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
                Users can be assigned different roles:
            </Typography>
            
            <Box sx={{ mb: 3 }}>
                <Typography variant="body2" component="div" sx={{ textAlign: 'left' }}>
                    • <strong>Admin:</strong> Full system access and user management
                </Typography>
                <Typography variant="body2" component="div" sx={{ textAlign: 'left' }}>
                    • <strong>Manager:</strong> Team oversight and reporting access
                </Typography>
                <Typography variant="body2" component="div" sx={{ textAlign: 'left' }}>
                    • <strong>Broker:</strong> Field sales with territory-based access
                </Typography>
            </Box>

            {identity && (
                <CreateButton
                    variant="contained"
                    label="Add First User"
                    sx={{
                        minHeight: 48,
                        px: 4,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                    }}
                />
            )}
        </Box>
    );
};