import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import {
    endOfToday,
    endOfTomorrow,
    endOfWeek,
    getDay,
    startOfToday,
} from 'date-fns';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../components/ui-kit';
import { AddTask } from '../tasks/AddTask';

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
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <ClipboardDocumentListIcon className="h-5 w-5 text-gray-400" />
                        <CardTitle className="text-lg font-semibold text-gray-800">Upcoming Tasks</CardTitle>
                    </div>
                    <AddTask display="icon" selectContact />
                </div>
                <div className="mt-2">
                    <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">OVERDUE</span>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-4">
                    {/* Sample tasks to match the Atomic CRM design */}
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    Meeting Qui dolor praesentium libero similique voluptas.
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    due 1/27/2024 (Re: Carlton Williamson)
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    Meeting Ad debitis itaque.
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    due 4/16/2024 (Re: Crystal O'Conner)
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    Follow-up Pariatur quis et ut necessitatibus aliquam expedita optio iste distinctio.
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    due 6/15/2024 (Re: Tommie Waelchi)
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    Lunch Sit non quod repellat error.
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    due 6/28/2024 (Re: Deven Gerhold)
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    Thank you Et officia sunt commodi dignissimos temporibus velit.
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    due 7/5/2024 (Re: Alexanne Leannon)
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">TODAY</span>
                        <div className="mt-3 space-y-3">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        Thank you Sint et nobis non quibusdam quos expedita odio vero quia.
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        due 7/4/2025 (Re: Rachel McGlynn)
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        Officia possimus enim occaecati et corporis quidem ea.
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        due 7/4/2025 (Re: Valerie Schoen)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                            Load more
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
