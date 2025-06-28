import { faker } from '@faker-js/faker';
import { Db } from './types';

interface Visit {
    id: string;
    organizationId: number;
    contactId?: number;
    visitDate: string;
    duration: number; // in minutes
    purpose: string;
    notes?: string;
    latitude?: number;
    longitude?: number;
    salesRepId: string;
    createdAt: string;
    updatedAt: string;
}

export const generateVisits = (db: Db): Visit[] => {
    const organizations = db.organizations || [];
    const contacts = db.contacts || [];
    const sales = db.sales || [];

    const purposes = [
        'Sales Call',
        'Product Demo',
        'Follow-up Meeting',
        'Contract Negotiation',
        'Relationship Building',
        'Market Research',
        'Problem Resolution',
        'New Product Introduction',
    ];

    const visits: Visit[] = [];

    // Generate 2-5 visits per organization
    organizations.forEach((org, orgIndex) => {
        const visitCount = faker.number.int({ min: 2, max: 5 });
        const orgContacts = contacts.filter(c => c.company_id === org.id);

        for (let i = 0; i < visitCount; i++) {
            const visitId = `visit_${orgIndex}_${i + 1}`;
            const contact =
                orgContacts.length > 0
                    ? faker.helpers.arrayElement(orgContacts)
                    : undefined;
            const salesRep =
                sales.length > 0
                    ? faker.helpers.arrayElement(sales)
                    : undefined;

            visits.push({
                id: visitId,
                organizationId: org.id,
                contactId: contact?.id,
                visitDate: faker.date.recent({ days: 180 }).toISOString(),
                duration: faker.number.int({ min: 30, max: 180 }),
                purpose: faker.helpers.arrayElement(purposes),
                notes: faker.datatype.boolean()
                    ? faker.lorem.sentences(2)
                    : undefined,
                latitude: org.latitude
                    ? org.latitude + (Math.random() - 0.5) * 0.01
                    : undefined,
                longitude: org.longitude
                    ? org.longitude + (Math.random() - 0.5) * 0.01
                    : undefined,
                salesRepId: salesRep?.id || 'unknown',
                createdAt: faker.date.past({ years: 1 }).toISOString(),
                updatedAt: faker.date.recent({ days: 30 }).toISOString(),
            });
        }
    });

    return visits;
};
