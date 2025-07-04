import { useState, Fragment } from 'react';
import {
    COMPANY_CREATED,
    CONTACT_CREATED,
    CONTACT_NOTE_CREATED,
    DEAL_CREATED,
    DEAL_NOTE_CREATED,
} from '../consts';
import { Activity } from '../types';
import { ActivityLogCompanyCreated } from './ActivityLogCompanyCreated';
import { ActivityLogContactCreated } from './ActivityLogContactCreated';
import { ActivityLogContactNoteCreated } from './ActivityLogContactNoteCreated';
import { ActivityLogDealCreated } from './ActivityLogDealCreated';
import { ActivityLogDealNoteCreated } from './ActivityLogDealNoteCreated';
import { Button } from '../components/ui-kit/Button';

type ActivityLogIteratorProps = {
    activities: Activity[];
    pageSize: number;
};

export function ActivityLogIterator({
    activities,
    pageSize,
}: ActivityLogIteratorProps) {
    const [activitiesDisplayed, setActivityDisplayed] = useState(pageSize);

    const filteredActivities = activities.slice(0, activitiesDisplayed);

    return (
        <ul className="divide-y divide-gray-200">
            {filteredActivities.map((activity, index) => (
                <Fragment key={index}>
                    <li className="py-4">
                        <ActivityItem key={activity.id} activity={activity} />
                    </li>
                </Fragment>
            ))}

            {activitiesDisplayed < activities.length && (
                <Button
                    onClick={() =>
                        setActivityDisplayed(
                            activitiesDisplayed =>
                                activitiesDisplayed + pageSize
                        )
                    }
                    className="w-full mt-4"
                >
                    Load more activity
                </Button>
            )}
        </ul>
    );
}

function ActivityItem({ activity }: { activity: Activity }) {
    if (activity.type === COMPANY_CREATED) {
        return <ActivityLogCompanyCreated activity={activity as any} />;
    }

    if (activity.type === CONTACT_CREATED) {
        return <ActivityLogContactCreated activity={activity as any} />;
    }

    if (activity.type === CONTACT_NOTE_CREATED) {
        return <ActivityLogContactNoteCreated activity={activity as any} />;
    }

    if (activity.type === DEAL_CREATED) {
        return <ActivityLogDealCreated activity={activity as any} />;
    }

    if (activity.type === DEAL_NOTE_CREATED) {
        return <ActivityLogDealNoteCreated activity={activity as any} />;
    }

    return null;
}
