// src/users/UserList.tsx
import React, { useState } from 'react';
import {
    ListBase,
    useListContext,
    useGetIdentity,
    TopToolbar,
    CreateButton,
    ExportButton,
    BulkActionsToolbar,
    BulkDeleteButton,
    Pagination,
    SortButton,
    Title,
    ListToolbar,
    Button,
    useUpdateMany,
    useNotify,
    useRefresh,
    useUnselectAll,
    Datagrid,
    TextField,
    DateField,
    BooleanField,
    EmailField,
    FunctionField,
    useRecordContext,
    ReferenceField,
} from 'react-admin';
import {
    Box,
    Stack,
    Card,
    Chip,
    Avatar,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    Person as PersonIcon,
    MoreVert as MoreVertIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    AdminPanelSettings as AdminIcon,
    Security as SecurityIcon,
    LocationOn as LocationIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';

import { User, UserRole } from '../types';
import { UserEmpty } from './UserEmpty';
import { UserListFilter } from './UserListFilter';
import { TerritoryDisplay } from '../components/TerritoryDisplay';
import { RoleChip } from '../components/auth/RoleChip';
import { useTerritoryFilter } from '../hooks/useTerritoryFilter';

export const UserList = () => {
    const { identity } = useGetIdentity();
    
    if (!identity) return null;
    
    return (
        <ListBase
            perPage={25}
            sort={{ field: 'lastName', order: 'ASC' }}
            resource="users"
        >
            <UserListLayout />
        </ListBase>
    );
};

const UserListLayout = () => {
    const { data, isPending, filterValues } = useListContext<User>();
    const { identity } = useGetIdentity();
    const { hasRestrictions, territoryDisplayName } = useTerritoryFilter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const hasFilters = filterValues && Object.keys(filterValues).length > 0;

    if (!identity || isPending) return null;

    if (!data?.length && !hasFilters) return <UserEmpty />;

    return (
        <Stack direction="row">
            <UserListFilter />
            <Stack sx={{ width: '100%' }}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Title title="User Management" />
                    {hasRestrictions && (
                        <TerritoryDisplay
                            showTooltip={true}
                            size="small"
                            variant="outlined"
                            color="primary"
                        />
                    )}
                </Box>
                <ListToolbar actions={<UserListActions />} />
                <BulkActionsToolbar>
                    <BulkActivateButton />
                    <BulkDeactivateButton />
                    <BulkExportButton />
                    <BulkDeleteButton />
                </BulkActionsToolbar>
                <Card>
                    {isMobile ? <UserListMobile /> : <UserListDesktop />}
                </Card>
                <Pagination rowsPerPageOptions={[10, 25, 50, 100]} />
            </Stack>
        </Stack>
    );
};

const UserListActions = () => (
    <TopToolbar>
        <SortButton fields={['lastName', 'firstName', 'email', 'role', 'createdAt']} />
        <ExportButton />
        <CreateButton
            variant="contained"
            label="Add User"
            sx={{
                marginLeft: 2,
                minHeight: 44,
                px: 3,
            }}
        />
    </TopToolbar>
);

const UserListDesktop = () => (
    <Datagrid
        bulkActionButtons={false}
        rowClick="edit"
        sx={{
            '& .RaDatagrid-headerCell': {
                backgroundColor: 'background.default',
            },
        }}
    >
        <UserAvatarField source="avatar" />
        <TextField source="firstName" label="First Name" />
        <TextField source="lastName" label="Last Name" />
        <EmailField source="email" />
        <RoleField source="role" />
        <TerritoryField source="territory" />
        <UserStatusField source="isActive" />
        <DateField source="lastLoginAt" label="Last Login" showTime />
        <DateField source="createdAt" label="Created" />
        <UserActionsField />
    </Datagrid>
);

const UserListMobile = () => {
    const { data } = useListContext<User>();
    
    return (
        <Box sx={{ p: 1 }}>
            {data?.map((user) => (
                <UserCard key={user.id} user={user} />
            ))}
        </Box>
    );
};

const UserCard: React.FC<{ user: User }> = ({ user }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const theme = useTheme();

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Card
            sx={{
                p: 2,
                mb: 1,
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: 'action.hover',
                },
            }}
        >
            <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                    src={user.avatar}
                    sx={{ width: 48, height: 48 }}
                >
                    {user.firstName[0]}{user.lastName[0]}
                </Avatar>
                
                <Box flex={1}>
                    <Typography variant="h6" component="div">
                        {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {user.email}
                    </Typography>
                    
                    <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                        <RoleChip role={user.role} size="small" />
                        {user.isActive ? (
                            <Chip
                                icon={<CheckCircleIcon />}
                                label="Active"
                                color="success"
                                size="small"
                                variant="outlined"
                            />
                        ) : (
                            <Chip
                                icon={<BlockIcon />}
                                label="Inactive"
                                color="error"
                                size="small"
                                variant="outlined"
                            />
                        )}
                        {user.territory && user.territory.length > 0 && (
                            <Chip
                                icon={<LocationIcon />}
                                label={`${user.territory.length} areas`}
                                size="small"
                                variant="outlined"
                            />
                        )}
                    </Box>
                    
                    {user.lastLoginAt && (
                        <Typography variant="caption" color="text.secondary">
                            Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
                        </Typography>
                    )}
                </Box>

                <IconButton
                    onClick={handleMenuOpen}
                    sx={{ minHeight: 44, minWidth: 44 }}
                >
                    <MoreVertIcon />
                </IconButton>
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={handleMenuClose}>
                    <EditIcon sx={{ mr: 1 }} />
                    Edit
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                    {user.isActive ? (
                        <>
                            <BlockIcon sx={{ mr: 1 }} />
                            Deactivate
                        </>
                    ) : (
                        <>
                            <CheckCircleIcon sx={{ mr: 1 }} />
                            Activate
                        </>
                    )}
                </MenuItem>
                <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
                    <DeleteIcon sx={{ mr: 1 }} />
                    Delete
                </MenuItem>
            </Menu>
        </Card>
    );
};

