/**
 * Centralized modal animation configurations
 * Provides consistent animations across all modal components
 */

export const modalAnimationConfig = {
    // Slide up from bottom (mobile-optimized)
    slideUp: {
        initial: { opacity: 0, transform: 'translateY(100%)' },
        animate: { opacity: 1, transform: 'translateY(0%)' },
        exit: { opacity: 0, transform: 'translateY(100%)' },
        transition: {
            type: 'spring',
            damping: 25,
            stiffness: 120,
            duration: 0.3,
        },
    },

    // Slide down from top
    slideDown: {
        initial: { opacity: 0, transform: 'translateY(-100%)' },
        animate: { opacity: 1, transform: 'translateY(0%)' },
        exit: { opacity: 0, transform: 'translateY(-100%)' },
        transition: {
            type: 'spring',
            damping: 25,
            stiffness: 120,
            duration: 0.3,
        },
    },

    // Scale from center
    scale: {
        initial: { opacity: 0, transform: 'scale(0.8)' },
        animate: { opacity: 1, transform: 'scale(1)' },
        exit: { opacity: 0, transform: 'scale(0.8)' },
        transition: {
            type: 'spring',
            damping: 25,
            stiffness: 120,
            duration: 0.2,
        },
    },

    // Fade in/out
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: {
            duration: 0.2,
        },
    },

    // Backdrop fade
    backdrop: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: {
            duration: 0.15,
        },
    },
};

export type AnimationType = keyof typeof modalAnimationConfig;

/**
 * Get animation config for specific modal type
 */
export const getModalAnimation = (type: AnimationType = 'slideUp') => {
    return modalAnimationConfig[type];
};

/**
 * CSS classes for modal positioning
 */
export const modalPositionClasses = {
    slideUp: 'fixed inset-x-0 bottom-0 top-auto',
    slideDown: 'fixed inset-x-0 top-0 bottom-auto',
    center: 'fixed inset-0 flex items-center justify-center',
    fullscreen: 'fixed inset-0',
};

/**
 * Responsive modal width classes
 */
export const modalWidthClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-full',
};