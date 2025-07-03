import React from 'react';
import {
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Box,
    Chip,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    ViewList as TableIcon,
    ViewModule as CardsIcon,
    ViewKanban as KanbanIcon,
    Map as MapIcon,
} from '@mui/icons-material';
import { useViewMode } from '../hooks/useViewMode';
import { OrganizationListViewMode } from '../../types';

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
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
            icon: <TableIcon />,
            label: 'Table View',
            description: 'Detailed table with sortable columns',
            disabled: false,
        },
        {
            value: 'cards' as const,
            icon: <CardsIcon />,
            label: 'Card View',
            description: 'Visual cards with key information',
            disabled: false,
        },
        {
            value: 'kanban' as const,
            icon: <KanbanIcon />,
            label: 'Kanban Board',
            description: 'Drag and drop by status',
            disabled: false,
        },
        {
            value: 'map' as const,
            icon: <MapIcon />,
            label: 'Map View',
            description: 'Geographic visualization',
            disabled: false,
        },
    ];

    return (
        <Box className={className} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ToggleButtonGroup
                value={viewMode.mode}
                exclusive
                onChange={handleViewModeChange}
                aria-label="view mode selector"
                size={compact || isMobile ? 'small' : 'medium'}
                sx={{
                    '& .MuiToggleButton-root': {
                        minHeight: '44px',
                        minWidth: '44px',
                        border: `1px solid ${theme.palette.divider}`,
                        '&.Mui-selected': {
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                            '&:hover': {
                                backgroundColor: theme.palette.primary.dark,
                            },
                        },
                        '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                        },
                        transition: 'all 0.2s ease-in-out',
                    },
                }}
            >
                {viewModeOptions.map((option) => (
                    <ToggleButton
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                        aria-label={option.label}
                    >
                        <Tooltip 
                            title={
                                <Box>
                                    <Box sx={{ fontWeight: 'bold' }}>{option.label}</Box>
                                    <Box sx={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                        {option.description}
                                    </Box>
                                </Box>
                            }
                            placement="top"
                            arrow
                        >
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: showLabels ? 1 : 0,
                                flexDirection: isMobile && showLabels ? 'column' : 'row'
                            }}>
                                {option.icon}
                                {showLabels && !isMobile && (
                                    <Box sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                        {option.label.split(' ')[0]}
                                    </Box>
                                )}
                            </Box>
                        </Tooltip>
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>

            {/* Current view mode indicator for mobile */}
            {isMobile && (
                <Chip
                    label={viewModeOptions.find(opt => opt.value === viewMode.mode)?.label || 'Unknown'}
                    size="small"
                    variant="outlined"
                    sx={{
                        height: '32px',
                        '& .MuiChip-label': {
                            fontSize: '0.75rem',
                        },
                    }}
                />
            )}
        </Box>
    );
};

export default LayoutSelector;