import { Link, ReferenceField } from 'react-admin';

import { CompanyAvatar } from '../companies/CompanyAvatar';
import { RelativeDate } from '../misc/RelativeDate';
import { SaleName } from '../sales/SaleName';
import type { ActivityDealCreated } from '../types';
import { useActivityLogContext } from './ActivityLogContext';

type ActivityLogDealCreatedProps = {
    activity: ActivityDealCreated;
};

export function ActivityLogDealCreated({
    activity,
}: ActivityLogDealCreatedProps) {
    const context = useActivityLogContext();
    const { deal } = activity;

    if (!deal) {
        return null;
    }

    return (
        <div className="flex items-center space-x-2">
            <ReferenceField
                source="entityId"
                reference="companies"
                record={activity}
                link={false}
            >
                <CompanyAvatar />
            </ReferenceField>
            <p className="text-sm text-gray-500 flex-grow">
                <ReferenceField
                    source="userId"
                    reference="sales"
                    record={activity}
                    link={false}
                >
                    <SaleName />
                </ReferenceField>{' '}
                added deal{' '}
                <Link
                    to={`/deals/${deal.id}/show`}
                    className="font-medium text-blue-600 hover:underline"
                >
                    {deal.name}
                </Link>{' '}
                {context !== 'company' && (
                    <>
                        to company{' '}
                        <ReferenceField
                            source="entityId"
                            reference="companies"
                            record={activity}
                            link="show"
                        />{' '}
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
