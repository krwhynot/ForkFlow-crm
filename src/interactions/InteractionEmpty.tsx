import React from 'react';
import { Box, Typography, Button, Stack } from '@/components/ui-kit';
import {
    ClockIcon as InteractionIcon,
    PlusIcon as AddIcon,
} from '@heroicons/react/24/outline';
import { useCreatePath } from 'react-admin';
import { useNavigate } from 'react-router-dom';

export const InteractionEmpty = () => {
    const navigate = useNavigate();
    const createPath = useCreatePath();

    const handleCreateInteraction = () => {
        navigate(createPath({ resource: 'interactions', type: 'create' }));
    };

    return (
        <Box className="flex flex-col items-center justify-center min-h-96 p-4 text-center">
            <InteractionIcon className="h-16 w-16 text-gray-500 mb-2" />

            <Typography variant="h5" className="text-gray-500" gutterBottom>
                No Interactions Yet
            </Typography>

            <Typography
                variant="body1"
                className="text-gray-500 mb-3 max-w-96"
            >
                Start logging your customer interactions to track your food
                service broker activities. Record calls, visits, demos, quotes,
                and follow-ups all in one place.
            </Typography>

            <Stack className="flex-row space-x-2">
                <Button
                    variant="contained"
                    startIcon={<AddIcon className="h-4 w-4" />}
                    onClick={handleCreateInteraction}
                    size="large"
                    className="min-h-11 px-3"
                >
                    Log First Interaction
                </Button>
            </Stack>

            <Box className="mt-4 p-2 bg-gray-50 rounded-lg">
                <Typography variant="subtitle2" gutterBottom>
                    Interaction Types Available:
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                    📧 Email • 📞 Call • 👥 In Person • 🎯 Demo • 💰 Quote • 📅
                    Follow-up
                </Typography>
            </Box>
        </Box>
    );
};
