import React, { useState, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Card,
    CardContent,
    Avatar,
    Chip,
    IconButton,
    useTheme,
    useMediaQuery,
    Badge,
    Tooltip,
    Snackbar,
    Alert,
} from '@mui/material';
import {
    Edit as EditIcon,
    Business as BusinessIcon,
    DragIndicator as DragIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    LocationOn as LocationIcon,
} from '@mui/icons-material';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    closestCenter,
    DragOverEvent,
    useDroppable,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    CSS,
} from '@dnd-kit/utilities';
import { Organization, OrganizationListViewMode } from '../../types';

interface OrganizationKanbanProps {
    organizations: Organization[];
    loading?: boolean;
    viewMode: OrganizationListViewMode;
    onStatusChange?: (organizationId: string | number, newStatus: string) => Promise<void>;
    onEdit?: (organizationId: string | number) => void;
    onView?: (organizationId: string | number) => void;
}

interface DraggableCardProps {
    organization: Organization;
    onEdit?: (id: string | number) => void;
    onView?: (id: string | number) => void;
    isDragging?: boolean;
}

interface DroppableColumnProps {
    column: StatusColumn;
    organizations: Organization[];
    onEdit?: (id: string | number) => void;
    onView?: (id: string | number) => void;
}

interface StatusColumn {
    id: string;
    title: string;
    color: string;
    description: string;
    icon: string;
}

/**
 * Draggable organization card component optimized for mobile touch
 */
