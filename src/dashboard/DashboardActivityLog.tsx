import { ClockIcon } from '@heroicons/react/24/outline';
import { ActivityLog } from '../activity/ActivityLog';
import { Card } from '../components/Card/Card';
import { CardContent } from '../components/Card/CardContent';
import { CardHeader } from '../components/Card/CardHeader';
import { CardTitle } from '../components/Card/CardTitle';

export function DashboardActivityLog() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <ClockIcon className="h-6 w-6 text-gray-400" />
                    <CardTitle>Latest Activity</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <ActivityLog pageSize={10} />
            </CardContent>
        </Card>
    );
}
