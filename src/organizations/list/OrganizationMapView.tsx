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
    Drawer,
    Fab,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    Switch,
    FormControlLabel,
    Badge,
    Paper,
    Avatar,
} from '@mui/material';
import {
    GoogleMap,
    LoadScript,
    Marker,
    InfoWindow,
    MarkerClusterer,
} from '@react-google-maps/api';
import {
    Close as CloseIcon,
    FilterList as FilterIcon,
    MyLocation as MyLocationIcon,
    Directions as DirectionsIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Business as BusinessIcon,
    LocationOn as LocationIcon,
    Visibility as VisibilityIcon,
} from '@mui/icons-material';

import { Organization, Setting } from '../../types';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

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
    'fine_dining': '#d32f2f',     // Red
    'fast_food': '#f57c00',       // Orange  
    'healthcare': '#1976d2',      // Blue
    'catering': '#388e3c',        // Green
    'institutional': '#7b1fa2',   // Purple
    'default': '#757575',         // Grey
};

// Priority marker sizes
const priorityMarkerSizes = {
    'High': 40,
    'Medium': 32,
    'Low': 24,
    'default': 28,
};

interface OrganizationMapViewProps {
    onClose?: () => void;
}

export const OrganizationMapView: React.FC<OrganizationMapViewProps> = ({ onClose }) => {
    const isMobile = useBreakpoint('md');
    const notify = useNotify();

    // State
    const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
    const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        segmentId: '',
        priorityId: '',
        nearMeRadius: 50, // km
        showNearMeOnly: false,
    });

    // Data fetching
    const { data: organizations, isLoading } = useGetList<Organization>('organizations', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'name', order: 'ASC' },
    });

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
        return segment?.color || segmentColors[segment?.key || 'default'] || segmentColors.default;
    };

    // Get marker size based on priority
    const getMarkerSize = (organization: Organization): number => {
        const priority = priorities?.find(p => p.key === organization.priority);
        return priorityMarkerSizes[priority?.label as keyof typeof priorityMarkerSizes] || priorityMarkerSizes.default;
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
        <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
                Map Filters
            </Typography>
            
            <Stack spacing={2}>
                {/* Segment Filter */}
                <FormControl fullWidth size="small">
                    <InputLabel>Business Segment</InputLabel>
                    <Select
                        value={filters.segmentId}
                        onChange={(e) => setFilters(prev => ({ ...prev, segmentId: e.target.value }))}
                        label="Business Segment"
                    >
                        <MenuItem value="">All Segments</MenuItem>
                        {segments?.map(segment => (
                            <MenuItem key={segment.id} value={segment.id.toString()}>
                                {segment.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Priority Filter */}
                <FormControl fullWidth size="small">
                    <InputLabel>Priority</InputLabel>
                    <Select
                        value={filters.priorityId}
                        onChange={(e) => setFilters(prev => ({ ...prev, priorityId: e.target.value }))}
                        label="Priority"
                    >
                        <MenuItem value="">All Priorities</MenuItem>
                        {priorities?.map(priority => (
                            <MenuItem key={priority.id} value={priority.id.toString()}>
                                {priority.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Results Count */}
                <Typography variant="body2" color="text.secondary">
                    Showing {filteredOrganizations.length} organizations
                </Typography>
            </Stack>
        </Paper>
    );

    return (
        <Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
            <LoadScript
                googleMapsApiKey={process.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDTQb6tSmWCnoFkhcnMKP_ohrxm0hAxkMY'}
                libraries={libraries}
                loadingElement={
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '100vh' 
                    }}>
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
                                featureType: "poi",
                                elementType: "labels",
                                stylers: [{ visibility: "off" }]
                            }
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
                            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
                            gridSize: 60,
                            maxZoom: 15,
                        }}
                    >
                        {(clusterer) => (
                            <>
                                {filteredOrganizations.map((organization) => (
                                <Marker
                                    key={organization.id}
                                    position={{
                                        lat: organization.latitude!,
                                        lng: organization.longitude!,
                                    }}
                                    clusterer={clusterer}
                                    onClick={() => handleMarkerClick(organization)}
                                    icon={{
                                        path: (window as any).google?.maps?.SymbolPath?.CIRCLE || 0,
                                        fillColor: getMarkerColor(organization),
                                        fillOpacity: 0.8,
                                        strokeColor: 'white',
                                        strokeWeight: 2,
                                        scale: getMarkerSize(organization) / 2,
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
            <Box sx={{ position: 'absolute', bottom: 16, right: 16 }}>
                <Stack spacing={1}>
                    {/* Filter FAB */}
                    <Badge badgeContent={Object.values(filters).filter(Boolean).length} color="secondary">
                        <Fab
                            color="secondary"
                            size="medium"
                            onClick={() => setShowFilters(true)}
                            sx={{ minWidth: 44, minHeight: 44 }}
                            title="Show filters"
                        >
                            <FilterIcon />
                        </Fab>
                    </Badge>
                </Stack>
            </Box>

            {/* Close Button (if in modal/drawer mode) */}
            {onClose && (
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        bgcolor: 'background.paper',
                        minWidth: 44,
                        minHeight: 44,
                        '&:hover': { bgcolor: 'background.default' },
                    }}
                >
                    <CloseIcon />
                </IconButton>
            )}

            {/* Filter Drawer */}
            <Drawer
                anchor="left"
                open={showFilters}
                onClose={() => setShowFilters(false)}
                PaperProps={{
                    sx: { width: isMobile ? '100%' : 320, p: 2 }
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Map Filters</Typography>
                    <IconButton onClick={() => setShowFilters(false)}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                
                <FilterControls />
            </Drawer>
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
        <Box sx={{ maxWidth: 300, p: 1 }}>
            <Typography variant="h6" gutterBottom>
                {organization.name}
            </Typography>

            {/* Chips */}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                {priority && (
                    <Chip 
                        label={priority.label} 
                        size="small"
                        sx={{ 
                            bgcolor: priority.color || 'grey.300',
                            color: 'white',
                        }}
                    />
                )}
                {segment && (
                    <Chip 
                        label={segment.label} 
                        size="small" 
                        variant="outlined"
                        sx={{ borderColor: segment.color }}
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
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<DirectionsIcon />}
                    onClick={() => onGetDirections(organization)}
                    sx={{ minHeight: 44 }}
                >
                    Directions
                </Button>

                {organization.phone && (
                    <IconButton
                        onClick={() => onPhoneCall(organization.phone!)}
                        color="primary"
                        sx={{ minWidth: 44, minHeight: 44 }}
                    >
                        <PhoneIcon />
                    </IconButton>
                )}

                {organization.accountManager && (
                    <IconButton
                        onClick={() => onEmail(organization.accountManager!)}
                        color="primary"
                        sx={{ minWidth: 44, minHeight: 44 }}
                    >
                        <EmailIcon />
                    </IconButton>
                )}

                <IconButton
                    component={Link}
                    to={`/organizations/${organization.id}/show`}
                    color="primary"
                    sx={{ minWidth: 44, minHeight: 44 }}
                >
                    <VisibilityIcon />
                </IconButton>
            </Stack>
        </Box>
    );
};

export default OrganizationMapView;
