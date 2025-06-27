import { Chip } from '@mui/material';
import {
    Restaurant as RestaurantIcon,
    Store as StoreIcon,
    LocalShipping as DistributorIcon,
    Business as OtherIcon,
} from '@mui/icons-material';
import { useRecordContext } from 'react-admin';
import { Customer } from '../types';

interface BusinessTypeChipProps {
    source: string;
}

const businessTypeConfig = {
    restaurant: {
        label: 'Restaurant',
        color: 'error' as const,
        icon: <RestaurantIcon fontSize="small" />,
    },
    grocery: {
        label: 'Grocery',
        color: 'success' as const,
        icon: <StoreIcon fontSize="small" />,
    },
    distributor: {
        label: 'Distributor',
        color: 'warning' as const,
        icon: <DistributorIcon fontSize="small" />,
    },
    other: {
        label: 'Other',
        color: 'default' as const,
        icon: <OtherIcon fontSize="small" />,
    },
};

export const BusinessTypeChip = ({ source }: BusinessTypeChipProps) => {
    const record = useRecordContext<Customer>();

    if (!record || !record[source as keyof Customer]) {
        return null;
    }

    const businessType = record[source as keyof Customer] as string;
    const config =
        businessTypeConfig[businessType as keyof typeof businessTypeConfig];

    if (!config) {
        return null;
    }

    return (
        <Chip
            icon={config.icon}
            label={config.label}
            color={config.color}
            size="small"
            variant="outlined"
        />
    );
};
