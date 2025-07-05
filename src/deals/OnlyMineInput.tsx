import { Box, FormControlLabel, Switch } from '../components/ui-kit';
import { useGetIdentity, useListFilterContext } from 'react-admin';

export const OnlyMineInput = (_: { alwaysOn: boolean; source: string }) => {
    const { filterValues, displayedFilters, setFilters } =
        useListFilterContext();
    const { identity } = useGetIdentity();

    const handleChange = () => {
        const newFilterValues = { ...filterValues };
        if (typeof filterValues.salesId !== 'undefined') {
            delete newFilterValues.salesId;
        } else {
            newFilterValues.salesId = identity && identity?.id;
        }
        setFilters(newFilterValues, displayedFilters);
    };
    return (
        <Box className="mb-1 ml-1">
            <FormControlLabel
                control={
                    <Switch
                        checked={typeof filterValues.salesId !== 'undefined'}
                        onChange={handleChange}
                        color="primary"
                        name="checkedC"
                    />
                }
                label="Only organizations I manage"
            />
        </Box>
    );
};
