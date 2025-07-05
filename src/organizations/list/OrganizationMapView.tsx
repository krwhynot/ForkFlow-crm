import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import { useGetList, useNotify, Link } from 'react-admin';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
} from '../../components/ui-kit';
import {
    Chip,
    IconButton,
    Dialog,
    DialogContent,
    Fab,
    Select,
    Badge,
    Paper,
    Avatar,
} from '@/components/ui-kit';
import {
    GoogleMap,
    LoadScript,
    Marker,
    InfoWindow,
    MarkerClusterer,
} from '@react-google-maps/api';
import {
    XMarkIcon as CloseIcon,
    FunnelIcon as FilterIcon,
    MapPinIcon as MyLocationIcon,
    MapIcon as DirectionsIcon,
    PhoneIcon,
    EnvelopeIcon as EmailIcon,
    BuildingOfficeIcon as BusinessIcon,
    MapPinIcon as LocationIcon,
    EyeIcon as VisibilityIcon,
} from '@heroicons/react/24/outline';

import { Organization, Setting } from '../../types';
import { useBreakpoint } from '../../hooks/useBreakpoint';

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
        <Paper className="p-4 mb-4">
            <Typography variant="h6" gutterBottom>
                Map Filters
            </Typography>

            <Stack spacing={4}>
                {/* Segment Filter */}
                <div className="w-full">
                    <Select
                        value={filters.segmentId}
                        onValueChange={(value: string) =>
                            setFilters(prev => ({
                                ...prev,
                                segmentId: value,
                            }))
                        }
                        label="Business Segment"
                        size="small"
                    >
                        <option value="">All Segments</option>
                        {segments?.map(segment => (
                            <option
                                key={segment.id}
                                value={segment.id.toString()}
                            >
                                {segment.label}
                            </option>
                        ))}
                    </Select>
                </div>

                {/* Priority Filter */}
                <div className="w-full">
                    <Select
                        value={filters.priorityId}
                        onValueChange={(value: string) =>
                            setFilters(prev => ({
                                ...prev,
                                priorityId: value,
                            }))
                        }
                        label="Priority"
                        size="small"
                    >
                        <option value="">All Priorities</option>
                        {priorities?.map(priority => (
                            <option
                                key={priority.id}
                                value={priority.id.toString()}
                            >
                                {priority.label}
                            </option>
                        ))}
                    </Select>
                </div>

                {/* Results Count */}
                <Typography variant="body2" className="text-gray-500">
                    Showing {filteredOrganizations.length} organizations
                </Typography>
            </Stack>
        </Paper>
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

            {/* Floating Action Buttons */}
            <Box className="absolute bottom-4 right-4">
                <Stack spacing={2}>
                    {/* Filter FAB */}
                    <Badge
                        badgeContent={
                            Object.values(filters).filter(Boolean).length
                        }
                        color="secondary"
                    >
                        <Fab
                            color="secondary"
                            size="medium"
                            onClick={() => setShowFilters(true)}
                            className="min-w-11 min-h-11"
                            title="Show filters"
                        >
                            <FilterIcon className="w-5 h-5" />
                        </Fab>
                    </Badge>
                </Stack>
            </Box>

            {/* Close Button (if in modal/drawer mode) */}
            {onClose && (
                <IconButton
                    onClick={onClose}
                    className="absolute top-4 left-4 bg-white min-w-11 min-h-11 hover:bg-gray-100"
                >
                    <CloseIcon className="w-5 h-5" />
                </IconButton>
            )}

            {/* Filter Dialog */}
            <Dialog
                open={showFilters}
                onClose={() => setShowFilters(false)}
                maxWidth={isMobile ? "lg" : "sm"}
                fullWidth
            >
                <DialogContent className={`${isMobile ? 'w-full' : 'w-80'} p-4`}>
                    <Box className="flex justify-between items-center mb-4">
                        <Typography variant="h6">Map Filters</Typography>
                        <IconButton onClick={() => setShowFilters(false)}>
                            <CloseIcon className="w-5 h-5" />
                        </IconButton>
                    </Box>

                    <FilterControls />
                </DialogContent>
            </Dialog>
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
    const priority = priorities?.find((p: any) => p.key === organization.priority);

    return (
        <Box className="max-w-[300px] p-2">
            <Typography variant="h6" gutterBottom>
                {organization.name}
            </Typography>

            {/* Chips */}
            <Stack direction="row" spacing={2} className="mb-4">
                {priority && (
                    <Chip
                        label={priority.label}
                        size="small"
                        className="text-white"
                        style={{ 
                            backgroundColor: priority.color || '#9ca3af',
                        }}
                    />
                )}
                {segment && (
                    <Chip
                        label={segment.label}
                        size="small"
                        variant="outlined"
                        style={{ 
                            borderColor: segment.color || '#d1d5db',
                        }}
                    />
                )}
            </Stack>

            {/* Address */}
            {organization.address && (
                <Typography variant="body2" className="text-gray-500 mb-2">
                    {organization.address}
                    {organization.city && `, ${organization.city}`}
                    {organization.stateAbbr && `, ${organization.stateAbbr}`}
                </Typography>
            )}

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} className="mt-4">
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<DirectionsIcon className="w-4 h-4" />}
                    onClick={() => onGetDirections(organization)}
                    className="min-h-11"
                >
                    Directions
                </Button>

                {organization.phone && (
                    <IconButton
                        onClick={() => onPhoneCall(organization.phone!)}
                        color="primary"
                        className="min-w-11 min-h-11"
                    >
                        <PhoneIcon className="w-4 h-4" />
                    </IconButton>
                )}

                {organization.accountManager && (
                    <IconButton
                        onClick={() => onEmail(organization.accountManager!)}
                        color="primary"
                        className="min-w-11 min-h-11"
                    >
                        <EmailIcon className="w-4 h-4" />
                    </IconButton>
                )}

                <IconButton
                    component={Link}
                    to={`/organizations/${organization.id}/show`}
                    color="primary"
                    className="min-w-11 min-h-11"
                >
                    <VisibilityIcon className="w-4 h-4" />
                </IconButton>
            </Stack>
        </Box>
    );
};

export default OrganizationMapView;
