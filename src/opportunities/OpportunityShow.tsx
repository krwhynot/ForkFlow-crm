import * as React from 'react';
import {
    Show,
    SimpleShowLayout,
    TextField,
    NumberField,
    DateField,
    useRecordContext,
    TopToolbar,
    EditButton,
    DeleteButton,
    ReferenceField,
} from 'react-admin';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Stack,
    Divider,
} from '../components/ui-kit';
import {
    CurrencyDollarIcon,
    CalendarIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';
import { Deal } from '../types';

const OpportunityShowActions = () => (
    <TopToolbar>
        <EditButton />
        <DeleteButton />
    </TopToolbar>
);

export const OpportunityShow = () => (
    <Show actions={<OpportunityShowActions />} resource="deals">
        <OpportunityShowContent />
    </Show>
);

const OpportunityShowContent = () => {
    const record = useRecordContext<Deal>();

    if (!record) return null;

    return (
        <Box maxWidth="lg" sx={{ mx: 'auto', p: 2 }}>
            <Card>
                <CardContent>
                    {/* Header */}
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        mb={3}
                    >
                        <ChartBarIcon className="h-8 w-8 text-blue-600" />
                        <Box>
                            <Typography variant="h4" component="h1">
                                {record.name || 'Untitled Opportunity'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Opportunity #{record.id}
                            </Typography>
                        </Box>
                    </Stack>

                    <Divider sx={{ mb: 3 }} />

                    {/* Basic Information */}
                    <SimpleShowLayout>
                        <TextField source="name" label="Opportunity Name" />
                        <ReferenceField
                            source="organizationId"
                            reference="organizations"
                            label="Organization"
                        >
                            <TextField source="name" />
                        </ReferenceField>
                        <ReferenceField
                            source="contactId"
                            reference="contacts"
                            label="Contact"
                        >
                            <TextField source="first_name" />
                        </ReferenceField>
                        <TextField source="stage" label="Stage" />
                        <NumberField
                            source="amount"
                            label="Amount"
                            options={{ style: 'currency', currency: 'USD' }}
                        />
                        <DateField
                            source="expected_close_date"
                            label="Expected Close Date"
                        />
                        <NumberField
                            source="probability"
                            label="Probability %"
                        />
                        <TextField source="category" label="Category" />
                        <TextField source="description" label="Description" />
                        <DateField
                            source="createdAt"
                            label="Created At"
                            showTime
                        />
                        <DateField
                            source="updatedAt"
                            label="Updated At"
                            showTime
                        />
                    </SimpleShowLayout>

                    {/* Status Indicators */}
                    <Box mt={3}>
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                            {record.stage && (
                                <Chip
                                    label={record.stage}
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                            {record.amount && (
                                <Chip
                                    icon={
                                        <CurrencyDollarIcon className="h-4 w-4" />
                                    }
                                    label={new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                        notation: 'compact',
                                    }).format(record.amount)}
                                    color="success"
                                    variant="outlined"
                                />
                            )}
                            {record.expected_close_date && (
                                <Chip
                                    icon={<CalendarIcon className="h-4 w-4" />}
                                    label={new Date(
                                        record.expected_close_date
                                    ).toLocaleDateString()}
                                    color="info"
                                    variant="outlined"
                                />
                            )}
                        </Stack>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};
