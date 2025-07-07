import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Typography
} from '../components/ui-kit';
import {
    ArrowPathIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
    BooleanField,
    CreateButton,
    Datagrid,
    DateField,
    FilterButton,
    FunctionField,
    List,
    ReferenceField,
    TextField,
    TopToolbar,
    useListContext,
    useNotify,
    useUpdate,
} from 'react-admin';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { Reminder } from '../types';
import { ReminderListFilter } from './ReminderListFilter';

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
        return colorMap[priority] || 'primary';
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
            className={`mb-1 cursor-pointer ${record.is_completed
                    ? 'bg-gray-100 opacity-70'
                    : isOverdue
                        ? 'bg-red-50'
                        : isDueToday
                            ? 'bg-yellow-50'
                            : 'bg-white'
                }`}
        >
            <CardContent className="p-4">
                <Box className="flex justify-between items-start mb-1">
                    <Box className="flex-1">
                        <Typography
                            variant="h6"
                            className={`font-semibold text-base ${record.is_completed ? 'line-through' : ''}`}
                        >
                            {record.title}
                        </Typography>
                        <Typography variant="body2" className="text-gray-500">
                            {record.customer_name ||
                                `Customer #${record.customer_id}`}
                        </Typography>
                    </Box>
                    <Box className="flex gap-1 items-center">
                        <Chip
                            label={record.priority}
                            className={
                                getPriorityColor(record.priority) === 'error'
                                    ? 'border-red-500 text-red-500'
                                    : getPriorityColor(record.priority) === 'warning'
                                      ? 'border-yellow-500 text-yellow-500'
                                      : 'border-blue-500 text-blue-500'
                            }
                            size="small"
                            icon={<ExclamationTriangleIcon className="h-4 w-4" />}
                        />
                        {record.is_completed && (
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        )}
                        {isOverdue && !record.is_completed && (
                            <ExclamationCircleIcon className="h-4 w-4 text-red-500" />
                        )}
                    </Box>
                </Box>

                <Box className="flex items-center mb-1 text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
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
                        className="text-gray-500 line-clamp-2 mb-1"
                    >
                        {record.notes}
                    </Typography>
                )}

                {!record.is_completed && (
                    <Box className="flex gap-2 mt-1">
                        <Button
                            size="small"
                            startIcon={<CheckCircleIcon className="h-4 w-4" />}
                            onClick={handleComplete}
                            className="border-green-500 text-green-500"
                            variant="outlined"
                        >
                            Complete
                        </Button>
                        <Button
                            size="small"
                            startIcon={<ArrowPathIcon className="h-4 w-4" />}
                            onClick={handleSnooze}
                            className="border-yellow-500 text-yellow-500"
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
                <Typography variant="body1" className="text-gray-500">
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
                    className={
                        record.priority === 'urgent' ||
                            record.priority === 'high'
                            ? 'border-red-500 text-red-500'
                            : record.priority === 'medium'
                                ? 'border-yellow-500 text-yellow-500'
                                : 'border-blue-500 text-blue-500'
                    }
                    size="small"
                    icon={<ExclamationTriangleIcon className="h-4 w-4" />}
                />
            )}
        />

        <DateField source="reminder_date" label="Due Date" showTime />

        <FunctionField
            label="Status"
            render={(record: Reminder) => {
                if (record.is_completed) {
                    return (
                        <Chip
                            label="Completed"
                            className="border-green-500 text-green-500"
                            size="small"
                            icon={<CheckCircleIcon className="h-4 w-4" />}
                        />
                    );
                }

                const isOverdue = new Date(record.reminder_date) < new Date();
                const isDueToday =
                    new Date(record.reminder_date).toDateString() ===
                    new Date().toDateString();

                if (isOverdue) {
                    return (
                        <Chip
                            label="Overdue"
                            className="border-red-500 text-red-500"
                            size="small"
                            icon={<ExclamationCircleIcon className="h-4 w-4" />}
                        />
                    );
                }
                if (isDueToday) {
                    return (
                        <Chip
                            label="Due Today"
                            className="border-yellow-500 text-yellow-500"
                            size="small"
                            icon={<ClockIcon className="h-4 w-4" />}
                        />
                    );
                }
                return (
                    <Chip
                        label="Pending"
                        className="border-blue-500 text-blue-500"
                        size="small"
                        icon={<ClockIcon className="h-4 w-4" />}
                    />
                );
            }}
        />

        <BooleanField source="is_completed" label="Completed" />

        <TextField
            source="notes"
            label="Notes"
            className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap"
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
