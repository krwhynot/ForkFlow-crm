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
import { 
    Stack, 
    Button, 
    Dialog, 
    DialogContent, 
    useMediaQuery, 
    useTheme, 
    Box, 
    Chip,
    Divider,
} from '@mui/material';
import { 
    Map as MapIcon, 
    LocationOn as LocationIcon,
    ViewList as TableIcon,
    ViewModule as CardsIcon,
} from '@mui/icons-material';

import { OrganizationListFilter } from './OrganizationListFilter';
import { OrganizationEmpty } from './OrganizationEmpty';
import { OrganizationMapView } from './OrganizationMapView';
import { LayoutSelector, ViewModeRenderer } from '../common';
import { useViewMode, useKeyboardShortcuts } from '../hooks';
import { useTerritoryFilter } from '../../hooks/useTerritoryFilter';

/**
 * Enhanced OrganizationList component with multiple view modes
 * Supports table, cards, kanban, and map views with layout persistence
 */
export const EnhancedOrganizationList = () => {
    const { identity } = useGetIdentity();
    if (!identity) return null;
    
    return (
        <ListBase perPage={25} sort={{ field: 'name', order: 'ASC' }}>
            <EnhancedOrganizationListLayout />
        </ListBase>
    );
};

const EnhancedOrganizationListLayout = () => {
    const { data, isPending, filterValues, error } = useListContext();
    const { hasRestrictions, territoryDisplayName } = useTerritoryFilter();
    const { viewMode } = useViewMode();
    const [showMapDialog, setShowMapDialog] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    // Enable keyboard shortcuts
    useKeyboardShortcuts({
        enableGlobalShortcuts: true,
        onCreateNew: () => {
            // TODO: Navigate to create page
            console.log('Create new organization shortcut triggered');
        },
        onSearch: () => {
            // Focus search input
            const searchInput = document.querySelector('input[name="q"]') as HTMLInputElement;
            if (searchInput) {
                searchInput.focus();
            }
        },
    });
    
    const hasFilters = filterValues && Object.keys(filterValues).length > 0;

    if (isPending) return null;
    if (!data?.length && !hasFilters) return <OrganizationEmpty />;

    return (
        <Stack direction="row" component="div">
            <OrganizationListFilter />
            <Stack sx={{ width: '100%' }}>
                {/* Header Section */}
                <Box sx={{ mb: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Title title="Organizations" />
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
                        
                        {/* View Mode Selector - Desktop */}
                        {!isMobile && (
                            <LayoutSelector 
                                showLabels={false}
                                compact={false}
                            />
                        )}
                    </Box>

                    {/* Mobile View Mode Selector */}
                    {isMobile && (
                        <Box sx={{ mb: 2 }}>
                            <LayoutSelector 
                                showLabels={false}
                                compact={true}
                            />
                        </Box>
                    )}

                    {/* Current View Mode Info */}
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={1}>
                            {viewMode.mode === 'table' && <TableIcon color="action" />}
                            {viewMode.mode === 'cards' && <CardsIcon color="action" />}
                            <Chip
                                label={`${data?.length || 0} organizations`}
                                size="small"
                                variant="outlined"
                            />
                        </Box>
                        
                        <Box>
                            <EnhancedOrganizationListActions 
                                onShowMap={() => setShowMapDialog(true)}
                            />
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Main Content Area */}
                <ViewModeRenderer
                    organizations={data || []}
                    loading={isPending}
                    error={error?.message}
                    onRefresh={() => window.location.reload()}
                />

                {/* Pagination */}
                {viewMode.mode !== 'kanban' && viewMode.mode !== 'map' && (
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                        <Pagination 
                            rowsPerPageOptions={[10, 25, 50, 100]}
                        />
                    </Box>
                )}

                {/* Map Dialog */}
                <Dialog
                    open={showMapDialog}
                    onClose={() => setShowMapDialog(false)}
                    fullScreen={isMobile}
                    maxWidth="lg"
                    fullWidth
                >
                    <DialogContent sx={{ p: 0, height: isMobile ? '100vh' : '70vh' }}>
                        <OrganizationMapView />
                    </DialogContent>
                </Dialog>
            </Stack>
        </Stack>
    );
};

interface EnhancedOrganizationListActionsProps {
    onShowMap: () => void;
}

const EnhancedOrganizationListActions: React.FC<EnhancedOrganizationListActionsProps> = ({
    onShowMap
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <TopToolbar sx={{ minHeight: 'auto' }}>
            <SortButton fields={['name', 'createdAt', 'city', 'revenue', 'nb_contacts', 'nb_deals']} />
            <ExportButton />
            <Button
                variant="outlined"
                startIcon={<MapIcon />}
                onClick={onShowMap}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                    marginLeft: 1,
                    minHeight: 44,
                    px: 2,
                }}
            >
                {isMobile ? 'Map' : 'View Map'}
            </Button>
            <CreateButton 
                sx={{ 
                    marginLeft: 1,
                    minHeight: 44,
                }}
            />
        </TopToolbar>
    );
};