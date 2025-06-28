import { faker } from '@faker-js/faker';
import { randomDate } from './utils';

import { defaultCompanySectors } from '../../../root/defaultConfiguration';
import { Company } from '../../../types';
import { Db } from './types';

const sizes = [1, 10, 50, 250, 500];

const regex = /\W+/;

// Utility to safely convert a value to ISO string, fallback to now if invalid
const safeDate = (value: any) => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

export const generateCompanies = (db: Db, size = 55): Required<Company>[] => {
    return Array.from(Array(size).keys()).map(id => {
        const name = faker.company.name();
        const createdAt = safeDate(randomDate());
        return {
            id,
            business_name: name,
            name: name, // alias for compatibility
            logo: faker.image.avatar(),
            sector: faker.helpers.arrayElement(defaultCompanySectors),
            size: faker.helpers.arrayElement([
                'Very Small',
                'Small',
                'Medium',
                'Big',
                'Very Big',
            ]) as 'Very Small' | 'Small' | 'Medium' | 'Big' | 'Very Big',
            linkedin_url: `https://www.linkedin.com/company/${name
                .toLowerCase()
                .replace(regex, '_')}`,
            website: faker.internet.url(),
            phone_number: faker.phone.number(),
            phone: faker.phone.number(), // alias for compatibility
            email: faker.internet.email(), // required field
            contact_person: faker.person.fullName(),
            address: faker.location.streetAddress(),
            zipcode: faker.location.zipCode(),
            city: faker.location.city(),
            stateAbbr: faker.location.state({ abbreviated: true }),
            nb_contacts: 0,
            nb_deals: 0,
            business_type: faker.helpers.arrayElement([
                'restaurant',
                'grocery',
                'distributor',
                'other',
            ]) as 'restaurant' | 'grocery' | 'distributor' | 'other',
            // at least 1/3rd of companies for Jane Doe
            salesId:
                faker.number.int(2) === 0
                    ? 0
                    : faker.helpers.arrayElement(db.sales).id,
            broker_id:
                faker.number.int(2) === 0
                    ? 0
                    : faker.helpers.arrayElement(db.sales).id, // alias for salesId
            created_at: createdAt,
            createdAt,
            updatedAt: safeDate(randomDate(new Date(createdAt))),
            description: faker.lorem.paragraph(),
            revenue: faker.number.int({ min: 100000, max: 100000000 }),
            tax_identifier: faker.string.alphanumeric(10),
            context_links: [],
            latitude: faker.location.latitude(),
            longitude: faker.location.longitude(),
            notes: faker.lorem.paragraph(),
            // Additional required Customer fields
            total_visits: 0,
            last_visit_date: createdAt,
            last_visit_notes: '',
            visit_status: 'Never visited' as const,
            pending_reminders: 0,
            overdue_reminders: 0,
            // Contact compatibility fields
            first_name: '',
            last_name: '',
            firstName: '',
            lastName: '',
            organizationId: id,
            isPrimary: false,
        };
    });
};
