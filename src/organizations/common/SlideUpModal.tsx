import React, { useState, useCallback, useEffect, useRef, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';

interface SlideUpModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
    fullHeight?: boolean;
    showProgress?: boolean;
    progress?: number;
    onSave?: () => void;
    onMinimize?: () => void;
    saveLabel?: string;
    saveDisabled?: boolean;
    showBackButton?: boolean;
    onBack?: () => void;
    actions?: React.ReactNode;
    minimizable?: boolean;
    preventClose?: boolean;
    swipeToClose?: boolean;
}

/**
 * Mobile-optimized slide-up modal for form creation using Headless UI
 * Features:
 * - Smooth slide-up animation from bottom
 * - Full-height mobile optimization
 * - Swipe-to-close gesture support (optimized to prevent forced reflows)
 * - Progress indicator for multi-step forms
 * - Minimizable for multitasking
 * - Keyboard height adjustment
 * - Touch-friendly interactions
 */
export const SlideUpModal: React.FC<SlideUpModalProps> = ({
    open,
    onClose,
    title,
    subtitle,
    children,
    maxWidth = 'sm',
    fullHeight = true,
    showProgress = false,
    progress = 0,
    onSave,
    saveLabel = 'Save',
    saveDisabled = false,
    showBackButton = false,
    onBack,
    actions,
    preventClose = false,
    swipeToClose = true,
}) => {
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const startY = useRef<number>(0);

    // Detect keyboard visibility on mobile (optimized)
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        
        const handleResize = () => {
            // Debounce resize events to prevent excessive calculations
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const viewport = window.visualViewport;
                if (viewport) {
                    const keyboardHeight = window.innerHeight - viewport.height;
                    setKeyboardVisible(keyboardHeight > 100);
                }
            }, 100);
        };

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
            return () => {
                clearTimeout(timeoutId);
                window.visualViewport?.removeEventListener('resize', handleResize);
            };
        }
    }, []);

    // Optimized swipe handlers using CSS transforms instead of style manipulation
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (!swipeToClose || preventClose) return;
        
        const touch = e.touches[0];
        startY.current = touch.clientY;
        setIsDragging(true);
        setSwipeOffset(0);
    }, [swipeToClose, preventClose]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDragging || !swipeToClose || preventClose) return;

        const touch = e.touches[0];
        const deltaY = touch.clientY - startY.current;
        
        // Only allow downward swipes and limit the offset
        if (deltaY > 0) {
            const limitedOffset = Math.min(deltaY * 0.5, 100);
            setSwipeOffset(limitedOffset);
        }
    }, [isDragging, swipeToClose, preventClose]);

    const handleTouchEnd = useCallback(() => {
        if (!isDragging || !swipeToClose || preventClose) return;

        // Close if swiped down enough
        if (swipeOffset > 60) {
            onClose();
        }
        
        setIsDragging(false);
        setSwipeOffset(0);
    }, [isDragging, swipeToClose, preventClose, swipeOffset, onClose]);

    // Enhanced close handler
    const handleClose = useCallback(() => {
        if (preventClose) return;
        onClose();
    }, [preventClose, onClose]);

    const getMaxWidthClass = () => {
        const widthMap = {
            xs: 'max-w-xs',
            sm: 'max-w-sm',
            md: 'max-w-md',
            lg: 'max-w-lg',
            xl: 'max-w-xl',
            false: '',
        };
        return widthMap[maxWidth || 'sm'];
    };

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel
                                ref={panelRef}
                                className={cn(
                                    "relative w-full transform overflow-hidden bg-white text-left shadow-xl transition-all",
                                    // Mobile styles
                                    "sm:hidden",
                                    fullHeight ? "h-screen" : "min-h-[50vh] max-h-[90vh] rounded-t-2xl",
                                    // Desktop styles
                                    "sm:block sm:my-8 sm:rounded-lg",
                                    getMaxWidthClass(),
                                    "sm:max-h-[80vh]"
                                )}
                                style={{
                                    transform: swipeOffset > 0 ? `translateY(${swipeOffset}px)` : undefined,
                                    opacity: swipeOffset > 0 ? Math.max(0.3, 1 - (swipeOffset / 200)) : undefined,
                                }}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                {/* Mobile Header */}
                                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 sm:hidden">
                                    {/* Swipe Indicator */}
                                    {swipeToClose && !preventClose && (
                                        <div className="flex justify-center pt-2 pb-1">
                                            <div className="w-9 h-1 bg-gray-300 rounded-full" />
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center justify-between px-4 py-3">
                                        {/* Left Action */}
                                        <div className="flex items-center w-12">
                                            {showBackButton ? (
                                                <button
                                                    onClick={onBack}
                                                    className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors"
                                                    aria-label="Go back"
                                                >
                                                    <ArrowLeftIcon className="h-6 w-6" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleClose}
                                                    disabled={preventClose}
                                                    className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                                                    aria-label="Close"
                                                >
                                                    <XMarkIcon className="h-6 w-6" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Title */}
                                        <div className="flex-1 text-center px-4">
                                            <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 truncate">
                                                {title}
                                            </Dialog.Title>
                                            {subtitle && (
                                                <p className="text-sm text-gray-500 truncate">{subtitle}</p>
                                            )}
                                        </div>

                                        {/* Right Actions */}
                                        <div className="flex items-center gap-2 w-12 justify-end">
                                            {actions}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    {showProgress && (
                                        <div className="h-1 bg-gray-200">
                                            <div 
                                                className="h-full bg-blue-500 transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Desktop Header */}
                                <div className="hidden sm:block px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                                                {title}
                                            </Dialog.Title>
                                            {subtitle && (
                                                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {actions}
                                            <button
                                                onClick={handleClose}
                                                disabled={preventClose}
                                                className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                                                aria-label="Close"
                                            >
                                                <XMarkIcon className="h-6 w-6" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Desktop Progress Bar */}
                                    {showProgress && (
                                        <div className="mt-4 h-2 bg-gray-200 rounded-full">
                                            <div 
                                                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div 
                                    className={cn(
                                        "flex-1 overflow-y-auto",
                                        keyboardVisible ? "pb-0" : "pb-20 sm:pb-4", // Space for save button on mobile
                                        "max-h-[calc(100vh-120px)] sm:max-h-[60vh]"
                                    )}
                                >
                                    {children}
                                </div>

                                {/* Floating Save Button (Mobile) */}
                                {onSave && !keyboardVisible && (
                                    <div className="fixed bottom-6 right-6 sm:hidden">
                                        <button
                                            onClick={onSave}
                                            disabled={saveDisabled}
                                            className={cn(
                                                "min-h-[52px] min-w-[52px] w-14 h-14 rounded-full shadow-lg flex items-center justify-center",
                                                "bg-blue-600 text-white",
                                                "hover:bg-blue-700 focus:ring-4 focus:ring-primary-200",
                                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                                "transition-all duration-200",
                                                "active:scale-95"
                                            )}
                                            aria-label={saveLabel}
                                        >
                                            <CheckIcon className="h-6 w-6 mx-auto" />
                                        </button>
                                    </div>
                                )}

                                {/* Desktop Footer with Save Button */}
                                {onSave && (
                                    <div className="hidden sm:flex justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
                                        <button
                                            onClick={onSave}
                                            disabled={saveDisabled}
                                            className={cn(
                                                "min-h-[44px] min-w-[44px] flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg",
                                                "bg-blue-600 text-white",
                                                "hover:bg-blue-700 focus:ring-4 focus:ring-primary-200",
                                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                                "transition-colors duration-200"
                                            )}
                                        >
                                            {saveLabel}
                                        </button>
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
