import React, { useState } from 'react';
import {
    Create,
    SimpleForm,
    required,
    TopToolbar,
    ListButton,
    useGetIdentity,
    useDataProvider,
    useNotify,
    useRedirect,
} from 'react-admin';
import { Box, Button, Chip } from '@mui/material';
import { 
    GpsFixed as GpsIcon,
    CloudOff as OfflineIcon 
} from '@mui/icons-material';

import { InteractionInputs } from './InteractionInputs';
import { useInteractionAPI } from './hooks/useInteractionAPI';

const CreateActions = () => {
    const { getCurrentLocation, syncOfflineData, getOfflineStatus } = useInteractionAPI();
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const offlineStatus = getOfflineStatus();

    const handleGetLocation = async () => {
        setIsGettingLocation(true);
        try {
            await getCurrentLocation();
        } finally {
            setIsGettingLocation(false);
        }
    };

    return (
        <TopToolbar>
            <ListButton />
            
            {/* Quick GPS button */}
            <Button
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                startIcon={<GpsIcon />}
                sx={{ mr: 1 }}
            >
                {isGettingLocation ? 'Getting Location...' : 'Get GPS'}
            </Button>
            
            {/* Offline status */}
            {!offlineStatus.isOnline && (
                <Chip
                    icon={<OfflineIcon />}
                    label="Offline Mode"
                    color="warning"
                    size="small"
                />
            )}
        </TopToolbar>
    );
};

export const InteractionCreate = () => {
    const { identity } = useGetIdentity();
    const { createWithLocation } = useInteractionAPI();
    const redirect = useRedirect();
    const notify = useNotify();

    const transform = (data: any) => ({
        ...data,
        createdBy: identity?.id,
        isCompleted: false,
        scheduledDate: data.scheduledDate || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    const handleSubmit = async (data: any) => {
        try {
            // Use our enhanced create method with automatic GPS capture
            const result = await createWithLocation(transform(data), true);
            
            // Redirect to the interaction details or list
            if (result.data.id) {
                redirect('show', 'interactions', result.data.id);
            } else {
                redirect('list', 'interactions');
            }
        } catch (error) {
            // Error is already handled by the hook
            console.error('Failed to create interaction:', error);
        }
    };

    return (
        <Create
            actions={<CreateActions />}
            mutationOptions={{
                onSuccess: () => {
                    // Handled by custom submit
                },
                onError: () => {
                    // Handled by custom submit
                }
            }}
            sx={{
                '& .RaCreate-main': {
                    maxWidth: 800,
                    margin: '0 auto',
                },
            }}
        >
            <SimpleForm onSubmit={handleSubmit}>
                <Box sx={{ width: '100%', maxWidth: 600 }}>
                    <InteractionInputs />
                </Box>
            </SimpleForm>
        </Create>
    );
};