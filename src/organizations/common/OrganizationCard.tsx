import React, { useState, useRef, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Box,
    Chip,
    IconButton,
    Avatar,
    Tooltip,
    Menu,
    MenuItem,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@/components/ui-kit';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useTwTheme } from '../../hooks/useTwTheme';
import {
    PhoneIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    MapPinIcon,
    PencilIcon,
    BuildingOfficeIcon,
    EllipsisVerticalIcon,
    EyeIcon,
    TrashIcon,
    ShareIcon,
    TrendingUpIcon,
} from '@heroicons/react/24/outline';
import { useRecordContext, useGetOne, Link } from 'react-admin';
import { Organization, Setting } from '../../types';

interface OrganizationCardProps {
    lazy?: boolean;
    onView?: (id: string | number) => void;
    onEdit?: (id: string | number) => void;
    onDelete?: (id: string | number) => void;
    onShare?: (organization: Organization) => void;
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({
    lazy = true,
    onView,
    onEdit,
    onDelete,
    onShare,
}) => {
    const record = useRecordContext<Organization>();
    const theme = useTwTheme();
    const isMobile = useMediaQuery('(max-width: 768px)'); // Mobile breakpoint
    const isTablet = useMediaQuery('(max-width: 1024px)'); // Tablet breakpoint

    // Lazy loading state
    const [isVisible, setIsVisible] = useState(!lazy);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    
    const cardRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Fetch Settings for display
    const { data: priority } = useGetOne<Setting>(
        'settings',
        {
            id: record?.priorityId,
        },
        { enabled: !!record?.priorityId }
    );

    const { data: segment } = useGetOne<Setting>(
        'settings',
        {
            id: record?.segmentId,
        },
        { enabled: !!record?.segmentId }
    );

    const { data: distributor } = useGetOne<Setting>(
        'settings',
        {
            id: record?.distributorId,
        },
        { enabled: !!record?.distributorId }
    );

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (!lazy || isVisible) return;

        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observerRef.current?.disconnect();
                }
            },
            {
                rootMargin: '50px', // Load 50px before entering viewport
                threshold: 0.1,
            }
        );

        if (cardRef.current) {
            observerRef.current.observe(cardRef.current);
        }

        return () => {
            observerRef.current?.disconnect();
        };
    }, [lazy, isVisible]);

    if (!record) return null;

    const handlePhoneClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (record.phone) {
            window.location.href = `tel:${record.phone}`;
        }
    };

    const handleEmailClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (record.accountManager) {
            window.location.href = `mailto:${record.accountManager}`;
        }
    };

    const handleWebsiteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (record.website) {
            window.open(record.website, '_blank');
        }
    };

    const handleDirectionsClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (record.latitude && record.longitude) {
            const url = `https://maps.google.com/?q=${record.latitude},${record.longitude}`;
            window.open(url, '_blank');
        } else if (record.address) {
            const url = `https://maps.google.com/?q=${encodeURIComponent(
                `${record.address}, ${record.city}, ${record.state} ${record.zipCode}`
            )}`;
            window.open(url, '_blank');
        }
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setMenuAnchor(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
    };

    const handleAction = (action: () => void) => {
        handleMenuClose();
        action();
    };

    const formatRevenue = (revenue?: number) => {
        if (!revenue) return null;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
        }).format(revenue);
    };

    const getBusinessTypeColor = (type?: string) => {
        switch (type) {
            case 'restaurant': return 'warning';
            case 'grocery': return 'success';
            case 'distributor': return 'secondary';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'prospect': return 'info';
            case 'active': return 'success';
            case 'inactive': return 'default';
            case 'closed': return 'error';
            default: return 'default';
        }
    };

    // Loading skeleton for lazy loading
    if (!isVisible) {
        return (
            <Card 
                ref={cardRef}
                className="h-50 sm:h-55 md:h-60 flex flex-col"
            >
                <CardContent className="flex-1 p-4 sm:p-6">
                    <Box className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                        <Box className="flex-1">
                            <div className="w-3/4 h-6 bg-gray-200 rounded animate-pulse mb-2" />
                            <div className="w-1/2 h-5 bg-gray-200 rounded animate-pulse" />
                        </Box>
                    </Box>
                    <div className="w-2/5 h-5 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="w-3/5 h-5 bg-gray-200 rounded animate-pulse mb-4" />
                    <Box className="flex gap-2 flex-wrap">
                        <div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />
                        <div className="w-15 h-6 bg-gray-200 rounded animate-pulse" />
                    </Box>
                </CardContent>
                <CardActions className="p-2 sm:p-4 pt-0">
                    <div className="w-11 h-11 bg-gray-200 rounded-full animate-pulse" />
                    <div className="w-11 h-11 bg-gray-200 rounded-full animate-pulse" />
                    <div className="w-11 h-11 bg-gray-200 rounded-full animate-pulse ml-auto" />
                </CardActions>
            </Card>
        );
    }

    return (
        <Card
            ref={cardRef}
            component="article"
            role="button"
            tabIndex={0}
            aria-label={`Organization: ${record.name}${record.address ? `, located at ${record.address}` : ''}${priority ? `, priority: ${priority.label}` : ''}`}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onView?.(record.id) || (window.location.href = `/organizations/${record.id}/show`);
                }
            }}
            onClick={() => onView?.(record.id)}
            className="h-50 sm:h-55 md:h-60 flex flex-col cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
        >
            <CardContent className="flex-1 p-4 sm:p-6">
                {/* Header with Avatar and Name */}
                <Box className="flex items-start gap-4 mb-4">
                    <Avatar
                        src={isVisible && record.logo ? record.logo : undefined}
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600"
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                    >
                        {!imageLoaded || imageError ? (
                            <BuildingOfficeIcon className={isMobile ? 'w-5 h-5' : 'w-6 h-6'} />
                        ) : null}
                    </Avatar>
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                            variant={isMobile ? 'subtitle1' : 'h6'}
                            component="h2"
                            fontWeight="medium"
                            sx={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                mb: 0.5,
                                lineHeight: 1.2,
                            }}
                        >
                            {record.name}
                        </Typography>
                        
                        {(record.city || record.stateAbbr) && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <MapPinIcon className="w-4 h-4 text-gray-500" />
                                <Typography 
                                    variant="caption" 
                                    className="text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap"
                                >
                                    {record.city}
                                    {record.city && record.stateAbbr && ', '}
                                    {record.stateAbbr}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Priority Chip */}
                    {priority && (
                        <Chip
                            label={priority.label}
                            size="small"
                            className="font-semibold text-xs"
                            style={{
                                backgroundColor: priority.color || '#d1d5db',
                                color: priority.color ? '#fff' : '#374151',
                            }}
                        />
                    )}
                </Box>

                {/* Contact Information */}
                <Box className="mb-4">
                    {record.accountManager && (
                        <Typography 
                            variant="body2" 
                            className="mb-1 font-medium"
                        >
                            {record.accountManager}
                        </Typography>
                    )}
                    
                    {/* Business Context - Compact */}
                    <Box className="flex flex-wrap gap-2 mb-2">
                        {segment && (
                            <Typography variant="caption" color="text.secondary">
                                {segment.label}
                            </Typography>
                        )}
                        {distributor && segment && (
                            <Typography variant="caption" color="text.secondary">
                                • {distributor.label}
                            </Typography>
                        )}
                        {distributor && !segment && (
                            <Typography variant="caption" color="text.secondary">
                                {distributor.label}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* Revenue */}
                {record.revenue && (
                    <Box className="flex items-center gap-1 mb-4">
                        <TrendingUpIcon className="w-4 h-4 text-gray-500" />
                        <Typography variant="body2" className="font-medium">
                            {formatRevenue(record.revenue)}
                        </Typography>
                    </Box>
                )}

                {/* Address - Compact */}
                {(record.address || record.city) && !isMobile && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        className="mb-2 block overflow-hidden text-ellipsis whitespace-nowrap text-gray-600"
                    >
                        {record.address && `${record.address}, `}
                        {record.city && record.state
                            ? `${record.city}, ${record.state}`
                            : record.city || record.state}
                        {record.zipCode && ` ${record.zipCode}`}
                    </Typography>
                )}

                {/* Status Chips */}
                <Box className="flex gap-2 flex-wrap items-center mt-auto">
                    {record.business_type && (
                        <Chip
                            label={record.business_type}
                            size="small"
                            color={getBusinessTypeColor(record.business_type) as any}
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                        />
                    )}
                    
                    {record.status && (
                        <Chip
                            label={record.status}
                            size="small"
                            color={getStatusColor(record.status) as any}
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                        />
                    )}
                </Box>
            </CardContent>

            {/* Enhanced Actions */}
            <CardActions className="p-2 sm:p-4 pt-0 justify-between">
                <Box className="flex gap-1">
                    {/* Primary Actions - Mobile Optimized */>
                    {record.phone && (
                        <Tooltip title="Call Organization">
                            <IconButton
                                size="small"
                                onClick={handlePhoneClick}
                                className="min-w-11 min-h-11 text-blue-600 hover:bg-gray-100"
                                aria-label="Call organization"
                            >
                                <PhoneIcon className="w-4 h-4" />
                            </IconButton>
                        </Tooltip>
                    )}
                    
                    {record.accountManager && (
                        <Tooltip title="Email Manager">
                            <IconButton
                                size="small"
                                onClick={handleEmailClick}
                                className="min-w-11 min-h-11 text-blue-600 hover:bg-gray-100"
                                aria-label="Email account manager"
                            >
                                <EnvelopeIcon className="w-4 h-4" />
                            </IconButton>
                        </Tooltip>
                    )}
                    
                    {record.website && (
                        <Tooltip title="Visit Website">
                            <IconButton
                                size="small"
                                onClick={handleWebsiteClick}
                                className="min-w-11 min-h-11 text-blue-600 hover:bg-gray-100"
                                aria-label="Visit website"
                            >
                                <GlobeAltIcon className="w-4 h-4" />
                            </IconButton>
                        </Tooltip>
                    )}
                    
                    {(record.latitude || record.address) && (
                        <Tooltip title="Get Directions">
                            <IconButton
                                size="small"
                                onClick={handleDirectionsClick}
                                className="min-w-11 min-h-11 text-blue-600 hover:bg-gray-100"
                                aria-label="Get directions"
                            >
                                <MapPinIcon className="w-4 h-4" />
                            </IconButton>
                        </Tooltip>
                    )}

                    {/* View Action */}
                    <Tooltip title="View Details">
                        <IconButton 
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onView?.(record.id);
                            }}
                            className="min-w-11 min-h-11 hover:bg-gray-100"
                        >
                            <EyeIcon className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {/* Edit Action */}
                    <Tooltip title="Edit Organization">
                        <IconButton
                            component={Link}
                            to={`/organizations/${record.id}/edit`}
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.(record.id);
                            }}
                            className="min-w-11 min-h-11 text-gray-600 hover:bg-gray-100"
                            aria-label="Edit organization"
                        >
                            <PencilIcon className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>

                    {/* More Actions Menu */}
                    <Tooltip title="More Actions">
                        <IconButton 
                            size="small"
                            onClick={handleMenuOpen}
                            className="min-w-11 min-h-11 hover:bg-gray-100"
                        >
                            <EllipsisVerticalIcon className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                    
                    <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={handleMenuClose}
                        onClick={(e) => e.stopPropagation()}
                        className="min-w-40"
                    >
                        <MenuItem onClick={() => handleAction(() => onShare?.(record))}>
                            <ListItemIcon>
                                <ShareIcon className="w-4 h-4" />
                            </ListItemIcon>
                            <ListItemText primary="Share" />
                        </MenuItem>
                        
                        <MenuItem 
                            onClick={() => handleAction(() => onDelete?.(record.id))}
                            className="text-red-600"
                        >
                            <ListItemIcon>
                                <TrashIcon className="w-4 h-4 text-red-600" />
                            </ListItemIcon>
                            <ListItemText primary="Delete" />
                        </MenuItem>
                    </Menu>
                </Box>
            </CardActions>
        </Card>
    );
};
