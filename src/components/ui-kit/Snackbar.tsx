import React, { useEffect, useState } from 'react';

interface SnackbarProps {
    action?: React.ReactNode;
    anchorOrigin?: {
        vertical: 'top' | 'bottom';
        horizontal: 'left' | 'center' | 'right';
    };
    autoHideDuration?: number | null;
    children?: React.ReactNode;
    className?: string;
    ClickAwayListenerProps?: any;
    ContentProps?: any;
    disableWindowBlurListener?: boolean;
    key?: string | number;
    message?: React.ReactNode;
    onClose?: (event: React.SyntheticEvent | Event, reason?: string) => void;
    open: boolean;
    resumeHideDuration?: number;
    TransitionComponent?: React.ComponentType<any>;
    transitionDuration?: number | { appear?: number; enter?: number; exit?: number };
    TransitionProps?: any;
}

export const Snackbar: React.FC<SnackbarProps> = ({
    action,
    anchorOrigin = { vertical: 'bottom', horizontal: 'left' },
    autoHideDuration = 6000,
    children,
    className = '',
    ClickAwayListenerProps,
    ContentProps,
    disableWindowBlurListener = false,
    key,
    message,
    onClose,
    open,
    resumeHideDuration,
    TransitionComponent,
    transitionDuration = 300,
    TransitionProps,
    ...props
}) => {
    const [isVisible, setIsVisible] = useState(open);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (open) {
            setIsVisible(true);
            setIsAnimating(true);

            // Auto hide after specified duration
            if (autoHideDuration !== null && autoHideDuration > 0) {
                const timer = setTimeout(() => {
                    handleClose(new Event('timeout'), 'timeout');
                }, autoHideDuration);

                return () => clearTimeout(timer);
            }
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, typeof transitionDuration === 'number' ? transitionDuration : 300);

            return () => clearTimeout(timer);
        }
    }, [open, autoHideDuration, transitionDuration]);

    const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
        setIsAnimating(false);
        onClose?.(event, reason);
    };

    const getPositionClasses = () => {
        const { vertical, horizontal } = anchorOrigin;

        let classes = 'fixed z-50 ';

        if (vertical === 'top') {
            classes += 'top-4 ';
        } else {
            classes += 'bottom-4 ';
        }

        if (horizontal === 'left') {
            classes += 'left-4 ';
        } else if (horizontal === 'right') {
            classes += 'right-4 ';
        } else {
            classes += 'left-1/2 transform -translate-x-1/2 ';
        }

        return classes;
    };

    const animationClasses = `
    transition-all duration-300 ease-in-out
    ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
  `;

    if (!isVisible) {
        return null;
    }

    const content = children || (
        <div className="bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg flex items-center justify-between min-w-0">
            <span className="flex-1 text-sm">{message}</span>
            {action && <div className="ml-4 flex-shrink-0">{action}</div>}
        </div>
    );

    return (
        <div
            className={`${getPositionClasses()} ${animationClasses} ${className}`}
            {...ContentProps}
            {...props}
        >
            {content}
        </div>
    );
};

export default Snackbar; 