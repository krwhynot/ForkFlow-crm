/**
 * Tooltip Component
 * Displays contextual information on hover using Headless UI
 */

import React, { useState, useRef } from 'react';
import { Transition } from '@headlessui/react';
import { cn } from '../../utils/cn';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
    contentClassName?: string;
    delay?: number;
}

/**
 * Tooltip component for displaying contextual information on hover
 */
export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    placement = 'top',
    className,
    contentClassName,
    delay = 300,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = (e: React.MouseEvent) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            if (triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                const scrollTop =
                    window.pageYOffset || document.documentElement.scrollTop;
                const scrollLeft =
                    window.pageXOffset || document.documentElement.scrollLeft;

                let x = 0;
                let y = 0;

                switch (placement) {
                    case 'top':
                        x = rect.left + scrollLeft + rect.width / 2;
                        y = rect.top + scrollTop;
                        break;
                    case 'bottom':
                        x = rect.left + scrollLeft + rect.width / 2;
                        y = rect.bottom + scrollTop;
                        break;
                    case 'left':
                        x = rect.left + scrollLeft;
                        y = rect.top + scrollTop + rect.height / 2;
                        break;
                    case 'right':
                        x = rect.right + scrollLeft;
                        y = rect.top + scrollTop + rect.height / 2;
                        break;
                }

                setPosition({ x, y });
                setIsVisible(true);
            }
        }, delay);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    const getTooltipClasses = () => {
        const baseClasses =
            'absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm max-w-sm';

        switch (placement) {
            case 'top':
                return cn(
                    baseClasses,
                    'mb-2 -translate-x-1/2 -translate-y-full'
                );
            case 'bottom':
                return cn(baseClasses, 'mt-2 -translate-x-1/2');
            case 'left':
                return cn(
                    baseClasses,
                    'mr-2 -translate-y-1/2 -translate-x-full'
                );
            case 'right':
                return cn(baseClasses, 'ml-2 -translate-y-1/2');
            default:
                return cn(
                    baseClasses,
                    'mb-2 -translate-x-1/2 -translate-y-full'
                );
        }
    };

    const getArrowClasses = () => {
        const baseClasses = 'absolute w-2 h-2 bg-gray-900 transform rotate-45';

        switch (placement) {
            case 'top':
                return cn(baseClasses, 'left-1/2 -translate-x-1/2 -bottom-1');
            case 'bottom':
                return cn(baseClasses, 'left-1/2 -translate-x-1/2 -top-1');
            case 'left':
                return cn(baseClasses, 'top-1/2 -translate-y-1/2 -right-1');
            case 'right':
                return cn(baseClasses, 'top-1/2 -translate-y-1/2 -left-1');
            default:
                return cn(baseClasses, 'left-1/2 -translate-x-1/2 -bottom-1');
        }
    };

    return (
        <>
            <div
                ref={triggerRef}
                className={cn('inline-block', className)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {children}
            </div>

            {/* Portal-like tooltip rendered at document level */}
            {isVisible && (
                <div
                    className="fixed inset-0 pointer-events-none z-50"
                    style={{
                        left: 0,
                        top: 0,
                    }}
                >
                    <Transition
                        show={isVisible}
                        enter="transition-opacity duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div
                            className={cn(
                                getTooltipClasses(),
                                contentClassName
                            )}
                            style={{
                                left: position.x,
                                top: position.y,
                            }}
                        >
                            {content}
                            <div className={getArrowClasses()} />
                        </div>
                    </Transition>
                </div>
            )}
        </>
    );
};

export default Tooltip;
