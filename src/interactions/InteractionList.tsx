import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    DateField,
    BooleanField,
    ReferenceField,
    FunctionField,
    useListContext,
    TopToolbar,
    CreateButton,
    FilterButton,
    FilterForm,
    TextInput,
    SelectInput,
    BooleanInput,
    DateInput,
    useGetList,
} from 'react-admin';
import {
    Box,
    useMediaQuery,
    useTheme,
    Card,
    CardContent,
    Typography,
    Chip,
    Stack,
    Avatar,
} from '@mui/material';
// Timeline components alternative - using simple layout instead
import {
    Email as EmailIcon,
    Phone as PhoneIcon,
    PersonPin as PersonIcon,
    Slideshow as DemoIcon,
    AttachMoney as QuoteIcon,
    Schedule as FollowUpIcon,
} from '@mui/icons-material';

import { InteractionCard } from './InteractionCard';
import { InteractionEmpty } from './InteractionEmpty';
import { InteractionFilters } from './InteractionFilters';
import { Interaction } from '../types';

const interactionTypeIcons = {
    email: EmailIcon,
    call: PhoneIcon,
    in_person: PersonIcon,
    demo: DemoIcon,
    quote: QuoteIcon,
    follow_up: FollowUpIcon,
};

const ListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton />
    </TopToolbar>
);

const InteractionListDesktop = () => (
    <Datagrid 
        rowClick="show"
        sx={{
            '& .RaDatagrid-headerRow': {
                borderLeft: '1px solid rgba(224, 224, 224, 1)',
            },
        }}
    >
        <ReferenceField 
            source="organizationId" 
            reference="organizations" 
            link="show"
            label="Organization"
        >
            <TextField source="name" />
        </ReferenceField>
        <TextField source="subject" />
        <ReferenceField 
            source="typeId" 
            reference="settings" 
            link={false}
            label="Type"
        >
            <FunctionField render={(record: any) => (
                <Chip
                    label={record?.label || 'Unknown'}
                    size="small"
                    variant="outlined"
                    sx={{ minWidth: 80 }}
                />
            )} />
        </ReferenceField>
        <DateField source="scheduledDate" label="Scheduled" showTime />
        <BooleanField source="isCompleted" label="Completed" />
        <ReferenceField 
            source="contactId" 
            reference="contacts" 
            link="show"
            label="Contact"
            emptyText="-"
        >
            <FunctionField render={(record: any) => 
                record ? `${record.firstName} ${record.lastName}` : '-'
            } />
        </ReferenceField>
        <DateField source="createdAt" label="Created" showTime />
    </Datagrid>
);

const InteractionListMobile = () => {
    const { data, isLoading } = useListContext<Interaction>();
    
    if (isLoading) return <div>Loading...</div>;
    if (!data || data.length === 0) return <InteractionEmpty />;

    return (
        <Box sx={{ px: 2, py: 1 }}>
            <Stack spacing={2}>
                {data.map((interaction) => (
                    <InteractionCard 
                        key={interaction.id}
                        interaction={interaction} 
                        showTimeline={false}
                    />
                ))}
            </Stack>
        </Box>
    );
};

const InteractionListContent = () => {
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('md'));
    
    return isSmall ? <InteractionListMobile /> : <InteractionListDesktop />;
};

export const InteractionList = () => {
    const { data: settings } = useGetList('settings', {
        filter: { category: 'interaction_type' },
        pagination: { page: 1, perPage: 10 },
        sort: { field: 'sortOrder', order: 'ASC' },
    });

    const interactionTypeChoices = settings?.map(setting => ({
        id: setting.id,
        name: setting.label,
    })) || [];

    return (
        <List
            actions={<ListActions />}
            aside={
                <Box sx={{ width: 250, p: 2 }}>
                    <FilterForm 
                        filters={[
                            <TextInput 
                                key="search"
                                source="q" 
                                label="Search" 
                                alwaysOn 
                                variant="outlined"
                                size="small"
                            />,
                            <SelectInput
                                key="type"
                                source="typeId"
                                label="Interaction Type"
                                choices={interactionTypeChoices}
                                variant="outlined"
                                size="small"
                            />,
                            <BooleanInput
                                key="has-files"
                                source="isCompleted"
                                label="Completed Only"
                            />,
                            <DateInput
                                key="date-after"
                                source="scheduledDate_gte"
                                label="Scheduled After"
                                variant="outlined"
                                size="small"
                            />,
                            <DateInput
                                key="date-before"
                                source="scheduledDate_lte"
                                label="Scheduled Before"
                                variant="outlined"
                                size="small"
                            />
                        ]}
                    />
                </Box>
            }
            sx={{
                '& .RaList-main': {
                    display: 'flex',
                    flexDirection: 'row',
                },
                '& .RaList-content': {
                    flex: 1,
                },
            }}
        >
            <InteractionListContent />
        </List>
    );
};