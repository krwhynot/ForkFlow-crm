import React from 'react';
import {
    XMarkIcon,
    ArrowLeftIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';

interface ModalHeaderProps {
    title: string;
    subtitle?: string;
    showProgress?: boolean;
    progress?: number;
    onClose?: () => void;
    onSave?: () => void;
    onMinimize?: () => void;
    onBack?: () => void;
    saveLabel?: string;
    saveDisabled?: boolean;
    showBackButton?: boolean;
    actions?: React.ReactNode;
    minimizable?: boolean;
    preventClose?: boolean;
    className?: string;
}

/**
 * Reusable modal header component with common action patterns
 * Extracted from SlideUpModal for reuse across modals
 */
export const ModalHeader: React.FC<ModalHeaderProps> = ({
    title,
    subtitle,
    showProgress = false,
    progress = 0,
    onClose,
    onSave,
    onMinimize,
    onBack,
    saveLabel = 'Save',
    saveDisabled = false,
    showBackButton = false,
    actions,
    minimizable = false,
    preventClose = false,
    className,
}) => {
    return (
        <div className={cn(
            'flex-shrink-0 border-b border-gray-200 bg-white px-4 py-3',
            className
        )}>
            {/* Top bar with controls */}
            <div className="flex items-center justify-between">
                {/* Left side - Back/Close */}
                <div className="flex items-center space-x-3">
                    {showBackButton && onBack && (
                        <button
                            onClick={onBack}
                            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Go back"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                        </button>
                    )}
                    
                    {!preventClose && onClose && (
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Close modal"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Center - Title */}
                <div className="flex-1 text-center">
                    <h2 className="text-lg font-semibold text-gray-900 truncate">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-sm text-gray-500 truncate">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Right side - Actions */}
                <div className="flex items-center space-x-2">
                    {minimizable && onMinimize && (
                        <button
                            onClick={onMinimize}
                            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Minimize"
                        >
                            <span className="block h-0.5 w-4 bg-current" />
                        </button>
                    )}
                    
                    {onSave && (
                        <button
                            onClick={onSave}
                            disabled={saveDisabled}
                            className={cn(
                                'inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
                                saveDisabled
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            )}
                        >
                            <CheckIcon className="mr-1 h-4 w-4" />
                            {saveLabel}
                        </button>
                    )}
                    
                    {actions}
                </div>
            </div>

            {/* Progress bar */}
            {showProgress && (
                <div className="mt-3">
                    <div className="h-1 w-full rounded-full bg-gray-200">
                        <div
                            className="h-1 rounded-full bg-blue-600 transition-all duration-300 ease-out"
                            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};