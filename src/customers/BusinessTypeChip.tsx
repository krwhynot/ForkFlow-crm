import {
    BuildingStorefrontIcon,
    TruckIcon,
    BuildingOfficeIcon,
    QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { useRecordContext } from 'react-admin';
import { Organization as Customer } from '../types';

interface BusinessTypeChipProps {
    source: string;
}

const businessTypeConfig = {
    restaurant: {
        label: 'Restaurant',
        icon: BuildingStorefrontIcon,
        color: 'text-red-500 bg-red-100',
    },
    grocery: {
        label: 'Grocery',
        icon: BuildingStorefrontIcon,
        color: 'text-green-500 bg-green-100',
    },
    distributor: {
        label: 'Distributor',
        icon: TruckIcon,
        color: 'text-yellow-500 bg-yellow-100',
    },
    other: {
        label: 'Other',
        icon: BuildingOfficeIcon,
        color: 'text-gray-500 bg-gray-100',
    },
};

export const BusinessTypeChip = ({ source }: BusinessTypeChipProps) => {
    const record = useRecordContext<Customer>();

    if (!record || !record[source as keyof Customer]) {
        return null;
    }

    const businessType = record[source as keyof Customer] as string;
    const config = businessTypeConfig[
        businessType as keyof typeof businessTypeConfig
    ] || {
        label: 'Unknown',
        icon: QuestionMarkCircleIcon,
        color: 'text-gray-500 bg-gray-100',
    };

    const Icon = config.icon;

    return (
        <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
        >
            <Icon className="h-4 w-4 mr-1.5" />
            {config.label}
        </div>
    );
};
