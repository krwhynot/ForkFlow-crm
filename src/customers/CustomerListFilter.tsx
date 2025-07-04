import {
    BuildingStorefrontIcon,
    TruckIcon,
    BuildingOfficeIcon,
    ClockIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline';
import { SearchInput } from 'react-admin';
import { Card, CardContent } from '../components/ui-kit/Card';
import { Filter, FilterItem } from '../components/ui-kit/Filter';

export const CustomerListFilter = () => {
    return (
        <div className="hidden sm:block order-first w-60 mr-4">
            <Card>
                <CardContent>
                    <SearchInput
                        source="q"
                        placeholder="Search customers..."
                        alwaysOn
                    />

                    <div className="space-y-4 mt-4">
                        <Filter
                            label="Business Type"
                            icon={
                                <BuildingStorefrontIcon className="h-5 w-5" />
                            }
                        >
                            <FilterItem
                                label="Restaurants"
                                value={{ business_type: 'restaurant' }}
                            />
                            <FilterItem
                                label="Grocery Stores"
                                value={{ business_type: 'grocery' }}
                            />
                            <FilterItem
                                label="Distributors"
                                value={{ business_type: 'distributor' }}
                            />
                            <FilterItem
                                label="Other"
                                value={{ business_type: 'other' }}
                            />
                        </Filter>

                        <Filter
                            label="Visit Status"
                            icon={<ClockIcon className="h-5 w-5" />}
                        >
                            <FilterItem
                                label="Needs Visit (30+ days)"
                                value={{ needs_visit: true }}
                            />
                            <FilterItem
                                label="Recently Visited"
                                value={{ recently_visited: true }}
                            />
                        </Filter>

                        <Filter
                            label="Location"
                            icon={<MapPinIcon className="h-5 w-5" />}
                        >
                            <FilterItem
                                label="Has GPS Coordinates"
                                value={{ has_location: true }}
                            />
                            <FilterItem
                                label="Missing Location"
                                value={{ has_location: false }}
                            />
                        </Filter>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
