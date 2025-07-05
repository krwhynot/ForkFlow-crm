import React, { Suspense } from 'react';
import { Box, CircularProgress } from '../../components/ui-kit';
import { useViewMode } from '../hooks/useViewMode';
import { Organization } from '../../types';

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
            className="flex justify-center items-center min-h-[200px] w-full"
        >
            <CircularProgress size={40} />
        </Box>
    );

    // Error display component
    if (error) {
        return (
            <Box
                className="flex justify-center items-center min-h-[200px] flex-col gap-2 text-red-600"
            >
                <Box>Error loading organizations: {error}</Box>
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        className="px-4 py-2 rounded border border-gray-300 bg-transparent cursor-pointer hover:bg-gray-50"
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
        <Box className="w-full min-h-[200px]">
            <Suspense fallback={<LoadingFallback />}>
                {renderView()}
            </Suspense>
        </Box>
    );
};

export default ViewModeRenderer;
