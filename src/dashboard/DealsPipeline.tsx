/**
 * This component displays the deals pipeline for the current user.
 * It's currently not used in the application but can be added to the dashboard.
 */

import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { Box, Card } from '../components/ui-kit';
import {
    Link,
    ReferenceField,
    SimpleList,
    useGetIdentity,
    useGetList,
} from 'react-admin';

import { OrganizationAvatar } from '../organizations/OrganizationAvatar';
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
            <Box className="flex items-center mb-4">
                <Box className="mx-4 flex">
                    <CurrencyDollarIcon className="h-8 w-8 text-gray-400" />
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
                        `${(deal.amount ?? 0).toLocaleString('en-US', {
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
                            reference="organizations"
                            resource="deals"
                            link={false}
                        >
                            <OrganizationAvatar width={20} height={20} />
                        </ReferenceField>
                    )}
                />
            </Card>
        </>
    );
};
