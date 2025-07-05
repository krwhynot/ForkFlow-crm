import React from 'react';
import {
    TableCellsIcon,
    Squares2X2Icon,
    RectangleGroupIcon,
    MapIcon,
} from '@heroicons/react/24/outline';
import { useViewMode } from '../hooks/useViewMode';
import { OrganizationListViewMode } from '../../types';
import { Box } from '../../components/Layout/Box';
import { Chip } from '../../components/DataDisplay/Chip';
import { ToggleButton } from '../../components/Button/ToggleButton';
import { ToggleButtonGroup } from '../../components/Button/ToggleButtonGroup';
import { Tooltip } from '../../components/Tooltip/Tooltip';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useTheme } from '../../hooks/useTheme';

interface LayoutSelectorProps {
    className?: string;
    showLabels?: boolean;
    compact?: boolean;
}

/**
 * Layout selector component for switching between different organization list views
 * Supports table, cards, kanban, and map views with smooth transitions
 */
export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
    className,
    showLabels = false,
    compact = false,
}) => {
    const theme = useTheme();
    const isMobile = useBreakpoint('md');
    const { viewMode, setViewMode } = useViewMode();

    const handleViewModeChange = (
        _event: React.MouseEvent<HTMLElement>,
        newMode: OrganizationListViewMode['mode'] | null
    ) => {
        if (newMode !== null) {
            setViewMode({ mode: newMode });
        }
    };

    const viewModeOptions = [
        {
            value: 'table' as const,
            icon: <TableCellsIcon className="w-5 h-5" />,
            label: 'Table View',
            description: 'Detailed table with sortable columns',
            disabled: false,
        },
        {
            value: 'cards' as const,
            icon: <Squares2X2Icon className="w-5 h-5" />,
            label: 'Card View',
            description: 'Visual cards with key information',
            disabled: false,
        },
        {
            value: 'kanban' as const,
            icon: <RectangleGroupIcon className="w-5 h-5" />,
            label: 'Kanban Board',
            description: 'Drag and drop by status',
            disabled: false,
        },
        {
            value: 'map' as const,
            icon: <MapIcon className="w-5 h-5" />,
            label: 'Map View',
            description: 'Geographic visualization',
            disabled: false,
        },
    ];

    return (
        <Box className={`${className} flex items-center gap-1`}>
            <ToggleButtonGroup
                value={viewMode.mode}
                exclusive
                onChange={handleViewModeChange}
                aria-label="view mode selector"
            >
                {viewModeOptions.map(option => (
                    <Tooltip
                        key={option.value}
                        title={
                            <Box>
                                <Box className="font-bold">{option.label}</Box>
                                <Box className="text-xs opacity-80">
                                    {option.description}
                                </Box>
                            </Box>
                        }
                        placement="top"
                        arrow
                    >
                        <ToggleButton
                            value={option.value}
                            disabled={option.disabled}
                            aria-label={option.label}
                            className={`min-h-11 min-w-11 transition-all duration-200 ease-in-out ${
                                compact || isMobile ? 'p-1' : 'p-2'
                            }`}
                        >
                            <Box
                                className={`flex items-center gap-${
                                    showLabels ? 1 : 0
                                } ${
                                    isMobile && showLabels
                                        ? 'flex-col'
                                        : 'flex-row'
                                }`}
                            >
                                {option.icon}
                                {showLabels && !isMobile && (
                                    <Box className="text-xs font-medium">
                                        {option.label.split(' ')[0]}
                                    </Box>
                                )}
                            </Box>
                        </ToggleButton>
                    </Tooltip>
                ))}
            </ToggleButtonGroup>

            {/* Current view mode indicator for mobile */}
            {isMobile && (
                <Chip
                    label={
                        viewModeOptions.find(opt => opt.value === viewMode.mode)
                            ?.label || 'Unknown'
                    }
                    size="small"
                    className="h-8 text-xs border"
                />
            )}
        </Box>
    );
};

export default LayoutSelector;
