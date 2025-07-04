/**
 * FAB (Floating Action Button) Components
 * Mobile-optimized floating action button with speed dial functionality
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface FabProps {
    children: React.ReactNode;
    size?: 'small' | 'medium' | 'large';
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    className?: string;
    onClick?: () => void;
    style?: React.CSSProperties;
    'aria-label'?: string;
}

interface SpeedDialProps {
    children: React.ReactNode;
    icon: React.ReactNode;
    open?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    direction?: 'up' | 'down' | 'left' | 'right';
    className?: string;
    'aria-label'?: string;
}

interface SpeedDialActionProps {
    icon: React.ReactNode;
    tooltipTitle: string;
    onClick: () => void;
    color?: string;
    className?: string;
}

interface BackdropProps {
    open: boolean;
    onClick?: () => void;
    className?: string;
}

/**
 * Floating Action Button component
 */
export const Fab: React.FC<FabProps> = ({
    children,
    size = 'medium',
    color = 'primary',
    className,
    onClick,
    style,
    'aria-label': ariaLabel,
}) => {
    const sizeClasses = {
        small: 'w-10 h-10',
        medium: 'w-12 h-12',
        large: 'w-16 h-16',
    };

    const colorClasses = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
        success: 'bg-green-600 hover:bg-green-700 text-white',
        warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        error: 'bg-red-600 hover:bg-red-700 text-white',
    };

    return (
        <button
            className={cn(
                'fixed bottom-4 right-4 rounded-full shadow-lg',
                'flex items-center justify-center',
                'transition-all duration-200 ease-in-out',
                'hover:scale-110 focus:outline-none focus:ring-4 focus:ring-opacity-50',
                'z-50',
                sizeClasses[size],
                colorClasses[color],
                className
            )}
            onClick={onClick}
            style={style}
            aria-label={ariaLabel}
        >
            {children}
        </button>
    );
};

/**
 * Speed Dial component for multi-action FAB
 */
export const SpeedDial: React.FC<SpeedDialProps> = ({
    children,
    icon,
    open = false,
    onOpen,
    onClose,
    direction = 'up',
    className,
    'aria-label': ariaLabel,
}) => {
    const [isOpen, setIsOpen] = useState(open);
    const speedDialRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsOpen(open);
    }, [open]);

    const handleToggle = () => {
        const newOpen = !isOpen;
        setIsOpen(newOpen);
        if (newOpen && onOpen) {
            onOpen();
        } else if (!newOpen && onClose) {
            onClose();
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        if (onClose) onClose();
    };

    const getActionPosition = (index: number) => {
        const spacing = 60; // pixels between actions
        const offset = (index + 1) * spacing;
        
        switch (direction) {
            case 'up':
                return { bottom: offset };
            case 'down':
                return { top: offset };
            case 'left':
                return { right: offset };
            case 'right':
                return { left: offset };
            default:
                return { bottom: offset };
        }
    };

    return (
        <div ref={speedDialRef} className={cn('fixed bottom-4 right-4 z-50', className)}>
            {/* Speed Dial Actions */}
            {isOpen && React.Children.map(children, (child, index) => (
                <div
                    key={index}
                    className="absolute transition-all duration-200 ease-in-out"
                    style={getActionPosition(index)}
                >
                    {React.cloneElement(child as React.ReactElement, {
                        onActionClick: handleClose,
                    })}
                </div>
            ))}

            {/* Main FAB */}
            <Fab
                size="large"
                onClick={handleToggle}
                aria-label={ariaLabel}
                className="shadow-xl"
            >
                <div className={cn('transition-transform duration-200', isOpen && 'rotate-45')}>
                    {icon}
                </div>
            </Fab>
        </div>
    );
};

/**
 * Speed Dial Action component
 */
export const SpeedDialAction: React.FC<SpeedDialActionProps & { onActionClick?: () => void }> = ({
    icon,
    tooltipTitle,
    onClick,
    color,
    className,
    onActionClick,
}) => {
    const handleClick = () => {
        onClick();
        if (onActionClick) onActionClick();
    };

    return (
        <div className="flex items-center space-x-2">
            {/* Tooltip */}
            <div className="bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
                {tooltipTitle}
            </div>
            
            {/* Action Button */}
            <button
                className={cn(
                    'w-12 h-12 rounded-full shadow-lg',
                    'flex items-center justify-center',
                    'transition-all duration-200 ease-in-out',
                    'hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50',
                    'text-white',
                    className
                )}
                style={{ backgroundColor: color }}
                onClick={handleClick}
                aria-label={tooltipTitle}
            >
                {icon}
            </button>
        </div>
    );
};

/**
 * Backdrop component for overlays
 */
export const Backdrop: React.FC<BackdropProps> = ({
    open,
    onClick,
    className,
}) => {
    if (!open) return null;

    return (
        <div
            className={cn(
                'fixed inset-0 bg-black bg-opacity-50 z-40',
                'transition-opacity duration-200',
                className
            )}
            onClick={onClick}
        />
    );
};

export default Fab;