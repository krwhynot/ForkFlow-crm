import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Typography,
} from '../components/ui-kit';
import {
    ArrowPathIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import {
    DeleteButton,
    EditButton,
    FunctionField,
    Show,
    SimpleShowLayout,
    TopToolbar,
    useNotify,
    useUpdate,
} from 'react-admin';
import { Reminder } from '../types';

const ReminderShowActions = () => (
    <TopToolbar>
        <EditButton />
        <DeleteButton />
    </TopToolbar>
);

const ReminderStatusCard = ({ reminder }: { reminder: Reminder }) => {
    const [update] = useUpdate();
    const notify = useNotify();

    const isOverdue =
        new Date(reminder.reminder_date) < new Date() && !reminder.is_completed;
    const isDueToday =
        new Date(reminder.reminder_date).toDateString() ===
        new Date().toDateString();

    const handleComplete = async () => {
        try {
            await update('reminders', {
                id: reminder.id,
                data: {
                    is_completed: true,
                    completed_at: new Date().toISOString(),
                },
                previousData: reminder,
            });
            notify('Reminder marked as completed', { type: 'success' });
        } catch (error) {
            notify('Error completing reminder', { type: 'error' });
        }
    };

    const handleSnooze = async (hours: number) => {
        const snoozeUntil = new Date();
        snoozeUntil.setHours(snoozeUntil.getHours() + hours);

        try {
            await update('reminders', {
                id: reminder.id,
                data: {
                    snoozed_until: snoozeUntil.toISOString(),
                    snooze_count: (reminder.snooze_count || 0) + 1,
                },
                previousData: reminder,
            });
            notify(
                `Reminder snoozed for ${hours} hour${hours > 1 ? 's' : ''}`,
                { type: 'success' }
            );
        } catch (error) {
            notify('Error snoozing reminder', { type: 'error' });
        }
    };

    const getPriorityColor = (priority: string) => {
        const colorMap: Record<string, any> = {
            low: 'info',
            medium: 'warning',
            high: 'error',
            urgent: 'error',
        };
        return colorMap[priority] || 'primary';
    };

    const getStatusColor = () => {
        if (reminder.is_completed) return 'success';
        if (isOverdue) return 'error';
        if (isDueToday) return 'warning';
        return 'info';
    };

    const getStatusText = () => {
        if (reminder.is_completed) return 'Completed';
        if (isOverdue) return 'Overdue';
        if (isDueToday) return 'Due Today';
        return 'Pending';
    };

    const getStatusIcon = () => {
        if (reminder.is_completed) return <CheckCircleIcon className="h-4 w-4" />;
        if (isOverdue) return <ExclamationCircleIcon className="h-4 w-4" />;
        return <ClockIcon className="h-4 w-4" />;
    };

    return (
        <Card className="mb-4">
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Reminder Status & Actions
                </Typography>

                <Box className="flex gap-2 mb-2 flex-wrap">
                    <Chip
                        label={getStatusText()}
                        className={
                            getStatusColor() === 'success'
                                ? 'border-green-500 text-green-500'
                                : getStatusColor() === 'error'
                                  ? 'border-red-500 text-red-500'
                                  : getStatusColor() === 'warning'
                                    ? 'border-yellow-500 text-yellow-500'
                                    : 'border-blue-500 text-blue-500'
                        }
                        icon={getStatusIcon()}
                        size="small"
                    />
                    <Chip
                        label={`${reminder.priority} Priority`}
                        className={
                            getPriorityColor(reminder.priority) === 'error'
                                ? 'border-red-500 text-red-500'
                                : getPriorityColor(reminder.priority) === 'warning'
                                  ? 'border-yellow-500 text-yellow-500'
                                  : 'border-blue-500 text-blue-500'
                        }
                        icon={<ExclamationTriangleIcon className="h-4 w-4" />}
                        size="small"
                    />
                    {reminder.snooze_count > 0 && (
                        <Chip
                            label={`Snoozed ${reminder.snooze_count} time${reminder.snooze_count > 1 ? 's' : ''}`}
                            className="border-yellow-500 text-yellow-500"
                            size="small"
                            icon={<ArrowPathIcon className="h-4 w-4" />}
                        />
                    )}
                </Box>

                {isOverdue && !reminder.is_completed && (
                    <Alert variant="error" className="mb-2">
                        <Typography variant="body2">
                            This reminder is overdue! Consider taking action or
                            rescheduling.
                        </Typography>
                    </Alert>
                )}

                {isDueToday && !reminder.is_completed && (
                    <Alert variant="warning" className="mb-2">
                        <Typography variant="body2">
                            This reminder is due today. Don't forget to follow
                            up!
                        </Typography>
                    </Alert>
                )}

                {!reminder.is_completed && (
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            Quick Actions:
                        </Typography>
                        <Box className="flex gap-2 flex-wrap">
                            <Button
                                variant="contained"
                                className="bg-green-500 text-white"
                                startIcon={<CheckCircleIcon className="h-4 w-4" />}
                                onClick={handleComplete}
                            >
                                Mark Complete
                            </Button>
                            <Button
                                variant="outlined"
                                className="border-yellow-500 text-yellow-500"
                                startIcon={<ArrowPathIcon className="h-4 w-4" />}
                                onClick={() => handleSnooze(2)}
                            >
                                Snooze 2h
                            </Button>
                            <Button
                                variant="outlined"
                                className="border-yellow-500 text-yellow-500"
                                startIcon={<ArrowPathIcon className="h-4 w-4" />}
                                onClick={() => handleSnooze(24)}
                            >
                                Snooze 1 day
                            </Button>
                        </Box>
                    </Box>
                )}

                {reminder.is_completed && reminder.completed_at && (
                    <Alert variant="success">
                        <Typography variant="body2">
                            Completed on{' '}
                            {new Date(
                                reminder.completed_at
                            ).toLocaleDateString()}{' '}
                            at{' '}
                            {new Date(reminder.completed_at).toLocaleTimeString(
                                [],
                                {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                }
                            )}
                        </Typography>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
};

const ReminderDetailsCard = ({ reminder }: { reminder: Reminder }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
            time: date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };
    };

    const reminderDateTime = formatDate(reminder.reminder_date);

    return (
        <Card className="mb-4">
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Reminder Details
                </Typography>

                <Box className="flex items-center mb-2">
                    <UserIcon className="h-5 w-5 mr-2 text-gray-400" />
                    <Typography variant="body1">
                        Customer:{' '}
                        {reminder.customer_name ||
                            `Customer #${reminder.customer_id}`}
                    </Typography>
                </Box>

                <Typography variant="h5" className="mb-2 font-medium">
                    {reminder.title}
                </Typography>

                <Box className="flex items-center mb-2">
                    <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
                    <Box>
                        <Typography variant="body1">
                            {reminderDateTime.date}
                        </Typography>
                        <Typography variant="body2" className="text-gray-500">
                            at {reminderDateTime.time}
                        </Typography>
                    </Box>
                </Box>

                {reminder.visit_id && (
                    <Typography
                        variant="body2"
                        className="text-gray-500 mb-1"
                    >
                        Related to visit #{reminder.visit_id}
                    </Typography>
                )}

                <Typography variant="body2" className="text-gray-500">
                    Created:{' '}
                    {new Date(reminder.created_at).toLocaleDateString()}
                </Typography>
            </CardContent>
        </Card>
    );
};

const NotesCard = ({ reminder }: { reminder: Reminder }) => {
    if (!reminder.notes) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Notes
                    </Typography>
                    <Typography className="text-gray-500">
                        No additional notes for this reminder
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Notes
                </Typography>
                <Typography variant="body1" className="whitespace-pre-wrap">
                    {reminder.notes}
                </Typography>
            </CardContent>
        </Card>
    );
};

export const ReminderShow = () => (
    <Show actions={<ReminderShowActions />}>
        <SimpleShowLayout>
            <FunctionField
                render={(record: Reminder) => (
                    <Box className="p-4">
                        <ReminderStatusCard reminder={record} />
                        <ReminderDetailsCard reminder={record} />
                        <NotesCard reminder={record} />
                    </Box>
                )}
            />
        </SimpleShowLayout>
    </Show>
);
