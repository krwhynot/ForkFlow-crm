import * as React from 'react';
import {
    FilterList,
    FilterLiveSearch,
    FilterListItem,
    useGetIdentity,
    useGetList,
} from 'react-admin';
import { Box, Chip } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import StarIcon from '@mui/icons-material/Star';

import { Setting } from '../types';

export const ContactListFilter = () => {
    const { identity } = useGetIdentity();

    // Fetch Settings for filtering
    const { data: roleSettings } = useGetList<Setting>('settings', {
        filter: { category: 'role', active: true },
        sort: { field: 'sortOrder', order: 'ASC' },
        pagination: { page: 1, perPage: 100 },
    });

    const { data: influenceSettings } = useGetList<Setting>('settings', {
        filter: { category: 'influence', active: true },
        sort: { field: 'sortOrder', order: 'ASC' },
        pagination: { page: 1, perPage: 100 },
    });

    const { data: decisionSettings } = useGetList<Setting>('settings', {
        filter: { category: 'decision', active: true },
        sort: { field: 'sortOrder', order: 'ASC' },
        pagination: { page: 1, perPage: 100 },
    });

    const { data: organizations } = useGetList('organizations', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'name', order: 'ASC' },
    });

    return (
        <Box width="14em" minWidth="14em" order={-1} mr={2} mt={5}>
            <FilterLiveSearch
                hiddenLabel
                sx={{
                    display: 'block',
                    '& .MuiFilledInput-root': { width: '100%' },
                }}
                placeholder="Search contacts..."
            />

            <FilterList label="Organization" icon={<BusinessIcon />}>
                {organizations
                    ?.slice(0, 10)
                    .map(org => (
                        <FilterListItem
                            key={org.id}
                            label={org.name}
                            value={{ organizationId: org.id }}
                        />
                    ))}
            </FilterList>

            <FilterList label="Role" icon={<AssignmentIndIcon />}>
                {roleSettings?.map(role => (
                    <FilterListItem
                        key={role.id}
                        label={
                            <Chip
                                label={role.label}
                                size="small"
                                sx={{
                                    backgroundColor: role.color || '#e0e0e0',
                                    color: 'white',
                                    border: 0,
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                }}
                            />
                        }
                        value={{ roleId: role.id }}
                    />
                ))}
            </FilterList>

            <FilterList label="Influence Level" icon={<TrendingUpIcon />}>
                {influenceSettings?.map(influence => (
                    <FilterListItem
                        key={influence.id}
                        label={
                            <Chip
                                label={influence.label}
                                size="small"
                                sx={{
                                    backgroundColor:
                                        influence.color || '#e0e0e0',
                                    color: 'white',
                                    border: 0,
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                }}
                            />
                        }
                        value={{ influenceLevelId: influence.id }}
                    />
                ))}
            </FilterList>

            <FilterList label="Decision Role" icon={<HowToRegIcon />}>
                {decisionSettings?.map(decision => (
                    <FilterListItem
                        key={decision.id}
                        label={
                            <Chip
                                label={decision.label}
                                size="small"
                                sx={{
                                    backgroundColor:
                                        decision.color || '#e0e0e0',
                                    color: 'white',
                                    border: 0,
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                }}
                            />
                        }
                        value={{ decisionRoleId: decision.id }}
                    />
                ))}
            </FilterList>

            <FilterList label="Primary Contact" icon={<StarIcon />}>
                <FilterListItem
                    label="Primary contacts only"
                    value={{ isPrimary: true }}
                />
                <FilterListItem
                    label="Non-primary contacts"
                    value={{ isPrimary: false }}
                />
            </FilterList>
        </Box>
    );
};
