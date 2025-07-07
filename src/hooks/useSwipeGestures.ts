import { useState, useRef, useCallback } from 'react';

interface UseSwipeGesturesProps {
    enabled?: boolean;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    swipeThreshold?: number;
    preventClose?: boolean;
}

interface SwipeState {
    isDragging: boolean;
    swipeOffset: number;
    direction: 'up' | 'down' | 'left' | 'right' | null;
}

/**
 * Custom hook for handling swipe gestures on touch devices
 * Optimized to prevent forced reflows by using CSS transforms
 */
export const useSwipeGestures = ({
    enabled = true,
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
    swipeThreshold = 60,
    preventClose = false,
}: UseSwipeGesturesProps = {}) => {
    const [swipeState, setSwipeState] = useState<SwipeState>({
        isDragging: false,
        swipeOffset: 0,
        direction: null,
    });

    const startX = useRef<number>(0);
    const startY = useRef<number>(0);

    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            if (!enabled || preventClose) return;

            const touch = e.touches[0];
            startX.current = touch.clientX;
            startY.current = touch.clientY;
            
            setSwipeState(prev => ({
                ...prev,
                isDragging: true,
                swipeOffset: 0,
                direction: null,
            }));
        },
        [enabled, preventClose]
    );

    const handleTouchMove = useCallback(
        (e: React.TouchEvent) => {
            if (!swipeState.isDragging || !enabled || preventClose) return;

            const touch = e.touches[0];
            const deltaX = touch.clientX - startX.current;
            const deltaY = touch.clientY - startY.current;

            // Determine primary direction based on larger delta
            const direction = Math.abs(deltaX) > Math.abs(deltaY) 
                ? (deltaX > 0 ? 'right' : 'left')
                : (deltaY > 0 ? 'down' : 'up');

            // Calculate offset with damping for smooth feel
            const offset = direction === 'down' || direction === 'up' 
                ? Math.min(Math.abs(deltaY) * 0.5, 100)
                : Math.min(Math.abs(deltaX) * 0.5, 100);

            setSwipeState(prev => ({
                ...prev,
                swipeOffset: offset,
                direction,
            }));
        },
        [swipeState.isDragging, enabled, preventClose]
    );

    const handleTouchEnd = useCallback(() => {
        if (!swipeState.isDragging || !enabled || preventClose) return;

        const { swipeOffset, direction } = swipeState;

        // Trigger appropriate callback if threshold is met
        if (swipeOffset > swipeThreshold) {
            switch (direction) {
                case 'up':
                    onSwipeUp?.();
                    break;
                case 'down':
                    onSwipeDown?.();
                    break;
                case 'left':
                    onSwipeLeft?.();
                    break;
                case 'right':
                    onSwipeRight?.();
                    break;
            }
        }

        // Reset state
        setSwipeState({
            isDragging: false,
            swipeOffset: 0,
            direction: null,
        });
    }, [swipeState, enabled, preventClose, swipeThreshold, onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight]);

    return {
        swipeState,
        swipeHandlers: {
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd,
        },
    };
};