/**
 * This component displays the deals pipeline for the current user.
 * It's currently not used in the application but can be added to the dashboard.
 */

import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { Box, Card } from '@mui/material';
import {
    Link,
    ReferenceField,
    SimpleList,
    useGetIdentity,
    useGetList,
} from 'react-admin';

import { CompanyAvatar } from '../companies/CompanyAvatar';
import { findDealLabel } from '../deals/deal';
import { useConfigurationContext } from '../root/ConfigurationContext';
import { Deal } from '../types';

export const DealsPipeline = () => {
    const { identity } = useGetIdentity();
    const { dealStages, dealPipelineStatuses } = useConfigurationContext();
    const { data, total, isPending } = useGetList<Deal>(
        'deals',
        {
            pagination: { page: 1, perPage: 10 },
            sort: { field: 'last_seen', order: 'DESC' },
            filter: { 'stage@neq': 'lost', salesId: identity?.id },
        },
        { enabled: Number.isInteger(identity?.id) }
    );

    const getOrderedDeals = (data?: Deal[]): Deal[] | undefined => {
        if (!data) {
            return;
        }
        const deals: Deal[] = [];
        dealStages
            .filter(stage => !dealPipelineStatuses.includes(stage.value))
            .forEach(stage =>
                data
                    .filter(deal => deal.stage === stage.value)
                    .forEach(deal => deals.push(deal))
            );
        return deals;
    };

    return (
        <>
            <Box display="flex" alignItems="center" marginBottom="1em">
                <Box ml={2} mr={2} display="flex">
                    <MonetizationOnIcon color="disabled" fontSize="large" />
                </Box>
                <Link
                    underline="none"
                    variant="h5"
                    color="textSecondary"
                    to="/deals"
                >
                    Deals Pipeline
                </Link>
            </Box>
            <Card>
                <SimpleList<Deal>
                    resource="deals"
                    linkType="show"
                    data={getOrderedDeals(data)}
                    total={total}
                    isPending={isPending}
                    primaryText={deal => deal.name}
                    secondaryText={deal =>
                        `${deal.amount.toLocaleString('en-US', {
                            notation: 'compact',
                            style: 'currency',
                            currency: 'USD',
                            currencyDisplay: 'narrowSymbol',
                            minimumSignificantDigits: 3,
                        })} , ${findDealLabel(dealStages, deal.stage)}`
                    }
                    leftAvatar={deal => (
                        <ReferenceField
                            source="organizationId"
                            record={deal}
                            reference="companies"
                            resource="deals"
                            link={false}
                        >
                            <CompanyAvatar width={20} height={20} />
                        </ReferenceField>
                    )}
                />
            </Card>
        </>
    );
};
