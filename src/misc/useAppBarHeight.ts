import { useBreakpoint } from '../hooks/useBreakpoint';

const NAVBAR_HEIGHT_DESKTOP = 48;
const NAVBAR_HEIGHT_MOBILE = 64;

export default function useAppBarHeight(): number {
    // Tailwind 'sm' breakpoint is 640px
    const isDesktop = useBreakpoint('sm', 'up');
    return isDesktop ? NAVBAR_HEIGHT_DESKTOP : NAVBAR_HEIGHT_MOBILE;
}
