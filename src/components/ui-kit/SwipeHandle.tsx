import React from 'react';
import { cn } from '../../utils/cn';

interface SwipeHandleProps {
    className?: string;
    visible?: boolean;
}

/**
 * Visual indicator for swipe-enabled modals
 * Shows users they can swipe to dismiss
 */
export const SwipeHandle: React.FC<SwipeHandleProps> = ({ 
    className,
    visible = true 
}) => {
    if (!visible) return null;

    return (
        <div className={cn(
            'flex justify-center py-2',
            className
        )}>
            <div className="h-1 w-12 rounded-full bg-gray-300 transition-colors duration-200 hover:bg-gray-400" />
        </div>
    );
};