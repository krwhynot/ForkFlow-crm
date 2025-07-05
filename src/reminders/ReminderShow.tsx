import {
    CheckCircleIcon,
    CheckCircleIcon as CompleteIcon,
    ExclamationTriangleIcon as OverdueIcon,
    UserIcon as PersonIcon,
    ExclamationCircleIcon as PriorityIcon,
    ClockIcon as ScheduleIcon,
    MoonIcon as SnoozeIcon,
} from '@heroicons/react/24/outline';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Typography,
} from '@/components/ui-kit';
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

    const getPriorityColor = (priority: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
        const colorMap: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
            low: 'primary',
            medium: 'warning',
            high: 'error',
            urgent: 'error',
        };
        return colorMap[priority] || 'secondary';
    };

    const getStatusColor = (): 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
        if (reminder.is_completed) return 'success';
        if (isOverdue) return 'error';
        if (isDueToday) return 'warning';
        return 'primary';
    };

    const getStatusText = () => {
        if (reminder.is_completed) return 'Completed';
        if (isOverdue) return 'Overdue';
        if (isDueToday) return 'Due Today';
        return 'Pending';
    };

    return (
        <Card className="mb-4">
            <CardContent>
                <Typography variant="h6" className="mb-2">
                    Reminder Status & Actions
                </Typography>

                <Box className="flex gap-2 mb-4 flex-wrap">
                    <Chip
                        label={getStatusText()}
                        color={getStatusColor()}
                        icon={
                            reminder.is_completed ? (
                                <CheckCircleIcon className="w-4 h-4" />
                            ) : isOverdue ? (
                                <OverdueIcon className="w-4 h-4" />
                            ) : (
                                <ScheduleIcon className="w-4 h-4" />
                            )
                        }
                    />
                    <Chip
                        label={`${reminder.priority} Priority`}
                        color={getPriorityColor(reminder.priority)}
                        icon={<PriorityIcon className="w-4 h-4" />}
                        size="small"
                    />
                    {reminder.snooze_count > 0 && (
                        <Chip
                            label={`Snoozed ${reminder.snooze_count} time${reminder.snooze_count > 1 ? 's' : ''}`}
                            color="warning"
                            size="small"
                            icon={<SnoozeIcon className="w-4 h-4" />}
                        />
                    )}
                </Box>

                {isOverdue && !reminder.is_completed && (
                    <Alert severity="error" className="mb-4">
                        <Typography variant="body2">
                            This reminder is overdue! Consider taking action or
                            rescheduling.
                        </Typography>
                    </Alert>
                )}

                {isDueToday && !reminder.is_completed && (
                    <Alert severity="warning" className="mb-4">
                        <Typography variant="body2">
                            This reminder is due today. Don't forget to follow
                            up!
                        </Typography>
                    </Alert>
                )}

                {!reminder.is_completed && (
                    <Box>
                        <Typography variant="subtitle2" className="mb-2">
                            Quick Actions:
                        </Typography>
                        <Box className="flex gap-2 flex-wrap">
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<CompleteIcon className="w-4 h-4" />}
                                onClick={handleComplete}
                            >
                                Mark Complete
                            </Button>
                            <Button
                                variant="outlined"
                                color="warning"
                                startIcon={<SnoozeIcon className="w-4 h-4" />}
                                onClick={() => handleSnooze(2)}
                            >
                                Snooze 2h
                            </Button>
                            <Button
                                variant="outlined"
                                color="warning"
                                startIcon={<SnoozeIcon className="w-4 h-4" />}
                                onClick={() => handleSnooze(24)}
                            >
                                Snooze 1 day
                            </Button>
                        </Box>
                    </Box>
                )}

                {reminder.is_completed && reminder.completed_at && (
                    <Alert severity="success">
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
                <Typography variant="h6" className="mb-2">
                    Reminder Details
                </Typography>

                <Box className="flex items-center mb-4">
                    <PersonIcon className="w-5 h-5 mr-2 text-gray-600" />
                    <Typography variant="body1">
                        Customer:{' '}
                        {reminder.customer_name ||
                            `Customer #${reminder.customer_id}`}
                    </Typography>
                </Box>

                <Typography variant="h5" className="mb-4 font-medium">
                    {reminder.title}
                </Typography>

                <Box className="flex items-center mb-4">
                    <ScheduleIcon className="w-5 h-5 mr-2 text-gray-600" />
                    <Box>
                        <Typography variant="body1">
                            {reminderDateTime.date}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                            at {reminderDateTime.time}
                        </Typography>
                    </Box>
                </Box>

                {(reminder as any).visit_id && (
                    <Typography
                        variant="body2"
                        className="text-gray-600 mb-2"
                    >
                        Related to visit #{(reminder as any).visit_id}
                    </Typography>
                )}

                <Typography variant="body2" className="text-gray-600">
                    Created:{' '}
                    {(reminder as any).created_at 
                        ? new Date((reminder as any).created_at).toLocaleDateString()
                        : 'Unknown'
                    }
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
                    <Typography variant="h6" className="mb-2">
                        Notes
                    </Typography>
                    <Typography className="text-gray-600">
                        No additional notes for this reminder
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" className="mb-2">
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
