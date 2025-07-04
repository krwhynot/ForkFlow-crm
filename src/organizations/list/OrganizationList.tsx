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
import { Dialog, DialogContent, useMediaQuery, useTheme } from '@mui/material';
import {
    Map as MapIcon,
    LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useState } from 'react';
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
                                    <LocationIcon className="mr-1" />
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
    const theme = useTheme();
    const isFullScreen = useMediaQuery(theme.breakpoints.down('md'));

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
                    <MapIcon className="mr-1" />
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
                    sx: {
                        width: isFullScreen ? '100%' : '90vw',
                        height: isFullScreen ? '100%' : '90vh',
                        maxWidth: 'none',
                        maxHeight: 'none',
                    },
                }}
            >
                <DialogContent sx={{ p: 0, height: '100%' }}>
                    <OrganizationMapView onClose={() => setShowMap(false)} />
                </DialogContent>
            </Dialog>
        </>
    );
};
