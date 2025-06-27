/* eslint-disable import/no-anonymous-default-export */
import BusinessIcon from '@mui/icons-material/Business';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { Box } from '@mui/material';
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
        <Box width="13em" minWidth="13em" order={-1} mr={2} mt={5}>
            <FilterLiveSearch hiddenLabel />

            <FilterList label="Size" icon={<BusinessIcon />}>
                {sizes.map(size => (
                    <FilterListItem
                        key={size.id}
                        label={size.name}
                        value={{ size: size.id }}
                    />
                ))}
            </FilterList>

            <FilterList label="Sector" icon={<LocalShippingIcon />}>
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
                icon={<SupervisorAccountIcon />}
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
