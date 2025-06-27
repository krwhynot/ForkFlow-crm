import { Box, Button, Typography } from '@mui/material';
import { CreateButton } from 'react-admin';
import { Business as BusinessIcon } from '@mui/icons-material';

export const CustomerEmpty = () => (
    <Box
        textAlign="center"
        m={1}
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            padding: 3,
        }}
    >
        <BusinessIcon
            sx={{
                fontSize: 80,
                color: 'text.disabled',
                marginBottom: 2,
            }}
        />
        <Typography variant="h4" paragraph>
            No customers yet
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
            Start building your customer base by adding restaurants, grocery
            stores, and other food businesses
        </Typography>
        <Box sx={{ mt: 2 }}>
            <CreateButton
                variant="contained"
                label="Add First Customer"
                sx={{
                    minHeight: 44, // Touch-friendly
                    px: 3,
                    py: 1.5,
                }}
            />
        </Box>
    </Box>
);
