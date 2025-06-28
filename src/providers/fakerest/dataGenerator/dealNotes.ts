import { faker } from '@faker-js/faker';

import { DealNote } from '../../../types';
import { Db } from './types';
import { randomDate } from './utils';

// Utility to safely convert a value to ISO string, fallback to now if invalid
const safeDate = (value: any) => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

export const generateDealNotes = (db: Db): DealNote[] => {
    return Array.from(Array(300).keys()).map(id => {
        const deal = faker.helpers.arrayElement(db.deals);
        const date = randomDate(new Date(deal.createdAt));
        return {
            id,
            dealId: deal.id,
            organizationId: deal.organizationId,
            content: faker.lorem.paragraphs(
                faker.number.int({ min: 1, max: 4 })
            ),
            subject: `Deal Note ${id}`,
            status: 'published',
            createdAt: safeDate(date),
            updatedAt: safeDate(date),
            createdBy: deal.createdBy?.toString(),
            // Legacy compatibility fields
            deal_id: deal.id,
            text: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 4 })),
            date: safeDate(date),
            salesId: deal.createdBy,
            customer_id: deal.organizationId,
            broker_id: deal.createdBy,
            order_date: safeDate(date),
            notes: faker.lorem.sentence(),
            internal_notes: faker.lorem.sentence(),
            name: deal.name,
            attachments: [],
        };
    });
};
