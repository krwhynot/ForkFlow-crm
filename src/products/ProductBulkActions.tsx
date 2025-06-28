import * as React from 'react';
import {
    Button,
    useUpdateMany,
    useNotify,
    useRefresh,
    useUnselectAll,
    useListContext,
    BulkDeleteButton,
} from 'react-admin';
import {
    CheckCircle as ActivateIcon,
    Cancel as DeactivateIcon,
} from '@mui/icons-material';

export const ProductBulkActions = () => {
    return (
        <>
            <BulkActivateButton />
            <BulkDeactivateButton />
            <BulkDeleteButton />
        </>
    );
};

const BulkActivateButton = () => {
    const [updateMany, { isLoading }] = useUpdateMany();
    const { selectedIds } = useListContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const unselectAll = useUnselectAll('products');

    const handleActivate = async () => {
        if (selectedIds.length === 0) return;

        try {
            await updateMany('products', {
                ids: selectedIds,
                data: {
                    active: true,
                    updatedAt: new Date().toISOString(),
                },
            });

            notify(`Successfully activated ${selectedIds.length} product(s)`, {
                type: 'success',
            });
            refresh();
            unselectAll();
        } catch (error) {
            notify('Error activating products', { type: 'error' });
        }
    };

    return (
        <Button
            onClick={handleActivate}
            startIcon={<ActivateIcon />}
            disabled={selectedIds.length === 0 || isLoading}
            sx={{
                minHeight: '44px',
                px: 2,
                color: 'success.main',
                borderColor: 'success.main',
                '&:hover': {
                    backgroundColor: 'success.light',
                    borderColor: 'success.dark',
                },
            }}
        >
            Activate
        </Button>
    );
};

const BulkDeactivateButton = () => {
    const [updateMany, { isLoading }] = useUpdateMany();
    const { selectedIds } = useListContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const unselectAll = useUnselectAll('products');

    const handleDeactivate = async () => {
        if (selectedIds.length === 0) return;

        try {
            await updateMany('products', {
                ids: selectedIds,
                data: {
                    active: false,
                    updatedAt: new Date().toISOString(),
                },
            });

            notify(
                `Successfully deactivated ${selectedIds.length} product(s)`,
                { type: 'success' }
            );
            refresh();
            unselectAll();
        } catch (error) {
            notify('Error deactivating products', { type: 'error' });
        }
    };

    return (
        <Button
            onClick={handleDeactivate}
            startIcon={<DeactivateIcon />}
            disabled={selectedIds.length === 0 || isLoading}
            sx={{
                minHeight: '44px',
                px: 2,
                color: 'warning.main',
                borderColor: 'warning.main',
                '&:hover': {
                    backgroundColor: 'warning.light',
                    borderColor: 'warning.dark',
                },
            }}
        >
            Deactivate
        </Button>
    );
};
