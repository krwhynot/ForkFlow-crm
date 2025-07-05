import { CreateButton } from 'react-admin';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { Box } from '../../components/Layout/Box';
import { Typography } from '../../components/Typography/Typography';

export const OrganizationEmpty = () => (
    <Box className="text-center m-1">
        <Box className="mb-4 mt-8">
            <BuildingOfficeIcon className="w-20 h-20 text-gray-400 mb-2 mx-auto" />
            <Typography variant="h4" className="text-gray-500 mb-4">
                No organizations yet
            </Typography>
            <Typography className="text-gray-500 mb-4 max-w-md mx-auto">
                Start building your food service network by adding restaurants,
                distributors, and other business partners to your CRM system.
            </Typography>
        </Box>
        <CreateButton
            variant="contained"
            label="Add First Organization"
            className="min-h-11 px-4 py-2 text-base"
        />
    </Box>
);
