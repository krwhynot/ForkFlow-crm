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
} from '@/components/ui-kit';
import {
    CheckCircleIcon as CompleteIcon,
    CheckCircleIcon,
    ClockIcon as ScheduleIcon,
    ExclamationCircleIcon as HighPriorityIcon,
    MoonIcon as SnoozeIcon,
    ExclamationTriangleIcon as OverdueIcon,
} from '@heroicons/react/24/outline';
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
        const colorMap: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
            low: 'primary',
            medium: 'warning',
            high: 'error',
            urgent: 'error',
        };
        return colorMap[priority] || 'secondary';
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

    const getCardStyles = () => {
        if (record.is_completed) return 'mb-2 cursor-pointer bg-gray-100 opacity-70';
        if (isOverdue) return 'mb-2 cursor-pointer bg-red-50 border-red-200';
        if (isDueToday) return 'mb-2 cursor-pointer bg-yellow-50 border-yellow-200';
        return 'mb-2 cursor-pointer bg-white';
    };

    return (
        <Card className={getCardStyles()}>
            <CardContent className="p-4">
                <Box className="flex justify-between items-start mb-2">
                    <Box className="flex-1">
                        <Typography
                            variant="h6"
                            className={`font-semibold text-base ${
                                record.is_completed ? 'line-through' : ''
                            }`}
                        >
                            {record.title}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                            {record.customer_name ||
                                `Customer #${record.customer_id}`}
                        </Typography>
                    </Box>
                    <Box className="flex gap-2 items-center">
                        <Chip
                            label={record.priority}
                            color={getPriorityColor(record.priority)}
                            size="small"
                        />
                        {record.is_completed && (
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        )}
                        {isOverdue && !record.is_completed && (
                            <OverdueIcon className="w-5 h-5 text-red-600" />
                        )}
                    </Box>
                </Box>

                <Box className="flex items-center mb-2 text-gray-600">
                    <ScheduleIcon className="w-4 h-4 mr-2" />
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
                        className="text-gray-600 mb-2 line-clamp-2"
                    >
                        {record.notes}
                    </Typography>
                )}

                {!record.is_completed && (
                    <Box className="flex gap-2 mt-2">
                        <Button
                            size="small"
                            startIcon={<CompleteIcon className="w-4 h-4" />}
                            onClick={handleComplete}
                            color="success"
                            variant="outlined"
                        >
                            Complete
                        </Button>
                        <Button
                            size="small"
                            startIcon={<SnoozeIcon className="w-4 h-4" />}
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
            <Box className="p-4 text-center">
                <Typography variant="body1" className="text-gray-600">
                    No reminders set yet. Create your first follow-up reminder!
                </Typography>
            </Box>
        );
    }

    return (
        <Box className="p-2">
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
                              : 'primary'
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
                return <Chip label="Pending" color="primary" size="small" />;
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
