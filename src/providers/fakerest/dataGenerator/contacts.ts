import { faker } from '@faker-js/faker';

import {
    defaultContactGender,
    defaultNoteStatuses,
} from '../../../root/defaultConfiguration';
import { Company, Contact } from '../../../types';
import { Db } from './types';
import { randomDate, weightedBoolean } from './utils';

const maxContacts = {
    1: 1,
    10: 4,
    50: 12,
    250: 25,
    500: 50,
};

const getRandomContactDetailsType = () =>
    faker.helpers.arrayElement(['Work', 'Home', 'Other']) as 'Work' | 'Home' | 'Other';

// Utility to safely convert a value to ISO string, fallback to now if invalid
const safeDate = (value: any) => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

export const generateContacts = (db: Db, size = 500): Required<Contact>[] => {
    const nbAvailblePictures = 223;
    let numberOfContacts = 0;

    return Array.from(Array(size).keys()).map(id => {
        const has_avatar =
            weightedBoolean(25) && numberOfContacts < nbAvailblePictures;
        const gender = faker.helpers.arrayElement(defaultContactGender).value;
        const firstName = faker.person.firstName(gender as any);
        const lastName = faker.person.lastName();
        const email = faker.internet.email({ firstName, lastName });
        const phone = faker.phone.number();
        const avatar = {
            src: has_avatar
                ? 'https://marmelab.com/posters/avatar-' +
                (223 - numberOfContacts) +
                '.jpeg'
                : undefined,
        };
        const title = faker.company.buzzAdjective();

        if (has_avatar) {
            numberOfContacts++;
        }

        // choose company with people left to know
        let company: Required<Company>;
        do {
            company = faker.helpers.arrayElement(db.companies);
        } while (company.nb_contacts >= maxContacts[company.size as unknown as keyof typeof maxContacts]);
        company.nb_contacts++;

        const first_seen = safeDate(randomDate(new Date(company.createdAt)));
        const last_seen = first_seen;

        return {
            id,
            firstName,
            lastName,
            fullName: `${faker.person.firstName()} ${faker.person.lastName()}`,
            role: { id: 1, category: 'role', key: 'manager', label: 'Manager', color: '#000', sortOrder: 1, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            influenceLevel: { id: 1, category: 'influence', key: 'high', label: 'High', color: '#000', sortOrder: 1, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            decisionRole: { id: 1, category: 'decision', key: 'decision_maker', label: 'Decision Maker', color: '#000', sortOrder: 1, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            zipcode: company.zipcode,
            gender,
            title: title.charAt(0).toUpperCase() + title.substr(1),
            organizationId: typeof company.id === 'number' ? company.id : Number(company.id),
            email,
            phone,
            background: faker.lorem.sentence(),
            acquisition: faker.helpers.arrayElement(['inbound', 'outbound']),
            avatar,
            first_seen: first_seen,
            last_seen: last_seen,
            createdAt: first_seen, // new schema field
            updatedAt: last_seen, // new schema field
            has_newsletter: weightedBoolean(30),
            status: faker.helpers.arrayElement(defaultNoteStatuses).value,
            tags: faker.helpers.arrayElements(db.tags, faker.helpers.arrayElement([0, 0, 0, 1, 1, 2]))
                .map(tag => tag.id.toString()), // finalize
            salesId: company.salesId || company.broker_id,
            createdBy: (company.salesId || company.broker_id)?.toString(),
            notes: faker.lorem.sentence(),
            nb_tasks: 0,
            linkedin_url: null,
            linkedInUrl: company.linkedin_url ?? '',
            isPrimary: faker.datatype.boolean(),
            // Additional required fields for Contact type compatibility
            roleId: ((id % 4) + 1), // Random role ID 1-4
            influenceLevelId: ((id % 3) + 1), // Random influence level 1-3
            decisionRoleId: ((id % 4) + 1), // Random decision role 1-4
            first_name: firstName,
            last_name: lastName,
            lastInteractionDate: new Date().toISOString(),
            interactionCount: 0,
            organization: {
                id: typeof company.id === 'number' ? company.id : Number(company.id),
                name: company.business_name || company.name,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        };
    });
};
