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
} from '@mui/material';
import { DragIndicator, Visibility, VisibilityOff } from '@mui/icons-material';
import { Setting } from '../types';

const PrincipalListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton 
            variant="contained" 
            label="Add Principal"
            transform={(data: any) => ({
                ...data,
                category: 'principal',
            })}
        />
    </TopToolbar>
);

const principalFilters = [
    <TextInput source="q" label="Search Principals" alwaysOn />,
];

const PrincipalColorChip = (props: { label?: string }) => {
    const record = useRecordContext<Setting>(props);
    if (!record?.color) return null;
    
    return (
        <Box display="flex" alignItems="center" gap={1}>
            <Box
                sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: record.color,
                    border: '2px solid #ccc',
                    boxShadow: 1,
                }}
            />
            <Typography variant="body2" color="textSecondary">
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
            sx={{ 
                mb: 1, 
                border: `2px solid ${record.color}`,
                '&:hover': { boxShadow: 3 }
            }}
        >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={2}>
                        <DragIndicator sx={{ color: 'text.secondary', cursor: 'grab' }} />
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '4px',
                                backgroundColor: record.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.75rem',
                            }}
                        >
                            {record.sortOrder}
                        </Box>
                        <Box>
                            <Typography variant="h6" component="div">
                                {record.label}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Key: {record.key} | Market Rank: #{record.sortOrder}
                            </Typography>
                        </Box>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                            label={record.active ? 'Active' : 'Inactive'}
                            color={record.active ? 'success' : 'default'}
                            size="small"
                            icon={record.active ? <Visibility /> : <VisibilityOff />}
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
            notify(`${record.label} ${record.active ? 'deactivated' : 'activated'}`);
            refresh();
        } catch (error) {
            notify('Error updating principal status', { type: 'error' });
        }
    };

    return (
        <Tooltip title={record?.active ? 'Deactivate' : 'Activate'}>
            <IconButton onClick={handleToggle} size="small">
                {record?.active ? <Visibility color="success" /> : <VisibilityOff color="disabled" />}
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
            <Typography variant="body1" color="textSecondary" paragraph>
                Manage food service principals and brands. Drag to reorder by market importance.
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
                    <Box key={record.id} sx={{ mb: 2 }}>
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