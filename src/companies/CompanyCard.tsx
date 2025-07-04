import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { AvatarGroup } from '../components/ui-kit/AvatarGroup';
import { Box } from '../components/ui-kit/Box';
import { Paper } from '../components/ui-kit/Paper';
import { Typography } from '../components/ui-kit/Typography';
import { useState } from 'react';
import {
    Link,
    ReferenceManyField,
    SelectField,
    useCreatePath,
    useListContext,
    useRecordContext,
} from 'react-admin';

import { Avatar } from '../contacts/Avatar';
import { useConfigurationContext } from '../root/ConfigurationContext';
import { Company } from '../types';
import { CompanyAvatar } from './CompanyAvatar';

export const CompanyCard = (props: { record?: Company }) => {
    const { companySectors } = useConfigurationContext();
    const [elevation, setElevation] = useState(1);
    const createPath = useCreatePath();
    const record = useRecordContext<Company>(props);
    if (!record) return null;

    return (
        <Link
            to={createPath({
                resource: 'companies',
                id: record.id,
                type: 'show',
            })}
            underline="none"
            onMouseEnter={() => setElevation(3)}
            onMouseLeave={() => setElevation(1)}
        >
            <Paper
                style={{
                    height: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1rem',
                }}
                elevation={elevation}
            >
                <Box display="flex" flexDirection="column" alignItems="center">
                    <CompanyAvatar />
                    <Box textAlign="center" marginTop={1}>
                        <Typography variant="subtitle2">
                            {record.name}
                        </Typography>
                        <SelectField
                            color="textSecondary"
                            source="sector"
                            choices={companySectors.map(sector => ({
                                id: sector,
                                name: sector,
                            }))}
                        />
                    </Box>
                </Box>
                <Box display="flex" width="100%">
                    <Box display="flex" alignItems="center">
                        {record.nb_contacts ? (
                            <ReferenceManyField
                                reference="contacts"
                                target="organizationId"
                            >
                                <AvatarGroupIterator />
                            </ReferenceManyField>
                        ) : null}
                    </Box>
                    {record.nb_deals ? (
                        <Box
                            display="flex"
                            alignItems="center"
                            style={{ marginLeft: '0.5rem', gap: '0.125rem' }}
                        >
                            <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                            <Typography variant="subtitle2">
                                {record.nb_deals}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                {record.nb_deals
                                    ? record.nb_deals > 1
                                        ? 'deals'
                                        : 'deal'
                                    : 'deal'}
                            </Typography>
                        </Box>
                    ) : null}
                </Box>
            </Paper>
        </Link>
    );
};

const AvatarGroupIterator = () => {
    const { data, total, error, isPending } = useListContext();
    if (isPending || error) return null;
    return (
        <AvatarGroup
            max={4}
            total={total}
            spacing="medium"
        >
            {data.map((record: any) => (
                <Avatar
                    key={record.id}
                    record={record}
                    width={20}
                    height={20}
                    title={`${record.first_name} ${record.last_name}`}
                />
            ))}
        </AvatarGroup>
    );
};
