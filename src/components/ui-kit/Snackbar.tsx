import React, { useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
    CheckCircleIcon,
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { twMerge } from 'tailwind-merge';

export interface SnackbarProps {
    open: boolean;
    onClose?: () => void;
    message: React.ReactNode;
    autoHideDuration?: number | null;
    severity?: 'success' | 'error' | 'warning' | 'info';
    variant?: 'filled' | 'outlined' | 'standard';
    action?: React.ReactNode;
    anchorOrigin?: {
        vertical: 'top' | 'bottom';
        horizontal: 'left' | 'center' | 'right';
    };
    className?: string;
}

export const Snackbar: React.FC<SnackbarProps> = ({
    open,
    onClose,
    message,
    autoHideDuration = 6000,
    severity = 'info',
    variant = 'filled',
    action,
    anchorOrigin = { vertical: 'bottom', horizontal: 'left' },
    className,
}) => {
    const [isVisible, setIsVisible] = useState(open);

    useEffect(() => {
        setIsVisible(open);
        
        if (open && autoHideDuration && autoHideDuration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, autoHideDuration);
            
            return () => clearTimeout(timer);
        }
    }, [open, autoHideDuration]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose?.();
        }, 300); // Wait for transition to complete
    };

    const severityConfig = {
        success: {
            icon: CheckCircleIcon,
            filled: 'bg-green-600 text-white',
            outlined: 'border-2 border-green-600 text-green-600 bg-white',
            standard: 'bg-green-100 text-green-800',
        },
        error: {
            icon: ExclamationCircleIcon,
            filled: 'bg-red-600 text-white',
            outlined: 'border-2 border-red-600 text-red-600 bg-white',
            standard: 'bg-red-100 text-red-800',
        },
        warning: {
            icon: ExclamationTriangleIcon,
            filled: 'bg-yellow-600 text-white',
            outlined: 'border-2 border-yellow-600 text-yellow-600 bg-white',
            standard: 'bg-yellow-100 text-yellow-800',
        },
        info: {
            icon: InformationCircleIcon,
            filled: 'bg-blue-600 text-white',
            outlined: 'border-2 border-blue-600 text-blue-600 bg-white',
            standard: 'bg-blue-100 text-blue-800',
        },
    };

    const positionClasses = {
        top: {
            left: 'top-4 left-4',
            center: 'top-4 left-1/2 -translate-x-1/2',
            right: 'top-4 right-4',
        },
        bottom: {
            left: 'bottom-4 left-4',
            center: 'bottom-4 left-1/2 -translate-x-1/2',
            right: 'bottom-4 right-4',
        },
    };

    const Icon = severityConfig[severity].icon;
    const variantClasses = severityConfig[severity][variant];
    const position = positionClasses[anchorOrigin.vertical][anchorOrigin.horizontal];

    const baseClasses = twMerge(
        'fixed z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg',
        'min-h-[48px] max-w-sm',
        'transition-all duration-300',
        variantClasses,
        position,
        className
    );

    return (
        <Transition
            show={isVisible}
            enter="transition ease-out duration-300"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-200"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
        >
            <div className={baseClasses} role="alert">
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 text-sm font-medium">{message}</div>
                {action || (
                    <button
                        onClick={handleClose}
                        className="ml-2 flex-shrink-0 rounded-lg p-1.5 inline-flex hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label="Close"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        </Transition>
    );
};

// Toast is an alias for Snackbar
export const Toast = Snackbar;

// Hook for managing snackbar state
export const useSnackbar = () => {
    const [state, setState] = useState<{
        open: boolean;
        message: string;
        severity?: SnackbarProps['severity'];
    }>({
        open: false,
        message: '',
    });

    const showSnackbar = (
        message: string,
        severity: SnackbarProps['severity'] = 'info'
    ) => {
        setState({ open: true, message, severity });
    };

    const hideSnackbar = () => {
        setState(prev => ({ ...prev, open: false }));
    };

    return {
        snackbarProps: {
            open: state.open,
            message: state.message,
            severity: state.severity,
            onClose: hideSnackbar,
        },
        showSnackbar,
        hideSnackbar,
    };
};