const DraggableCard: React.FC<DraggableCardProps> = ({ 
    organization, 
    onEdit, 
    onView,
    isDragging = false 
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: organization.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging || isSortableDragging ? 0.5 : 1,
    };

    const handleContactClick = (e: React.MouseEvent, type: 'phone' | 'email') => {
        e.stopPropagation();
        if (type === 'phone' && organization.phone) {
            window.location.href = `tel:${organization.phone}`;
        } else if (type === 'email' && organization.email) {
            window.location.href = `mailto:${organization.email}`;
        }
    };

    return (
        <Card 
            ref={setNodeRef}
            style={style}
            sx={{ 
                cursor: isDragging || isSortableDragging ? 'grabbing' : 'grab',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    transform: isDragging || isSortableDragging ? 'none' : 'translateY(-1px)',
                    boxShadow: isDragging || isSortableDragging ? 'none' : theme.shadows[4],
                },
                minHeight: { xs: 140, sm: 160 }, // Mobile-optimized heights
                touchAction: 'none', // Prevent scrolling while dragging on mobile
            }}
            {...attributes}
            {...listeners}
            onClick={() => onView?.(organization.id)}
        >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                {/* Drag Handle & Organization Header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                    <DragIcon 
                        fontSize="small" 
                        color="action" 
                        sx={{ 
                            mt: 0.5,
                            cursor: 'grab',
                            opacity: 0.7,
                            '&:hover': { opacity: 1 },
                            minWidth: '20px', // Ensure touch target
                            minHeight: '20px'
                        }} 
                    />
                    <Avatar 
                        src={organization.logo}
                        sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}
                    >
                        <BusinessIcon fontSize="small" />
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography 
                            variant={isMobile ? 'body2' : 'subtitle2'}
                            sx={{ 
                                fontWeight: 600,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                lineHeight: 1.2,
                                mb: 0.25,
                            }}
                        >
                            {organization.name}
                        </Typography>
                        {organization.business_type && (
                            <Typography variant="caption" color="text.secondary">
                                {organization.business_type}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* Contact & Location - Compact */}
                <Box sx={{ mb: 1 }}>
                    {organization.contact_person && (
                        <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ display: 'block', mb: 0.25 }}
                        >
                            👤 {organization.contact_person}
                        </Typography>
                    )}
                    {(organization.city || organization.stateAbbr) && (
                        <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ display: 'block' }}
                        >
                            📍 {[organization.city, organization.stateAbbr].filter(Boolean).join(', ')}
                        </Typography>
                    )}
                </Box>

                {/* Quick Actions & Priority */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mt: 'auto'
                }}>
                    {/* Quick Contact Actions */}
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {organization.phone && (
                            <Tooltip title="Call">
                                <IconButton 
                                    size="small"
                                    onClick={(e) => handleContactClick(e, 'phone')}
                                    sx={{ 
                                        minWidth: { xs: 32, sm: 36 },
                                        minHeight: { xs: 32, sm: 36 },
                                        color: 'primary.main'
                                    }}
                                >
                                    <PhoneIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {organization.email && (
                            <Tooltip title="Email">
                                <IconButton 
                                    size="small"
                                    onClick={(e) => handleContactClick(e, 'email')}
                                    sx={{ 
                                        minWidth: { xs: 32, sm: 36 },
                                        minHeight: { xs: 32, sm: 36 },
                                        color: 'primary.main'
                                    }}
                                >
                                    <EmailIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>

                    {/* Priority & Edit */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {organization.priority && (
                            <Chip
                                label={organization.priority}
                                size="small"
                                color={
                                    organization.priority === 'high' ? 'error' :
                                    organization.priority === 'medium' ? 'warning' : 'success'
                                }
                                variant="filled"
                                sx={{ 
                                    fontSize: '0.65rem', 
                                    height: { xs: 18, sm: 20 },
                                    minWidth: { xs: 50, sm: 60 }
                                }}
                            />
                        )}
                        <Tooltip title="Edit">
                            <IconButton 
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit?.(organization.id);
                                }}
                                sx={{ 
                                    minWidth: { xs: 32, sm: 36 },
                                    minHeight: { xs: 32, sm: 36 }
                                }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Revenue Badge */}
                {organization.revenue && (
                    <Box sx={{ mt: 1 }}>
                        <Chip
                            label={new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                notation: 'compact',
                            }).format(organization.revenue)}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ 
                                fontSize: '0.65rem', 
                                height: { xs: 18, sm: 20 },
                                fontWeight: 600 
                            }}
                        />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

/**
 * Droppable column component with enhanced visual feedback
 */
const DroppableColumn: React.FC<DroppableColumnProps> = ({ 
    column, 
    organizations, 
    onEdit, 
    onView 
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
    });

    return (
        <Box sx={{ minWidth: { xs: 280, sm: 300, md: 320 }, maxWidth: { xs: 280, sm: 300, md: 320 } }}>
            {/* Enhanced Column Header */}
            <Paper 
                elevation={2}
                sx={{ 
                    p: { xs: 1.5, sm: 2 },
                    mb: 2, 
                    background: `linear-gradient(135deg, ${column.color}dd, ${column.color})`,
                    color: 'white',
                    textAlign: 'center',
                    borderRadius: 2,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
                    <Typography component="span" sx={{ fontSize: '1.2rem' }}>{column.icon}</Typography>
                    <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ fontWeight: 600 }}>
                        {column.title}
                    </Typography>
                </Box>
                <Badge
                    badgeContent={organizations.length}
                    color="secondary"
                    sx={{
                        '& .MuiBadge-badge': {
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            color: column.color,
                            fontWeight: 600,
                        }
                    }}
                >
                    <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 500 }}>
                        {column.description}
                    </Typography>
                </Badge>
            </Paper>

            {/* Droppable Sortable Container */}
            <SortableContext items={organizations.map(org => org.id)} strategy={verticalListSortingStrategy}>
                <Box 
                    ref={setNodeRef}
                    sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: { xs: 1, sm: 1.5 },
                        minHeight: 200,
                        p: 1,
                        borderRadius: 2,
                        border: '2px dashed',
                        borderColor: isOver ? column.color : 'transparent',
                        backgroundColor: isOver ? `${column.color}08` : 'transparent',
                        transition: 'all 0.2s ease-in-out',
                    }}
                >
                    {organizations.map((org) => (
                        <DraggableCard
                            key={org.id}
                            organization={org}
                            onEdit={onEdit}
                            onView={onView}
                        />
                    ))}

                    {/* Empty State with Enhanced Drop Feedback */}
                    {organizations.length === 0 && (
                        <Paper 
                            sx={{ 
                                p: { xs: 2, sm: 3 },
                                textAlign: 'center',
                                backgroundColor: isOver ? `${column.color}15` : 'grey.50',
                                border: '2px dashed',
                                borderColor: isOver ? column.color : 'grey.300',
                                borderRadius: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1,
                                transition: 'all 0.2s ease-in-out',
                                transform: isOver ? 'scale(1.02)' : 'scale(1)',
                            }}
                        >
                            <Typography 
                                component="span" 
                                sx={{ 
                                    fontSize: '2rem', 
                                    opacity: isOver ? 0.8 : 0.5,
                                    transition: 'opacity 0.2s ease-in-out'
                                }}
                            >
                                {column.icon}
                            </Typography>
                            <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ 
                                    fontWeight: isOver ? 600 : 400,
                                    color: isOver ? column.color : 'text.secondary'
                                }}
                            >
                                {isOver ? `Drop here for ${column.title}` : `No ${column.title.toLowerCase()}`}
                            </Typography>
                            {!isOver && (
                                <Typography variant="caption" color="text.secondary">
                                    Drag organizations here
                                </Typography>
                            )}
                        </Paper>
                    )}

                    {/* Visual Drop Indicator for Non-Empty Columns */}
                    {organizations.length > 0 && isOver && (
                        <Box
                            sx={{
                                height: 4,
                                backgroundColor: column.color,
                                borderRadius: 2,
                                opacity: 0.7,
                                animation: 'pulse 1s infinite',
                                '@keyframes pulse': {
                                    '0%': { opacity: 0.7 },
                                    '50%': { opacity: 1 },
                                    '100%': { opacity: 0.7 },
                                },
                            }}
                        />
                    )}
                </Box>
            </SortableContext>
        </Box>
    );
};

