import { useSyncExternalStore } from 'react';
import { theme } from '../lib/tailwind-theme';

const screens = theme.screens;

type ScreenSize = keyof typeof screens;

const subscribe = (callback: () => void) => {
    window.addEventListener('resize', callback);
    return () => window.removeEventListener('resize', callback);
};

const getSnapshot = () => window.innerWidth;

export const useBreakpoint = (size: ScreenSize): boolean => {
    const width = useSyncExternalStore(subscribe, getSnapshot);
    const breakpoint = parseInt(screens[size]);
    return width >= breakpoint;
};

export const useIsMobile = (): boolean => {
    return useBreakpoint('sm');
};
