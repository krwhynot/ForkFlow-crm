import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import { useGetList, useNotify, Link } from 'react-admin';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    IconButton,
    Button,
    Stack,
    Drawer,
    useTheme,
    useMediaQuery,
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

import { Organization, Setting } from '../types';
import { useLocation } from '../components/mobile/LocationProvider';

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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const notify = useNotify();
    const { currentLocation, permission, requestLocation } = useLocation();

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
            if (filters.segmentId && org.segmentId !== parseInt(filters.segmentId)) {
                return false;
            }

            // Priority filter
            if (filters.priorityId && org.priorityId !== parseInt(filters.priorityId)) {
                return false;
            }

            // Near me filter
            if (filters.showNearMeOnly && currentLocation) {
                const distance = calculateDistance(
                    currentLocation.latitude,
                    currentLocation.longitude,
                    org.latitude,
                    org.longitude
                );
                if (distance > filters.nearMeRadius) {
                    return false;
                }
            }

            return true;
        });
    }, [organizations, filters, currentLocation]);

    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    // Get marker color based on segment
    const getMarkerColor = (organization: Organization): string => {
        const segment = segments?.find(s => s.id === organization.segmentId);
        return segment?.color || segmentColors[segment?.key || 'default'] || segmentColors.default;
    };

    // Get marker size based on priority
    const getMarkerSize = (organization: Organization): number => {
        const priority = priorities?.find(p => p.id === organization.priorityId);
        return priorityMarkerSizes[priority?.label as keyof typeof priorityMarkerSizes] || priorityMarkerSizes.default;
    };

    // Handle map load
    const onMapLoad = useCallback((map: google.maps.Map) => {
        setMapRef(map);
    }, []);

    // Center map on user location
    const centerOnUserLocation = () => {
        if (currentLocation && mapRef) {
            mapRef.panTo({
                lat: currentLocation.latitude,
                lng: currentLocation.longitude,
            });
            mapRef.setZoom(12);
        } else if (permission !== 'granted') {
            requestLocation();
        } else {
            notify('Location not available', { type: 'warning' });
        }
    };

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

                {/* Near Me Toggle */}
                <FormControlLabel
                    control={
                        <Switch
                            checked={filters.showNearMeOnly}
                            onChange={(e) => setFilters(prev => ({ ...prev, showNearMeOnly: e.target.checked }))}
                            disabled={!currentLocation}
                        />
                    }
                    label={`Show only within ${filters.nearMeRadius}km`}
                />

                {/* Radius Slider */}
                {filters.showNearMeOnly && (
                    <Box>
                        <Typography gutterBottom>
                            Radius: {filters.nearMeRadius}km
                        </Typography>
                        <Slider
                            value={filters.nearMeRadius}
                            onChange={(_, value) => setFilters(prev => ({ ...prev, nearMeRadius: value as number }))}
                            min={5}
                            max={200}
                            step={5}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => `${value}km`}
                        />
                    </Box>
                )}

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
                    {/* User location marker */}
                    {currentLocation && (
                        <Marker
                            position={{
                                lat: currentLocation.latitude,
                                lng: currentLocation.longitude,
                            }}
                            icon={{
                                url: "data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='50' cy='50' r='50' fill='%234285f4'/%3e%3ccircle cx='50' cy='50' r='25' fill='white'/%3e%3c/svg%3e",
                                scaledSize: (window as any).google?.maps ? new (window as any).google.maps.Size(20, 20) : undefined,
                            }}
                            title="Your Location"
                        />
                    )}

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
                    {/* My Location FAB */}
                    <Fab
                        color="primary"
                        size="medium"
                        onClick={centerOnUserLocation}
                        sx={{ minWidth: 44, minHeight: 44 }}
                        title="Center on my location"
                    >
                        <MyLocationIcon />
                    </Fab>

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
    const segment = segments?.find(s => s.id === organization.segmentId);
    const priority = priorities?.find(p => p.id === organization.priorityId);

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
                    {organization.state && `, ${organization.state}`}
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