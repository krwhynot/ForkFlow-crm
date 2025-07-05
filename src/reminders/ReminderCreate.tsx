import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    Typography,
} from '@/components/ui-kit';
import {
    BellAlertIcon as ReminderIcon,
    ClockIcon as ScheduleIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import {
    Create,
    DateTimeInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextInput,
    useGetIdentity,
    useNotify,
} from 'react-admin';

const priorityChoices = [
    { id: 'low', name: 'Low Priority' },
    { id: 'medium', name: 'Medium Priority' },
    { id: 'high', name: 'High Priority' },
    { id: 'urgent', name: 'Urgent' },
];

const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, any> = {
        low: 'info',
        medium: 'warning',
        high: 'error',
        urgent: 'error',
    };
    return colorMap[priority] || 'primary';
};

const quickReminderTemplates = [
    'Follow up on product presentation',
    'Check on delivery status',
    'Schedule next visit',
    'Send product catalog',
    'Discuss pricing options',
    'Review order requirements',
    'Follow up on payment',
    'Schedule product demo',
];

export const ReminderCreate = () => {
    const { identity } = useGetIdentity();
    const notify = useNotify();
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');

    const transform = (data: any) => {
        const reminderDate = new Date(data.reminder_date);
        const now = new Date();
        if (reminderDate.getHours() === 0 && reminderDate.getMinutes() === 0) {
            reminderDate.setHours(9, 0, 0, 0);
        }
        return {
            ...data,
            broker_id: identity?.id,
            reminder_date: reminderDate.toISOString(),
            is_completed: false,
            snooze_count: 0,
        };
    };

    const handleTemplateSelect = (template: string) => {
        setSelectedTemplate(template);
        notify(
            `Template selected: "${template}". Please copy to the title field.`,
            { type: 'info' }
        );
    };

    return (
        <Create transform={transform} redirect="list">
            <SimpleForm>
                <Box className="w-full mb-4">
                    <Typography variant="h6" gutterBottom>
                        Create Follow-up Reminder
                    </Typography>
                    {/* Quick Templates */}
                    <Card className="mb-4 bg-blue-50 text-blue-900">
                        <CardContent>
                            <Box className="flex items-center mb-2">
                                <ReminderIcon className="h-5 w-5 mr-2" />
                                <Typography variant="subtitle1">
                                    Quick Templates
                                </Typography>
                            </Box>
                            <Typography variant="body2" className="mb-2 opacity-90">
                                Click on a template to use as your reminder title:
                            </Typography>
                            <Box className="flex flex-wrap gap-2">
                                {quickReminderTemplates.map((template, index) => (
                                    <Chip
                                        key={index}
                                        label={template}
                                        onClick={() => handleTemplateSelect(template)}
                                        className="cursor-pointer bg-white/20 text-inherit hover:bg-white/30"
                                        size="small"
                                    />
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                    {/* Reminder Form */}
                    <ReferenceInput
                        source="customer_id"
                        reference="customers"
                        label="Customer"
                        fullWidth
                    >
                        <SelectInput optionText="business_name" fullWidth className="mb-4" />
                    </ReferenceInput>
                    <TextInput
                        source="title"
                        label="Reminder Title"
                        fullWidth
                        className="mb-4"
                        placeholder="What do you need to follow up on?"
                        helperText={selectedTemplate ? `Template: ${selectedTemplate}` : ''}
                    />
                    <SelectInput
                        source="priority"
                        label="Priority Level"
                        choices={priorityChoices}
                        fullWidth
                        className="mb-4"
                        defaultValue="medium"
                    />
                    <DateTimeInput
                        source="reminder_date"
                        label="Reminder Date & Time"
                        fullWidth
                        className="mb-4"
                        defaultValue={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}
                    />
                    <TextInput
                        source="notes"
                        label="Additional Notes"
                        multiline
                        rows={3}
                        fullWidth
                        placeholder="Any additional context or details..."
                        className="mb-4"
                    />
                    {/* Reminder Tips */}
                    <Alert variant="info" className="mt-4">
                        <Box className="flex items-center">
                            <ScheduleIcon className="h-5 w-5 mr-2" />
                            <Typography variant="body2">
                                Set reminders for follow-ups after visits, product demos, or important conversations. You'll be notified on your dashboard when reminders are due.
                            </Typography>
                        </Box>
                    </Alert>
                </Box>
            </SimpleForm>
        </Create>
    );
};
