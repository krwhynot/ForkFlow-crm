import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    Fab,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    useTheme,
    useMediaQuery,
    Zoom,
    Box,
    Tooltip,
    IconButton,
    Backdrop,
} from '@mui/material';
import {
    Add as AddIcon,
    Business as BusinessIcon,
    QrCodeScanner as QrIcon,
    CameraAlt as CameraIcon,
    Mic as MicIcon,
    Close as CloseIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { useNotify, useRedirect } from 'react-admin';

interface MobileFABProps {
    onCreateOrganization: () => void;
    onQuickScan?: () => void;
    onVoiceCreate?: () => void;
    onPhotoCapture?: () => void;
    disabled?: boolean;
    hidden?: boolean;
    position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

/**
 * Mobile-optimized Floating Action Button with quick actions
 * Features:
 * - Speed dial with multiple creation options
 * - Voice input support for descriptions
 * - QR code scanning for business cards
 * - Photo capture for organization details
 * - Haptic feedback on supported devices
 * - Accessibility support with proper ARIA labels
 */
export const MobileFAB: React.FC<MobileFABProps> = ({
    onCreateOrganization,
    onQuickScan,
    onVoiceCreate,
    onPhotoCapture,
    disabled = false,
    hidden = false,
    position = 'bottom-right',
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [open, setOpen] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const notify = useNotify();

    // Position styles based on prop
    const getPositionStyles = useCallback(() => {
        const baseStyles = {
            position: 'fixed' as const,
            zIndex: theme.zIndex.speedDial,
        };

        switch (position) {
            case 'bottom-left':
                return { ...baseStyles, bottom: 16, left: 16 };
            case 'bottom-center':
                return { 
                    ...baseStyles, 
                    bottom: 16, 
                    left: '50%', 
                    transform: 'translateX(-50%)' 
                };
            case 'bottom-right':
            default:
                return { ...baseStyles, bottom: 16, right: 16 };
        }
    }, [position, theme.zIndex.speedDial]);

    // Haptic feedback for supported devices
    const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
        if ('vibrate' in navigator) {
            const patterns = {
                light: [10],
                medium: [20],
                heavy: [50],
            };
            navigator.vibrate(patterns[type]);
        }
    }, []);

    // Handle speed dial open/close
    const handleOpen = useCallback(() => {
        setOpen(true);
        triggerHapticFeedback('light');
    }, [triggerHapticFeedback]);

    const handleClose = useCallback(() => {
        setOpen(false);
        triggerHapticFeedback('light');
    }, [triggerHapticFeedback]);

    // Long press detection for quick create
    const handleMouseDown = useCallback(() => {
        setIsPressed(true);
        longPressTimer.current = setTimeout(() => {
            triggerHapticFeedback('medium');
            onCreateOrganization();
            notify('Quick create activated!', { type: 'info' });
        }, 800); // 800ms long press
    }, [triggerHapticFeedback, onCreateOrganization, notify]);

    const handleMouseUp = useCallback(() => {
        setIsPressed(false);
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }, []);

    // Touch event handlers for mobile
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        handleMouseDown();
    }, [handleMouseDown]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        handleMouseUp();
    }, [handleMouseUp]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
            }
        };
    }, []);

    // Speed dial actions
    const actions = [
        {
            icon: <BusinessIcon />,
            name: 'Create Organization',
            onClick: () => {
                handleClose();
                triggerHapticFeedback('medium');
                onCreateOrganization();
            },
            color: 'primary' as const,
        },
        ...(onVoiceCreate ? [{
            icon: <MicIcon />,
            name: 'Voice Input',
            onClick: () => {
                handleClose();
                triggerHapticFeedback('medium');
                onVoiceCreate();
            },
            color: 'secondary' as const,
        }] : []),
        ...(onQuickScan ? [{
            icon: <QrIcon />,
            name: 'Scan Business Card',
            onClick: () => {
                handleClose();
                triggerHapticFeedback('medium');
                onQuickScan();
            },
            color: 'info' as const,
        }] : []),
        ...(onPhotoCapture ? [{
            icon: <CameraIcon />,
            name: 'Photo Capture',
            onClick: () => {
                handleClose();
                triggerHapticFeedback('medium');
                onPhotoCapture();
            },
            color: 'success' as const,
        }] : []),
    ];

    // Don't render on desktop or when hidden
    if (!isMobile || hidden) {
        return null;
    }

    // Simple FAB for single action
    if (actions.length <= 1) {
        return (
            <Zoom in={!hidden} timeout={300}>
                <Fab
                    color="primary"
                    aria-label="Create organization"
                    disabled={disabled}
                    onClick={onCreateOrganization}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    sx={{
                        ...getPositionStyles(),
                        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
                        transition: 'transform 0.1s ease-in-out',
                        width: 64,
                        height: 64,
                        '&:active': {
                            transform: 'scale(0.95)',
                        },
                    }}
                >
                    <AddIcon sx={{ fontSize: 28 }} />
                </Fab>
            </Zoom>
        );
    }

    // Speed dial for multiple actions
    return (
        <>
            <SpeedDial
                ariaLabel="Create options"
                sx={getPositionStyles()}
                icon={<SpeedDialIcon />}
                onClose={handleClose}
                onOpen={handleOpen}
                open={open}
                direction="up"
                hidden={hidden}
                FabProps={{
                    disabled,
                    size: 'large',
                    sx: {
                        width: 64,
                        height: 64,
                        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
                        transition: 'transform 0.1s ease-in-out',
                        '&:active': {
                            transform: 'scale(0.95)',
                        },
                    },
                    onMouseDown: handleMouseDown,
                    onMouseUp: handleMouseUp,
                    onTouchStart: handleTouchStart,
                    onTouchEnd: handleTouchEnd,
                }}
            >
                {actions.map((action) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        tooltipOpen
                        onClick={action.onClick}
                        FabProps={{
                            color: action.color,
                            size: 'medium',
                            sx: {
                                minWidth: 48,
                                minHeight: 48,
                                '&:active': {
                                    transform: 'scale(0.95)',
                                },
                            },
                        }}
                    />
                ))}
            </SpeedDial>

            {/* Backdrop for mobile accessibility */}
            <Backdrop
                open={open}
                onClick={handleClose}
                sx={{
                    zIndex: theme.zIndex.speedDial - 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }}
            />
        </>
    );
};

interface QuickActionTooltipProps {
    title: string;
    children: React.ReactElement;
    disabled?: boolean;
}

/**
 * Enhanced tooltip for mobile quick actions
 */
export const QuickActionTooltip: React.FC<QuickActionTooltipProps> = ({
    title,
    children,
    disabled = false,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    if (!isMobile || disabled) {
        return children;
    }

    return (
        <Tooltip
            title={title}
            placement="left"
            arrow
            enterTouchDelay={300}
            leaveTouchDelay={1500}
            PopperProps={{
                sx: {
                    '& .MuiTooltip-tooltip': {
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        backgroundColor: theme.palette.grey[900],
                        color: 'white',
                        borderRadius: 2,
                        padding: theme.spacing(1, 1.5),
                        boxShadow: theme.shadows[8],
                    },
                    '& .MuiTooltip-arrow': {
                        color: theme.palette.grey[900],
                    },
                },
            }}
        >
            {children}
        </Tooltip>
    );
};