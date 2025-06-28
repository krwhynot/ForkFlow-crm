/* eslint-disable import/no-anonymous-default-export */
import { Card, Stack } from '@mui/material';
import jsonExport from 'jsonexport/dist';
import type { Exporter } from 'react-admin';
import {
    BulkActionsToolbar,
    BulkDeleteButton,
    BulkExportButton,
    CreateButton,
    downloadCSV,
    ExportButton,
    ListBase,
    ListToolbar,
    Pagination,
    SortButton,
    Title,
    TopToolbar,
    useGetIdentity,
    useListContext,
} from 'react-admin';

import { Customer } from '../types';
import { CustomerEmpty } from './CustomerEmpty';
import { CustomerImportButton } from './CustomerImportButton';
import { CustomerListContent } from './CustomerListContent';
import { CustomerListFilter } from './CustomerListFilter';

export const CustomerList = () => {
    const { identity } = useGetIdentity();

    if (!identity) return null;

    return (
        <ListBase
            resource="customers"
            perPage={25}
            sort={{ field: 'business_name', order: 'ASC' }}
            exporter={exporter}
        >
            <CustomerListLayout />
        </ListBase>
    );
};

const CustomerListLayout = () => {
    const { data, isPending, filterValues } = useListContext();
    const { identity } = useGetIdentity();

    const hasFilters = filterValues && Object.keys(filterValues).length > 0;

    if (!identity || isPending) return null;

    if (!data?.length && !hasFilters) return <CustomerEmpty />;

    return (
        <Stack direction="row">
            <CustomerListFilter />
            <Stack sx={{ width: '100%' }}>
                <Title title={'Customers'} />
                <ListToolbar actions={<CustomerListActions />} />
                <BulkActionsToolbar>
                    <BulkExportButton />
                    <BulkDeleteButton />
                </BulkActionsToolbar>
                <Card>
                    <CustomerListContent />
                </Card>
                <Pagination rowsPerPageOptions={[10, 25, 50, 100]} />
            </Stack>
        </Stack>
    );
};

const CustomerListActions = () => (
    <TopToolbar>
        <SortButton fields={['business_name', 'contact_person', 'createdAt']} />
        <CustomerImportButton />
        <ExportButton />
        <CreateButton
            variant="contained"
            label="New Customer"
            sx={{ marginLeft: 2 }}
        />
    </TopToolbar>
);

const exporter: Exporter<Customer> = async (records, fetchRelatedRecords) => {
    const customers = records.map(customer => {
        const exportedCustomer = {
            ...customer,
            // Remove internal fields from export
            search_vector: undefined,
        };
        delete exportedCustomer.search_vector;
        return exportedCustomer;
    });

    return jsonExport(customers, {}, (_err: any, csv: string) => {
        downloadCSV(csv, 'customers');
    });
};
