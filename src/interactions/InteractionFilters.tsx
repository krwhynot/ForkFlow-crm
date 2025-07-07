import React from 'react';
import {
    Filter,
    TextInput,
    SelectInput,
    BooleanInput,
    DateInput,
    ReferenceInput,
    AutocompleteInput,
    useGetList,
} from 'react-admin';
import { Stack, Typography, Divider } from '../components/ui-kit';

export const InteractionFilters = () => {
    // Get interaction types from settings
    const { data: interactionTypes } = useGetList('settings', {
        filter: { category: 'interaction_type' },
        pagination: { page: 1, perPage: 10 },
        sort: { field: 'sortOrder', order: 'ASC' },
    });

    const interactionTypeChoices =
        interactionTypes?.map(type => ({
            id: type.id,
            name: type.label,
        })) || [];

    return (
        <Filter>
            <Stack className="space-y-2 p-2 min-w-60">
                <Typography variant="subtitle1" gutterBottom>
                    Filter Interactions
                </Typography>

                <TextInput
                    source="q"
                    label="Search"
                    alwaysOn
                    variant="outlined"
                    size="small"
                    helperText="Search subject, description, or outcome"
                />

                <Divider />

                <Typography variant="subtitle2" className="text-gray-600">
                    Type & Status
                </Typography>

                <SelectInput
                    source="typeId"
                    label="Interaction Type"
                    choices={interactionTypeChoices}
                    variant="outlined"
                    size="small"
                    emptyText="All types"
                />

                <BooleanInput source="isCompleted" label="Completed Only" />

                <BooleanInput
                    source="followUpRequired"
                    label="Follow-up Required"
                />

                <Divider />

                <Typography variant="subtitle2" className="text-gray-600">
                    Date Range
                </Typography>

                <DateInput
                    source="scheduledDate_gte"
                    label="Scheduled After"
                    variant="outlined"
                    size="small"
                />

                <DateInput
                    source="scheduledDate_lte"
                    label="Scheduled Before"
                    variant="outlined"
                    size="small"
                />

                <DateInput
                    source="completedDate_gte"
                    label="Completed After"
                    variant="outlined"
                    size="small"
                />

                <Divider />

                <Typography variant="subtitle2" className="text-gray-600">
                    Relationships
                </Typography>

                <ReferenceInput
                    source="organizationId"
                    reference="organizations"
                    label="Organization"
                >
                    <AutocompleteInput
                        optionText="name"
                        size="small"
                        variant="outlined"
                        emptyText="All organizations"
                    />
                </ReferenceInput>

                <ReferenceInput
                    source="contactId"
                    reference="contacts"
                    label="Contact"
                >
                    <AutocompleteInput
                        optionText={(choice: any) =>
                            choice
                                ? `${choice.firstName} ${choice.lastName}`
                                : ''
                        }
                        size="small"
                        variant="outlined"
                        emptyText="All contacts"
                    />
                </ReferenceInput>

                <ReferenceInput
                    source="opportunityId"
                    reference="deals"
                    label="Opportunity"
                >
                    <AutocompleteInput
                        optionText="name"
                        size="small"
                        variant="outlined"
                        emptyText="All opportunities"
                    />
                </ReferenceInput>
            </Stack>
        </Filter>
    );
};
