import { useState, useEffect } from 'react';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config.js';

const fullConfig = resolveConfig(tailwindConfig);

const getBreakpointValue = (value: string): number => {
    return parseInt(value.replace('px', ''));
};

export const useMediaQuery = (query: string): boolean => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        const handleChange = () => setMatches(mediaQuery.matches);

        handleChange();
        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, [query]);

    return matches;
};

export const useBreakpoint = (breakpoint: keyof typeof fullConfig.theme.screens): boolean => {
    const screens = fullConfig.theme.screens as Record<string, string>;
    const query = `(min-width: ${getBreakpointValue(screens[breakpoint as string])}px)`;
    return useMediaQuery(query);
};
