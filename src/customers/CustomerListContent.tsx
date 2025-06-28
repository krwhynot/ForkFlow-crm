/* eslint-disable import/no-anonymous-default-export */
import {
    Business as BusinessIcon,
    Phone as PhoneIcon,
    Place as PlaceIcon,
} from '@mui/icons-material';
import type { Theme } from '@mui/material';
import {
    Box,
    Checkbox,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Typography,
    useMediaQuery,
} from '@mui/material';
import { formatRelative } from 'date-fns';
import {
    Datagrid,
    DateField,
    RecordContextProvider,
    SimpleListLoading,
    TextField,
    useListContext,
} from 'react-admin';
import { Link } from 'react-router-dom';

import { Customer } from '../types';
import { BusinessTypeChip } from './BusinessTypeChip';

export const CustomerListContent = () => {
    const {
        data: customers,
        error,
        isPending,
        onToggleItem,
        selectedIds,
    } = useListContext<Customer>();

    const isSmall = useMediaQuery((theme: Theme) =>
        theme.breakpoints.down('md')
    );

    if (isPending) {
        return <SimpleListLoading hasLeftAvatarOrIcon hasSecondaryText />;
    }

    if (error) {
        return null;
    }

    // Mobile view - Card layout optimized for touch
    if (isSmall) {
        return (
            <MobileCustomerList
                customers={customers}
                selectedIds={selectedIds}
                onToggleItem={onToggleItem}
            />
        );
    }

    // Desktop view - Table layout
    return (
        <Datagrid>
            <TextField source="business_name" label="Business Name" />
            <TextField source="contact_person" label="Contact" />
            <BusinessTypeChip source="business_type" />
            <TextField source="phone" label="Phone" />
            <TextField source="address" label="Address" />
            <DateField source="created_at" label="Added" />
        </Datagrid>
    );
};

const MobileCustomerList = ({
    customers,
    selectedIds,
    onToggleItem,
}: {
    customers: Customer[];
    selectedIds: any[];
    onToggleItem: (id: any) => void;
}) => {
    const now = Date.now();

    return (
        <List dense>
            {customers.map(customer => (
                <RecordContextProvider key={customer.id} value={customer}>
                    <ListItem
                        disablePadding
                        sx={{
                            minHeight: 72, // 44px+ touch target
                            '&:hover': { backgroundColor: 'action.hover' },
                        }}
                    >
                        <ListItemButton
                            component={Link}
                            to={`/customers/${customer.id}/show`}
                            sx={{
                                padding: 2,
                                minHeight: 72,
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: '2.5em' }}>
                                <Checkbox
                                    edge="start"
                                    checked={selectedIds.includes(customer.id)}
                                    tabIndex={-1}
                                    disableRipple
                                    onClick={e => {
                                        e.stopPropagation();
                                        onToggleItem(customer.id);
                                    }}
                                    sx={{ padding: 1.5 }} // Larger touch target
                                />
                            </ListItemIcon>

                            <ListItemAvatar>
                                <BusinessIcon
                                    sx={{
                                        fontSize: 40,
                                        color: 'primary.main',
                                        backgroundColor: 'primary.light',
                                        borderRadius: '50%',
                                        padding: 1,
                                    }}
                                />
                            </ListItemAvatar>

                            <ListItemText
                                primary={
                                    <Typography variant="h6" component="div">
                                        {customer.business_name}
                                    </Typography>
                                }
                                secondary={
                                    <Box>
                                        {customer.contact_person && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Contact:{' '}
                                                {customer.contact_person}
                                            </Typography>
                                        )}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                mt: 0.5,
                                            }}
                                        >
                                            <BusinessTypeChip source="business_type" />
                                            {customer.phone && (
                                                <IconButton
                                                    size="small"
                                                    href={`tel:${customer.phone}`}
                                                    onClick={e =>
                                                        e.stopPropagation()
                                                    }
                                                    sx={{ padding: 1 }}
                                                >
                                                    <PhoneIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                            {customer.latitude &&
                                                customer.longitude && (
                                                    <PlaceIcon
                                                        fontSize="small"
                                                        color="action"
                                                        sx={{ ml: 0.5 }}
                                                    />
                                                )}
                                        </Box>
                                    </Box>
                                }
                            />

                            {customer.created_at && (
                                <ListItemSecondaryAction
                                    sx={{
                                        top: '16px',
                                        transform: 'none',
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        color="textSecondary"
                                        title={customer.created_at}
                                    >
                                        Added{' '}
                                        {formatRelative(
                                            customer.created_at,
                                            now
                                        )}
                                    </Typography>
                                </ListItemSecondaryAction>
                            )}
                        </ListItemButton>
                    </ListItem>
                </RecordContextProvider>
            ))}

            {customers.length === 0 && (
                <ListItem sx={{ minHeight: 72 }}>
                    <ListItemText primary="No customers found" />
                </ListItem>
            )}
        </List>
    );
};
