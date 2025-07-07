/**
 * Mobile Feature Components
 * Components optimized for mobile experiences
 */

// Location Services
export {
    LocationProvider,
    useLocation,
    useLocationOnDemand,
} from './LocationProvider';

// Touch-Optimized Components
export {
    MobileButton,
    MobileIconButton,
    TouchTargetWrapper,
    useMobileViewport,
    MobileSpacing,
} from './TouchOptimized';

// Re-export types
export type { LocationProviderProps } from './LocationProvider';
