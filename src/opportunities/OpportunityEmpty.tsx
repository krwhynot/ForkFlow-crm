import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { CreateButton } from 'react-admin';
import { Box, Typography } from '../components/ui-kit';

export const OpportunityEmpty = () => (
    <Box className="text-center m-1">
        <Box className="mb-2">
            <ArrowTrendingUpIcon className="w-16 h-16 text-gray-500 mb-2" />
        </Box>
        <Typography variant="h5" className="text-gray-500 mb-4">
            No sales opportunities found
        </Typography>
        <Typography variant="body1" className="text-gray-500 mb-4">
            Start building your food service sales pipeline by creating your
            first opportunity.
        </Typography>
        <CreateButton
            variant="contained"
            label="Create First Opportunity"
            className="mt-2"
        />
    </Box>
);
