import { faker } from '@faker-js/faker';
import { add, sub } from 'date-fns';

import { Interaction } from '../../../types';
import { Db } from './types';
import { randomDate } from './utils';

// Utility to safely convert a value to ISO string, fallback to now if invalid
const safeDate = (value: any) => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

export const generateInteractions = (db: Db): Interaction[] => {
    // Get interaction type settings for proper B2B relationship schema
    const interactionTypeSettings =
        db.settings?.filter(s => s.category === 'interaction_type') || [];
    const typeMapping = {
        email: interactionTypeSettings.find(s => s.key === 'email')?.id || 42,
        call: interactionTypeSettings.find(s => s.key === 'call')?.id || 43,
        in_person:
            interactionTypeSettings.find(s => s.key === 'in_person')?.id || 44,
        demo: interactionTypeSettings.find(s => s.key === 'demo')?.id || 45,
        quote: interactionTypeSettings.find(s => s.key === 'quote')?.id || 46,
        follow_up:
            interactionTypeSettings.find(s => s.key === 'follow_up')?.id || 47,
    };

    const interactions: Interaction[] = [];

    // Generate 200+ interactions across all organizations for rich data
    const totalInteractions = 250;

    for (let id = 0; id < totalInteractions; id++) {
        // Select organization and related entities
        const organization = faker.helpers.arrayElement(
            (db.organizations || db.companies || []) as any[]
        );
        const contacts =
            db.contacts?.filter(
                contact => contact.organizationId === organization.id
            ) || [];
        const selectedContact =
            contacts.length > 0
                ? faker.helpers.arrayElement(contacts)
                : undefined;
        const opportunities =
            db.deals?.filter(deal => deal.organizationId === organization.id) ||
            [];
        const selectedOpportunity =
            opportunities.length > 0 && faker.datatype.boolean(0.4)
                ? faker.helpers.arrayElement(opportunities)
                : undefined;

        // Select interaction type
        const typeKeys = Object.keys(typeMapping);
        const selectedTypeKey = faker.helpers.arrayElement(typeKeys);
        const typeId = typeMapping[selectedTypeKey as keyof typeof typeMapping];
        const typeSetting = interactionTypeSettings.find(s => s.id === typeId);

        // Generate dates - most interactions in the last 90 days
        const baseDate = sub(new Date(), {
            days: faker.number.int({ min: 0, max: 90 }),
        });
        const scheduledDate = baseDate.toISOString();

        // Determine if completed and completion date
        const isCompleted = faker.datatype.boolean(0.8); // 80% of interactions are completed
        const completedDate = isCompleted
            ? randomDate(
                  new Date(scheduledDate),
                  add(new Date(scheduledDate), { days: 7 })
              ).toISOString()
            : undefined;

        // Generate GPS coordinates for in-person interactions
        const hasLocation =
            selectedTypeKey === 'in_person' || selectedTypeKey === 'demo';
        const latitude =
            hasLocation && organization.latitude
                ? organization.latitude +
                  faker.number.float({ min: -0.001, max: 0.001 })
                : undefined;
        const longitude =
            hasLocation && organization.longitude
                ? organization.longitude +
                  faker.number.float({ min: -0.001, max: 0.001 })
                : undefined;

        // Generate interaction-specific content
        const subjects = {
            email: [
                'Product inquiry',
                'Quote request',
                'Follow-up on visit',
                'New product introduction',
                'Order confirmation',
            ],
            call: [
                'Check-in call',
                'Quote discussion',
                'Order follow-up',
                'Product consultation',
                'Scheduling visit',
            ],
            in_person: [
                'Site visit',
                'Product presentation',
                'Menu planning session',
                'Kitchen assessment',
                'Tasting session',
            ],
            demo: [
                'Product demonstration',
                'Sample delivery',
                'Kitchen equipment demo',
                'Menu item testing',
                'Chef training',
            ],
            quote: [
                'Pricing proposal',
                'Volume discount quote',
                'Custom product quote',
                'Contract renewal',
                'Special pricing',
            ],
            follow_up: [
                'Post-visit follow-up',
                'Quote follow-up',
                'Sample feedback',
                'Decision timeline',
                'Next steps',
            ],
        };

        const subject = faker.helpers.arrayElement(
            subjects[selectedTypeKey as keyof typeof subjects]
        );

        // Generate follow-up requirements
        const followUpRequired = !isCompleted || faker.datatype.boolean(0.3);
        const followUpDate = followUpRequired
            ? add(new Date(completedDate || scheduledDate), {
                  days: faker.number.int({ min: 1, max: 14 }),
              }).toISOString()
            : undefined;

        const interaction: Interaction = {
            id,
            organizationId: organization.id,
            contactId: selectedContact?.id,
            opportunityId: selectedOpportunity?.id,
            typeId: typeId,
            subject: subject,
            description: faker.lorem.paragraphs(
                faker.number.int({ min: 1, max: 3 })
            ),
            scheduledDate: scheduledDate,
            completedDate: completedDate,
            isCompleted: isCompleted,
            duration: isCompleted
                ? faker.number.int({ min: 15, max: 120 })
                : undefined, // Duration in minutes
            outcome: isCompleted ? faker.lorem.sentence() : undefined,
            followUpRequired: followUpRequired,
            followUpDate: followUpDate,
            followUpNotes: followUpRequired
                ? faker.lorem.sentence()
                : undefined,
            latitude: latitude,
            longitude: longitude,
            locationNotes: hasLocation
                ? `${organization.name} location`
                : undefined,
            attachments: faker.datatype.boolean(0.2)
                ? [`document_${id}.pdf`]
                : undefined,
            createdAt: scheduledDate,
            updatedAt: safeDate(randomDate(new Date(scheduledDate))),
            createdBy:
                organization.accountManager?.toString() ||
                organization.distributorId?.toString() ||
                '1',
        };

        interactions.push(interaction);
    }

    return interactions.sort(
        (a, b) =>
            new Date(b.scheduledDate || b.createdAt).getTime() -
            new Date(a.scheduledDate || a.createdAt).getTime()
    );
};
