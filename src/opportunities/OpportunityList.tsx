import {
    CreateButton,
    ExportButton,
    ListBase,
    ListToolbar,
    Title,
    TopToolbar,
    useGetIdentity,
    useListContext,
} from 'react-admin';
import { matchPath, useLocation } from 'react-router';

import { Card, Stack } from '@mui/material';
import { useConfigurationContext } from '../root/ConfigurationContext';
import { OpportunityCreate } from './OpportunityCreate';
import { OpportunityEdit } from './OpportunityEdit';
import { OpportunityEmpty } from './OpportunityEmpty';
import { OpportunityListContent } from './OpportunityListContent';
import { OpportunityListFilter } from './OpportunityListFilter';
import { OpportunityShow } from './OpportunityShow';

export const OpportunityList = () => {
    const { identity } = useGetIdentity();

    if (!identity) return null;
    return (
        <ListBase
            resource="deals" // Backend still uses deals table
            perPage={100}
            filter={{
                'archivedAt@is': null,
            }}
            sort={{ field: 'index', order: 'DESC' }}
        >
            <OpportunityLayout />
        </ListBase>
    );
};

const OpportunityLayout = () => {
    const location = useLocation();
    const matchCreate = matchPath('/opportunities/create', location.pathname);
    const matchShow = matchPath('/opportunities/:id/show', location.pathname);
    const matchEdit = matchPath('/opportunities/:id', location.pathname);

    const { dealCategories } = useConfigurationContext();
    const { data, isPending, filterValues } = useListContext();

    if (matchCreate) {
        return <OpportunityCreate />;
    }

    if (matchShow?.params.id) {
        return (
            <OpportunityShow id={matchShow.params.id} key={matchShow.params.id} />
        );
    }

    if (matchEdit?.params.id) {
        return (
            <OpportunityEdit id={matchEdit.params.id} key={matchEdit.params.id} />
        );
    }

    const hasFilters = filterValues && Object.keys(filterValues).length > 0;

    if (isPending) return null;
    if (!data?.length && !hasFilters) return <OpportunityEmpty />;

    return (
        <Stack direction="row" component="div">
            <OpportunityListFilter />
            <Stack sx={{ width: '100%' }}>
                <Title title="Food Service Sales Pipeline" />
                <ListToolbar actions={<OpportunityListActions />} />
                <Card>
                    <OpportunityListContent />
                </Card>
            </Stack>
        </Stack>
    );
};

const OpportunityListActions = () => (
    <TopToolbar>
        <CreateButton
            variant="contained"
            label="New Opportunity"
            sx={{ marginLeft: 'auto' }}
        />
        <ExportButton />
    </TopToolbar>
);