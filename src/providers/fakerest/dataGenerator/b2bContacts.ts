import { Contact } from '../../../types';
import { Db } from './types';

// Utility to safely convert a value to ISO string, fallback to now if invalid
const safeDate = (value: any) => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

export const generateB2BContacts = (db: Db): Contact[] => {
    const b2bContacts: Contact[] = [];

    // Create contacts for each organization
    db.organizations?.forEach((org, orgIndex) => {
        // Create 1-3 contacts per organization
        const contactCount = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < contactCount; i++) {
            const contactId = orgIndex * 10 + i + 1;
            const isPrimary = i === 0; // First contact is primary

            // Get a random role, influence, and decision setting
            const roleId = Math.floor(Math.random() * 6) + 13; // Role IDs 13-18
            const influenceLevelId = Math.floor(Math.random() * 3) + 19; // Influence IDs 19-21
            const decisionRoleId = Math.floor(Math.random() * 4) + 22; // Decision IDs 22-25

            const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emily', 'James', 'Maria'];
            const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${org.name.toLowerCase().replace(/\s+/g, '')}.com`;

            b2bContacts.push({
                id: contactId,
                organizationId: org.id,
                firstName,
                lastName,
                email,
                phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
                roleId,
                influenceLevelId,
                decisionRoleId,
                linkedInUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
                isPrimary,
                notes: `${firstName} is a key contact at ${org.name}. ${isPrimary ? 'Primary contact for this organization.' : 'Secondary contact.'}`,
                createdAt: safeDate(new Date()),
                updatedAt: safeDate(new Date()),
                createdBy: 'demo-user',
            });
        }
    });

    return b2bContacts;
};