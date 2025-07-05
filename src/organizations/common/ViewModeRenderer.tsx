import { Box, CircularProgress, Fade } from '@/components/ui-kit';
import React, { Suspense } from 'react';
import { Organization } from '../../types';
import { useViewMode } from '../hooks/useViewMode';

// Lazy load components for better performance
const OrganizationTable = React.lazy(() =>
    import('../list/OrganizationTable').then(module => ({
        default: module.OrganizationTable,
    }))
);
const OrganizationCards = React.lazy(() =>
    import('../list/OrganizationCards').then(module => ({
        default: module.OrganizationCards,
    }))
);
const OrganizationKanban = React.lazy(() =>
    import('../list/OrganizationKanban').then(module => ({
        default: module.OrganizationKanban,
    }))
);
const OrganizationMapView = React.lazy(() =>
    import('../list/OrganizationMapView').then(module => ({
        default: module.OrganizationMapView,
    }))
);

interface ViewModeRendererProps {
    organizations?: Organization[];
    loading?: boolean;
    error?: string;
    onRefresh?: () => void;
}

/**
 * Component that renders different organization views based on selected view mode
 * Supports smooth transitions between table, cards, kanban, and map views
 */
export const ViewModeRenderer: React.FC<ViewModeRendererProps> = ({
    organizations = [],
    loading = false,
    error,
    onRefresh,
}) => {
    const { viewMode } = useViewMode();

    // Loading fallback component
    const LoadingFallback = () => (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px',
                width: '100%',
            }}
        >
            <CircularProgress size={40} />
        </Box>
    );

    // Error display component
    if (error) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '200px',
                    flexDirection: 'column',
                    gap: 2,
                    color: 'error.main',
                }}
            >
                <Box>Error loading organizations: {error}</Box>
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '4px',
                            border: '1px solid',
                            background: 'transparent',
                            cursor: 'pointer',
                        }}
                    >
                        Retry
                    </button>
                )}
            </Box>
        );
    }

    // Render appropriate view based on mode
    const renderView = () => {
        const commonProps = {
            organizations,
            loading,
            viewMode,
        };

        switch (viewMode.mode) {
            case 'table':
                return <OrganizationTable {...commonProps} />;
            case 'cards':
                return <OrganizationCards {...commonProps} />;
            case 'kanban':
                return <OrganizationKanban {...commonProps} />;
            case 'map':
                return <OrganizationMapView {...commonProps} />;
            default:
                return <OrganizationCards {...commonProps} />;
        }
    };

    return (
        <Fade in={true} timeout={300}>
            <Box sx={{ width: '100%', minHeight: '200px' }}>
                <Suspense fallback={<LoadingFallback />}>
                    {renderView()}
                </Suspense>
            </Box>
        </Fade>
    );
};

export default ViewModeRenderer;