/**
 * Enhanced Kanban board with @dnd-kit drag and drop
 * Optimized for mobile touch interactions and accessibility
 */
export const OrganizationKanban: React.FC<OrganizationKanbanProps> = ({
    organizations,
    loading = false,
    onStatusChange,
    onEdit,
    onView,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [activeId, setActiveId] = useState<string | number | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    // Enhanced status columns with descriptions and icons
    const statusColumns: StatusColumn[] = [
        { 
            id: 'prospect', 
            title: 'Prospects', 
            color: '#6366f1',
            description: 'Potential customers',
            icon: '🎯'
        },
        { 
            id: 'active', 
            title: 'Active', 
            color: '#10b981',
            description: 'Current customers',
            icon: '✅'
        },
        { 
            id: 'inactive', 
            title: 'Inactive', 
            color: '#6b7280',
            description: 'Dormant accounts',
            icon: '⏸️'
        },
        { 
            id: 'closed', 
            title: 'Closed', 
            color: '#ef4444',
            description: 'No longer active',
            icon: '❌'
        },
    ];

    // Configure sensors for both mouse and touch
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Minimum distance before drag starts
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250, // Delay for touch to distinguish from scroll
                tolerance: 5,
            },
        })
    );

    // Group organizations by status
    const groupedOrganizations = useMemo(() => {
        return statusColumns.map(column => ({
            ...column,
            organizations: organizations.filter(org => 
                org.status === column.id || (!org.status && column.id === 'prospect')
            ),
        }));
    }, [organizations, statusColumns]);

    // Find active organization for drag overlay
    const activeOrganization = useMemo(() => {
        if (!activeId) return null;
        return organizations.find(org => org.id === activeId) || null;
    }, [activeId, organizations]);

    // Handle drag start
    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveId(event.active.id);
    }, []);

    // Handle drag end
    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeOrgId = active.id;
        const newStatus = over.id as string;

        // Find the organization being dragged
        const activeOrg = organizations.find(org => org.id === activeOrgId);
        if (!activeOrg) return;

        // Don't update if dropping in the same column
        if (activeOrg.status === newStatus || (!activeOrg.status && newStatus === 'prospect')) {
            return;
        }

        try {
            // Call the status change handler
            if (onStatusChange) {
                await onStatusChange(activeOrgId, newStatus);
                setSnackbar({
                    open: true,
                    message: `${activeOrg.name} moved to ${statusColumns.find(col => col.id === newStatus)?.title}`,
                    severity: 'success'
                });
            }
        } catch (error) {
            console.error('Failed to update organization status:', error);
            setSnackbar({
                open: true,
                message: 'Failed to update organization status',
                severity: 'error'
            });
        }
    }, [organizations, onStatusChange, statusColumns]);

    const handleSnackbarClose = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }));
    }, []);

    // Loading state
    if (loading) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Loading organizations...</Typography>
            </Box>
        );
    }

    // Empty state
    if (organizations.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    No organizations found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Create your first organization to get started with the Kanban board
                </Typography>
            </Box>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <Box sx={{ 
                mt: 2, 
                overflow: 'auto',
                pb: 2,
                // Improve touch scrolling on mobile
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin',
            }}>
                {/* Kanban Board */}
                <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 1.5, sm: 2 }, 
                    minWidth: 'fit-content',
                    px: { xs: 1, sm: 0 }
                }}>
                    {groupedOrganizations.map((column) => (
                        <DroppableColumn
                            key={column.id}
                            column={column}
                            organizations={column.organizations}
                            onEdit={onEdit}
                            onView={onView}
                        />
                    ))}
                </Box>

                {/* Help Text */}
                <Box sx={{ 
                    mt: 3, 
                    mx: { xs: 1, sm: 0 },
                    p: 2, 
                    backgroundColor: 'primary.light', 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'primary.main'
                }}>
                    <Typography variant="body2" sx={{ 
                        color: 'primary.contrastText',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontWeight: 500
                    }}>
                        <Box component="span" sx={{ fontSize: '1.2em' }}>✨</Box>
                        <strong>Tip:</strong> 
                        {isMobile 
                            ? 'Touch and hold cards to drag them between columns' 
                            : 'Drag organizations between columns to change their status'
                        }
                    </Typography>
                </Box>
            </Box>

            {/* Drag Overlay */}
            <DragOverlay>
                {activeOrganization ? (
                    <DraggableCard
                        organization={activeOrganization}
                        isDragging={true}
                        onEdit={onEdit}
                        onView={onView}
                    />
                ) : null}
            </DragOverlay>

            {/* Status Update Feedback */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleSnackbarClose} 
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </DndContext>
    );
};