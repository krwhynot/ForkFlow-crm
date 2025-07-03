import React, { useState, useRef, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Box,
    Chip,
    IconButton,
    useTheme,
    useMediaQuery,
    Avatar,
    Skeleton,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    Phone as PhoneIcon,
    Email as EmailIcon,
    Language as WebsiteIcon,
    LocationOn as LocationIcon,
    Edit as EditIcon,
    Business as BusinessIcon,
    MoreVert as MoreVertIcon,
    Visibility as ViewIcon,
    Delete as DeleteIcon,
    Share as ShareIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Updated breakpoint for mobile-first
    const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

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
                sx={{
                    height: { xs: 200, sm: 220, md: 240 },
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <CardContent sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Skeleton variant="circular" width={48} height={48} />
                        <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="70%" height={24} />
                            <Skeleton variant="text" width="50%" height={20} />
                        </Box>
                    </Box>
                    <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Skeleton variant="rounded" width={80} height={24} />
                        <Skeleton variant="rounded" width={60} height={24} />
                    </Box>
                </CardContent>
                <CardActions sx={{ p: { xs: 1, sm: 2 }, pt: 0 }}>
                    <Skeleton variant="circular" width={44} height={44} />
                    <Skeleton variant="circular" width={44} height={44} />
                    <Skeleton variant="circular" width={44} height={44} sx={{ ml: 'auto' }} />
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
            sx={{
                height: { xs: 200, sm: 220, md: 240 }, // Mobile-first responsive heights
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[6],
                },
                '&:focus': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: '2px',
                },
            }}
        >
            <CardContent sx={{ 
                flex: 1, 
                p: { xs: 2, sm: 3 },
                '&:last-child': { pb: { xs: 2, sm: 3 } }
            }}>
                {/* Header with Avatar and Name */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 2, 
                    mb: 2 
                }}>
                    <Avatar
                        src={isVisible && record.logo ? record.logo : undefined}
                        sx={{ 
                            width: { xs: 40, sm: 48 }, 
                            height: { xs: 40, sm: 48 },
                            bgcolor: 'primary.main',
                        }}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                    >
                        {!imageLoaded || imageError ? (
                            <BusinessIcon fontSize={isMobile ? 'medium' : 'large'} />
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
                                <LocationIcon 
                                    fontSize="small" 
                                    color="action" 
                                    sx={{ fontSize: 16 }}
                                />
                                <Typography 
                                    variant="caption" 
                                    color="text.secondary"
                                    sx={{ 
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
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
                            sx={{
                                backgroundColor:
                                    priority.color || theme.palette.grey[300],
                                color: theme.palette.getContrastText(
                                    priority.color || theme.palette.grey[300]
                                ),
                                fontWeight: 600,
                                fontSize: '0.7rem',
                            }}
                        />
                    )}
                </Box>

                {/* Contact Information */}
                <Box sx={{ mb: 2 }}>
                    {record.accountManager && (
                        <Typography 
                            variant="body2" 
                            sx={{ mb: 0.5, fontWeight: 'medium' }}
                        >
                            {record.accountManager}
                        </Typography>
                    )}
                    
                    {/* Business Context - Compact */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                        <TrendingUpIcon fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight="medium">
                            {formatRevenue(record.revenue)}
                        </Typography>
                    </Box>
                )}

                {/* Address - Compact */}
                {(record.address || record.city) && !isMobile && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ 
                            mb: 1,
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {record.address && `${record.address}, `}
                        {record.city && record.state
                            ? `${record.city}, ${record.state}`
                            : record.city || record.state}
                        {record.zipCode && ` ${record.zipCode}`}
                    </Typography>
                )}

                {/* Status Chips */}
                <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    mt: 'auto'
                }}>
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
            <CardActions sx={{ 
                p: { xs: 1, sm: 2 }, 
                pt: 0,
                justifyContent: 'space-between',
            }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {/* Primary Actions - Mobile Optimized */}
                    {record.phone && (
                        <Tooltip title="Call Organization">
                            <IconButton
                                size="small"
                                onClick={handlePhoneClick}
                                sx={{
                                    minWidth: '44px',
                                    minHeight: '44px',
                                    color: theme.palette.primary.main,
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                                aria-label="Call organization"
                            >
                                <PhoneIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    
                    {record.accountManager && (
                        <Tooltip title="Email Manager">
                            <IconButton
                                size="small"
                                onClick={handleEmailClick}
                                sx={{
                                    minWidth: '44px',
                                    minHeight: '44px',
                                    color: theme.palette.primary.main,
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                                aria-label="Email account manager"
                            >
                                <EmailIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    
                    {record.website && (
                        <Tooltip title="Visit Website">
                            <IconButton
                                size="small"
                                onClick={handleWebsiteClick}
                                sx={{
                                    minWidth: '44px',
                                    minHeight: '44px',
                                    color: theme.palette.primary.main,
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                                aria-label="Visit website"
                            >
                                <WebsiteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    
                    {(record.latitude || record.address) && (
                        <Tooltip title="Get Directions">
                            <IconButton
                                size="small"
                                onClick={handleDirectionsClick}
                                sx={{
                                    minWidth: '44px',
                                    minHeight: '44px',
                                    color: theme.palette.primary.main,
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                                aria-label="Get directions"
                            >
                                <LocationIcon fontSize="small" />
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
                            sx={{ 
                                minWidth: '44px', 
                                minHeight: '44px',
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                        >
                            <ViewIcon fontSize="small" />
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
                            sx={{
                                minWidth: '44px',
                                minHeight: '44px',
                                color: theme.palette.text.secondary,
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                            aria-label="Edit organization"
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    {/* More Actions Menu */}
                    <Tooltip title="More Actions">
                        <IconButton 
                            size="small"
                            onClick={handleMenuOpen}
                            sx={{ 
                                minWidth: '44px', 
                                minHeight: '44px',
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                        >
                            <MoreVertIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    
                    <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={handleMenuClose}
                        onClick={(e) => e.stopPropagation()}
                        PaperProps={{
                            sx: { minWidth: 160 }
                        }}
                    >
                        <MenuItem onClick={() => handleAction(() => onShare?.(record))}>
                            <ListItemIcon>
                                <ShareIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Share" />
                        </MenuItem>
                        
                        <MenuItem 
                            onClick={() => handleAction(() => onDelete?.(record.id))}
                            sx={{ color: 'error.main' }}
                        >
                            <ListItemIcon>
                                <DeleteIcon fontSize="small" color="error" />
                            </ListItemIcon>
                            <ListItemText primary="Delete" />
                        </MenuItem>
                    </Menu>
                </Box>
            </CardActions>
        </Card>
    );
};
