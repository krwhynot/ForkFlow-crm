import { faker } from '@faker-js/faker';

import { defaultTaskTypes } from '../../../root/defaultConfiguration';
import { Task } from '../../../types';
import { Db } from './types';
import { randomDate } from './utils';

type TaskType = (typeof defaultTaskTypes)[number];

export const type: TaskType[] = [
    'Email',
    'Email',
    'Email',
    'Email',
    'Email',
    'Email',
    'Call',
    'Call',
    'Call',
    'Call',
    'Call',
    'Call',
    'Call',
    'Call',
    'Call',
    'Call',
    'Call',
    'Demo',
    'Lunch',
    'Meeting',
    'Follow-up',
    'Follow-up',
    'Thank you',
    'Ship',
    'None',
];

// Utility to safely convert a value to ISO string, fallback to now if invalid
const safeDate = (value: any) => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

export const generateTasks = (db: Db) => {
    return Array.from(Array(400).keys()).map<Task>(id => {
        const contact = faker.helpers.arrayElement(db.contacts);
        contact.nb_tasks++;
        const createdAt = safeDate(
            randomDate(
                faker.datatype.boolean()
                    ? new Date()
                    : new Date(contact.first_seen || contact.createdAt),
                new Date(Date.now() + 100 * 24 * 60 * 60 * 1000)
            )
        );
        return {
            id,
            contact_id: contact.id,
            customer_id: contact.organizationId, // alias for compatibility
            broker_id: contact.salesId || 0, // alias for compatibility
            type: faker.helpers.arrayElement(defaultTaskTypes),
            text: faker.lorem.sentence(),
            title: faker.lorem.sentence(), // alias for compatibility
            notes: faker.lorem.sentence(), // alias for compatibility
            due_date: createdAt,
            reminder_date: createdAt, // alias for compatibility
            done_date: undefined,
            completed_at: undefined, // alias for compatibility
            is_completed: false, // default value
            priority: faker.helpers.arrayElement([
                'low',
                'medium',
                'high',
                'urgent',
            ]) as 'low' | 'medium' | 'high' | 'urgent',
            snooze_count: 0,
            created_at: createdAt,
            createdAt: createdAt, // new schema field
            updatedAt: createdAt,
            salesId: contact.salesId || 0,
        };
    });
};
