import {
    ArrowTrendingUpIcon,
    BuildingOfficeIcon,
    CheckBadgeIcon,
    StarIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import {
    FilterList,
    FilterListItem,
    FilterLiveSearch,
    useGetIdentity,
    useGetList,
} from 'react-admin';
import { Box, Chip } from '../components/ui-kit';

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
        <Box
            style={{
                width: '14rem',
                minWidth: '14rem',
                order: -1,
                marginRight: '0.5rem',
                marginTop: '1.25rem',
            }}
        >
            <FilterLiveSearch
                hiddenLabel
                className="block w-full"
                placeholder="Search contacts..."
            />

            <FilterList
                label="Organization"
                icon={<BuildingOfficeIcon className="h-5 w-5" />}
            >
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

            <FilterList label="Role" icon={<UserIcon className="h-5 w-5" />}>
                {roleSettings?.map(role => (
                    <FilterListItem
                        key={role.id}
                        label={
                            <Chip
                                label={role.label}
                                size="small"
                                style={{
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

            <FilterList
                label="Influence Level"
                icon={<ArrowTrendingUpIcon className="h-5 w-5" />}
            >
                {influenceSettings?.map(influence => (
                    <FilterListItem
                        key={influence.id}
                        label={
                            <Chip
                                label={influence.label}
                                size="small"
                                style={{
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

            <FilterList
                label="Decision Role"
                icon={<CheckBadgeIcon className="h-5 w-5" />}
            >
                {decisionSettings?.map(decision => (
                    <FilterListItem
                        key={decision.id}
                        label={
                            <Chip
                                label={decision.label}
                                size="small"
                                style={{
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

            <FilterList
                label="Primary Contact"
                icon={<StarIcon className="h-5 w-5" />}
            >
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
