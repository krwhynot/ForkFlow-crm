import React from 'react';
import { cn } from '../../utils/cn';

interface FadeProps {
    in: boolean;
    children: React.ReactNode;
    className?: string;
    duration?: number; // ms
}

/**
 * Simple Fade component (opacity transition). Replaces @mui/material Fade.
 */
export const Fade: React.FC<FadeProps> = ({ in: open, children, className, duration = 150 }) => {
    return (
        <div
            className={cn(
                'transition-opacity',
                open ? 'opacity-100' : 'opacity-0 pointer-events-none',
                className
            )}
            style={{ transitionDuration: `${duration}ms` }}
        >
            {children}
        </div>
    );
};

export default Fade; 