import {
    CreateButton,
    Datagrid,
    FilterButton,
    List,
    SelectInput,
    TextField,
    TextInput,
    TopToolbar,
    useListContext,
    useRecordContext,
} from 'react-admin';
import { Box, Chip } from '@mui/material';
import { Setting } from '../types';

const PostListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton />
    </TopToolbar>
);

const settingsFilters = [
    <TextInput source="q" label="Search" alwaysOn />,
    <SelectInput
        source="category"
        label="Category"
        choices={[
            { id: 'priority', name: 'Priority' },
            { id: 'segment', name: 'Segment' },
            { id: 'distributor', name: 'Distributor' },
            { id: 'role', name: 'Role' },
            { id: 'influence', name: 'Influence' },
            { id: 'decision', name: 'Decision' },
            { id: 'principal', name: 'Principal' },
        ]}
    />,
];

const ColorChip = (props: { label?: string }) => {
    const record = useRecordContext<Setting>(props);
    if (!record?.color) return null;

    return (
        <Box display="flex" alignItems="center" gap={1}>
            <Box
                sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: record.color,
                    border: '1px solid #ccc',
                }}
            />
            <span>{record.color}</span>
        </Box>
    );
};

const CategoryChip = (props: { label?: string }) => {
    const record = useRecordContext<Setting>(props);
    if (!record?.category) return null;

    const categoryColors: Record<string, string> = {
        priority: '#9C27B0',
        segment: '#2196F3',
        distributor: '#FF9800',
        role: '#4CAF50',
        influence: '#F44336',
        decision: '#795548',
        principal: '#607D8B',
    };

    return (
        <Chip
            label={record.category}
            size="small"
            sx={{
                backgroundColor: categoryColors[record.category] || '#9E9E9E',
                color: 'white',
                textTransform: 'capitalize',
            }}
        />
    );
};

const ActiveStatus = (props: { label?: string }) => {
    const record = useRecordContext<Setting>(props);
    return (
        <Chip
            label={record?.active ? 'Active' : 'Inactive'}
            size="small"
            color={record?.active ? 'success' : 'default'}
            variant={record?.active ? 'filled' : 'outlined'}
        />
    );
};

export const SettingsList = () => {
    return (
        <List
            filters={settingsFilters}
            actions={<PostListActions />}
            sort={{ field: 'category', order: 'ASC' }}
            perPage={25}
        >
            <SettingsDatagrid />
        </List>
    );
};

const SettingsDatagrid = () => {
    const listContext = useListContext();

    if (listContext.isLoading) return null;

    return (
        <Datagrid rowClick="show" bulkActionButtons={false}>
            <CategoryChip label="Category" />
            <TextField source="label" />
            <TextField source="key" />
            <ColorChip label="Color" />
            <TextField source="sortOrder" label="Sort Order" />
            <ActiveStatus label="Status" />
        </Datagrid>
    );
};