// Custom field components
const UserAvatarField = ({ source }: { source: string }) => {
    const record = useRecordContext<User>();
    if (!record) return null;

    return (
        <Box display="flex" alignItems="center" gap={1}>
            <Avatar
                src={record.avatar}
                sx={{ width: 32, height: 32, fontSize: '0.875rem' }}
            >
                {record.firstName[0]}{record.lastName[0]}
            </Avatar>
        </Box>
    );
};

const RoleField = ({ source }: { source: string }) => {
    const record = useRecordContext<User>();
    if (!record) return null;

    return <RoleChip role={record.role} size="small" />;
};

const TerritoryField = ({ source }: { source: string }) => {
    const record = useRecordContext<User>();
    if (!record) return null;

    if (!record.territory || record.territory.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary">
                No territory
            </Typography>
        );
    }

    return (
        <Box display="flex" alignItems="center" gap={0.5}>
            <LocationIcon fontSize="small" color="primary" />
            <Typography variant="body2">
                {record.territory.length} area{record.territory.length !== 1 ? 's' : ''}
            </Typography>
        </Box>
    );
};

const UserStatusField = ({ source }: { source: string }) => {
    const record = useRecordContext<User>();
    if (!record) return null;

    return record.isActive ? (
        <Chip
            icon={<CheckCircleIcon />}
            label="Active"
            color="success"
            size="small"
            variant="outlined"
        />
    ) : (
        <Chip
            icon={<BlockIcon />}
            label="Inactive"
            color="error"
            size="small"
            variant="outlined"
        />
    );
};

const UserActionsField = () => {
    const record = useRecordContext<User>();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    if (!record) return null;

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{ minHeight: 44, minWidth: 44 }}
            >
                <MoreVertIcon />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={handleMenuClose}>
                    <EditIcon sx={{ mr: 1 }} />
                    Edit
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                    {record.isActive ? (
                        <>
                            <BlockIcon sx={{ mr: 1 }} />
                            Deactivate
                        </>
                    ) : (
                        <>
                            <CheckCircleIcon sx={{ mr: 1 }} />
                            Activate
                        </>
                    )}
                </MenuItem>
            </Menu>
        </>
    );
};

// Bulk action components
const BulkActivateButton = () => {
    const [updateMany] = useUpdateMany();
    const { selectedIds } = useListContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const unselectAll = useUnselectAll('users');

    const handleActivate = async () => {
        if (selectedIds.length === 0) return;

        try {
            await updateMany('users', {
                ids: selectedIds,
                data: { isActive: true },
            });

            notify(
                `Successfully activated ${selectedIds.length} user(s)`,
                { type: 'success' }
            );
            refresh();
            unselectAll();
        } catch (error) {
            notify('Error activating users', { type: 'error' });
        }
    };

    return (
        <Button
            onClick={handleActivate}
            startIcon={<CheckCircleIcon />}
            disabled={selectedIds.length === 0}
        >
            Activate
        </Button>
    );
};

const BulkDeactivateButton = () => {
    const [updateMany] = useUpdateMany();
    const { selectedIds } = useListContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const unselectAll = useUnselectAll('users');

    const handleDeactivate = async () => {
        if (selectedIds.length === 0) return;

        try {
            await updateMany('users', {
                ids: selectedIds,
                data: { isActive: false },
            });

            notify(
                `Successfully deactivated ${selectedIds.length} user(s)`,
                { type: 'success' }
            );
            refresh();
            unselectAll();
        } catch (error) {
            notify('Error deactivating users', { type: 'error' });
        }
    };

    return (
        <Button
            onClick={handleDeactivate}
            startIcon={<BlockIcon />}
            disabled={selectedIds.length === 0}
        >
            Deactivate
        </Button>
    );
};

const BulkExportButton = () => {
    return (
        <ExportButton
            label="Export Users"
            maxResults={1000}
        />
    );
};