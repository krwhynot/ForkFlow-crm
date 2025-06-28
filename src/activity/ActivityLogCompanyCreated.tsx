import { ListItem, Stack, Typography } from '@mui/material';
import { Link, ReferenceField } from 'react-admin';

import { CompanyAvatar } from '../companies/CompanyAvatar';
import { RelativeDate } from '../misc/RelativeDate';
import { SaleName } from '../sales/SaleName';
import type { ActivityOrganizationCreated } from '../types';
import { useActivityLogContext } from './ActivityLogContext';

type ActivityLogCompanyCreatedProps = {
    activity: ActivityOrganizationCreated;
};

export function ActivityLogCompanyCreated({
    activity,
}: ActivityLogCompanyCreatedProps) {
    const context = useActivityLogContext();
    const { organization } = activity;
    return (
        <ListItem disableGutters>
            <Stack direction="row" spacing={1} alignItems="center" width="100%">
                <CompanyAvatar
                    width={20}
                    height={20}
                    record={organization as any}
                />
                <Typography
                    component="p"
                    variant="body2"
                    color="text.secondary"
                    flexGrow={1}
                >
                    <ReferenceField
                        source="salesId"
                        reference="sales"
                        record={activity}
                        link={false}
                    >
                        <SaleName />
                    </ReferenceField>{' '}
                    added company{' '}
                    <Link to={`/companies/${organization.id}/show`}>
                        {organization.name}
                    </Link>
                    {context === 'all' && (
                        <>
                            {' '}
                            <RelativeDate date={activity.date} />
                        </>
                    )}
                </Typography>
                {context === 'company' && (
                    <Typography
                        color="textSecondary"
                        variant="body2"
                        component="span"
                    >
                        <RelativeDate date={activity.date} />
                    </Typography>
                )}
            </Stack>
        </ListItem>
    );
}
