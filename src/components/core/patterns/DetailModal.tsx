import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../buttons/Button';
import { Typography } from '../typography/Typography';

export interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    headerContent?: React.ReactNode;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
    className?: string;
}

/**
 * Standardized detail modal for viewing detailed information
 * Consolidates modal layout patterns with consistent header, content, and close behavior
 */
export const DetailModal: React.FC<DetailModalProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    headerContent,
    children,
    maxWidth = '4xl',
    className = ''
}) => {
    if (!isOpen) return null;

    const getMaxWidthClass = (size: string) => {
        const sizeMap = {
            sm: 'max-w-sm',
            md: 'max-w-md',
            lg: 'max-w-lg',
            xl: 'max-w-xl',
            '2xl': 'max-w-2xl',
            '4xl': 'max-w-4xl',
        };
        return sizeMap[size as keyof typeof sizeMap] || sizeMap['4xl'];
    };

    // Handle background click to close
    const handleBackgroundClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackgroundClick}
        >
            <div 
                className={`
                    bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto
                    ${getMaxWidthClass(maxWidth)}
                    ${className}
                `.trim()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-4 flex-1">
                        {headerContent && (
                            <div className="flex-shrink-0">
                                {headerContent}
                            </div>
                        )}
                        <div className="flex-1">
                            <Typography variant="h5" className="text-secondary-800">
                                {title}
                            </Typography>
                            {subtitle && (
                                <Typography variant="body2" className="text-secondary-600">
                                    {subtitle}
                                </Typography>
                            )}
                        </div>
                    </div>
                    <Button
                        variant="text"
                        size="sm"
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};