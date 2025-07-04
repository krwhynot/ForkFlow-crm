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
import { Box, Chip } from '../components/ui-kit';
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
        <Box className="flex items-center gap-1">
            <Box
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: record.color }}
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
            style={{
                backgroundColor: categoryColors[record.category] || '#9E9E9E',
            }}
            className="text-white capitalize"
        />
    );
};

const ActiveStatus = (props: { label?: string }) => {
    const record = useRecordContext<Setting>(props);
    return (
        <Chip
            label={record?.active ? 'Active' : 'Inactive'}
            size="small"
            className={
                record?.active
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700'
            }
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
