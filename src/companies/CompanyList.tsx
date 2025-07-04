import {
    CreateButton,
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

import { Box } from '../components/ui-kit';
import { CompanyEmpty } from './CompanyEmpty';
import { CompanyListFilter } from './CompanyListFilter';
import { ImageList } from './GridList';

export const CompanyList = () => {
    const { identity } = useGetIdentity();
    if (!identity) return null;
    return (
        <ListBase perPage={25} sort={{ field: 'name', order: 'ASC' }}>
            <CompanyListLayout />
        </ListBase>
    );
};

const CompanyListLayout = () => {
    const { data, isPending, filterValues } = useListContext();
    const hasFilters = filterValues && Object.keys(filterValues).length > 0;

    if (isPending) return null;
    if (!data?.length && !hasFilters) return <CompanyEmpty />;

    return (
        <Box className="flex flex-row">
            <CompanyListFilter />
            <Box className="w-full">
                <Title title={'Organizations'} />
                <ListToolbar actions={<CompanyListActions />} />
                <ImageList />
                <Pagination rowsPerPageOptions={[10, 25, 50, 100]} />
            </Box>
        </Box>
    );
};

const CompanyListActions = () => {
    return (
        <TopToolbar>
            <SortButton fields={['name', 'created_at', 'nb_contacts']} />
            <ExportButton />
            <CreateButton
                variant="contained"
                label="New Organization"
                className="ml-2"
            />
        </TopToolbar>
    );
};
