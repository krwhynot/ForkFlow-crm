import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Typography,
} from '../components/ui-kit';
import {
    PlusIcon as AddIcon,
    CheckCircleIcon as CompleteIcon,
    ExclamationCircleIcon as OverdueIcon,
    BellAlertIcon as ReminderIcon,
    ClockIcon as ScheduleIcon,
} from '@heroicons/react/24/outline';
import { Link, useGetIdentity, useGetList } from 'react-admin';
import { Reminder } from '../types';

interface ReminderStatsProps {
    reminders: Reminder[];
}

const ReminderStats = ({ reminders }: ReminderStatsProps) => {
    const now = new Date();
    const today = now.toDateString();

    const overdue = reminders.filter(
        r => !r.is_completed && new Date(r.reminder_date) < now
    ).length;

    const dueToday = reminders.filter(
        r =>
            !r.is_completed &&
            new Date(r.reminder_date).toDateString() === today
    ).length;

    const upcoming = reminders.filter(
        r => !r.is_completed && new Date(r.reminder_date) > now
    ).length;

    const completed = reminders.filter(r => r.is_completed).length;

    const stats = [
        {
            label: 'Overdue',
            count: overdue,
            color: 'error',
            icon: <OverdueIcon className="h-6 w-6 text-red-500" />,
        },
        {
            label: 'Due Today',
            count: dueToday,
            color: 'warning',
            icon: <ScheduleIcon className="h-6 w-6 text-yellow-500" />,
        },
        {
            label: 'Upcoming',
            count: upcoming,
            color: 'info',
            icon: <ReminderIcon className="h-6 w-6 text-blue-500" />,
        },
        {
            label: 'Completed',
            count: completed,
            color: 'success',
            icon: <CompleteIcon className="h-6 w-6 text-green-500" />,
        },
    ];

    return (
        <Box className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {stats.map(stat => (
                <Card key={stat.label} className={
                    stat.color === 'error' ? 'bg-red-50' :
                    stat.color === 'warning' ? 'bg-yellow-50' :
                    stat.color === 'info' ? 'bg-blue-50' :
                    stat.color === 'success' ? 'bg-green-50' : 'bg-gray-50'
                }>
                    <CardContent className="flex items-center p-4">
                        <Box className="mr-4">{stat.icon}</Box>
                        <Box>
                            <Typography variant="h4" className="font-bold">
                                {stat.count}
                            </Typography>
                            <Typography variant="body2" className="opacity-90">
                                {stat.label}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
};

interface UpcomingRemindersProps {
    reminders: Reminder[];
}

const UpcomingReminders = ({ reminders }: UpcomingRemindersProps) => {
    const now = new Date();
    const today = now.toDateString();

    // Get reminders due today and overdue, sorted by date
    const urgentReminders = reminders
        .filter(
            r =>
                !r.is_completed &&
                (new Date(r.reminder_date) < now ||
                    new Date(r.reminder_date).toDateString() === today)
        )
        .sort(
            (a, b) =>
                new Date(a.reminder_date).getTime() -
                new Date(b.reminder_date).getTime()
        )
        .slice(0, 5); // Show top 5

    // Get next upcoming reminders
    const upcomingReminders = reminders
        .filter(r => !r.is_completed && new Date(r.reminder_date) > now)
        .sort(
            (a, b) =>
                new Date(a.reminder_date).getTime() -
                new Date(b.reminder_date).getTime()
        )
        .slice(0, 3); // Show next 3

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isOverdue = (dateString: string) => new Date(dateString) < now;
    const isDueToday = (dateString: string) =>
        new Date(dateString).toDateString() === today;

    return (
        <Box className="grid gap-4 md:grid-cols-2">
            {/* Urgent Reminders */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom className="flex items-center">
                        <OverdueIcon className="h-5 w-5 mr-2 text-red-500" />
                        Urgent Attention
                    </Typography>

                    {urgentReminders.length === 0 ? (
                        <Typography className="text-gray-500">
                            No urgent reminders. Great job staying on top of
                            things!
                        </Typography>
                    ) : (
                        <Box>
                            {urgentReminders.map(reminder => (
                                <Box key={reminder.id} className="mb-2 pb-2 border-b border-gray-200">
                                    <Box className="flex justify-between items-start mb-1">
                                        <Typography variant="subtitle2" className="font-semibold">
                                            {reminder.title}
                                        </Typography>
                                        <Chip
                                            label={
                                                isOverdue(
                                                    reminder.reminder_date
                                                )
                                                    ? 'Overdue'
                                                    : 'Due Today'
                                            }
                                            className={
                                                isOverdue(
                                                    reminder.reminder_date
                                                )
                                                    ? 'border-red-500 text-red-500'
                                                    : 'border-yellow-500 text-yellow-500'
                                            }
                                            size="small"
                                            icon={
                                                isOverdue(
                                                    reminder.reminder_date
                                                )
                                                    ? <OverdueIcon className="h-4 w-4" />
                                                    : <ScheduleIcon className="h-4 w-4" />
                                            }
                                        />
                                    </Box>
                                    <Typography variant="body2" className="text-gray-500 mb-1">
                                        {reminder.customer_name}
                                    </Typography>
                                    <Typography variant="body2" className="text-gray-500">
                                        {isDueToday(reminder.reminder_date)
                                            ? `Today at ${formatTime(reminder.reminder_date)}`
                                            : new Date(
                                                reminder.reminder_date
                                            ).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            ))}
                            <Button
                                component={Link}
                                to="/reminders"
                                size="small"
                                className="mt-2"
                            >
                                View All Reminders
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Upcoming Reminders */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom className="flex items-center">
                        <ScheduleIcon className="h-5 w-5 mr-2 text-blue-500" />
                        Coming Up
                    </Typography>

                    {upcomingReminders.length === 0 ? (
                        <Box>
                            <Typography className="text-gray-500 mb-2">
                                No upcoming reminders scheduled.
                            </Typography>
                            <Button
                                component={Link}
                                to="/reminders/create"
                                variant="outlined"
                                startIcon={<AddIcon className="h-4 w-4" />}
                                size="small"
                            >
                                Add Reminder
                            </Button>
                        </Box>
                    ) : (
                        <Box>
                            {upcomingReminders.map(reminder => (
                                <Box key={reminder.id} className="mb-2 pb-2 border-b border-gray-200">
                                    <Typography variant="subtitle2" className="font-semibold mb-1">
                                        {reminder.title}
                                    </Typography>
                                    <Typography variant="body2" className="text-gray-500 mb-1">
                                        {reminder.customer_name}
                                    </Typography>
                                    <Typography variant="body2" className="text-gray-500">
                                        {new Date(
                                            reminder.reminder_date
                                        ).toLocaleDateString()} at {formatTime(reminder.reminder_date)}
                                    </Typography>
                                </Box>
                            ))}
                            <Button
                                component={Link}
                                to="/reminders/create"
                                size="small"
                                startIcon={<AddIcon className="h-4 w-4" />}
                                className="mt-2"
                            >
                                Add New Reminder
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export const ReminderDashboard = () => {
    const { identity } = useGetIdentity();

    const {
        data: reminders,
        isLoading,
        error,
    } = useGetList<Reminder>('reminders', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'reminder_date', order: 'ASC' },
        filter: { broker_id: identity?.id },
    });

    if (isLoading) {
        return (
            <Box className="flex justify-center p-8">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert variant="error" className="m-4">
                Error loading reminders. Please try again.
            </Alert>
        );
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom className="mb-6">
                Follow-up Reminders
            </Typography>

            <ReminderStats reminders={reminders || []} />
            <UpcomingReminders reminders={reminders || []} />
        </Box>
    );
};
