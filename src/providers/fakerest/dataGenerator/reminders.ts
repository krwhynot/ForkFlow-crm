import { faker } from '@faker-js/faker';
import { Db } from './types';

interface Reminder {
    id: string;
    title: string;
    description?: string;
    dueDate: string;
    completed: boolean;
    organizationId?: number;
    contactId?: number;
    priority: 'low' | 'medium' | 'high';
    assignedTo: string;
    createdAt: string;
    updatedAt: string;
}

export const generateReminders = (db: Db): Reminder[] => {
    const organizations = db.organizations || [];
    const contacts = db.contacts || [];
    const sales = db.sales || [];

    const reminderTitles = [
        'Follow up on pricing proposal',
        'Schedule product demonstration',
        'Send contract renewal documents',
        'Check inventory requirements',
        'Review quarterly performance',
        'Plan next site visit',
        'Update contact information',
        'Prepare seasonal catalog',
        'Coordinate delivery schedule',
        'Review payment terms',
    ];

    const reminders: Reminder[] = [];

    // Generate 1-3 reminders per organization
    organizations.forEach((org, orgIndex) => {
        const reminderCount = faker.number.int({ min: 1, max: 3 });
        const orgContacts = contacts.filter(c => c.organizationId === org.id);

        for (let i = 0; i < reminderCount; i++) {
            const reminderId = `reminder_${orgIndex}_${i + 1}`;
            const contact =
                orgContacts.length > 0
                    ? faker.helpers.arrayElement(orgContacts)
                    : undefined;
            const salesRep =
                sales.length > 0
                    ? faker.helpers.arrayElement(sales)
                    : undefined;
            const isCompleted = faker.datatype.boolean(0.3); // 30% chance of being completed

            reminders.push({
                id: reminderId,
                title: faker.helpers.arrayElement(reminderTitles),
                description: faker.datatype.boolean()
                    ? faker.lorem.sentence()
                    : undefined,
                dueDate: faker.date.future({ refDate: new Date() }).toISOString(),
                completed: isCompleted,
                organizationId: org.id,
                contactId: contact?.id,
                priority: faker.helpers.arrayElement(['low', 'medium', 'high']),
                assignedTo: String(salesRep?.id || 'unknown'),
                createdAt: faker.date.past({ years: 1 }).toISOString(),
                updatedAt: faker.date.recent({ refDate: new Date() }).toISOString(),
            });
        }
    });

    // Generate some general reminders not tied to organizations
    for (let i = 0; i < 10; i++) {
        const salesRep =
            sales.length > 0 ? faker.helpers.arrayElement(sales) : undefined;

        reminders.push({
            id: `general_reminder_${i + 1}`,
            title: faker.helpers.arrayElement([
                'Team meeting preparation',
                'Monthly sales report',
                'Training session attendance',
                'Market analysis review',
                'Performance evaluation',
            ]),
            description: faker.lorem.sentence(),
            dueDate: faker.date.future({ refDate: new Date() }).toISOString(),
            completed: faker.datatype.boolean(0.2),
            priority: faker.helpers.arrayElement(['low', 'medium', 'high']),
            assignedTo: String(salesRep?.id || 'unknown'),
            createdAt: faker.date.past({ years: 1 }).toISOString(),
            updatedAt: faker.date.recent({ days: 30 }).toISOString(),
        });
    }

    return reminders;
};
