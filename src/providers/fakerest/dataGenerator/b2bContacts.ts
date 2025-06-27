import { faker } from '@faker-js/faker';
import { Contact } from '../../../types';
import { Db } from './types';
import { weightedBoolean } from './utils';

// Utility to safely convert a value to ISO string, fallback to now if invalid
const safeDate = (value: any) => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

export const generateB2BContacts = (db: Db): Contact[] => {
    const b2bContacts: Contact[] = [];

    // Get settings for relationships (with safety checks)
    const roleSettings = db.settings?.filter(s => s.category === 'role' && s.active) || [];
    const influenceSettings = db.settings?.filter(s => s.category === 'influence' && s.active) || [];
    const decisionSettings = db.settings?.filter(s => s.category === 'decision' && s.active) || [];

    // Create contacts for each organization
    db.organizations?.forEach((org, orgIndex) => {
        // Create 1-4 contacts per organization (more realistic for B2B)
        const contactCount = Math.floor(Math.random() * 4) + 1;

        for (let i = 0; i < contactCount; i++) {
            const contactId = orgIndex * 10 + i + 1;
            const isPrimary = i === 0; // First contact is primary

            // Get random settings with safety checks
            const roleId = roleSettings.length > 0 ? faker.helpers.arrayElement(roleSettings).id : undefined;
            const influenceLevelId = weightedBoolean(0.8) && influenceSettings.length > 0 ? faker.helpers.arrayElement(influenceSettings).id : undefined;
            const decisionRoleId = weightedBoolean(0.7) && decisionSettings.length > 0 ? faker.helpers.arrayElement(decisionSettings).id : undefined;

            // Use more business-appropriate names for food service contacts
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const emailDomain = org.website ? 
                org.website.replace(/^https?:\/\//, '').replace(/^www\./, '') : 
                `${org.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
            const email = weightedBoolean(0.9) ? 
                `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}` : 
                undefined;

            // Generate realistic contact details
            const phone = weightedBoolean(0.8) ? faker.phone.number() : undefined;
            const linkedInUrl = weightedBoolean(0.6) ? 
                `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}` : 
                undefined;

            // Create role-appropriate notes
            const role = roleSettings.find(r => r.id === roleId);
            const influence = influenceSettings.find(i => i.id === influenceLevelId);
            const decision = decisionSettings.find(d => d.id === decisionRoleId);
            
            const noteElements = [
                `${firstName} ${lastName} is a ${role?.label || 'contact'} at ${org.name}.`,
                isPrimary ? 'Primary contact for this organization.' : '',
                influence ? `Has ${influence.label.toLowerCase()} influence in decision making.` : '',
                decision ? `Serves as ${decision.label.toLowerCase()} in the buying process.` : '',
                faker.helpers.arrayElement([
                    'Responsive to communications.',
                    'Prefers email communication.',
                    'Best reached by phone.',
                    'Available during business hours.',
                    'Interested in new product offerings.',
                    'Budget conscious decision maker.',
                    'Values long-term partnerships.',
                    'Focuses on quality over price.'
                ])
            ].filter(Boolean);

            b2bContacts.push({
                id: contactId,
                organizationId: org.id,
                firstName,
                lastName,
                email,
                phone,
                roleId,
                influenceLevelId,
                decisionRoleId,
                linkedInUrl,
                isPrimary,
                notes: noteElements.join(' '),
                createdAt: safeDate(new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)), // Random date within last year
                updatedAt: safeDate(new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)), // Random date within last month
                createdBy: faker.helpers.arrayElement([
                    'john.smith@forkflow.com',
                    'sarah.johnson@forkflow.com',
                    'mike.davis@forkflow.com',
                    'lisa.wilson@forkflow.com'
                ]),
            });
        }
    });

    return b2bContacts;
};