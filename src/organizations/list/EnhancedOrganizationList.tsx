import { Box, Button, Chip, Dialog, DialogContent, Stack } from '@/components/ui-kit';
import {
    MapPinIcon as LocationIcon,
    MapIcon
} from '@heroicons/react/24/outline';
import { useCallback, useState } from 'react';
import {
    CreateButton,
    ExportButton,
    ListBase,
    Pagination,
    SortButton,
    Title,
    TopToolbar,
    useGetIdentity,
    useListContext,
    useNotify,
    useRedirect
} from 'react-admin';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { Organization } from '../../types';
import { MobileFAB } from '../common/MobileFAB';
import { MobileOrganizationCreate } from '../form/MobileOrganizationCreate';
import { ImageList } from './GridList';
import { OrganizationEmpty } from './OrganizationEmpty';
import { OrganizationListFilter } from './OrganizationListFilter';
import { OrganizationMapView } from './OrganizationMapView';

/**
 * Enhanced Organization List with mobile-optimized features
 * Features:
 * - Mobile FAB for quick organization creation
 * - Voice input and QR scanning integration
 * - Slide-up modal for mobile creation
 * - Enhanced mobile navigation
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
    const isMobile = useBreakpoint('md');
    const [showMap, setShowMap] = useState(false);

    const hasFilters = filterValues && Object.keys(filterValues).length > 0;

    if (isPending) return null;
    if (!data?.length && !hasFilters) return <OrganizationEmpty />;

    return (
        <Stack direction="row" component="div">
            <OrganizationListFilter />
            <Stack sx={{ width: '100%' }}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Title title={'Organizations'} />
                </Box>

                {/* Enhanced Toolbar */}
                <TopToolbar>
                    <SortButton
                        fields={['name', 'createdAt', 'revenue']}
                    />

                    {/* Map View Toggle */}
                    <Button
                        variant="outlined"
                        startIcon={<MapIcon />}
                        onClick={() => setShowMap(true)}
                        size={isMobile ? 'small' : 'medium'}
                        sx={{ minHeight: 44 }}
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
                        sx: {
                            height: isMobile ? '100vh' : '80vh',
                            borderRadius: isMobile ? 0 : 2,
                        },
                    }}
                >
                    <DialogContent sx={{ p: 0, height: '100%' }}>
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
