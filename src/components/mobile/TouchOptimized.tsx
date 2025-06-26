import React from 'react';
import { Button, ButtonProps, IconButton, IconButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TouchTarget } from '../../types';

// Mobile-first touch target configuration
const MOBILE_TOUCH_TARGET: TouchTarget = {
    minHeight: 44, // iOS/Android guideline minimum
    minWidth: 44,
};

// Styled components for mobile-optimized touch targets
const TouchOptimizedButton = styled(Button)(({ theme }) => ({
    minHeight: MOBILE_TOUCH_TARGET.minHeight,
    minWidth: MOBILE_TOUCH_TARGET.minWidth,
    padding: theme.spacing(1.5, 2),
    fontSize: '1rem',
    
    // Enhanced touch feedback
    transition: 'all 0.15s ease-in-out',
    '&:active': {
        transform: 'scale(0.98)',
        backgroundColor: theme.palette.action.selected,
    },
    
    // Better spacing for mobile
    '& + &': {
        marginLeft: theme.spacing(1),
        marginTop: theme.spacing(0.5),
    },
}));

const TouchOptimizedIconButton = styled(IconButton)(({ theme }) => ({
    minHeight: MOBILE_TOUCH_TARGET.minHeight,
    minWidth: MOBILE_TOUCH_TARGET.minWidth,
    padding: theme.spacing(1),
    
    // Enhanced touch feedback
    transition: 'all 0.15s ease-in-out',
    '&:active': {
        transform: 'scale(0.95)',
        backgroundColor: theme.palette.action.selected,
    },
    
    // Ensure icon is properly sized
    '& .MuiSvgIcon-root': {
        fontSize: '1.5rem',
    },
}));

// Mobile-optimized Button component
interface MobileButtonProps extends Omit<ButtonProps, 'size'> {
    touchSize?: 'small' | 'medium' | 'large';
}

export const MobileButton: React.FC<MobileButtonProps> = ({ 
    touchSize = 'medium', 
    children,
    ...props 
}) => {
    const sizeStyles = {
        small: { minHeight: 36, minWidth: 36, fontSize: '0.875rem' },
        medium: { minHeight: 44, minWidth: 44, fontSize: '1rem' },
        large: { minHeight: 52, minWidth: 52, fontSize: '1.125rem' },
    };
    
    return (
        <TouchOptimizedButton
            {...props}
            sx={{
                ...sizeStyles[touchSize],
                ...props.sx,
            }}
        >
            {children}
        </TouchOptimizedButton>
    );
};

// Mobile-optimized IconButton component
interface MobileIconButtonProps extends Omit<IconButtonProps, 'size'> {
    touchSize?: 'small' | 'medium' | 'large';
}

export const MobileIconButton: React.FC<MobileIconButtonProps> = ({ 
    touchSize = 'medium', 
    children,
    ...props 
}) => {
    const sizeStyles = {
        small: { minHeight: 36, minWidth: 36 },
        medium: { minHeight: 44, minWidth: 44 },
        large: { minHeight: 52, minWidth: 52 },
    };
    
    return (
        <TouchOptimizedIconButton
            {...props}
            sx={{
                ...sizeStyles[touchSize],
                ...props.sx,
            }}
        >
            {children}
        </TouchOptimizedIconButton>
    );
};

// Component for ensuring proper touch targets in forms
interface TouchTargetWrapperProps {
    children: React.ReactNode;
    className?: string;
}

export const TouchTargetWrapper: React.FC<TouchTargetWrapperProps> = ({ 
    children, 
    className 
}) => {
    return (
        <div 
            className={className}
            style={{
                minHeight: MOBILE_TOUCH_TARGET.minHeight,
                display: 'flex',
                alignItems: 'center',
                padding: '8px 0',
            }}
        >
            {children}
        </div>
    );
};

// Hook for detecting mobile viewport
export const useMobileViewport = () => {
    const [viewport, setViewport] = React.useState({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    });

    React.useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            setViewport({
                width,
                height,
                isMobile: width < 768,
                isTablet: width >= 768 && width < 1024,
            });
        };

        window.addEventListener('resize', handleResize);
        
        // Set initial state
        handleResize();
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return viewport;
};

// Component for responsive spacing based on mobile viewport
interface MobileSpacingProps {
    children: React.ReactNode;
    mobile?: number;
    tablet?: number;
    desktop?: number;
}

export const MobileSpacing: React.FC<MobileSpacingProps> = ({ 
    children, 
    mobile = 1, 
    tablet = 2, 
    desktop = 3 
}) => {
    const { isMobile, isTablet } = useMobileViewport();
    
    const spacing = isMobile ? mobile : isTablet ? tablet : desktop;
    
    return (
        <div style={{ padding: `${spacing * 8}px` }}>
            {children}
        </div>
    );
};