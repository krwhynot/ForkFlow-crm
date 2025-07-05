// Migrated from MUI to UI Kit components and Tailwind CSS
// - Badge: UI kit Badge with badgeContent for filter count indicator
// - Fab: UI kit Fab for floating action button with proper 44px touch targets
// - Drawer: Replaced with custom slide-out panel using Headless UI Transition
// - All sx props converted to Tailwind CSS classes
import {
    Badge,
    Box,
    Button,
    Chip,
    Fab,
    IconButton,
    Stack,
    Typography
} from '@/components/ui-kit';
import { EyeIcon, MapPinIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import {
    GoogleMap,
    InfoWindow,
    LoadScript,
    Marker,
    MarkerClusterer,
} from '@react-google-maps/api';
import * as React from 'react';
import { useCallback, useMemo, useState, Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Link, useGetList, useNotify } from 'react-admin';

import { useBreakpoint } from '../../hooks/useBreakpoint';
import { Organization, Setting } from '../../types';

const libraries: ('places' | 'geometry')[] = ['places', 'geometry'];

const mapContainerStyle = {
    width: '100%',
    height: '100vh',
};

const defaultCenter = {
    lat: 39.8283, // Center of US
    lng: -98.5795,
};

const defaultZoom = 4;

// Color mapping for organization segments
const segmentColors: { [key: string]: string } = {
    fine_dining: '#d32f2f', // Red
    fast_food: '#f57c00', // Orange
    healthcare: '#1976d2', // Blue
    catering: '#388e3c', // Green
    institutional: '#7b1fa2', // Purple
    default: '#757575', // Grey
};

// Priority marker sizes
const priorityMarkerSizes = {
    High: 40,
    Medium: 32,
    Low: 24,
    default: 28,
};

interface OrganizationMapViewProps {
    onClose?: () => void;
}

export const OrganizationMapView: React.FC<OrganizationMapViewProps> = ({
    onClose,
}) => {
    const isMobile = useBreakpoint('md');
    const notify = useNotify();

    // State
    const [selectedOrganization, setSelectedOrganization] =
        useState<Organization | null>(null);
    const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        segmentId: '',
        priorityId: '',
        nearMeRadius: 50, // km
        showNearMeOnly: false,
    });

    // Data fetching
    const { data: organizations, isLoading } = useGetList<Organization>(
        'organizations',
        {
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'name', order: 'ASC' },
        }
    );

    const { data: segments } = useGetList<Setting>('settings', {
        filter: { category: 'segment' },
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'sortOrder', order: 'ASC' },
    });

    const { data: priorities } = useGetList<Setting>('settings', {
        filter: { category: 'priority' },
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'sortOrder', order: 'ASC' },
    });

    // Filter organizations based on current filters
    const filteredOrganizations = useMemo(() => {
        if (!organizations) return [];

        return organizations.filter(org => {
            // Must have coordinates to show on map
            if (!org.latitude || !org.longitude) return false;

            // Segment filter
            if (filters.segmentId && org.segment !== filters.segmentId) {
                return false;
            }

            // Priority filter
            if (filters.priorityId && org.priority !== filters.priorityId) {
                return false;
            }

            return true;
        });
    }, [organizations, filters]);

    // Get marker color based on segment
    const getMarkerColor = (organization: Organization): string => {
        const segment = segments?.find(s => s.key === organization.segment);
        return (
            segment?.color ||
            segmentColors[segment?.key || 'default'] ||
            segmentColors.default
        );
    };

    // Get marker size based on priority
    const getMarkerSize = (organization: Organization): number => {
        const priority = priorities?.find(p => p.key === organization.priority);
        return (
            priorityMarkerSizes[
            priority?.label as keyof typeof priorityMarkerSizes
            ] || priorityMarkerSizes.default
        );
    };

    // Handle map load
    const onMapLoad = useCallback((map: google.maps.Map) => {
        setMapRef(map);
    }, []);

    // Handle marker click
    const handleMarkerClick = (organization: Organization) => {
        setSelectedOrganization(organization);
        if (mapRef) {
            mapRef.panTo({
                lat: organization.latitude!,
                lng: organization.longitude!,
            });
        }
    };

    // Handle directions
    const handleGetDirections = (organization: Organization) => {
        const url = `https://maps.google.com/?daddr=${organization.latitude},${organization.longitude}`;
        window.open(url, '_blank');
    };

    // Handle phone call
    const handlePhoneCall = (phone: string) => {
        window.location.href = `tel:${phone}`;
    };

    // Handle email
    const handleEmail = (email: string) => {
        window.location.href = `mailto:${email}`;
    };

    // Filter controls
    const FilterControls = () => (
        <Box className="p-4 mb-4 bg-white rounded shadow">
            <Typography variant="h6" gutterBottom>
                Map Filters
            </Typography>

            <Stack spacing={2}>
                {/* Segment Filter */}
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Segment</label>
                <select
                    className="block w-full rounded border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 text-sm py-2 px-3 mb-2"
                    value={filters.segmentId}
                    onChange={e => setFilters(prev => ({ ...prev, segmentId: e.target.value }))}
                >
                    <option value="">All Segments</option>
                    {segments?.map(segment => (
                        <option key={segment.id} value={segment.id.toString()}>
                            {segment.label}
                        </option>
                    ))}
                </select>

                {/* Priority Filter */}
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                    className="block w-full rounded border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 text-sm py-2 px-3 mb-2"
                    value={filters.priorityId}
                    onChange={e => setFilters(prev => ({ ...prev, priorityId: e.target.value }))}
                >
                    <option value="">All Priorities</option>
                    {priorities?.map(priority => (
                        <option key={priority.id} value={priority.id.toString()}>
                            {priority.label}
                        </option>
                    ))}
                </select>

                {/* Results Count */}
                <Typography variant="body2" color="text.secondary">
                    Showing {filteredOrganizations.length} organizations
                </Typography>
            </Stack>
        </Box>
    );

    return (
        <Box className="relative h-screen overflow-hidden">
            <LoadScript
                googleMapsApiKey={
                    process.env.VITE_GOOGLE_MAPS_API_KEY ||
                    'AIzaSyDTQb6tSmWCnoFkhcnMKP_ohrxm0hAxkMY'
                }
                libraries={libraries}
                loadingElement={
                    <Box className="flex justify-center items-center h-screen">
                        <Typography>Loading map...</Typography>
                    </Box>
                }
            >
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={defaultCenter}
                    zoom={defaultZoom}
                    onLoad={onMapLoad}
                    options={{
                        styles: [
                            {
                                featureType: 'poi',
                                elementType: 'labels',
                                stylers: [{ visibility: 'off' }],
                            },
                        ],
                        zoomControl: true,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: true,
                    }}
                >
                    {/* Organization markers with clustering */}
                    <MarkerClusterer
                        options={{
                            imagePath:
                                'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
                            gridSize: 60,
                            maxZoom: 15,
                        }}
                    >
                        {clusterer => (
                            <>
                                {filteredOrganizations.map(organization => (
                                    <Marker
                                        key={organization.id}
                                        position={{
                                            lat: organization.latitude!,
                                            lng: organization.longitude!,
                                        }}
                                        clusterer={clusterer}
                                        onClick={() =>
                                            handleMarkerClick(organization)
                                        }
                                        icon={{
                                            path:
                                                (window as any).google?.maps
                                                    ?.SymbolPath?.CIRCLE || 0,
                                            fillColor:
                                                getMarkerColor(organization),
                                            fillOpacity: 0.8,
                                            strokeColor: 'white',
                                            strokeWeight: 2,
                                            scale:
                                                getMarkerSize(organization) / 2,
                                        }}
                                        title={organization.name}
                                    />
                                ))}
                            </>
                        )}
                    </MarkerClusterer>

                    {/* Info Window */}
                    {selectedOrganization && (
                        <InfoWindow
                            position={{
                                lat: selectedOrganization.latitude!,
                                lng: selectedOrganization.longitude!,
                            }}
                            onCloseClick={() => setSelectedOrganization(null)}
                        >
                            <OrganizationInfoCard
                                organization={selectedOrganization}
                                onGetDirections={handleGetDirections}
                                onPhoneCall={handlePhoneCall}
                                onEmail={handleEmail}
                                segments={segments}
                                priorities={priorities}
                            />
                        </InfoWindow>
                    )}
                </GoogleMap>
            </LoadScript>

            {/* Floating Action Button with Badge for Filters */}
            <Box className="absolute bottom-4 right-4">
                <Badge
                    badgeContent={Object.values(filters).filter(Boolean).length}
                    color="secondary"
                >
                    <Fab
                        color="secondary"
                        size="medium"
                        onClick={() => setShowFilters(true)}
                        aria-label="Show filters"
                        className="min-w-[44px] min-h-[44px] static relative"
                    >
                        <PencilSquareIcon className="h-6 w-6" />
                    </Fab>
                </Badge>
            </Box>

            {/* Close Button (if in modal/drawer mode) */}
            {onClose && (
                <IconButton
                    onClick={onClose}
                    className="absolute top-4 left-4 bg-white min-w-[44px] min-h-[44px] hover:bg-gray-50 shadow-md rounded-full"
                >
                    <EyeIcon className="h-6 w-6" />
                </IconButton>
            )}

            {/* Filter Slide-out Panel */}
            <Transition
                as={Fragment}
                show={showFilters}
                enter="transition-transform duration-300 ease-in-out"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition-transform duration-300 ease-in-out"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
            >
                <Box className={`absolute top-0 left-0 h-full bg-white shadow-lg z-50 p-4 ${isMobile ? 'w-full' : 'w-80'}`}>
                    <Box className="flex justify-between items-center mb-4">
                        <Typography variant="h6">Map Filters</Typography>
                        <IconButton 
                            onClick={() => setShowFilters(false)}
                            className="min-w-[44px] min-h-[44px]"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </IconButton>
                    </Box>
                    
                    <FilterControls />
                </Box>
            </Transition>
            
            {/* Backdrop for filter panel */}
            <Transition
                as={Fragment}
                show={showFilters}
                enter="transition-opacity duration-300 ease-in-out"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-300 ease-in-out"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <Box 
                    className="absolute inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setShowFilters(false)}
                />
            </Transition>
        </Box>
    );
};

