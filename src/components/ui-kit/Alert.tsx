/**
 * Alert Component
 * Notification/alert messages with different severity levels
 */

import React from 'react';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XCircleIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';

interface AlertProps {
    severity?: 'success' | 'warning' | 'info' | 'error';
    variant?: 'filled' | 'outlined' | 'standard';
    onClose?: () => void;
    children: React.ReactNode;
    className?: string;
    title?: string;
}

const SEVERITY_STYLES = {
    filled: {
        success: 'bg-green-100 text-green-800 border-green-200',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        info: 'bg-blue-100 text-blue-800 border-blue-200',
        error: 'bg-red-100 text-red-800 border-red-200',
    },
    outlined: {
        success: 'bg-white text-green-800 border-green-300',
        warning: 'bg-white text-yellow-800 border-yellow-300',
        info: 'bg-white text-blue-800 border-blue-300',
        error: 'bg-white text-red-800 border-red-300',
    },
    standard: {
        success: 'bg-green-50 text-green-800 border-green-200',
        warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        info: 'bg-blue-50 text-blue-800 border-blue-200',
        error: 'bg-red-50 text-red-800 border-red-200',
    },
};

const ICON_STYLES = {
    success: 'text-green-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
    error: 'text-red-500',
};

/**
 * Get the appropriate icon for the severity level
 */
const getSeverityIcon = (severity: string) => {
    switch (severity) {
        case 'success':
            return CheckCircleIcon;
        case 'warning':
            return ExclamationTriangleIcon;
        case 'info':
            return InformationCircleIcon;
        case 'error':
            return XCircleIcon;
        default:
            return InformationCircleIcon;
    }
};

/**
 * Alert component for displaying notifications and messages
 */
export const Alert: React.FC<AlertProps> = ({
    severity = 'info',
    variant = 'standard',
    onClose,
    children,
    className,
    title,
}) => {
    const Icon = getSeverityIcon(severity);

    return (
        <div
            className={cn(
                'rounded-md border p-4',
                SEVERITY_STYLES[variant][severity],
                className
            )}
            role="alert"
        >
            <div className="flex">
                <div className="flex-shrink-0">
                    <Icon
                        className={cn('h-5 w-5', ICON_STYLES[severity])}
                        aria-hidden="true"
                    />
                </div>
                <div className="ml-3 flex-1">
                    {title && (
                        <h3 className="text-sm font-medium mb-1">{title}</h3>
                    )}
                    <div className="text-sm">{children}</div>
                </div>
                {onClose && (
                    <div className="ml-auto pl-3">
                        <div className="-mx-1.5 -my-1.5">
                            <button
                                type="button"
                                className={cn(
                                    'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
                                    severity === 'success' &&
                                        'text-green-500 hover:bg-green-100 focus:ring-green-600',
                                    severity === 'warning' &&
                                        'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600',
                                    severity === 'info' &&
                                        'text-blue-500 hover:bg-blue-100 focus:ring-blue-600',
                                    severity === 'error' &&
                                        'text-red-500 hover:bg-red-100 focus:ring-red-600'
                                )}
                                onClick={onClose}
                            >
                                <span className="sr-only">Dismiss</span>
                                <XMarkIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Alert;
