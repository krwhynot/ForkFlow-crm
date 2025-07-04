import * as React from 'react';
import {
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
import { Button } from '../components/Button/Button';

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
            disabled={selectedIds.length === 0 || isLoading}
            className="min-h-11 px-2 text-green-600 border-green-600 hover:bg-green-100 hover:border-green-700"
            variant="secondary"
        >
            <ActivateIcon className="mr-1" />
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
            disabled={selectedIds.length === 0 || isLoading}
            className="min-h-11 px-2 text-yellow-600 border-yellow-600 hover:bg-yellow-100 hover:border-yellow-700"
            variant="secondary"
        >
            <DeactivateIcon className="mr-1" />
            Deactivate
        </Button>
    );
};
