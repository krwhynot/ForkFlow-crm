import React from 'react';
import {
    Filter,
    ReferenceInput,
    SelectInput,
    DateInput,
    TextInput,
} from 'react-admin';

const visitTypeChoices = [
    { id: 'sales_call', name: 'Sales Call' },
    { id: 'follow_up', name: 'Follow-up' },
    { id: 'delivery', name: 'Delivery' },
    { id: 'service_call', name: 'Service Call' },
    { id: 'other', name: 'Other' },
];

export const VisitListFilter = () => (
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
            source="visit_type"
            label="Visit Type"
            choices={visitTypeChoices}
            alwaysOn
        />

        <DateInput source="visit_date_gte" label="From Date" />

        <DateInput source="visit_date_lte" label="To Date" />

        <TextInput
            source="notes@ilike"
            label="Search Notes"
            placeholder="Search in visit notes..."
        />
    </Filter>
);
