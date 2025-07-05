import React, { useState, useCallback } from 'react';
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
    useRedirect,
    useNotify,
} from 'react-admin';
import { Stack, Button, Dialog, DialogContent, Box, Chip } from '../../components/ui-kit';
import {
    MapIcon,
    MapPinIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';
import { ImageList } from './GridList';
import { OrganizationListFilter } from './OrganizationListFilter';
import { OrganizationEmpty } from './OrganizationEmpty';
import { OrganizationMapView } from './OrganizationMapView';
import { useTerritoryFilter } from '../../hooks/useTerritoryFilter';
import { MobileFAB } from '../common/MobileFAB';
import { MobileOrganizationCreate } from '../form/MobileOrganizationCreate';
import { Organization } from '../../types';
import { useBreakpoint } from '../../hooks/useBreakpoint';

/**
 * Enhanced Organization List with mobile-optimized features
 * Features:
 * - Mobile FAB for quick organization creation
 * - Voice input and QR scanning integration
 * - Slide-up modal for mobile creation
 * - Enhanced mobile navigation
 * - Territory filtering and display
 */
export const EnhancedOrganizationList = () => {
    const { identity } = useGetIdentity();
    const isMobile = useBreakpoint('md');
    const notify = useNotify();
    const redirect = useRedirect();

    // Mobile creation state
    const [showMobileCreate, setShowMobileCreate] = useState(false);
    const [createMode, setCreateMode] = useState<'quick' | 'full'>('quick');

    // Handle mobile organization creation
    const handleMobileCreate = useCallback(
        (mode: 'quick' | 'full' = 'quick') => {
            setCreateMode(mode);
            setShowMobileCreate(true);
        },
        []
    );

    // Handle creation success
    const handleCreateSuccess = useCallback(
        (organization: Organization) => {
            notify(
                `Organization "${organization.name}" created successfully!`,
                { type: 'success' }
            );
            setShowMobileCreate(false);
            // Optionally redirect to the new organization
            if (organization.id) {
                redirect('show', 'organizations', organization.id);
            }
        },
        [notify, redirect]
    );

    // Handle voice input creation
    const handleVoiceCreate = useCallback(() => {
        handleMobileCreate('full'); // Voice input works better with full form
    }, [handleMobileCreate]);

    // Handle QR scanning
    const handleQRScan = useCallback(() => {
        // TODO: Implement QR scanning logic
        notify('QR scanning will extract business card data automatically', {
            type: 'info',
        });
        handleMobileCreate('full');
    }, [notify, handleMobileCreate]);

    // Handle photo capture
    const handlePhotoCapture = useCallback(() => {
        // TODO: Implement photo capture logic
        notify('Photo capture will extract text from business documents', {
            type: 'info',
        });
        handleMobileCreate('full');
    }, [notify, handleMobileCreate]);

    if (!identity) return null;

    return (
        <ListBase perPage={25} sort={{ field: 'name', order: 'ASC' }}>
            <OrganizationListLayout />

            {/* Mobile FAB */}
            {isMobile && (
                <MobileFAB
                    onCreateOrganization={() => handleMobileCreate('quick')}
                    onVoiceCreate={handleVoiceCreate}
                    onQuickScan={handleQRScan}
                    onPhotoCapture={handlePhotoCapture}
                    position="bottom-right"
                />
            )}

            {/* Mobile Creation Modal */}
            <MobileOrganizationCreate
                open={showMobileCreate}
                onClose={() => setShowMobileCreate(false)}
                onSuccess={handleCreateSuccess}
                mode={createMode}
            />
        </ListBase>
    );
};

const OrganizationListLayout = () => {
    const { data, isPending, filterValues } = useListContext();
    const { hasRestrictions, territoryDisplayName } = useTerritoryFilter();
    const isMobile = useBreakpoint('md');
    const [showMap, setShowMap] = useState(false);

    const hasFilters = filterValues && Object.keys(filterValues).length > 0;

    if (isPending) return null;
    if (!data?.length && !hasFilters) return <OrganizationEmpty />;

    return (
        <Stack direction="row" component="div">
            <OrganizationListFilter />
            <Stack className="w-full">
                <Box className="flex items-center gap-2 mb-1">
                    <Title title={'Organizations'} />
                    {hasRestrictions && (
                        <Chip
                            icon={<MapPinIcon className="w-4 h-4" />}
                            label={`Territory: ${territoryDisplayName}`}
                            color="primary"
                            variant="outlined"
                            size="small"
                        />
                    )}
                </Box>

                {/* Enhanced Toolbar */}
                <TopToolbar>
                    <SortButton
                        fields={['name', 'createdAt', 'nb_deals', 'revenue']}
                    />

                    {/* Map View Toggle */}
                    <Button
                        variant="outlined"
                        startIcon={<MapIcon className="w-4 h-4" />}
                        onClick={() => setShowMap(true)}
                        size={isMobile ? 'small' : 'medium'}
                        className="min-h-[44px]"
                    >
                        {isMobile ? 'Map' : 'Map View'}
                    </Button>

                    <ExportButton />

                    {/* Desktop Create Button */}
                    {!isMobile && <CreateButton />}
                </TopToolbar>

                {/* List Content */}
                <ImageList />

                {/* Pagination */}
                <Pagination />

                {/* Map Dialog */}
                <Dialog
                    open={showMap}
                    onClose={() => setShowMap(false)}
                    maxWidth="lg"
                    fullWidth
                    fullScreen={isMobile}
                    PaperProps={{
                        style: {
                            height: isMobile ? '100vh' : '80vh',
                            borderRadius: isMobile ? 0 : 8,
                        },
                    }}
                >
                    <DialogContent className="p-0 h-full">
                        <OrganizationMapView
                            onClose={() => setShowMap(false)}
                        />
                    </DialogContent>
                </Dialog>
            </Stack>
        </Stack>
    );
};

// Re-export with enhanced version as default
export const OrganizationList = EnhancedOrganizationList;
