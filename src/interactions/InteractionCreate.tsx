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
import { Box, Button, Chip } from '@/components/ui-kit';
import {
    MapPinIcon,
    CloudIcon,
} from '@heroicons/react/24/outline';

import { InteractionInputs } from './InteractionInputs';
import { useInteractionAPI } from './hooks/useInteractionAPI';

const CreateActions = () => {
    const { getCurrentLocation, syncOfflineData, getOfflineStatus } =
        useInteractionAPI();
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
                startIcon={<MapPinIcon className="w-4 h-4" />}
                className="mr-1"
            >
                {isGettingLocation ? 'Getting Location...' : 'Get GPS'}
            </Button>

            {/* Offline status */}
            {!offlineStatus.isOnline && (
                <Chip
                    icon={<CloudIcon className="w-4 h-4" />}
                    label="Offline Mode"
                    className="text-yellow-600 border-yellow-600 bg-yellow-50"
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
                },
            }}
            className="[&_.RaCreate-main]:max-w-4xl [&_.RaCreate-main]:mx-auto"
        >
            <SimpleForm onSubmit={handleSubmit}>
                <Box className="w-full max-w-xl">
                    <InteractionInputs />
                </Box>
            </SimpleForm>
        </Create>
    );
};
