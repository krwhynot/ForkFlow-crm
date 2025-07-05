import React, { useState } from 'react';
import {
    TopToolbar,
    ExportButton,
    CreateButton,
    Pagination,
    useGetIdentity,
    ListBase,
    Title,
    ListToolbar,
    useListContext,
    SortButton,
} from 'react-admin';

import { ImageList } from './GridList';
import { OrganizationListFilter } from './OrganizationListFilter';
import { Stack } from '../../components/Layout/Stack';
import { Box } from '../../components/Layout/Box';
import { Chip } from '../../components/DataDisplay/Chip';
import { Button } from '../../components/Button/Button';
import { Dialog, DialogContent } from '@/components/ui-kit';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useTwTheme } from '../../hooks/useTwTheme';
import {
    MapIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline';
import { OrganizationEmpty } from './OrganizationEmpty';
import { OrganizationMapView } from './OrganizationMapView';
import { useTerritoryFilter } from '../../hooks/useTerritoryFilter';

export const OrganizationList = () => {
    const { identity } = useGetIdentity();
    if (!identity) return null;
    return (
        <ListBase perPage={25} sort={{ field: 'name', order: 'ASC' }}>
            <OrganizationListLayout />
        </ListBase>
    );
};

const OrganizationListLayout = () => {
    const { data, isPending, filterValues } = useListContext();
    const { hasRestrictions, territoryDisplayName } = useTerritoryFilter();
    const hasFilters = filterValues && Object.keys(filterValues).length > 0;

    if (isPending) return null;
    if (!data?.length && !hasFilters) return <OrganizationEmpty />;

    return (
        <Stack direction="row">
            <OrganizationListFilter />
            <Stack className="w-full">
                <Box className="flex items-center gap-2 mb-1">
                    <Title title={'Organizations'} />
                    {hasRestrictions && (
                        <Chip
                            label={
                                <span className="flex items-center">
                                    <MapPinIcon className="mr-1 w-4 h-4" />
                                    {`Territory: ${territoryDisplayName}`}
                                </span>
                            }
                            size="small"
                            className="border border-blue-500 text-blue-500"
                        />
                    )}
                </Box>
                <ListToolbar actions={<OrganizationListActions />} />
                <ImageList />
                <Pagination rowsPerPageOptions={[10, 25, 50, 100]} />
            </Stack>
        </Stack>
    );
};

const OrganizationListActions = () => {
    const [showMap, setShowMap] = useState(false);
    const theme = useTwTheme();
    const isFullScreen = useMediaQuery('(max-width: 768px)');

    return (
        <>
            <TopToolbar>
                <SortButton fields={['name', 'createdAt', 'city', 'state']} />
                <ExportButton />
                <Button
                    variant="secondary"
                    onClick={() => setShowMap(true)}
                    className="ml-1 min-h-11 px-2"
                >
                    <MapIcon className="mr-1 w-4 h-4" />
                    Map View
                </Button>
                <CreateButton
                    variant="contained"
                    label="New Organization"
                    className="ml-2 min-h-11 px-3"
                />
            </TopToolbar>

            {/* Map Dialog */}
            <Dialog
                open={showMap}
                onClose={() => setShowMap(false)}
                maxWidth={false}
                fullScreen={isFullScreen}
                PaperProps={{
                    style: {
                        width: isFullScreen ? '100%' : '90vw',
                        height: isFullScreen ? '100%' : '90vh',
                        maxWidth: 'none',
                        maxHeight: 'none',
                    },
                }}
            >
                <DialogContent className="p-0 h-full">
                    <OrganizationMapView onClose={() => setShowMap(false)} />
                </DialogContent>
            </Dialog>
        </>
    );
};
