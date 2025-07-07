import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    Box,
    Tooltip,
    IconButton,
    Backdrop,
} from '../../components/ui-kit';
import {
    PlusIcon as AddIcon,
    BuildingOfficeIcon as BusinessIcon,
    QrCodeIcon as QrIcon,
    CameraIcon,
    MicrophoneIcon as MicIcon,
    XMarkIcon as CloseIcon,
    PencilIcon as EditIcon,
} from '@heroicons/react/24/outline';
import { useBreakpoint } from '../../hooks/useBreakpoint';
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
    const isMobile = useBreakpoint('md');
    const [open, setOpen] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const notify = useNotify();

    // Position styles based on prop
    const getPositionStyles = useCallback(() => {
        const baseStyles = 'fixed z-50';

        switch (position) {
            case 'bottom-left':
                return `${baseStyles} bottom-4 left-4`;
            case 'bottom-center':
                return `${baseStyles} bottom-4 left-1/2 transform -translate-x-1/2`;
            case 'bottom-right':
            default:
                return `${baseStyles} bottom-4 right-4`;
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
            icon: <BusinessIcon className="h-5 w-5" />,
            name: 'Create Organization',
            onClick: () => {
                handleClose();
                triggerHapticFeedback('medium');
                onCreateOrganization();
            },
            color: 'bg-blue-600 hover:bg-blue-700 text-white',
        },
        ...(onVoiceCreate
            ? [
                  {
                      icon: <MicIcon className="h-5 w-5" />,
                      name: 'Voice Input',
                      onClick: () => {
                          handleClose();
                          triggerHapticFeedback('medium');
                          onVoiceCreate();
                      },
                      color: 'bg-purple-600 hover:bg-purple-700 text-white',
                  },
              ]
            : []),
        ...(onQuickScan
            ? [
                  {
                      icon: <QrIcon className="h-5 w-5" />,
                      name: 'Scan Business Card',
                      onClick: () => {
                          handleClose();
                          triggerHapticFeedback('medium');
                          onQuickScan();
                      },
                      color: 'bg-cyan-600 hover:bg-cyan-700 text-white',
                  },
              ]
            : []),
        ...(onPhotoCapture
            ? [
                  {
                      icon: <CameraIcon className="h-5 w-5" />,
                      name: 'Photo Capture',
                      onClick: () => {
                          handleClose();
                          triggerHapticFeedback('medium');
                          onPhotoCapture();
                      },
                      color: 'bg-green-600 hover:bg-green-700 text-white',
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
            <div className={`${getPositionStyles()} transition-all duration-300 ${hidden ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                <IconButton
                    aria-label="Create organization"
                    disabled={disabled}
                    onClick={onCreateOrganization}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className={`w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-100 ${
                        isPressed ? 'scale-95' : 'scale-100'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <AddIcon className="h-7 w-7" />
                </IconButton>
            </div>
        );
    }

    // Speed dial for multiple actions
    return (
        <>
            <div className={`${getPositionStyles()} transition-all duration-300 ${hidden ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                {/* Main FAB */}
                <IconButton
                    aria-label="Create options"
                    disabled={disabled}
                    onClick={open ? handleClose : handleOpen}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className={`w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-100 ${
                        isPressed ? 'scale-95' : 'scale-100'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {open ? (
                        <CloseIcon className="h-6 w-6" />
                    ) : (
                        <AddIcon className="h-6 w-6" />
                    )}
                </IconButton>

                {/* Speed dial actions */}
                {open && (
                    <div className="absolute bottom-20 right-0 flex flex-col items-end space-y-3">
                        {actions.map((action, index) => (
                            <div
                                key={action.name}
                                className="flex items-center space-x-3 animate-in slide-in-from-bottom-2 duration-200"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <Tooltip title={action.name} placement="left">
                                    <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-medium opacity-90">
                                        {action.name}
                                    </span>
                                </Tooltip>
                                <IconButton
                                    onClick={action.onClick}
                                    className={`w-12 h-12 ${action.color} shadow-lg transition-all duration-100 hover:scale-105 active:scale-95`}
                                    aria-label={action.name}
                                >
                                    {action.icon}
                                </IconButton>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Backdrop for mobile accessibility */}
            {open && (
                <Backdrop
                    open={open}
                    onClick={handleClose}
                    className="bg-black bg-opacity-30 z-40"
                />
            )}
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
    const isMobile = useBreakpoint('md');

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
            className="tooltip-mobile"
        >
            {children}
        </Tooltip>
    );
};
