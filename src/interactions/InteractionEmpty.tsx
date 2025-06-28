import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { 
    Schedule as InteractionIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { useCreatePath } from 'react-admin';
import { useNavigate } from 'react-router-dom';

export const InteractionEmpty = () => {
    const navigate = useNavigate();
    const createPath = useCreatePath();

    const handleCreateInteraction = () => {
        navigate(createPath({ resource: 'interactions', type: 'create' }));
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 400,
                p: 4,
                textAlign: 'center',
            }}
        >
            <InteractionIcon
                sx={{
                    fontSize: 80,
                    color: 'text.secondary',
                    mb: 2,
                }}
            />
            
            <Typography variant="h5" gutterBottom color="text.secondary">
                No Interactions Yet
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
                Start logging your customer interactions to track your food service broker activities. 
                Record calls, visits, demos, quotes, and follow-ups all in one place.
            </Typography>
            
            <Stack direction="row" spacing={2}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateInteraction}
                    size="large"
                    sx={{ 
                        minHeight: 44, // Mobile touch target
                        px: 3,
                    }}
                >
                    Log First Interaction
                </Button>
            </Stack>
            
            <Box sx={{ mt: 4, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Interaction Types Available:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    📧 Email • 📞 Call • 👥 In Person • 🎯 Demo • 💰 Quote • 📅 Follow-up
                </Typography>
            </Box>
        </Box>
    );
};