import { ClockIcon } from '@heroicons/react/24/outline';
import { ActivityLog } from '../activity/ActivityLog';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui-kit';

export function DashboardActivityLog() {
    // Sample activity data to match the Atomic CRM design
    const sampleActivities = [
        {
            id: 1,
            user: 'Kaycee Gorczany',
            action: 'added a note about',
            target: 'Ervin Ernard',
            source: 'Senger - Bayer',
            time: 'today at 8:59 PM',
            description: 'Rerum totam iusto non nihil. Rerum sit quam rem nam et porro. Et quia tempore pariatur quidem animi nemo. Dignissimos quia qui esse sed sunt.'
        },
        {
            id: 2,
            user: 'Enola Kuhic',
            action: 'added a note about',
            target: 'Joan Spinka',
            source: 'Kuhic and Sons',
            time: 'today at 8:56 PM',
            description: 'Fugiat eos aliquid vitae totam aspernatur aut libero quis saepe. Sit numquam aspernatur ut debitis itaque sed omnis nulla. Aperiam qui rerum pariatur veniam. Officia perferendis aspernatur inventore dolor fugit aut laboriosam quam soluta. Assumenda provident...'
        },
        {
            id: 3,
            user: 'You',
            action: 'added a note about',
            target: 'Jarred Aufderhar',
            source: 'Rempel LLC',
            time: 'today at 8:55 PM',
            description: 'Modi aut saepe qui. Numquam aperiam nulla quia quia. Sapiente voluptatem omnis. Maiores voluptatem dignissimos.'
        }
    ];

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <CardTitle className="text-lg font-semibold text-gray-800">Latest Activity</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-4">
                    {sampleActivities.map(activity => (
                        <div key={activity.id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-medium text-gray-600">
                                            {activity.user === 'You' ? 'Y' : activity.user.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900">
                                        <span className="font-medium">{activity.user}</span>{' '}
                                        {activity.action}{' '}
                                        <span className="font-medium text-blue-600">{activity.target}</span>{' '}
                                        from <span className="font-medium">{activity.source}</span>{' '}
                                        <span className="text-gray-500">{activity.time}</span>
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                        {activity.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Fallback to original ActivityLog if needed */}
                <div className="hidden">
                    <ActivityLog pageSize={10} />
                </div>
            </CardContent>
        </Card>
    );
}
