import { useEffect, useState } from 'react';

/** Tailwind CSS default breakpoints */
const BREAKPOINT_PIXELS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
};

type BreakpointKey = keyof typeof BREAKPOINT_PIXELS;

type Direction = 'up' | 'down';

/**
 * useBreakpoint – checks if a Tailwind breakpoint is currently matched.
 * Example: const isDesktop = useBreakpoint('sm', 'up');
 */
export function useBreakpoint(
    breakpoint: BreakpointKey,
    direction: Direction = 'up'
): boolean {
    const query =
        direction === 'up'
            ? `(min-width: ${BREAKPOINT_PIXELS[breakpoint]}px)`
            : `(max-width: ${BREAKPOINT_PIXELS[breakpoint] - 1}px)`;

    const [matches, setMatches] = useState<boolean>(() =>
        typeof window !== 'undefined'
            ? window.matchMedia(query).matches
            : false
    );

    useEffect(() => {
        const mql = window.matchMedia(query);
        const handler = (ev: MediaQueryListEvent) => setMatches(ev.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, [query]);

    return matches;
}

export default useBreakpoint;
