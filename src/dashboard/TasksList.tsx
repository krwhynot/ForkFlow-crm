import * as React from 'react';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { AddTask } from '../tasks/AddTask';
import {
    startOfToday,
    endOfToday,
    endOfTomorrow,
    endOfWeek,
    getDay,
} from 'date-fns';
import { TasksListFilter } from './TasksListFilter';
import { TasksListEmpty } from './TasksListEmpty';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../components/ui-kit/Card';

const today = new Date();
const todayDayOfWeek = getDay(today);
const isBeforeFriday = todayDayOfWeek < 5; // Friday is represented by 5
const startOfTodayDateISO = startOfToday().toISOString();
const endOfTodayDateISO = endOfToday().toISOString();
const endOfTomorrowDateISO = endOfTomorrow().toISOString();
const endOfWeekDateISO = endOfWeek(today, { weekStartsOn: 0 }).toISOString();

const taskFilters = {
    overdue: { 'done_date@is': null, 'due_date@lt': startOfTodayDateISO },
    today: {
        'done_date@is': null,
        'due_date@gte': startOfTodayDateISO,
        'due_date@lte': endOfTodayDateISO,
    },
    tomorrow: {
        'done_date@is': null,
        'due_date@gt': endOfTodayDateISO,
        'due_date@lt': endOfTomorrowDateISO,
    },
    thisWeek: {
        'done_date@is': null,
        'due_date@gte': endOfTomorrowDateISO,
        'due_date@lte': endOfWeekDateISO,
    },
    later: { 'done_date@is': null, 'due_date@gt': endOfWeekDateISO },
};

export const TasksList = () => {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <ClipboardDocumentListIcon className="h-6 w-6 text-gray-400" />
                        <CardTitle>Upcoming Tasks</CardTitle>
                    </div>
                    <AddTask display="icon" selectContact />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <TasksListEmpty />
                    <TasksListFilter
                        title="Overdue"
                        filter={taskFilters.overdue}
                    />
                    <TasksListFilter title="Today" filter={taskFilters.today} />
                    <TasksListFilter
                        title="Tomorrow"
                        filter={taskFilters.tomorrow}
                    />
                    {isBeforeFriday && (
                        <TasksListFilter
                            title="This week"
                            filter={taskFilters.thisWeek}
                        />
                    )}
                    <TasksListFilter title="Later" filter={taskFilters.later} />
                </div>
            </CardContent>
        </Card>
    );
};
