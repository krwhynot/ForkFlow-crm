import React, { useEffect, useRef, useState } from 'react';

interface CollapseProps {
    in?: boolean;
    children?: React.ReactNode;
    timeout?: number | 'auto';
    unmountOnExit?: boolean;
    className?: string;
    orientation?: 'vertical' | 'horizontal';
    collapsedSize?: number;
    onEnter?: () => void;
    onEntering?: () => void;
    onEntered?: () => void;
    onExit?: () => void;
    onExiting?: () => void;
    onExited?: () => void;
}

export const Collapse: React.FC<CollapseProps> = ({
    in: isOpen = false,
    children,
    timeout = 300,
    unmountOnExit = false,
    className = '',
    orientation = 'vertical',
    collapsedSize = 0,
    onEnter,
    onEntering,
    onEntered,
    onExit,
    onExiting,
    onExited,
    ...props
}) => {
    const [mounted, setMounted] = useState(isOpen || !unmountOnExit);
    const [animating, setAnimating] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && unmountOnExit && !mounted) {
            setMounted(true);
        }

        if (isOpen) {
            setAnimating(true);
            onEnter?.();
            onEntering?.();

            const timer = setTimeout(() => {
                setAnimating(false);
                onEntered?.();
            }, typeof timeout === 'number' ? timeout : 300);

            return () => clearTimeout(timer);
        } else {
            setAnimating(true);
            onExit?.();
            onExiting?.();

            const timer = setTimeout(() => {
                setAnimating(false);
                onExited?.();
                if (unmountOnExit) {
                    setMounted(false);
                }
            }, typeof timeout === 'number' ? timeout : 300);

            return () => clearTimeout(timer);
        }
    }, [isOpen, timeout, unmountOnExit, mounted, onEnter, onEntering, onEntered, onExit, onExiting, onExited]);

    if (!mounted) {
        return null;
    }

    const transitionDuration = typeof timeout === 'number' ? `${timeout}ms` : '300ms';

    const baseStyles = {
        overflow: 'hidden',
        transition: `all ${transitionDuration} ease-in-out`,
    };

    const collapsedStyles = orientation === 'vertical'
        ? { height: `${collapsedSize}px` }
        : { width: `${collapsedSize}px` };

    const expandedStyles = orientation === 'vertical'
        ? { height: 'auto' }
        : { width: 'auto' };

    return (
        <div
            ref={contentRef}
            className={`${className}`}
            style={{
                ...baseStyles,
                ...(isOpen ? expandedStyles : collapsedStyles),
            }}
            {...props}
        >
            <div className={orientation === 'vertical' ? 'h-full' : 'w-full'}>
                {children}
            </div>
        </div>
    );
};

export default Collapse; 