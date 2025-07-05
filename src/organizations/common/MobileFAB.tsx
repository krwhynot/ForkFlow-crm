import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    Fab,
    Box,
    Tooltip,
    IconButton,
} from '@/components/ui-kit';
import {
    PlusIcon as AddIcon,
    BuildingOfficeIcon as BusinessIcon,
    QrCodeIcon as QrIcon,
    CameraIcon,
    MicrophoneIcon as MicIcon,
    XMarkIcon as CloseIcon,
    PencilIcon as EditIcon,
} from '@heroicons/react/24/outline';
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
    const [open, setOpen] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const notify = useNotify();

    // Check if mobile screen
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Position styles based on prop
    const getPositionClasses = useCallback(() => {
        const baseClasses = 'fixed z-50';
        
        switch (position) {
            case 'bottom-left':
                return `${baseClasses} bottom-4 left-4`;
            case 'bottom-center':
                return `${baseClasses} bottom-4 left-1/2 -translate-x-1/2`;
            case 'bottom-right':
            default:
                return `${baseClasses} bottom-4 right-4`;
        }
    }, [position]);

    // Haptic feedback for supported devices
    const triggerHapticFeedback = useCallback(
        (type: 'light' | 'medium' | 'heavy' = 'light') => {
            if ('vibrate' in navigator) {
                const patterns = {
                    light: [10],
                    medium: [20],
                    heavy: [50],
                };
                navigator.vibrate(patterns[type]);
            }
        },
        []
    );

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
    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            e.preventDefault();
            handleMouseDown();
        },
        [handleMouseDown]
    );

    const handleTouchEnd = useCallback(
        (e: React.TouchEvent) => {
            e.preventDefault();
            handleMouseUp();
        },
        [handleMouseUp]
    );

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
        ...(onVoiceCreate
            ? [
                  {
                      icon: <MicIcon />,
                      name: 'Voice Input',
                      onClick: () => {
                          handleClose();
                          triggerHapticFeedback('medium');
                          onVoiceCreate();
                      },
                      color: 'secondary' as const,
                  },
              ]
            : []),
        ...(onQuickScan
            ? [
                  {
                      icon: <QrIcon />,
                      name: 'Scan Business Card',
                      onClick: () => {
                          handleClose();
                          triggerHapticFeedback('medium');
                          onQuickScan();
                      },
                      color: 'info' as const,
                  },
              ]
            : []),
        ...(onPhotoCapture
            ? [
                  {
                      icon: <CameraIcon />,
                      name: 'Photo Capture',
                      onClick: () => {
                          handleClose();
                          triggerHapticFeedback('medium');
                          onPhotoCapture();
                      },
                      color: 'success' as const,
                  },
              ]
            : []),
    ];

    // Don't render on desktop or when hidden
    if (!isMobile || hidden) {
        return null;
    }

    // Simple FAB for single action
    if (actions.length <= 1) {
        return (
            <div className={`${getPositionClasses()} ${hidden ? 'hidden' : ''}`}>
                <Fab
                    color="primary"
                    aria-label="Create organization"
                    disabled={disabled}
                    onClick={onCreateOrganization}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className={`
                        w-16 h-16 transition-transform duration-100 ease-in-out
                        ${isPressed ? 'scale-95' : 'scale-100'}
                        active:scale-95
                    `}
                >
                    <AddIcon className="w-7 h-7" />
                </Fab>
            </div>
        );
    }

    // Custom speed dial implementation for multiple actions
    return (
        <>
            {/* Backdrop */}
            {open && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-30 z-40"
                    onClick={handleClose}
                />
            )}
            
            <div className={`${getPositionClasses()} ${hidden ? 'hidden' : ''}`}>
                {/* Action buttons */}
                {open && (
                    <div className="flex flex-col space-y-3 mb-3">
                        {actions.map((action, index) => (
                            <div
                                key={action.name}
                                className={`
                                    transform transition-all duration-200 ease-out
                                    ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                                `}
                                style={{ transitionDelay: `${index * 50}ms` }}
                            >
                                <Tooltip title={action.name} placement="left">
                                    <Fab
                                        size="medium"
                                        color={action.color}
                                        onClick={action.onClick}
                                        className="w-12 h-12 active:scale-95"
                                    >
                                        {action.icon}
                                    </Fab>
                                </Tooltip>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Main FAB */}
                <Fab
                    color="primary"
                    aria-label="Create options"
                    disabled={disabled}
                    onClick={open ? handleClose : handleOpen}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className={`
                        w-16 h-16 transition-transform duration-100 ease-in-out
                        ${isPressed ? 'scale-95' : 'scale-100'}
                        active:scale-95
                    `}
                >
                    <div className={`transform transition-transform duration-200 ${open ? 'rotate-45' : 'rotate-0'}`}>
                        <AddIcon className="w-7 h-7" />
                    </div>
                </Fab>
            </div>
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
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!isMobile || disabled) {
        return children;
    }

    return (
        <Tooltip
            title={title}
            placement="left"
            className="text-sm font-medium bg-gray-900 text-white rounded px-3 py-2 shadow-lg"
        >
            {children}
        </Tooltip>
    );
};
