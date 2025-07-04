import React, { useState } from 'react';
import {
    Create,
    SimpleForm,
    ReferenceInput,
    SelectInput,
    TextInput,
    DateTimeInput,
    useNotify,
    useGetIdentity,
} from 'react-admin';
import { Card, CardContent, Typography, Box, Chip, Alert } from '@mui/material';
import {
    NotificationsActive as ReminderIcon,
    Schedule as ScheduleIcon,
    PriorityHigh as HighPriorityIcon,
} from '@mui/icons-material';

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
    return colorMap[priority] || 'default';
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

        // Set default time to 9 AM if only date is provided
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
        // This would ideally update the form field, but react-admin doesn't expose form methods easily
        notify(
            `Template selected: "${template}". Please copy to the title field.`,
            { type: 'info' }
        );
    };

    return (
        <Create transform={transform} redirect="list">
            <SimpleForm>
                <Box sx={{ width: '100%', mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Create Follow-up Reminder
                    </Typography>

                    {/* Quick Templates */}
                    <Card
                        sx={{
                            mb: 2,
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText',
                        }}
                    >
                        <CardContent>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 1,
                                }}
                            >
                                <ReminderIcon sx={{ mr: 1 }} />
                                <Typography variant="subtitle1">
                                    Quick Templates
                                </Typography>
                            </Box>
                            <Typography
                                variant="body2"
                                sx={{ mb: 2, opacity: 0.9 }}
                            >
                                Click on a template to use as your reminder
                                title:
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 1,
                                }}
                            >
                                {quickReminderTemplates.map(
                                    (template, index) => (
                                        <Chip
                                            key={index}
                                            label={template}
                                            onClick={() =>
                                                handleTemplateSelect(template)
                                            }
                                            sx={{
                                                cursor: 'pointer',
                                                bgcolor:
                                                    'rgba(255,255,255,0.2)',
                                                color: 'inherit',
                                                '&:hover': {
                                                    bgcolor:
                                                        'rgba(255,255,255,0.3)',
                                                },
                                            }}
                                            size="small"
                                        />
                                    )
                                )}
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
                        <SelectInput
                            optionText="business_name"
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                    </ReferenceInput>

                    <TextInput
                        source="title"
                        label="Reminder Title"
                        fullWidth
                        sx={{ mb: 2 }}
                        placeholder="What do you need to follow up on?"
                        helperText={
                            selectedTemplate
                                ? `Template: ${selectedTemplate}`
                                : ''
                        }
                    />

                    <SelectInput
                        source="priority"
                        label="Priority Level"
                        choices={priorityChoices}
                        fullWidth
                        sx={{ mb: 2 }}
                        defaultValue="medium"
                    />

                    <DateTimeInput
                        source="reminder_date"
                        label="Reminder Date & Time"
                        fullWidth
                        sx={{ mb: 2 }}
                        defaultValue={new Date(
                            Date.now() + 24 * 60 * 60 * 1000
                        ).toISOString()} // Tomorrow
                    />

                    <TextInput
                        source="notes"
                        label="Additional Notes"
                        multiline
                        rows={3}
                        fullWidth
                        placeholder="Any additional context or details..."
                        sx={{ mb: 2 }}
                    />

                    {/* Reminder Tips */}
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ScheduleIcon sx={{ mr: 1 }} />
                            <Typography variant="body2">
                                Set reminders for follow-ups after visits,
                                product demos, or important conversations.
                                You'll be notified on your dashboard when
                                reminders are due.
                            </Typography>
                        </Box>
                    </Alert>
                </Box>
            </SimpleForm>
        </Create>
    );
};
