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
import { Stack, Button, Dialog, DialogContent, useMediaQuery, useTheme, Box, Chip } from '@mui/material';
import { Map as MapIcon, LocationOn as LocationIcon } from '@mui/icons-material';
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
        <Stack direction="row" component="div">
            <OrganizationListFilter />
            <Stack sx={{ width: '100%' }}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Title title={'Organizations'} />
                    {hasRestrictions && (
                        <Chip
                            icon={<LocationIcon />}
                            label={`Territory: ${territoryDisplayName}`}
                            variant="outlined"
                            size="small"
                            color="primary"
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
                    variant="outlined"
                    startIcon={<MapIcon />}
                    onClick={() => setShowMap(true)}
                    sx={{
                        marginLeft: 1,
                        minHeight: 44,
                        px: 2,
                    }}
                >
                    Map View
                </Button>
                <CreateButton
                    variant="contained"
                    label="New Organization"
                    sx={{
                        marginLeft: 2,
                        minHeight: 44,
                        px: 3,
                    }}
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
                    }
                }}
            >
                <DialogContent sx={{ p: 0, height: '100%' }}>
                    <OrganizationMapView onClose={() => setShowMap(false)} />
                </DialogContent>
            </Dialog>
        </>
    );
};
