/* eslint-disable import/no-anonymous-default-export */
import {
    BuildingOffice2Icon,
    PhoneIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline';
import { formatRelative } from 'date-fns';
import {
    DateField,
    RecordContextProvider,
    TextField,
    useListContext,
} from 'react-admin';
import { Link } from 'react-router-dom';

import { Organization as Customer } from '../types';
import { BusinessTypeChip } from './BusinessTypeChip';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../components/ui-kit/Table';
import { Spinner } from '../components/ui-kit/Spinner';
import { Checkbox } from '../components/ui-kit';

export const CustomerListContent = () => {
    const {
        data: customers,
        error,
        isPending,
        onToggleItem,
        selectedIds,
    } = useListContext<Customer>();

    // For now, we'll just use a simple check for mobile.
    // A more robust solution would use a custom hook with window.matchMedia.
    const isSmall = window.innerWidth < 768;

    if (isPending) {
        return (
            <div className="flex justify-center my-8">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return null;
    }

    // Mobile view - Card layout optimized for touch
    if (isSmall) {
        return (
            <MobileCustomerList
                customers={customers}
                selectedIds={selectedIds}
                onToggleItem={onToggleItem}
            />
        );
    }

    // Desktop view - Table layout
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead></TableHead>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Added</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {customers.map(customer => (
                    <RecordContextProvider key={customer.id} value={customer}>
                        <TableRow>
                            <TableCell>
                                <Checkbox
                                    checked={selectedIds.includes(customer.id)}
                                    onCheckedChange={() => onToggleItem(customer.id)}
                                />
                            </TableCell>
                            <TableCell>
                                <Link to={`/customers/${customer.id}/show`}>
                                    {customer.business_name}
                                </Link>
                            </TableCell>
                            <TableCell>{customer.contact_person}</TableCell>
                            <TableCell>
                                <BusinessTypeChip source="business_type" />
                            </TableCell>
                            <TableCell>{customer.phone}</TableCell>
                            <TableCell>{customer.address}</TableCell>
                            <TableCell>
                                <DateField source="createdAt" />
                            </TableCell>
                        </TableRow>
                    </RecordContextProvider>
                ))}
            </TableBody>
        </Table>
    );
};

const MobileCustomerList = ({
    customers,
    selectedIds,
    onToggleItem,
}: {
    customers: Customer[];
    selectedIds: any[];
    onToggleItem: (id: any) => void;
}) => {
    const now = Date.now();

    return (
        <ul className="divide-y divide-gray-200">
            {customers.map(customer => (
                <RecordContextProvider key={customer.id} value={customer}>
                    <li className="flex items-center p-4">
                        <Checkbox
                            checked={selectedIds.includes(customer.id)}
                            onCheckedChange={() => onToggleItem(customer.id)}
                            className="mr-4"
                        />
                        <BuildingOffice2Icon className="h-10 w-10 p-2 rounded-full bg-blue-100 text-blue-500" />
                        <div className="ml-4 flex-1">
                            <Link
                                to={`/customers/${customer.id}/show`}
                                className="font-medium text-gray-900 hover:underline"
                            >
                                {customer.business_name}
                            </Link>
                            <p className="text-sm text-gray-500">
                                Contact: {customer.contact_person}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                                <BusinessTypeChip source="business_type" />
                                {customer.phone && (
                                    <a href={`tel:${customer.phone}`}>
                                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                                    </a>
                                )}
                                {customer.latitude && customer.longitude && (
                                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                                )}
                            </div>
                        </div>
                        {customer.createdAt && (
                            <p className="text-xs text-gray-500">
                                Added{' '}
                                {formatRelative(new Date(customer.createdAt), now)}
                            </p>
                        )}
                    </li>
                </RecordContextProvider>
            ))}
            {customers.length === 0 && (
                <li className="p-4 text-center">
                    <p className="text-sm text-gray-500">No customers found</p>
                </li>
            )}
        </ul>
    );
};
