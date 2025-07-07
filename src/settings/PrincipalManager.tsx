import {
    CreateButton,
    Datagrid,
    EditButton,
    FilterButton,
    List,
    TextField,
    TextInput,
    TopToolbar,
    useListContext,
    useRecordContext,
    BooleanField,
    DeleteButton,
    useDataProvider,
    useNotify,
    useRefresh,
} from 'react-admin';
import {
    Box,
    Chip,
    Card,
    CardContent,
    Typography,
    IconButton,
    Tooltip,
    Stack,
} from '../components/ui-kit';
import { Bars3Icon as DragIndicator, EyeIcon as Visibility, EyeSlashIcon as VisibilityOff } from '@heroicons/react/24/outline';
import { Setting } from '../types';

const PrincipalListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton variant="contained" label="Add Principal" />
    </TopToolbar>
);

const principalFilters = [
    <TextInput source="q" label="Search Principals" alwaysOn />,
];

const PrincipalColorChip = (props: { label?: string }) => {
    const record = useRecordContext<Setting>(props);
    if (!record?.color) return null;

    return (
        <Box className="flex items-center gap-1">
            <Box
                className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                style={{ backgroundColor: record.color }}
            />
            <Typography variant="body2" color="text.secondary">
                {record.color}
            </Typography>
        </Box>
    );
};

const PrincipalCard = (props: { label?: string }) => {
    const record = useRecordContext<Setting>(props);
    if (!record) return null;

    return (
        <Card
            className="mb-1 hover:shadow-lg transition-shadow"
            style={{ border: `2px solid ${record.color}` }}
        >
            <CardContent className="p-2">
                <Stack
                    direction="row"
                    className="justify-between items-center"
                >
                    <Box className="flex items-center gap-2">
                        <DragIndicator
                            className="w-5 h-5 text-gray-500 cursor-grab"
                        />
                        <Box
                            className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-xs"
                            style={{ backgroundColor: record.color }}
                        >
                            {record.sortOrder}
                        </Box>
                        <Box>
                            <Typography variant="h6" component="div">
                                {record.label}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Key: {record.key} | Market Rank: #
                                {record.sortOrder}
                            </Typography>
                        </Box>
                    </Box>
                    <Stack direction="row" className="space-x-1 items-center">
                        <Chip
                            label={record.active ? 'Active' : 'Inactive'}
                            className={record.active ? 'border-green-500 text-green-500' : 'border-gray-500 text-gray-500'}
                            size="small"
                            icon={
                                record.active ? (
                                    <Visibility className="w-4 h-4" />
                                ) : (
                                    <VisibilityOff className="w-4 h-4" />
                                )
                            }
                        />
                        <EditButton />
                        <DeleteButton />
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
};

const PrincipalActiveToggle = () => {
    const record = useRecordContext<Setting>();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const refresh = useRefresh();

    const handleToggle = async () => {
        if (!record) return;

        try {
            await dataProvider.update('settings', {
                id: record.id,
                data: { ...record, active: !record.active },
                previousData: record,
            });
            notify(
                `${record.label} ${record.active ? 'deactivated' : 'activated'}`
            );
            refresh();
        } catch (error) {
            notify('Error updating principal status', { type: 'error' });
        }
    };

    return (
        <Tooltip title={record?.active ? 'Deactivate' : 'Activate'}>
            <IconButton onClick={handleToggle} size="small">
                {record?.active ? (
                    <Visibility className="w-5 h-5 text-green-600" />
                ) : (
                    <VisibilityOff className="w-5 h-5 text-gray-400" />
                )}
            </IconButton>
        </Tooltip>
    );
};

export const PrincipalManager = () => {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Principal Management
            </Typography>
            <Typography variant="body1" color="text.secondary" className="mb-4">
                Manage food service principals and brands. Drag to reorder by
                market importance.
            </Typography>

            <List
                resource="settings"
                filter={{ category: 'principal' }}
                filters={principalFilters}
                actions={<PrincipalListActions />}
                sort={{ field: 'sortOrder', order: 'ASC' }}
                perPage={25}
                pagination={false}
                title="Food Service Principals"
            >
                <PrincipalDatagrid />
            </List>
        </Box>
    );
};

const PrincipalDatagrid = () => {
    const listContext = useListContext();

    if (listContext.isLoading) return null;

    // For mobile/card view
    if (window.innerWidth < 768) {
        return (
            <Box>
                {listContext.data?.map((record: Setting) => (
                    <Box key={record.id} className="mb-2">
                        <PrincipalCard />
                    </Box>
                ))}
            </Box>
        );
    }

    // For desktop/table view
    return (
        <Datagrid rowClick="show" bulkActionButtons={false}>
            <TextField source="sortOrder" label="Rank" />
            <TextField source="label" label="Principal Name" />
            <TextField source="key" label="Key" />
            <PrincipalColorChip label="Brand Color" />
            <BooleanField source="active" label="Active" />
            <PrincipalActiveToggle />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    );
};

PrincipalManager.path = '/settings/principals';
