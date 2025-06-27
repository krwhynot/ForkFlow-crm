import {
    TopToolbar,
    ExportButton,
    CreateButton,
    Pagination,
    useGetIdentity,
    ListBase,
    Title,
    ListToolbar,
    useListContext,
    SortButton,
} from 'react-admin';

import { ImageList } from './GridList';
import { OrganizationListFilter } from './OrganizationListFilter';
import { Stack } from '@mui/material';
import { OrganizationEmpty } from './OrganizationEmpty';

export const OrganizationList = () => {
    const { identity } = useGetIdentity();
    if (!identity) return null;
    return (
        <ListBase perPage={25} sort={{ field: 'name', order: 'ASC' }}>
            <OrganizationListLayout />
        </ListBase>
    );
};

const OrganizationListLayout = () => {
    const { data, isPending, filterValues } = useListContext();
    const hasFilters = filterValues && Object.keys(filterValues).length > 0;

    if (isPending) return null;
    if (!data?.length && !hasFilters) return <OrganizationEmpty />;

    return (
        <Stack direction="row" component="div">
            <OrganizationListFilter />
            <Stack sx={{ width: '100%' }}>
                <Title title={'Organizations'} />
                <ListToolbar actions={<OrganizationListActions />} />
                <ImageList />
                <Pagination rowsPerPageOptions={[10, 25, 50, 100]} />
            </Stack>
        </Stack>
    );
};

const OrganizationListActions = () => {
    return (
        <TopToolbar>
            <SortButton fields={['name', 'createdAt', 'city', 'state']} />
            <ExportButton />
            <CreateButton
                variant="contained"
                label="New Organization"
                sx={{
                    marginLeft: 2,
                    minHeight: 44,
                    px: 3,
                }}
            />
        </TopToolbar>
    );
};