// Organization Info Card Component for InfoWindow
interface OrganizationInfoCardProps {
    organization: Organization;
    onGetDirections: (org: Organization) => void;
    onPhoneCall: (phone: string) => void;
    onEmail: (email: string) => void;
    segments?: Setting[];
    priorities?: Setting[];
}

const OrganizationInfoCard: React.FC<OrganizationInfoCardProps> = ({
    organization,
    onGetDirections,
    onPhoneCall,
    onEmail,
    segments,
    priorities,
}) => {
    const segment = segments?.find(s => s.key === organization.segment);
    const priority = priorities?.find(p => p.key === organization.priority);

    return (
        <Box className="max-w-[300px] p-1">
            <Typography variant="h6" gutterBottom>
                {organization.name}
            </Typography>

            {/* Chips */}
            <Stack direction="row" spacing={1} className="mb-2">
                {priority && (
                    <Chip
                        label={priority.label}
                        size="small"
                        className="text-white"
                        style={{ backgroundColor: priority.color || '#d1d5db' }}
                    />
                )}
                {segment && (
                    <Chip
                        label={segment.label}
                        size="small"
                        variant="outlined"
                        className="border"
                        style={{ borderColor: segment.color }}
                    />
                )}
            </Stack>

            {/* Address */}
            {organization.address && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {organization.address}
                    {organization.city && `, ${organization.city}`}
                    {organization.stateAbbr && `, ${organization.stateAbbr}`}
                </Typography>
            )}

            {/* Action Buttons */}
            <Stack direction="row" spacing={1} className="mt-2">
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<MapPinIcon className="h-4 w-4" />}
                    onClick={() => onGetDirections(organization)}
                    className="min-h-[44px]"
                >
                    Directions
                </Button>

                {organization.phone && (
                    <IconButton
                        onClick={() => onPhoneCall(organization.phone!)}
                        color="primary"
                        className="min-w-[44px] min-h-[44px]"
                    >
                        <MapPinIcon className="h-4 w-4" />
                    </IconButton>
                )}

                {organization.accountManager && (
                    <IconButton
                        onClick={() => onEmail(organization.accountManager!)}
                        color="primary"
                        className="min-w-[44px] min-h-[44px]"
                    >
                        <MapPinIcon className="h-4 w-4" />
                    </IconButton>
                )}

                <IconButton
                    component={Link}
                    to={`/organizations/${organization.id}/show`}
                    color="primary"
                    className="min-w-[44px] min-h-[44px]"
                >
                    <EyeIcon className="h-4 w-4" />
                </IconButton>
            </Stack>
        </Box>
    );
};

export default OrganizationMapView;
