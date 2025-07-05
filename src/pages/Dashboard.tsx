import ActivityLog from '../components/dashboard/ActivityLog';
import APriorityOrganizations from '../components/dashboard/APriorityOrganizations';
import HighPriorityTasks from '../components/dashboard/HighPriorityTasks';
import InteractionsChart from '../components/dashboard/InteractionsChart';
import KanbanBoard from '../components/dashboard/KanbanBoard';
import OpportunitiesChart from '../components/dashboard/OpportunitiesChart';
import RecentContacts from '../components/dashboard/RecentContacts';
import RecentInteractions from '../components/dashboard/RecentInteractions';
import RecentProducts from '../components/dashboard/RecentProducts';
import UpcomingMeetings from '../components/dashboard/UpcomingMeetings';
import WeeklyGoals from '../components/dashboard/WeeklyGoals';
import { Typography } from '../components/ui-kit/Typography';

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography variant="h1" className="text-2xl font-bold text-gray-900">
                                    Dashboard
                                </Typography>
                                <Typography variant="body1" className="text-gray-600 mt-1">
                                    Welcome back! Here's what's happening with your food brokerage business.
                                </Typography>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">
                                    {new Date().toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Row 1: High Priority Tasks & Recent Interactions */}
                    <div className="lg:col-span-6">
                        <HighPriorityTasks />
                    </div>
                    <div className="lg:col-span-6">
                        <RecentInteractions />
                    </div>

                    {/* Row 2: Upcoming Meetings & A-Priority Organizations */}
                    <div className="lg:col-span-6">
                        <UpcomingMeetings />
                    </div>
                    <div className="lg:col-span-6">
                        <APriorityOrganizations />
                    </div>

                    {/* Row 3: Weekly Goals & Recent Contacts */}
                    <div className="lg:col-span-6">
                        <WeeklyGoals />
                    </div>
                    <div className="lg:col-span-6">
                        <RecentContacts />
                    </div>

                    {/* Row 4: Charts - Interactions & Opportunities */}
                    <div className="lg:col-span-6">
                        <InteractionsChart />
                    </div>
                    <div className="lg:col-span-6">
                        <OpportunitiesChart />
                    </div>

                    {/* Row 5: Kanban Board - Full Width */}
                    <div className="lg:col-span-12">
                        <KanbanBoard />
                    </div>

                    {/* Row 6: Activity Log & Recent Products */}
                    <div className="lg:col-span-6">
                        <ActivityLog />
                    </div>
                    <div className="lg:col-span-6">
                        <RecentProducts />
                    </div>
                </div>
            </div>
        </div>
    );
} 