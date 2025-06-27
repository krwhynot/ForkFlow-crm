import { Box, Card, CardContent, Chip } from '@mui/material';
import {
    FilterContext,
    FilterForm,
    SearchInput,
    SelectInput,
    useGetList,
    useListContext,
} from 'react-admin';
import { Setting } from '../types';

const organizationFilters = [
    <SearchInput source="q" alwaysOn placeholder="Search organizations..." />,
];

export const OrganizationListFilter = () => {
    const { displayedFilters, filterValues } = useListContext();

    // Fetch Settings for filter options
    const { data: prioritySettings } = useGetList<Setting>('settings', {
        filter: { category: 'priority', active: true },
        sort: { field: 'sortOrder', order: 'ASC' },
        pagination: { page: 1, perPage: 100 },
    });

    const { data: segmentSettings } = useGetList<Setting>('settings', {
        filter: { category: 'segment', active: true },
        sort: { field: 'sortOrder', order: 'ASC' },
        pagination: { page: 1, perPage: 100 },
    });

    const { data: distributorSettings } = useGetList<Setting>('settings', {
        filter: { category: 'distributor', active: true },
        sort: { field: 'sortOrder', order: 'ASC' },
        pagination: { page: 1, perPage: 100 },
    });

    return (
        <Card
            sx={{
                order: -1,
                mr: 2,
                mt: 9,
                width: 250,
                minWidth: 250,
                display: {
                    xs:
                        displayedFilters.priority ||
                            displayedFilters.segment ||
                            displayedFilters.distributor
                            ? 'block'
                            : 'none',
                    sm: 'block',
                },
            }}
        >
            <CardContent>
                <FilterContext.Provider value={organizationFilters}>
                    <FilterForm />
                </FilterContext.Provider>

                <Box sx={{ mt: 2 }}>
                    <SelectInput
                        source="priorityId"
                        label="Priority"
                        choices={
                            prioritySettings?.map(setting => ({
                                id: setting.id,
                                name: setting.label,
                            })) || []
                        }
                        helperText={false}
                        sx={{ mb: 2 }}
                    />

                    <SelectInput
                        source="segmentId"
                        label="Business Segment"
                        choices={
                            segmentSettings?.map(setting => ({
                                id: setting.id,
                                name: setting.label,
                            })) || []
                        }
                        helperText={false}
                        sx={{ mb: 2 }}
                    />

                    <SelectInput
                        source="distributorId"
                        label="Primary Distributor"
                        choices={
                            distributorSettings?.map(setting => ({
                                id: setting.id,
                                name: setting.label,
                            })) || []
                        }
                        helperText={false}
                    />
                </Box>

                {/* Active Filters Display */}
                {(filterValues.priorityId ||
                    filterValues.segmentId ||
                    filterValues.distributorId) && (
                        <Box
                            sx={{
                                mt: 2,
                                pt: 2,
                                borderTop: 1,
                                borderColor: 'divider',
                            }}
                        >
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {filterValues.priorityId && (
                                    <Chip
                                        size="small"
                                        label={
                                            prioritySettings?.find(
                                                s =>
                                                    s.id === filterValues.priorityId
                                            )?.label || 'Priority'
                                        }
                                        onDelete={() => {
                                            // Remove filter logic would go here
                                        }}
                                        sx={{
                                            backgroundColor: prioritySettings?.find(
                                                s =>
                                                    s.id === filterValues.priorityId
                                            )?.color,
                                            color: 'white',
                                        }}
                                    />
                                )}
                                {filterValues.segmentId && (
                                    <Chip
                                        size="small"
                                        label={
                                            segmentSettings?.find(
                                                s => s.id === filterValues.segmentId
                                            )?.label || 'Segment'
                                        }
                                        onDelete={() => {
                                            // Remove filter logic would go here
                                        }}
                                        sx={{
                                            backgroundColor: segmentSettings?.find(
                                                s => s.id === filterValues.segmentId
                                            )?.color,
                                            color: 'white',
                                        }}
                                    />
                                )}
                                {filterValues.distributorId && (
                                    <Chip
                                        size="small"
                                        label={
                                            distributorSettings?.find(
                                                s =>
                                                    s.id ===
                                                    filterValues.distributorId
                                            )?.label || 'Distributor'
                                        }
                                        onDelete={() => {
                                            // Remove filter logic would go here
                                        }}
                                        sx={{
                                            backgroundColor:
                                                distributorSettings?.find(
                                                    s =>
                                                        s.id ===
                                                        filterValues.distributorId
                                                )?.color,
                                            color: 'white',
                                        }}
                                    />
                                )}
                            </Box>
                        </Box>
                    )}
            </CardContent>
        </Card>
    );
};
