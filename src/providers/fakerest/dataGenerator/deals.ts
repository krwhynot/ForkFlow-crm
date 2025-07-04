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
    // Get stage settings for proper B2B relationship schema
    const stageSettings =
        db.settings?.filter(s => s.category === 'stage') || [];
    const stageMappings = {
        lead_discovery:
            stageSettings.find(s => s.key === 'lead_discovery')?.id || 37,
        contacted: stageSettings.find(s => s.key === 'contacted')?.id || 38,
        sampled_visited:
            stageSettings.find(s => s.key === 'sampled_visited')?.id || 39,
        follow_up: stageSettings.find(s => s.key === 'follow_up')?.id || 40,
        close: stageSettings.find(s => s.key === 'close')?.id || 41,
    };

    const deals = Array.from(Array(50).keys()).map(id => {
        // Use B2B organizations instead of legacy companies
        const organization = faker.helpers.arrayElement(
            (db.organizations || db.companies || []) as any[]
        );
        if (organization) {
            // Track deal count (legacy compatibility)
            (organization as any).nb_deals =
                ((organization as any).nb_deals || 0) + 1;
        }

        // Get related contacts from the organization
        const contacts =
            db.contacts?.filter(
                contact => contact.organizationId === organization.id
            ) || [];
        const selectedContact =
            contacts.length > 0
                ? faker.helpers.arrayElement(contacts)
                : undefined;

        // Get random product for the deal
        const product =
            (db.products?.length || 0) > 0
                ? faker.helpers.arrayElement(db.products || [])
                : undefined;

        // Select stage with proper B2B relationship
        const stageKeys = Object.keys(stageMappings);
        const selectedStageKey = faker.helpers.arrayElement(stageKeys);
        const stageId =
            stageMappings[selectedStageKey as keyof typeof stageMappings];
        const stageSetting = stageSettings.find(s => s.id === stageId);

        const lowercaseName = faker.lorem.words();
        const createdAt = randomDate(
            new Date(organization.createdAt || new Date())
        ).toISOString();

        const expectedClosingDate = randomDate(
            new Date(createdAt),
            add(new Date(createdAt), { months: 6 })
        ).toISOString();

        // Calculate probability based on stage
        const probabilityByStage = {
            lead_discovery: faker.number.int({ min: 10, max: 25 }),
            contacted: faker.number.int({ min: 20, max: 40 }),
            sampled_visited: faker.number.int({ min: 40, max: 70 }),
            follow_up: faker.number.int({ min: 60, max: 85 }),
            close: faker.number.int({ min: 80, max: 95 }),
        };

        return {
            id,
            name: lowercaseName[0].toUpperCase() + lowercaseName.slice(1),
            organizationId: Number(organization.id),
            contactId: selectedContact?.id,
            productId: product?.id,
            stageId: stageId,
            stage: stageSetting?.key || selectedStageKey, // Fallback to key if setting not found
            status: faker.helpers.arrayElement([
                'active',
                'won',
                'lost',
                'on-hold',
            ]) as 'active' | 'won' | 'lost' | 'on-hold',
            probability:
                probabilityByStage[
                    selectedStageKey as keyof typeof probabilityByStage
                ] || faker.number.int({ min: 10, max: 90 }),
            amount: faker.number.int({ min: 1000, max: 50000 }),
            expectedClosingDate,
            description: faker.lorem.paragraphs(
                faker.number.int({ min: 1, max: 4 })
            ),
            notes: faker.lorem.sentence(),
            index: 0,
            createdAt: createdAt,
            updatedAt: safeDate(randomDate(new Date(createdAt))),
            createdBy:
                organization.accountManager?.toString() ||
                organization.distributorId?.toString() ||
                '1',

            // Legacy compatibility fields
            customer_id: organization.id,
            broker_id: organization.distributorId || 1,
            contactIds: selectedContact ? [selectedContact.id] : [],
            category: faker.helpers.arrayElement(defaultDealCategories),
            total_amount: faker.number.int({ min: 1000, max: 50000 }),
            subtotal: faker.number.int({ min: 900, max: 45000 }),
            tax_amount: faker.number.int({ min: 100, max: 5000 }),
            discount_percent: 0,
            commission_rate: 0.05,
            commission_amount: faker.number.int({ min: 50, max: 2500 }),
            created_at: createdAt,
            salesId: organization.salesId || 1,
            order_date: createdAt,
            products_jsonb: [],
            internal_notes: faker.lorem.sentence(),
            visit_id: undefined,
            expected_delivery_date: undefined,
        };
    });

    // Compute index based on stage for kanban ordering
    const stageKeys = Object.keys(stageMappings);
    stageKeys.forEach((stageKey: string) => {
        const stageId = stageMappings[stageKey as keyof typeof stageMappings];
        deals
            .filter(deal => deal.stageId === stageId)
            .forEach((deal, index) => {
                deals[deal.id].index = index;
            });
    });

    return deals;
};
