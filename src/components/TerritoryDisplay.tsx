// src/components/TerritoryDisplay.tsx
import React from 'react';
import { Chip, Tooltip, Box, Typography } from '@mui/material';
import { LocationOn as LocationIcon, Info as InfoIcon } from '@mui/icons-material';
import { useTerritoryFilter } from '../hooks/useTerritoryFilter';
import { parseTerritory } from '../utils/territoryFilter';

interface TerritoryDisplayProps {
    /**
     * Show tooltip with detailed territory breakdown
     */
    showTooltip?: boolean;
    
    /**
     * Size of the chip
     */
    size?: 'small' | 'medium';
    
    /**
     * Variant of the chip
     */
    variant?: 'filled' | 'outlined';
    
    /**
     * Color of the chip
     */
    color?: 'default' | 'primary' | 'secondary' | 'info';
    
    /**
     * Custom territory to display (if not using current user's territory)
     */
    territory?: string[];
}

export const TerritoryDisplay: React.FC<TerritoryDisplayProps> = ({
    showTooltip = true,
    size = 'small',
    variant = 'outlined',
    color = 'primary',
    territory: customTerritory
}) => {
    const { hasRestrictions, territoryDisplayName, user } = useTerritoryFilter();
    
    const territory = customTerritory || user?.territory || [];
    const displayName = customTerritory 
        ? getTerritoryDisplayName(customTerritory)
        : territoryDisplayName;
    
    // Only show if user has territory restrictions or custom territory is provided
    if (!hasRestrictions && !customTerritory) {
        return null;
    }

    if (!showTooltip) {
        return (
            <Chip
                icon={<LocationIcon />}
                label={`Territory: ${displayName}`}
                variant={variant}
                size={size}
                color={color}
            />
        );
    }

    const { states, cities, zipCodes } = parseTerritory(territory.join(','));
    
    const tooltipContent = (
        <Box>
            <Typography variant="subtitle2" gutterBottom>
                Territory Coverage
            </Typography>
            
            {states.length > 0 && (
                <Box mb={1}>
                    <Typography variant="body2" fontWeight="bold">
                        States:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {states.join(', ')}
                    </Typography>
                </Box>
            )}
            
            {cities.length > 0 && (
                <Box mb={1}>
                    <Typography variant="body2" fontWeight="bold">
                        Cities:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {cities.join(', ')}
                    </Typography>
                </Box>
            )}
            
            {zipCodes.length > 0 && (
                <Box mb={1}>
                    <Typography variant="body2" fontWeight="bold">
                        ZIP Codes:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {zipCodes.join(', ')}
                    </Typography>
                </Box>
            )}
            
            {territory.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                    No territory assigned
                </Typography>
            )}
        </Box>
    );

    return (
        <Tooltip title={tooltipContent} arrow placement="bottom">
            <Chip
                icon={<LocationIcon />}
                label={`Territory: ${displayName}`}
                variant={variant}
                size={size}
                color={color}
                onDelete={showTooltip ? () => {} : undefined}
                deleteIcon={<InfoIcon />}
            />
        </Tooltip>
    );
};

// Helper function that might be moved to utils later
function getTerritoryDisplayName(territory: string[]): string {
    if (territory.length === 0) {
        return 'No Territory Assigned';
    }

    if (territory.length === 1) {
        return territory[0];
    }

    if (territory.length <= 3) {
        return territory.join(', ');
    }

    return `${territory.slice(0, 2).join(', ')} +${territory.length - 2} more`;
}

/**
 * Compact territory badge for use in lists or cards
 */
export const TerritoryBadge: React.FC<{ territory?: string[]; maxItems?: number }> = ({ 
    territory = [], 
    maxItems = 2 
}) => {
    if (territory.length === 0) return null;

    const displayItems = territory.slice(0, maxItems);
    const remainingCount = territory.length - maxItems;

    return (
        <Box display="flex" gap={0.5} flexWrap="wrap">
            {displayItems.map((area, index) => (
                <Chip
                    key={index}
                    label={area}
                    size="small"
                    variant="outlined"
                    color="default"
                />
            ))}
            {remainingCount > 0 && (
                <Chip
                    label={`+${remainingCount}`}
                    size="small"
                    variant="filled"
                    color="primary"
                />
            )}
        </Box>
    );
};

/**
 * Territory status indicator for user profile or settings
 */
export const TerritoryStatus: React.FC<{ territory?: string[] }> = ({ territory = [] }) => {
    const isConfigured = territory.length > 0;
    
    return (
        <Box display="flex" alignItems="center" gap={1}>
            <LocationIcon 
                color={isConfigured ? 'primary' : 'disabled'}
                fontSize="small"
            />
            <Typography 
                variant="body2" 
                color={isConfigured ? 'text.primary' : 'text.secondary'}
            >
                {isConfigured 
                    ? `${territory.length} area${territory.length === 1 ? '' : 's'} assigned`
                    : 'No territory assigned'
                }
            </Typography>
        </Box>
    );
};