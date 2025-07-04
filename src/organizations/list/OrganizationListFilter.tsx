import { Box, Card, CardContent, Chip } from '@/components/ui-kit';
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
    const { displayedFilters, filterValues, setFilters } = useListContext();

    const removeFilter = (filterKey: string) => {
        const newFilters = { ...filterValues };
        delete newFilters[filterKey];
        setFilters(newFilters, null);
    };

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
            className={`order-first mr-4 mt-20 w-62 min-w-62 ${displayedFilters.priority || displayedFilters.segment || displayedFilters.distributor ? 'block' : 'hidden'} sm:block`}
        >
            <CardContent>
                <FilterContext.Provider value={organizationFilters}>
                    <FilterForm />
                </FilterContext.Provider>

                <Box className="mt-4">
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
                        className="mb-4"
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
                        className="mb-4"
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
                    <Box className="mt-4 pt-4 border-t border-gray-200">
                        <Box className="flex flex-wrap gap-2">
                            {filterValues.priorityId && (
                                <Chip
                                    size="small"
                                    label={
                                        prioritySettings?.find(
                                            s =>
                                                s.id === filterValues.priorityId
                                        )?.label || 'Priority'
                                    }
                                    onDelete={() => removeFilter('priorityId')}
                                    style={{
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
                                    onDelete={() => removeFilter('segmentId')}
                                    style={{
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
                                    onDelete={() =>
                                        removeFilter('distributorId')
                                    }
                                    style={{
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
