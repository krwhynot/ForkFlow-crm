import React, { useMemo } from 'react';
import {
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    Box,
    Chip,
    Badge,
    Button,
    Divider,
    Stack,
    Avatar,
    IconButton,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Schedule as ScheduleIcon,
    Warning as WarningIcon,
    Assignment as TaskIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Business as BusinessIcon,
    Person as PersonIcon,
    MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { formatDistanceToNow, isAfter, isPast, format } from 'date-fns';
import { useGetList, Link } from 'react-admin';
import { useNavigate } from 'react-router-dom';

import { Reminder, Organization, Contact } from '../types';

interface ReminderWithDetails extends Reminder {
    organization?: Organization;
    contact?: Contact;
    isOverdue: boolean;
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export const FollowUpRemindersWidget = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();

    // Get upcoming and overdue reminders
    const { data: reminders, isPending } = useGetList<Reminder>('reminders', {
        pagination: { page: 1, perPage: 20 },
        sort: { field: 'reminder_date', order: 'ASC' },
        filter: {
            is_completed: false,
        },
    });

    // Get organizations for reference
    const { data: organizations } = useGetList<Organization>('organizations', {
        pagination: { page: 1, perPage: 1000 },
    });

    // Get contacts for reference
    const { data: contacts } = useGetList<Contact>('contacts', {
        pagination: { page: 1, perPage: 1000 },
    });

    const enrichedReminders = useMemo(() => {
        if (!reminders || !organizations || !contacts) return [];

        const now = new Date();

        return reminders
            .map((reminder): ReminderWithDetails => {
                const organization = organizations.find(
                    org => org.id === reminder.customer_id
                );
                const contact = contacts.find(
                    c => c.id === reminder.contact_id
                );
                const reminderDate = new Date(reminder.reminder_date);
                const isOverdue = isPast(reminderDate);

                // Calculate urgency level
                let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' =
                    'low';
                if (isOverdue) {
                    const daysPast = Math.floor(
                        (now.getTime() - reminderDate.getTime()) /
                            (1000 * 60 * 60 * 24)
                    );
                    if (daysPast > 7) urgencyLevel = 'critical';
                    else if (daysPast > 3) urgencyLevel = 'high';
                    else if (daysPast > 1) urgencyLevel = 'medium';
                    else urgencyLevel = 'medium';
                } else {
                    const daysUntil = Math.floor(
                        (reminderDate.getTime() - now.getTime()) /
                            (1000 * 60 * 60 * 24)
                    );
                    if (daysUntil <= 1) urgencyLevel = 'high';
                    else if (daysUntil <= 3) urgencyLevel = 'medium';
                    else urgencyLevel = 'low';
                }

                // Increase urgency based on priority
                if (reminder.priority === 'urgent') urgencyLevel = 'critical';
                else if (reminder.priority === 'high' && urgencyLevel === 'low')
                    urgencyLevel = 'medium';

                return {
                    ...reminder,
                    organization,
                    contact,
                    isOverdue,
                    urgencyLevel,
                };
            })
            .sort((a, b) => {
                // Sort by urgency first, then by date
                const urgencyOrder = {
                    critical: 4,
                    high: 3,
                    medium: 2,
                    low: 1,
                };
                const urgencyDiff =
                    urgencyOrder[b.urgencyLevel] - urgencyOrder[a.urgencyLevel];
                if (urgencyDiff !== 0) return urgencyDiff;

                return (
                    new Date(a.reminder_date).getTime() -
                    new Date(b.reminder_date).getTime()
                );
            })
            .slice(0, isMobile ? 5 : 8); // Show fewer on mobile
    }, [reminders, organizations, contacts, isMobile]);

    const stats = useMemo(() => {
        if (!reminders) return { total: 0, overdue: 0, today: 0, thisWeek: 0 };

        const now = new Date();
        const today = format(now, 'yyyy-MM-dd');
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        return {
            total: reminders.length,
            overdue: reminders.filter(r => isPast(new Date(r.reminder_date)))
                .length,
            today: reminders.filter(
                r => format(new Date(r.reminder_date), 'yyyy-MM-dd') === today
            ).length,
            thisWeek: reminders.filter(r => {
                const reminderDate = new Date(r.reminder_date);
                return reminderDate >= now && reminderDate <= weekFromNow;
            }).length,
        };
    }, [reminders]);

    const getUrgencyColor = (urgencyLevel: string) => {
        switch (urgencyLevel) {
            case 'critical':
                return '#dc2626'; // red-600
            case 'high':
                return '#d97706'; // amber-600
            case 'medium':
                return '#2563eb'; // blue-600
            default:
                return '#16a34a'; // green-600
        }
    };

    const getUrgencyIcon = (reminder: ReminderWithDetails) => {
        if (reminder.urgencyLevel === 'critical' || reminder.isOverdue) {
            return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
        }
        return (
            <ClockIcon
                className={`w-5 h-5 ${reminder.urgencyLevel === 'high' ? 'text-yellow-600' : 'text-blue-600'}`}
            />
        );
    };

    const handleReminderClick = (reminder: ReminderWithDetails) => {
        if (reminder.organization) {
            navigate(`/organizations/${reminder.organization.id}/show`);
        }
    };

    if (isPending) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Follow-up Reminders
                    </Typography>
                    <Typography color="textSecondary">Loading...</Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                >
                    <Typography variant="h6">Follow-up Reminders</Typography>
                    <Link to="/reminders" style={{ textDecoration: 'none' }}>
                        <Button size="small" color="primary">
                            View All
                        </Button>
                    </Link>
                </Box>

                {/* Quick Stats */}
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip
                        size="small"
                        icon={<ExclamationTriangleIcon className="w-4 h-4" />}
                        label={`${stats.overdue} Overdue`}
                        color={stats.overdue > 0 ? 'error' : 'default'}
                        variant={stats.overdue > 0 ? 'filled' : 'outlined'}
                    />
                    <Chip
                        size="small"
                        icon={<ClockIcon className="w-4 h-4" />}
                        label={`${stats.today} Today`}
                        color={stats.today > 0 ? 'warning' : 'default'}
                        variant={stats.today > 0 ? 'filled' : 'outlined'}
                    />
                    <Chip
                        size="small"
                        icon={<DocumentTextIcon className="w-4 h-4" />}
                        label={`${stats.thisWeek} This Week`}
                        color={stats.thisWeek > 0 ? 'info' : 'default'}
                        variant="outlined"
                    />
                </Stack>

                {enrichedReminders.length === 0 ? (
                    <Box textAlign="center" py={3}>
                        <DocumentTextIcon
                            className="w-12 h-12 text-gray-400 mb-1"
                        />
                        <Typography variant="body2" color="textSecondary">
                            No pending follow-ups
                        </Typography>
                    </Box>
                ) : (
                    <List dense={isMobile} sx={{ p: 0 }}>
                        {enrichedReminders.map((reminder, index) => (
                            <React.Fragment key={reminder.id}>
                                <ListItem
                                    button
                                    onClick={() =>
                                        handleReminderClick(reminder)
                                    }
                                    sx={{
                                        borderLeft: `4px solid ${getUrgencyColor(reminder.urgencyLevel)}`,
                                        mb: 1,
                                        borderRadius: 1,
                                        backgroundColor: reminder.isOverdue
                                            ? 'rgba(220, 38, 38, 0.08)' // red-600 with 8% opacity
                                            : 'transparent',
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        {getUrgencyIcon(reminder)}
                                    </ListItemIcon>

                                    <ListItemText
                                        primary={
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                gap={1}
                                            >
                                                <Typography
                                                    variant={
                                                        isMobile
                                                            ? 'body2'
                                                            : 'subtitle2'
                                                    }
                                                    noWrap={isMobile}
                                                >
                                                    {reminder.title}
                                                </Typography>
                                                {reminder.priority ===
                                                    'urgent' && (
                                                    <Chip
                                                        size="small"
                                                        label="URGENT"
                                                        color="error"
                                                    />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Stack spacing={0.5}>
                                                <Box
                                                    display="flex"
                                                    alignItems="center"
                                                    gap={1}
                                                >
                                                    <BuildingOfficeIcon
                                                        className="w-4 h-4"
                                                    />
                                                    <Typography
                                                        variant="caption"
                                                        noWrap={isMobile}
                                                    >
                                                        {reminder.organization
                                                            ?.name ||
                                                            'Unknown Organization'}
                                                    </Typography>
                                                </Box>

                                                {reminder.contact && (
                                                    <Box
                                                        display="flex"
                                                        alignItems="center"
                                                        gap={1}
                                                    >
                                                        <UserIcon
                                                            className="w-4 h-4"
                                                        />
                                                        <Typography
                                                            variant="caption"
                                                            noWrap={isMobile}
                                                        >
                                                            {
                                                                reminder.contact
                                                                    .firstName
                                                            }{' '}
                                                            {
                                                                reminder.contact
                                                                    .lastName
                                                            }
                                                        </Typography>
                                                    </Box>
                                                )}

                                                <Typography
                                                    variant="caption"
                                                    color={
                                                        reminder.isOverdue
                                                            ? 'error'
                                                            : 'textSecondary'
                                                    }
                                                    fontWeight={
                                                        reminder.isOverdue
                                                            ? 'bold'
                                                            : 'normal'
                                                    }
                                                >
                                                    {reminder.isOverdue
                                                        ? 'Overdue by '
                                                        : 'Due '}
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            reminder.reminder_date
                                                        )
                                                    )}
                                                    {!reminder.isOverdue &&
                                                        ' from now'}
                                                </Typography>
                                            </Stack>
                                        }
                                    />

                                    <ListItemSecondaryAction>
                                        <Stack direction="row" spacing={0.5}>
                                            {reminder.organization?.phone && (
                                                <IconButton
                                                    size="small"
                                                    href={`tel:${reminder.organization.phone}`}
                                                    onClick={e =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <PhoneIcon
                                                        className="w-4 h-4"
                                                    />
                                                </IconButton>
                                            )}
                                            {reminder.contact?.email && (
                                                <IconButton
                                                    size="small"
                                                    href={`mailto:${reminder.contact.email}`}
                                                    onClick={e =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <EnvelopeIcon
                                                        className="w-4 h-4"
                                                    />
                                                </IconButton>
                                            )}
                                            <IconButton size="small">
                                                <EllipsisVerticalIcon
                                                    className="w-4 h-4"
                                                />
                                            </IconButton>
                                        </Stack>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {index < enrichedReminders.length - 1 && (
                                    <Divider />
                                )}
                            </React.Fragment>
                        ))}
                    </List>
                )}

                {/* Quick Action Button */}
                <Box mt={2}>
                    <Link
                        to="/reminders/create"
                        style={{ textDecoration: 'none', width: '100%' }}
                    >
                        <Button
                            variant="outlined"
                            fullWidth={isMobile}
                            size="small"
                            startIcon={<DocumentTextIcon className="w-4 h-4" />}
                        >
                            Add Reminder
                        </Button>
                    </Link>
                </Box>
            </CardContent>
        </Card>
    );
};
