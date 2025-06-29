import {
    CreateButton,
    ExportButton,
    FilterButton,
    ListBase,
    ListToolbar,
    ReferenceInput,
    SearchInput,
    SelectInput,
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
import { OpportunityShow } from './OpportunityShow';
import { OnlyMineInput } from './OnlyMineInput';

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

    return (
        <Stack spacing={2}>
            <TopToolbar>
                <FilterButton />
                <CreateButton
                    variant="contained"
                    label="New Opportunity"
                    sx={{ marginLeft: 'auto' }}
                />
                <ExportButton />
            </TopToolbar>
            <Card>
                <Title title="Food Service Sales Pipeline" />
                <ListToolbar
                    filters={[
                        <SearchInput source="q" alwaysOn placeholder="Search opportunities..." />,
                        <ReferenceInput
                            source="organizationId"
                            reference="organizations"
                            key="organizationId"
                        >
                            <SelectInput optionText="name" />
                        </ReferenceInput>,
                        <ReferenceInput
                            source="contactId"
                            reference="contacts"
                            key="contactId"
                        >
                            <SelectInput optionText={(choice: any) => 
                                `${choice.firstName} ${choice.lastName}`
                            } />
                        </ReferenceInput>,
                        <SelectInput
                            source="stage"
                            choices={[
                                { id: 'lead_discovery', name: 'Lead Discovery' },
                                { id: 'contacted', name: 'Contacted' },
                                { id: 'sampled_visited', name: 'Sampled/Visited' },
                                { id: 'follow_up', name: 'Follow-up' },
                                { id: 'close', name: 'Close' },
                            ]}
                            key="stage"
                        />,
                        <SelectInput
                            source="status"
                            choices={[
                                { id: 'active', name: 'Active' },
                                { id: 'won', name: 'Won' },
                                { id: 'lost', name: 'Lost' },
                                { id: 'on-hold', name: 'On Hold' },
                            ]}
                            key="status"
                        />,
                        <OnlyMineInput key="onlyMine" />,
                    ]}
                />
                {isPending ? null : (data?.length ?? 0) > 0 ? (
                    <OpportunityListContent />
                ) : (
                    <OpportunityEmpty />
                )}
            </Card>
        </Stack>
    );
};