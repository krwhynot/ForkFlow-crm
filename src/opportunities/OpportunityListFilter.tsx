import * as React from 'react';
import {
    FilterList,
    FilterLiveSearch,
    FilterListItem,
    useGetIdentity,
    useGetList,
} from 'react-admin';
import { Box, Chip } from '../components/ui-kit';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FlagIcon from '@mui/icons-material/Flag';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PercentIcon from '@mui/icons-material/Percent';
import DateRangeIcon from '@mui/icons-material/DateRange';

export const OpportunityListFilter = () => {
    const { identity } = useGetIdentity();

    // Fetch organizations for filtering
    const { data: organizations } = useGetList('organizations', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'name', order: 'ASC' },
    });

    // Fetch contacts for filtering
    const { data: contacts } = useGetList('contacts', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'firstName', order: 'ASC' },
    });

    // Sales pipeline stages for B2B food service
    const pipelineStages = [
        { id: 'lead_discovery', name: 'Lead Discovery', color: '#9e9e9e' },
        { id: 'contacted', name: 'Contacted', color: '#2196f3' },
        { id: 'sampled_visited', name: 'Sampled/Visited', color: '#ff9800' },
        { id: 'follow_up', name: 'Follow-up', color: '#ffeb3b' },
        { id: 'close', name: 'Close', color: '#4caf50' },
    ];

    // Opportunity status options
    const statusOptions = [
        { id: 'active', name: 'Active', color: '#4caf50' },
        { id: 'won', name: 'Won', color: '#8bc34a' },
        { id: 'lost', name: 'Lost', color: '#f44336' },
        { id: 'on-hold', name: 'On Hold', color: '#ff9800' },
    ];

    // Probability ranges for sales forecasting
    const probabilityRanges = [
        {
            id: 'high',
            name: 'High (80-100%)',
            min: 80,
            max: 100,
            color: '#4caf50',
        },
        {
            id: 'medium',
            name: 'Medium (50-79%)',
            min: 50,
            max: 79,
            color: '#ff9800',
        },
        { id: 'low', name: 'Low (0-49%)', min: 0, max: 49, color: '#f44336' },
    ];

    // Time-based filters for close dates
    const timePeriods = [
        { id: 'overdue', name: 'Overdue', color: '#f44336' },
        { id: 'this_month', name: 'This Month', color: '#ff9800' },
        { id: 'next_month', name: 'Next Month', color: '#2196f3' },
        { id: 'this_quarter', name: 'This Quarter', color: '#9c27b0' },
        { id: 'next_quarter', name: 'Next Quarter', color: '#673ab7' },
    ];

    return (
        <Box className="w-64 min-w-64 order-last mr-2 mt-5">
            <FilterLiveSearch
                hiddenLabel
                placeholder="Search opportunities..."
            />

            <FilterList label="Organization" icon={<BusinessIcon />}>
                {organizations
                    ?.slice(0, 12)
                    .map(org => (
                        <FilterListItem
                            key={org.id}
                            label={org.name}
                            value={{ organizationId: org.id }}
                        />
                    ))}
            </FilterList>

            <FilterList label="Contact" icon={<PersonIcon />}>
                {contacts
                    ?.slice(0, 12)
                    .map(contact => (
                        <FilterListItem
                            key={contact.id}
                            label={`${contact.firstName} ${contact.lastName}`}
                            value={{ contactId: contact.id }}
                        />
                    ))}
            </FilterList>

            <FilterList label="Pipeline Stage" icon={<TrendingUpIcon />}>
                {pipelineStages.map(stage => (
                    <FilterListItem
                        key={stage.id}
                        label={
                            <Chip
                                label={stage.name}
                                size="small"
                                style={{
                                    backgroundColor: stage.color,
                                }}
                                className="text-white border-0 cursor-pointer font-medium"
                            />
                        }
                        value={{ stage: stage.id }}
                    />
                ))}
            </FilterList>

            <FilterList label="Status" icon={<FlagIcon />}>
                {statusOptions.map(status => (
                    <FilterListItem
                        key={status.id}
                        label={
                            <Chip
                                label={status.name}
                                size="small"
                                style={{
                                    backgroundColor: status.color,
                                }}
                                className="text-white border-0 cursor-pointer font-medium"
                            />
                        }
                        value={{ status: status.id }}
                    />
                ))}
            </FilterList>

            <FilterList label="Win Probability" icon={<PercentIcon />}>
                {probabilityRanges.map(range => (
                    <FilterListItem
                        key={range.id}
                        label={
                            <Chip
                                label={range.name}
                                size="small"
                                style={{
                                    backgroundColor: range.color,
                                }}
                                className="text-white border-0 cursor-pointer font-medium"
                            />
                        }
                        value={{
                            'probability@gte': range.min,
                            'probability@lte': range.max,
                        }}
                    />
                ))}
            </FilterList>

            <FilterList label="Close Date" icon={<DateRangeIcon />}>
                {timePeriods.map(period => (
                    <FilterListItem
                        key={period.id}
                        label={
                            <Chip
                                label={period.name}
                                size="small"
                                style={{
                                    backgroundColor: period.color,
                                }}
                                className="text-white border-0 cursor-pointer font-medium"
                            />
                        }
                        value={{ timePeriod: period.id }}
                    />
                ))}
            </FilterList>

            {identity && (
                <FilterList label="Ownership" icon={<AccountCircleIcon />}>
                    <FilterListItem
                        label="Only my opportunities"
                        value={{ createdBy: identity.id }}
                    />
                    <FilterListItem
                        label="Unassigned opportunities"
                        value={{ 'createdBy@is': null }}
                    />
                    <FilterListItem label="All opportunities" value={{}} />
                </FilterList>
            )}
        </Box>
    );
};
