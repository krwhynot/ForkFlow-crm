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
    Button,
} from '@/components/ui-kit';
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
import { useBreakpoint } from '../hooks/useBreakpoint';

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
    const isMobile = useBreakpoint('sm');

    const hasFilters = filterValues && Object.keys(filterValues).length > 0;

    if (!identity || isPending) return null;

    if (!data?.length && !hasFilters) return <UserEmpty />;

    return (
        <Stack direction="row">
            <UserListFilter />
            <Stack className="w-full">
                <Box className="flex items-center gap-4 mb-2">
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
        <SortButton
            fields={['lastName', 'firstName', 'email', 'role', 'createdAt']}
        />
        <ExportButton />
        <CreateButton
            variant="contained"
            label="Add User"
            className="ml-4 min-h-11 px-6"
        />
    </TopToolbar>
);

const UserListDesktop = () => (
    <Datagrid bulkActionButtons={false} rowClick="edit" className="bg-gray-50">
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
        <Box className="p-2">
            {data?.map(user => <UserCard key={user.id} user={user} />)}
        </Box>
    );
};

const UserCard: React.FC<{ user: User }> = ({ user }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Card className="p-4 mb-2 cursor-pointer hover:bg-gray-50">
            <Box className="flex items-center gap-4">
                <Avatar src={user.avatar?.src} className="w-12 h-12">
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                </Avatar>

                <Box className="flex-1">
                    <Typography variant="h6" component="div">
                        {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {user.email}
                    </Typography>

                    <Box className="flex gap-2 mt-2 flex-wrap">
                        <RoleChip role={user.role || 'user'} size="small" />
                        {user.administrator ? (
                            <Chip
                                label="Active"
                                className="border-green-500 text-green-500"
                                size="small"
                            />
                        ) : (
                            <Chip
                                label="Inactive"
                                className="border-red-500 text-red-500"
                                size="small"
                            />
                        )}
                        {user.territory && user.territory.length > 0 && (
                            <Chip
                                label={`${user.territory.length} areas`}
                                className="border-gray-400 text-gray-600"
                                size="small"
                            />
                        )}
                    </Box>

                    {user.updatedAt && (
                        <Typography variant="caption" color="text.secondary">
                            Last login:{' '}
                            {new Date(user.updatedAt).toLocaleDateString()}
                        </Typography>
                    )}
                </Box>

                <IconButton
                    onClick={handleMenuOpen}
                    className="min-h-11 min-w-11"
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
                    <EditIcon className="mr-2" />
                    Edit
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                    {user.administrator ? (
                        <>
                            <BlockIcon className="mr-2" />
                            Deactivate
                        </>
                    ) : (
                        <>
                            <CheckCircleIcon className="mr-2" />
                            Activate
                        </>
                    )}
                </MenuItem>
                <MenuItem onClick={handleMenuClose} className="text-red-600">
                    <DeleteIcon className="mr-2" />
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
        <Box className="flex items-center gap-2">
            <Avatar src={record.avatar?.src} className="w-8 h-8 text-sm">
                {record.firstName?.[0]}
                {record.lastName?.[0]}
            </Avatar>
        </Box>
    );
};

const RoleField = ({ source }: { source: string }) => {
    const record = useRecordContext<User>();
    if (!record) return null;

    return <RoleChip role={record.role || 'user'} size="small" />;
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
        <Box className="flex items-center gap-1">
            <LocationIcon fontSize="small" color="primary" />
            <Typography variant="body2">
                {record.territory.length} area
                {record.territory.length !== 1 ? 's' : ''}
            </Typography>
        </Box>
    );
};

const UserStatusField = ({ source }: { source: string }) => {
    const record = useRecordContext<User>();
    if (!record) return null;

    return record.administrator ? (
        <Chip
            label="Active"
            className="border-green-500 text-green-500"
            size="small"
        />
    ) : (
        <Chip
            label="Inactive"
            className="border-red-500 text-red-500"
            size="small"
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
                className="min-h-11 min-w-11"
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
                    <EditIcon className="mr-2" />
                    Edit
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                    {record.administrator ? (
                        <>
                            <BlockIcon className="mr-2" />
                            Deactivate
                        </>
                    ) : (
                        <>
                            <CheckCircleIcon className="mr-2" />
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

            notify(`Successfully activated ${selectedIds.length} user(s)`, {
                type: 'success',
            });
            refresh();
            unselectAll();
        } catch (error) {
            notify('Error activating users', { type: 'error' });
        }
    };

    return (
        <Button
            onClick={handleActivate}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-2"
        >
            <CheckCircleIcon />
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

            notify(`Successfully deactivated ${selectedIds.length} user(s)`, {
                type: 'success',
            });
            refresh();
            unselectAll();
        } catch (error) {
            notify('Error deactivating users', { type: 'error' });
        }
    };

    return (
        <Button
            onClick={handleDeactivate}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-2"
        >
            <BlockIcon />
            Deactivate
        </Button>
    );
};

const BulkExportButton = () => {
    return <ExportButton label="Export Users" maxResults={1000} />;
};
