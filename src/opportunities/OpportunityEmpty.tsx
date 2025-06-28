import { Box, Button, Typography } from '@mui/material';
import { CreateButton } from 'react-admin';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export const OpportunityEmpty = () => (
    <Box textAlign="center" m={1}>
        <Box sx={{ mb: 2 }}>
            <TrendingUpIcon 
                sx={{ 
                    fontSize: 64, 
                    color: 'text.secondary',
                    mb: 2 
                }} 
            />
        </Box>
        <Typography variant="h5" paragraph color="textSecondary">
            No sales opportunities found
        </Typography>
        <Typography variant="body1" paragraph color="textSecondary">
            Start building your food service sales pipeline by creating your first opportunity.
            Track deals from initial contact through to closing.
        </Typography>
        <CreateButton 
            variant="contained" 
            label="Create First Opportunity"
            sx={{ mt: 2 }}
        />
    </Box>
);