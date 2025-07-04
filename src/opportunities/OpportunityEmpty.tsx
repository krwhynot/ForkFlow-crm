import { CreateButton } from 'react-admin';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Box, Typography } from '../components/ui-kit';

export const OpportunityEmpty = () => (
    <Box className="text-center m-1">
        <Box className="mb-2">
            <TrendingUpIcon className="text-6xl text-gray-500 mb-2" />
        </Box>
        <Typography variant="h5" className="text-gray-500 mb-4">
            No sales opportunities found
        </Typography>
        <Typography variant="body1" className="text-gray-500 mb-4">
            Start building your food service sales pipeline by creating your
            first opportunity. Track deals from initial contact through to
            closing.
        </Typography>
        <CreateButton
            variant="contained"
            label="Create First Opportunity"
            className="mt-2"
        />
    </Box>
);
