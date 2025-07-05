import { useEffect, useState } from 'react';

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

// Simplified breakpoint hook with standard Tailwind breakpoints
export const useBreakpoint = (breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl'): boolean => {
    const breakpoints = {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
    };

    const query = `(min-width: ${breakpoints[breakpoint]})`;
    return useMediaQuery(query);
};
