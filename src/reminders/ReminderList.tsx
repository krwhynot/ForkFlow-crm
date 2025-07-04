import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    DateField,
    ReferenceField,
    FunctionField,
    BooleanField,
    useListContext,
    TopToolbar,
    CreateButton,
    FilterButton,
    useUpdate,
    useNotify,
} from 'react-admin';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    IconButton,
    Button,
} from '@mui/material';
import {
    CheckCircle as CompleteIcon,
    CheckCircle,
    Schedule as ScheduleIcon,
    PriorityHigh as HighPriorityIcon,
    Snooze as SnoozeIcon,
    WarningAmber as OverdueIcon,
} from '@mui/icons-material';
import { ReminderListFilter } from './ReminderListFilter';
import { Reminder } from '../types';
import { useBreakpoint } from '../hooks/useBreakpoint';

const ReminderListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton label="Add Reminder" />
    </TopToolbar>
);

const MobileReminderCard = ({ record }: { record: Reminder }) => {
    const [update] = useUpdate();
    const notify = useNotify();

    const isOverdue =
        new Date(record.reminder_date) < new Date() && !record.is_completed;
    const isDueToday =
        new Date(record.reminder_date).toDateString() ===
        new Date().toDateString();

    const getPriorityColor = (priority: string) => {
        const colorMap: Record<string, any> = {
            low: 'info',
            medium: 'warning',
            high: 'error',
            urgent: 'error',
        };
        return colorMap[priority] || 'default';
    };

    const handleComplete = async () => {
        try {
            await update('reminders', {
                id: record.id,
                data: {
                    is_completed: true,
                    completed_at: new Date().toISOString(),
                },
                previousData: record,
            });
            notify('Reminder marked as completed', { type: 'success' });
        } catch (error) {
            notify('Error completing reminder', { type: 'error' });
        }
    };

    const handleSnooze = async () => {
        const snoozeUntil = new Date();
        snoozeUntil.setHours(snoozeUntil.getHours() + 2); // Snooze for 2 hours

        try {
            await update('reminders', {
                id: record.id,
                data: {
                    snoozed_until: snoozeUntil.toISOString(),
                    snooze_count: (record.snooze_count || 0) + 1,
                },
                previousData: record,
            });
            notify('Reminder snoozed for 2 hours', { type: 'success' });
        } catch (error) {
            notify('Error snoozing reminder', { type: 'error' });
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();

        if (date.toDateString() === now.toDateString()) {
            return `Today at ${date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            })}`;
        }

        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (date.toDateString() === tomorrow.toDateString()) {
            return `Tomorrow at ${date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            })}`;
        }

        return (
            date.toLocaleDateString() +
            ' at ' +
            date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            })
        );
    };

    return (
        <Card
            sx={{
                mb: 1,
                cursor: 'pointer',
                bgcolor: record.is_completed
                    ? 'grey.100'
                    : isOverdue
                      ? 'error.light'
                      : isDueToday
                        ? 'warning.light'
                        : 'background.paper',
                opacity: record.is_completed ? 0.7 : 1,
            }}
        >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 1,
                    }}
                >
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 600,
                                fontSize: '1rem',
                                textDecoration: record.is_completed
                                    ? 'line-through'
                                    : 'none',
                            }}
                        >
                            {record.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {record.customer_name ||
                                `Customer #${record.customer_id}`}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 0.5,
                            alignItems: 'center',
                        }}
                    >
                        <Chip
                            label={record.priority}
                            color={getPriorityColor(record.priority)}
                            size="small"
                        />
                        {record.is_completed && (
                            <CheckCircle color="success" fontSize="small" />
                        )}
                        {isOverdue && !record.is_completed && (
                            <OverdueIcon color="error" fontSize="small" />
                        )}
                    </Box>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1,
                        color: 'text.secondary',
                    }}
                >
                    <ScheduleIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                        {formatDate(record.reminder_date)}
                        {record.snooze_count > 0 && (
                            <span>
                                {' '}
                                • Snoozed {record.snooze_count} time
                                {record.snooze_count > 1 ? 's' : ''}
                            </span>
                        )}
                    </Typography>
                </Box>

                {record.notes && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 1,
                        }}
                    >
                        {record.notes}
                    </Typography>
                )}

                {!record.is_completed && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button
                            size="small"
                            startIcon={<CompleteIcon />}
                            onClick={handleComplete}
                            color="success"
                            variant="outlined"
                        >
                            Complete
                        </Button>
                        <Button
                            size="small"
                            startIcon={<SnoozeIcon />}
                            onClick={handleSnooze}
                            color="warning"
                            variant="outlined"
                        >
                            Snooze
                        </Button>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

const MobileReminderList = () => {
    const { data: reminders } = useListContext<Reminder>();

    if (!reminders?.length) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    No reminders set yet. Create your first follow-up reminder!
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 1 }}>
            {reminders.map(reminder => (
                <MobileReminderCard key={reminder.id} record={reminder} />
            ))}
        </Box>
    );
};

const DesktopReminderList = () => (
    <Datagrid>
        <ReferenceField
            source="customer_id"
            reference="customers"
            label="Customer"
            link="show"
        >
            <TextField source="business_name" />
        </ReferenceField>

        <TextField source="title" label="Reminder" />

        <FunctionField
            label="Priority"
            render={(record: Reminder) => (
                <Chip
                    label={record.priority}
                    color={
                        record.priority === 'urgent' ||
                        record.priority === 'high'
                            ? 'error'
                            : record.priority === 'medium'
                              ? 'warning'
                              : 'info'
                    }
                    size="small"
                />
            )}
        />

        <DateField source="reminder_date" label="Due Date" showTime />

        <FunctionField
            label="Status"
            render={(record: Reminder) => {
                if (record.is_completed) {
                    return (
                        <Chip label="Completed" color="success" size="small" />
                    );
                }

                const isOverdue = new Date(record.reminder_date) < new Date();
                const isDueToday =
                    new Date(record.reminder_date).toDateString() ===
                    new Date().toDateString();

                if (isOverdue) {
                    return <Chip label="Overdue" color="error" size="small" />;
                }
                if (isDueToday) {
                    return (
                        <Chip label="Due Today" color="warning" size="small" />
                    );
                }
                return <Chip label="Pending" color="info" size="small" />;
            }}
        />

        <BooleanField source="is_completed" label="Completed" />

        <TextField
            source="notes"
            label="Notes"
            sx={{
                maxWidth: 200,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}
        />
    </Datagrid>
);

export const ReminderList = () => {
    const isSmall = useBreakpoint('md');

    return (
        <List
            filters={<ReminderListFilter />}
            actions={<ReminderListActions />}
            perPage={25}
            sort={{ field: 'reminder_date', order: 'ASC' }}
        >
            {isSmall ? <MobileReminderList /> : <DesktopReminderList />}
        </List>
    );
};
