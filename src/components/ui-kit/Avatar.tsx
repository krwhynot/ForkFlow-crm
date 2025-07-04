/**
 * Avatar Component
 * Displays user/company avatars with fallback to initials
 */

import React from 'react';
import { cn } from '../../utils/cn';

interface AvatarProps {
    src?: string;
    alt?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    width?: number;
    height?: number;
    className?: string;
    children?: React.ReactNode;
    title?: string;
}

const SIZE_VARIANTS = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
};

/**
 * Avatar component for displaying user/company pictures with initials fallback
 */
export const Avatar: React.FC<AvatarProps> = ({
    src,
    alt,
    size = 'md',
    width,
    height,
    className,
    children,
    title,
}) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoaded, setImageLoaded] = React.useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
        setImageError(false);
    };

    // Reset error state when src changes
    React.useEffect(() => {
        if (src) {
            setImageError(false);
            setImageLoaded(false);
        }
    }, [src]);

    const showImage = src && !imageError && imageLoaded;
    const showFallback = !src || imageError || !imageLoaded;

    const customSize = width && height;
    const sizeClasses = customSize ? '' : SIZE_VARIANTS[size];

    const avatarStyle = customSize
        ? { width: `${width}px`, height: `${height}px` }
        : {};

    return (
        <div
            className={cn(
                'relative inline-flex items-center justify-center rounded-full bg-gray-100 font-medium text-gray-600 overflow-hidden',
                sizeClasses,
                className
            )}
            style={avatarStyle}
            title={title || alt}
        >
            {src && (
                <img
                    src={src}
                    alt={alt}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    className={cn(
                        'h-full w-full object-cover transition-opacity duration-200',
                        showImage ? 'opacity-100' : 'opacity-0'
                    )}
                />
            )}

            {showFallback && (
                <span
                    className={cn(
                        'select-none font-semibold uppercase',
                        customSize && 'text-xs' // smaller text for custom sizes
                    )}
                >
                    {children}
                </span>
            )}
        </div>
    );
};

export default Avatar;
