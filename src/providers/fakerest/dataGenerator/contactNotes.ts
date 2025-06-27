import { faker } from '@faker-js/faker';

import { defaultNoteStatuses } from '../../../root/defaultConfiguration';
import { ContactNote } from '../../../types';
import { Db } from './types';
import { randomDate } from './utils';

// Utility to safely convert a value to ISO string, fallback to now if invalid
const safeDate = (value: any) => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

export const generateContactNotes = (db: Db): ContactNote[] => {
    return Array.from(Array(1200).keys()).map(id => {
        const contact = faker.helpers.arrayElement(db.contacts);
        const date = randomDate(new Date(contact.first_seen || contact.createdAt));
        contact.last_seen =
            date > new Date(contact.last_seen || contact.createdAt)
                ? safeDate(date)
                : contact.last_seen;
        return {
            id,
            contactId: contact.id,
            organizationId: contact.organizationId,
            content: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 4 })),
            subject: `Contact Note ${id}`,
            status: faker.helpers.arrayElement(defaultNoteStatuses).value,
            createdAt: safeDate(date),
            updatedAt: safeDate(date),
            createdBy: contact.salesId?.toString(),
            // Legacy compatibility fields
            customer_id: contact.organizationId,
            broker_id: contact.salesId || 0,
            reminder_date: safeDate(date),
            completed_at: null,
            is_completed: false,
            title: `Contact Note ${id}`,
            notes: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 4 })),
            priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']) as 'low' | 'medium' | 'high' | 'urgent',
            visit_id: null,
            snoozed_until: null,
            snooze_count: 0,
            created_at: safeDate(date),
            salesId: contact.salesId,
            contact_id: contact.id,
            text: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 4 })),
            attachments: [],
        };
    });
};
