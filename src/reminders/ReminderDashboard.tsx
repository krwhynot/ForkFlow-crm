import React from 'react';
import { useGetList, useGetIdentity, Link } from 'react-admin';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Button,
    Alert,
    CircularProgress,
} from '@/components/ui-kit';
import {
    BellIcon as ReminderIcon,
    ClockIcon as ScheduleIcon,
    ExclamationTriangleIcon as OverdueIcon,
    CheckCircleIcon as CompleteIcon,
    PlusIcon as AddIcon,
} from '@heroicons/react/24/outline';
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
            icon: <OverdueIcon />,
        },
        {
            label: 'Due Today',
            count: dueToday,
            color: 'warning',
            icon: <ScheduleIcon />,
        },
        {
            label: 'Upcoming',
            count: upcoming,
            color: 'info',
            icon: <ReminderIcon />,
        },
        {
            label: 'Completed',
            count: completed,
            color: 'success',
            icon: <CompleteIcon />,
        },
    ];

    return (
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(stat => {
                const colorClasses = {
                    error: 'bg-red-100 text-red-900 border-red-200',
                    warning: 'bg-yellow-100 text-yellow-900 border-yellow-200',
                    info: 'bg-blue-100 text-blue-900 border-blue-200',
                    success: 'bg-green-100 text-green-900 border-green-200',
                };
                
                const iconClasses = {
                    error: 'text-red-600',
                    warning: 'text-yellow-600',
                    info: 'text-blue-600',
                    success: 'text-green-600',
                };

                return (
                    <Card
                        key={stat.label}
                        className={`${colorClasses[stat.color as keyof typeof colorClasses]} border`}
                    >
                        <CardContent className="flex items-center p-4">
                            <Box className="mr-4">
                                {React.cloneElement(stat.icon, { 
                                    className: `w-8 h-8 ${iconClasses[stat.color as keyof typeof iconClasses]}` 
                                })}
                            </Box>
                            <Box>
                                <Typography
                                    variant="h4"
                                    component="div"
                                    className="font-bold text-2xl"
                                >
                                    {stat.count}
                                </Typography>
                                <Typography variant="body2" className="opacity-90">
                                    {stat.label}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                );
            })}
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
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Urgent Reminders */}
            <Card>
                <CardContent>
                    <Typography
                        variant="h6"
                        className="flex items-center mb-2"
                    >
                        <OverdueIcon className="w-5 h-5 mr-2 text-red-600" />
                        Urgent Attention
                    </Typography>

                    {urgentReminders.length === 0 ? (
                        <Typography className="text-gray-600">
                            No urgent reminders. Great job staying on top of
                            things!
                        </Typography>
                    ) : (
                        <Box>
                            {urgentReminders.map(reminder => (
                                <Box
                                    key={reminder.id}
                                    className="mb-4 pb-4 border-b border-gray-200 last:border-b-0"
                                >
                                    <Box className="flex justify-between items-start mb-2">
                                        <Typography
                                            variant="subtitle2"
                                            className="font-semibold"
                                        >
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
                                            color={
                                                isOverdue(
                                                    reminder.reminder_date
                                                )
                                                    ? 'error'
                                                    : 'warning'
                                            }
                                            size="small"
                                        />
                                    </Box>
                                    <Typography
                                        variant="body2"
                                        className="text-gray-600 mb-2"
                                    >
                                        {reminder.customer_name}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        className="text-gray-600"
                                    >
                                        {isDueToday(reminder.reminder_date)
                                            ? `Today at ${formatTime(reminder.reminder_date)}`
                                            : new Date(
                                                  reminder.reminder_date
                                              ).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            ))}
                            <Link to="/reminders">
                                <Button
                                    size="small"
                                    className="mt-2"
                                >
                                    View All Reminders
                                </Button>
                            </Link>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Upcoming Reminders */}
            <Card>
                <CardContent>
                    <Typography
                        variant="h6"
                        className="flex items-center mb-2"
                    >
                        <ScheduleIcon className="w-5 h-5 mr-2 text-blue-600" />
                        Coming Up
                    </Typography>

                    {upcomingReminders.length === 0 ? (
                        <Box>
                            <Typography className="text-gray-600 mb-4">
                                No upcoming reminders scheduled.
                            </Typography>
                            <Link to="/reminders/create">
                                <Button
                                    variant="outlined"
                                    startIcon={<AddIcon className="w-4 h-4" />}
                                    size="small"
                                >
                                    Add Reminder
                                </Button>
                            </Link>
                        </Box>
                    ) : (
                        <Box>
                            {upcomingReminders.map(reminder => (
                                <Box
                                    key={reminder.id}
                                    className="mb-4 pb-4 border-b border-gray-200 last:border-b-0"
                                >
                                    <Typography
                                        variant="subtitle2"
                                        className="font-semibold mb-2"
                                    >
                                        {reminder.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        className="text-gray-600 mb-2"
                                    >
                                        {reminder.customer_name}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        className="text-gray-600"
                                    >
                                        {new Date(
                                            reminder.reminder_date
                                        ).toLocaleDateString()}{' '}
                                        at {formatTime(reminder.reminder_date)}
                                    </Typography>
                                </Box>
                            ))}
                            <Link to="/reminders/create">
                                <Button
                                    size="small"
                                    startIcon={<AddIcon className="w-4 h-4" />}
                                    className="mt-2"
                                >
                                    Add New Reminder
                                </Button>
                            </Link>
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
            <Alert severity="error" className="m-4">
                Error loading reminders. Please try again.
            </Alert>
        );
    }

    return (
        <Box>
            <Typography variant="h5" className="mb-6 font-semibold">
                Follow-up Reminders
            </Typography>

            <ReminderStats reminders={reminders || []} />
            <UpcomingReminders reminders={reminders || []} />
        </Box>
    );
};
