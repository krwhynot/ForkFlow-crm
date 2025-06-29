import { faker } from '@faker-js/faker';
import { Db } from './types';

interface CustomerSummary {
    id: string;
    organizationId: number;
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    lastOrderDate: string;
    createdAt: string;
    updatedAt: string;
}

export const generateCustomerSummary = (db: Db): CustomerSummary[] => {
    const organizations = db.organizations || [];

    return organizations.map((org, index) => {
        const totalOrders = faker.number.int({ min: 5, max: 150 });
        const totalRevenue = faker.number.float({
            min: 1000,
            max: 500000,
            fractionDigits: 2,
        });
        const averageOrderValue = totalRevenue / totalOrders;

        return {
            id: `cs_${index + 1}`,
            organizationId: org.id,
            totalRevenue,
            totalOrders,
            averageOrderValue,
            lastOrderDate: faker.date.recent({ days: 90 }).toISOString(),
            createdAt: faker.date.past({ years: 1 }).toISOString(),
            updatedAt: faker.date.recent({ days: 30 }).toISOString(),
        };
    });
};
