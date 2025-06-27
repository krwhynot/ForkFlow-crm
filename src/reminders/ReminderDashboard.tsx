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
} from '@mui/material';
import {
    NotificationsActive as ReminderIcon,
    Schedule as ScheduleIcon,
    WarningAmber as OverdueIcon,
    CheckCircle as CompleteIcon,
    Add as AddIcon,
} from '@mui/icons-material';
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
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 2,
                mb: 3,
            }}
        >
            {stats.map(stat => (
                <Card
                    key={stat.label}
                    sx={{
                        bgcolor: `${stat.color}.light`,
                        color: `${stat.color}.contrastText`,
                    }}
                >
                    <CardContent
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 2,
                            '&:last-child': { pb: 2 },
                        }}
                    >
                        <Box sx={{ mr: 2 }}>{stat.icon}</Box>
                        <Box>
                            <Typography
                                variant="h4"
                                component="div"
                                sx={{ fontWeight: 'bold' }}
                            >
                                {stat.count}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
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
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
            }}
        >
            {/* Urgent Reminders */}
            <Card>
                <CardContent>
                    <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ display: 'flex', alignItems: 'center' }}
                    >
                        <OverdueIcon sx={{ mr: 1, color: 'error.main' }} />
                        Urgent Attention
                    </Typography>

                    {urgentReminders.length === 0 ? (
                        <Typography color="text.secondary">
                            No urgent reminders. Great job staying on top of
                            things!
                        </Typography>
                    ) : (
                        <Box>
                            {urgentReminders.map(reminder => (
                                <Box
                                    key={reminder.id}
                                    sx={{
                                        mb: 2,
                                        pb: 2,
                                        borderBottom: '1px solid #eee',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            mb: 1,
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle2"
                                            sx={{ fontWeight: 600 }}
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
                                        color="text.secondary"
                                        sx={{ mb: 1 }}
                                    >
                                        {reminder.customer_name}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
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
                                sx={{ mt: 1 }}
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
                    <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ display: 'flex', alignItems: 'center' }}
                    >
                        <ScheduleIcon sx={{ mr: 1, color: 'info.main' }} />
                        Coming Up
                    </Typography>

                    {upcomingReminders.length === 0 ? (
                        <Box>
                            <Typography color="text.secondary" sx={{ mb: 2 }}>
                                No upcoming reminders scheduled.
                            </Typography>
                            <Button
                                component={Link}
                                to="/reminders/create"
                                variant="outlined"
                                startIcon={<AddIcon />}
                                size="small"
                            >
                                Add Reminder
                            </Button>
                        </Box>
                    ) : (
                        <Box>
                            {upcomingReminders.map(reminder => (
                                <Box
                                    key={reminder.id}
                                    sx={{
                                        mb: 2,
                                        pb: 2,
                                        borderBottom: '1px solid #eee',
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ fontWeight: 600, mb: 1 }}
                                    >
                                        {reminder.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mb: 1 }}
                                    >
                                        {reminder.customer_name}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {new Date(
                                            reminder.reminder_date
                                        ).toLocaleDateString()}{' '}
                                        at {formatTime(reminder.reminder_date)}
                                    </Typography>
                                </Box>
                            ))}
                            <Button
                                component={Link}
                                to="/reminders/create"
                                size="small"
                                startIcon={<AddIcon />}
                                sx={{ mt: 1 }}
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
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                Error loading reminders. Please try again.
            </Alert>
        );
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Follow-up Reminders
            </Typography>

            <ReminderStats reminders={reminders || []} />
            <UpcomingReminders reminders={reminders || []} />
        </Box>
    );
};
