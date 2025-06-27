import { Card, CardContent, Typography, Box } from '@mui/material';
import {
    FilterList,
    FilterListItem,
    SearchInput,
    SelectInput,
    BooleanInput,
} from 'react-admin';
import {
    Restaurant as RestaurantIcon,
    Store as StoreIcon,
    LocalShipping as DistributorIcon,
    Business as OtherIcon,
    Schedule as ScheduleIcon,
    Place as PlaceIcon,
} from '@mui/icons-material';

export const CustomerListFilter = () => {
    return (
        <Box
            sx={{
                display: {
                    xs: 'none', // Hide on mobile
                    sm: 'block',
                },
                order: -1,
                width: '15em',
                marginRight: '1em',
            }}
        >
            <Card>
                <CardContent>
                    <SearchInput
                        source="q"
                        placeholder="Search customers..."
                        alwaysOn
                    />

                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Business Type
                    </Typography>
                    <FilterList label="Business Type" icon={<RestaurantIcon />}>
                        <FilterListItem
                            label="Restaurants"
                            value={{ business_type: 'restaurant' }}
                            icon={<RestaurantIcon />}
                        />
                        <FilterListItem
                            label="Grocery Stores"
                            value={{ business_type: 'grocery' }}
                            icon={<StoreIcon />}
                        />
                        <FilterListItem
                            label="Distributors"
                            value={{ business_type: 'distributor' }}
                            icon={<DistributorIcon />}
                        />
                        <FilterListItem
                            label="Other"
                            value={{ business_type: 'other' }}
                            icon={<OtherIcon />}
                        />
                    </FilterList>

                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Visit Status
                    </Typography>
                    <FilterList label="Visit Status" icon={<ScheduleIcon />}>
                        <FilterListItem
                            label="Needs Visit (30+ days)"
                            value={{ needs_visit: true }}
                            icon={<ScheduleIcon />}
                        />
                        <FilterListItem
                            label="Recently Visited"
                            value={{ recently_visited: true }}
                            icon={<ScheduleIcon />}
                        />
                    </FilterList>

                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Location
                    </Typography>
                    <FilterList label="Location" icon={<PlaceIcon />}>
                        <FilterListItem
                            label="Has GPS Coordinates"
                            value={{ has_location: true }}
                            icon={<PlaceIcon />}
                        />
                        <FilterListItem
                            label="Missing Location"
                            value={{ has_location: false }}
                            icon={<PlaceIcon />}
                        />
                    </FilterList>
                </CardContent>
            </Card>
        </Box>
    );
};
