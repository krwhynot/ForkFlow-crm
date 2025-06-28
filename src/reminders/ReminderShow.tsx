import {
    CheckCircle,
    CheckCircle as CompleteIcon,
    WarningAmber as OverdueIcon,
    Person as PersonIcon,
    PriorityHigh as PriorityIcon,
    Schedule as ScheduleIcon,
    Snooze as SnoozeIcon,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Typography,
} from '@mui/material';
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
        return colorMap[priority] || 'default';
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

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Reminder Status & Actions
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                        label={getStatusText()}
                        color={getStatusColor()}
                        icon={
                            reminder.is_completed ? (
                                <CheckCircle />
                            ) : isOverdue ? (
                                <OverdueIcon />
                            ) : (
                                <ScheduleIcon />
                            )
                        }
                    />
                    <Chip
                        label={`${reminder.priority} Priority`}
                        color={getPriorityColor(reminder.priority)}
                        icon={<PriorityIcon />}
                        size="small"
                    />
                    {reminder.snooze_count > 0 && (
                        <Chip
                            label={`Snoozed ${reminder.snooze_count} time${reminder.snooze_count > 1 ? 's' : ''}`}
                            color="warning"
                            size="small"
                            icon={<SnoozeIcon />}
                        />
                    )}
                </Box>

                {isOverdue && !reminder.is_completed && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            This reminder is overdue! Consider taking action or
                            rescheduling.
                        </Typography>
                    </Alert>
                )}

                {isDueToday && !reminder.is_completed && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
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
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<CompleteIcon />}
                                onClick={handleComplete}
                            >
                                Mark Complete
                            </Button>
                            <Button
                                variant="outlined"
                                color="warning"
                                startIcon={<SnoozeIcon />}
                                onClick={() => handleSnooze(2)}
                            >
                                Snooze 2h
                            </Button>
                            <Button
                                variant="outlined"
                                color="warning"
                                startIcon={<SnoozeIcon />}
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
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Reminder Details
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                        Customer:{' '}
                        {reminder.customer_name ||
                            `Customer #${reminder.customer_id}`}
                    </Typography>
                </Box>

                <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
                    {reminder.title}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                        <Typography variant="body1">
                            {reminderDateTime.date}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            at {reminderDateTime.time}
                        </Typography>
                    </Box>
                </Box>

                {reminder.visit_id && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                    >
                        Related to visit #{reminder.visit_id}
                    </Typography>
                )}

                <Typography variant="body2" color="text.secondary">
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
                    <Typography color="text.secondary">
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
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
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
                    <Box sx={{ p: 2 }}>
                        <ReminderStatusCard reminder={record} />
                        <ReminderDetailsCard reminder={record} />
                        <NotesCard reminder={record} />
                    </Box>
                )}
            />
        </SimpleShowLayout>
    </Show>
);
