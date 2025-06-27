import { Organization } from '../../../types';
import { Db } from './types';

// Utility to safely convert a value to ISO string, fallback to now if invalid
const safeDate = (value: any) => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

export const generateOrganizations = (db: Db): Organization[] => {
    // Map existing companies to organizations with B2B schema
    return db.companies.map((company, index) => ({
        id: Number(company.id),
        name: company.business_name || company.name || `Organization ${index + 1}`,
        createdAt: safeDate(company.createdAt || new Date()),
        updatedAt: safeDate(company.updatedAt || new Date()),
    }));
};
