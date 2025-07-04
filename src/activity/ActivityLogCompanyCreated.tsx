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

    if (!organization) {
        return null;
    }

    return (
        <div className="flex items-center space-x-2">
            <CompanyAvatar record={organization} />
            <p className="text-sm text-gray-500 flex-grow">
                <ReferenceField
                    source="userId"
                    reference="sales"
                    record={activity}
                    link={false}
                >
                    <SaleName />
                </ReferenceField>{' '}
                added company{' '}
                <Link
                    to={`/companies/${organization.id}/show`}
                    className="font-medium text-blue-600 hover:underline"
                >
                    {organization.name}
                </Link>
                {context === 'all' && (
                    <>
                        {' '}
                        <RelativeDate date={activity.createdAt} />
                    </>
                )}
            </p>
            {context === 'company' && (
                <p className="text-sm text-gray-500">
                    <RelativeDate date={activity.createdAt} />
                </p>
            )}
        </div>
    );
}
