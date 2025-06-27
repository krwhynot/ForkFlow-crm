import React from 'react';
import {
    Filter,
    ReferenceInput,
    SelectInput,
    DateInput,
    TextInput,
    BooleanInput,
} from 'react-admin';

const priorityChoices = [
    { id: 'low', name: 'Low Priority' },
    { id: 'medium', name: 'Medium Priority' },
    { id: 'high', name: 'High Priority' },
    { id: 'urgent', name: 'Urgent' },
];

const statusChoices = [
    { id: 'pending', name: 'Pending' },
    { id: 'overdue', name: 'Overdue' },
    { id: 'due_today', name: 'Due Today' },
    { id: 'completed', name: 'Completed' },
];

export const ReminderListFilter = () => (
    <Filter>
        <ReferenceInput
            source="customer_id"
            reference="customers"
            label="Customer"
            alwaysOn
        >
            <SelectInput optionText="business_name" />
        </ReferenceInput>

        <SelectInput
            source="priority"
            label="Priority"
            choices={priorityChoices}
            alwaysOn
        />

        <BooleanInput
            source="is_completed"
            label="Show Completed"
            defaultValue={false}
        />

        <DateInput source="reminder_date_gte" label="Due From" />

        <DateInput source="reminder_date_lte" label="Due To" />

        <TextInput
            source="title@ilike"
            label="Search Title"
            placeholder="Search reminders..."
        />

        <TextInput
            source="notes@ilike"
            label="Search Notes"
            placeholder="Search in notes..."
        />
    </Filter>
);
