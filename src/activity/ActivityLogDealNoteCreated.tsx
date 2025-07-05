import { ReferenceField } from 'react-admin';

import { CompanyAvatar } from '../companies/CompanyAvatar';
import { RelativeDate } from '../misc/RelativeDate';
import { SaleName } from '../sales/SaleName';
import type { ActivityDealNoteCreated } from '../types';
import { useActivityLogContext } from './ActivityLogContext';
import { ActivityLogNote } from './ActivityLogNote';

type ActivityLogDealNoteCreatedProps = {
    activity: ActivityDealNoteCreated;
};

export function ActivityLogDealNoteCreated({
    activity,
}: ActivityLogDealNoteCreatedProps) {
    const context = useActivityLogContext();
    const { dealNote } = activity;

    if (!dealNote) {
        return null;
    }

    return (
        <ActivityLogNote
            header={
                <>
                    <ReferenceField
                        source="dealId"
                        reference="deals"
                        record={dealNote}
                        link={false}
                    >
                        <ReferenceField
                            source="organizationId"
                            reference="organizations"
                            link={false}
                        >
                            <CompanyAvatar />
                        </ReferenceField>
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
                        added a note about deal{' '}
                        <ReferenceField
                            source="dealId"
                            reference="deals"
                            record={dealNote}
                            link="show"
                        />
                        {context !== 'company' && (
                            <>
                                {' at '}
                                <ReferenceField
                                    source="dealId"
                                    reference="deals"
                                    record={dealNote}
                                    link={false}
                                >
                                    <ReferenceField
                                        source="organizationId"
                                        reference="organizations"
                                        link="show"
                                    />
                                </ReferenceField>{' '}
                                <RelativeDate date={activity.createdAt} />
                            </>
                        )}
                    </p>
                    {context === 'company' && (
                        <p className="text-sm text-gray-500">
                            <RelativeDate date={activity.createdAt} />
                        </p>
                    )}
                </>
            }
            text={dealNote.text}
        />
    );
}
