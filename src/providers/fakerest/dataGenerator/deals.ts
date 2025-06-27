import { faker } from '@faker-js/faker';
import { add } from 'date-fns';

import {
    defaultDealCategories,
    defaultDealStages,
} from '../../../root/defaultConfiguration';
import { Deal } from '../../../types';
import { Db } from './types';
import { randomDate } from './utils';

// Utility to safely convert a value to ISO string, fallback to now if invalid
const safeDate = (value: any) => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

export const generateDeals = (db: Db): Deal[] => {
    const deals = Array.from(Array(50).keys()).map(id => {
        const company = faker.helpers.arrayElement(db.companies);
        company.nb_deals++;
        const contacts = faker.helpers.arrayElements(
            db.contacts.filter(contact => contact.organizationId === company.id),
            faker.number.int({ min: 1, max: 3 })
        );
        const lowercaseName = faker.lorem.words();
        const createdAt = randomDate(
            new Date(company.createdAt)
        ).toISOString();

        const expectedClosingDate = randomDate(
            new Date(createdAt),
            add(new Date(createdAt), { months: 6 })
        ).toISOString();

        return {
            id,
            name: lowercaseName[0].toUpperCase() + lowercaseName.slice(1),
            organizationId: Number(company.id),
            contactId: contacts.length > 0 ? contacts[0].id : undefined,
            stage: faker.helpers.arrayElement(defaultDealStages).value,
            status: faker.helpers.arrayElement(['active', 'won', 'lost', 'on-hold']) as 'active' | 'won' | 'lost' | 'on-hold',
            probability: faker.number.int({ min: 10, max: 90 }),
            amount: faker.number.int(1000) * 100,
            expectedClosingDate,
            description: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 4 })),
            notes: faker.lorem.sentence(),
            index: 0,
            createdAt: createdAt,
            updatedAt: safeDate(randomDate(new Date(createdAt))),
            createdBy: company.salesId?.toString() || company.broker_id?.toString(),
            // Legacy compatibility fields
            customer_id: company.id,
            broker_id: company.salesId || company.broker_id,
            contactIds: contacts.map(contact => contact.id),
            category: faker.helpers.arrayElement(defaultDealCategories),
            total_amount: faker.number.int(1000) * 100,
            subtotal: faker.number.int(1000) * 100 * 0.9,
            tax_amount: faker.number.int(1000) * 100 * 0.1,
            discount_percent: 0,
            commission_rate: 0.05,
            commission_amount: faker.number.int(1000) * 100 * 0.05,
            created_at: createdAt,
            salesId: company.salesId,
            order_date: createdAt,
            products_jsonb: [],
            internal_notes: faker.lorem.sentence(),
            visit_id: undefined,
            expected_delivery_date: undefined,
        };
    });
    // compute index based on stage
    defaultDealStages.forEach(stage => {
        deals
            .filter(deal => deal.stage === stage.value)
            .forEach((deal, index) => {
                deals[deal.id].index = index;
            });
    });
    return deals;
};
