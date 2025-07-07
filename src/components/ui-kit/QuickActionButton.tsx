import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';
import { Button } from './Button';
import { Tooltip } from './Tooltip';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';

interface QuickActionButtonProps {
    label: string;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outlined';
    size?: 'sm' | 'md' | 'lg';
    position?: 'fixed' | 'relative';
    loading?: boolean;
    disabled?: boolean;
    tooltip?: string;
    confirmationMessage?: string;
    confirmationTitle?: string;
    onClick: () => void;
    className?: string;
    children?: React.ReactNode; // For dropdown menus
}

/**
 * Standardized quick action button for floating actions and quick operations
 * Supports confirmation dialogs and various positioning options
 */
export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
    label,
    icon = <PlusIcon className="h-5 w-5" />,
    variant = 'primary',
    size = 'md',
    position = 'relative',
    loading = false,
    disabled = false,
    tooltip,
    confirmationMessage,
    confirmationTitle = 'Confirm Action',
    onClick,
    className,
    children,
}) => {
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Position classes for fixed positioning
    const fixedPositionClasses = {
        sm: 'fixed bottom-4 right-4 z-50',
        md: 'fixed bottom-6 right-6 z-50',
        lg: 'fixed bottom-8 right-8 z-50',
    };

    // Size classes
    const sizeClasses = {
        sm: 'min-h-[44px] min-w-[44px] px-3 py-2 text-sm',
        md: 'min-h-[48px] min-w-[48px] px-4 py-3 text-base',
        lg: 'min-h-[52px] min-w-[52px] px-5 py-4 text-lg',
    };

    // Icon size classes
    const iconSizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };

    // Variant classes
    const variantClasses = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl',
        outlined: 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 shadow-md hover:shadow-lg',
    };

    const handleClick = () => {
        if (confirmationMessage) {
            setShowConfirmation(true);
        } else {
            onClick();
        }
    };

    const handleConfirm = () => {
        setShowConfirmation(false);
        onClick();
    };

    const handleCancel = () => {
        setShowConfirmation(false);
    };

    // Button component
    const buttonElement = (
        <Button
            onClick={handleClick}
            disabled={disabled || loading}
            loading={loading}
            className={cn(
                'rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                sizeClasses[size],
                variantClasses[variant],
                position === 'fixed' && fixedPositionClasses[size],
                position === 'fixed' && 'shadow-2xl hover:scale-105',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
            aria-label={label}
        >
            <div className="flex items-center space-x-2">
                {/* Icon */}
                <div className={iconSizeClasses[size]}>
                    {icon}
                </div>
                
                {/* Label - hidden on small sizes if position is fixed */}
                {position === 'relative' && (
                    <span className="font-medium whitespace-nowrap">
                        {label}
                    </span>
                )}
            </div>
        </Button>
    );

    // Wrap with tooltip if provided
    const wrappedButton = tooltip ? (
        <Tooltip content={tooltip}>
            {buttonElement}
        </Tooltip>
    ) : buttonElement;

    return (
        <>
            {children ? (
                <div className={cn(
                    'relative inline-block',
                    position === 'fixed' && fixedPositionClasses[size]
                )}>
                    {wrappedButton}
                    {children}
                </div>
            ) : (
                wrappedButton
            )}

            {/* Confirmation Dialog */}
            {confirmationMessage && (
                <UnsavedChangesDialog
                    open={showConfirmation}
                    onClose={handleCancel}
                    onDiscard={handleCancel}
                    onSave={handleConfirm}
                    title={confirmationTitle}
                    message={confirmationMessage}
                    discardLabel="Cancel"
                    saveLabel="Confirm"
                    showSaveOption={true}
                />
            )}
        </>
    );
};