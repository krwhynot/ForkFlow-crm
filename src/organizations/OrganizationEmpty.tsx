import { Box, Button, Typography } from '@mui/material';
import { CreateButton } from 'react-admin';
import BusinessIcon from '@mui/icons-material/Business';

export const OrganizationEmpty = () => (
    <Box textAlign="center" m={1}>
        <Box sx={{ mb: 4, mt: 8 }}>
            <BusinessIcon
                sx={{
                    fontSize: 80,
                    color: 'text.disabled',
                    mb: 2,
                }}
            />
            <Typography variant="h4" paragraph color="text.secondary">
                No organizations yet
            </Typography>
            <Typography
                color="text.secondary"
                sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}
            >
                Start building your food service network by adding restaurants,
                distributors, and other business partners to your CRM system.
            </Typography>
        </Box>
        <CreateButton
            variant="contained"
            label="Add First Organization"
            sx={{
                minHeight: 44,
                px: 4,
                py: 1.5,
                fontSize: '1rem',
            }}
        />
    </Box>
);
