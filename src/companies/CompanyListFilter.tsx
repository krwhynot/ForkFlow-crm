/* eslint-disable import/no-anonymous-default-export */
import {
    BuildingOfficeIcon,
    TruckIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import { Box } from '../components/ui-kit';
import {
    FilterList,
    FilterListItem,
    FilterLiveSearch,
    useGetIdentity,
} from 'react-admin';

import { useConfigurationContext } from '../root/ConfigurationContext';
import { sizes } from './sizes';

export const CompanyListFilter = () => {
    const { identity } = useGetIdentity();
    const { companySectors } = useConfigurationContext();
    const sectors = companySectors.map(sector => ({
        id: sector,
        name: sector,
    }));
    return (
        <Box className="w-52 min-w-52 -order-1 mr-2 mt-5">
            <FilterLiveSearch hiddenLabel />

            <FilterList
                label="Size"
                icon={<BuildingOfficeIcon className="h-5 w-5" />}
            >
                {sizes.map(size => (
                    <FilterListItem
                        key={size.id}
                        label={size.name}
                        value={{ size: size.id }}
                    />
                ))}
            </FilterList>

            <FilterList label="Sector" icon={<TruckIcon className="h-5 w-5" />}>
                {sectors.map(sector => (
                    <FilterListItem
                        key={sector.id}
                        label={sector.name}
                        value={{ sector: sector.id }}
                    />
                ))}
            </FilterList>

            <FilterList
                label="Account manager"
                icon={<UserGroupIcon className="h-5 w-5" />}
            >
                <FilterListItem
                    label="Me"
                    value={{
                        salesId: identity?.id,
                    }}
                />
            </FilterList>
        </Box>
    );
};
