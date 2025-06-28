import { faker } from '@faker-js/faker';
import { Db } from './types';

interface Order {
    id: string;
    organizationId: number;
    contactId?: number;
    orderNumber: string;
    orderDate: string;
    deliveryDate?: string;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    totalAmount: number;
    currency: string;
    items: OrderItem[];
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

interface OrderItem {
    id: string;
    productId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export const generateOrders = (db: Db): Order[] => {
    const organizations = db.organizations || [];
    const contacts = db.contacts || [];
    const products = db.products || [];

    const statuses: Order['status'][] = [
        'pending',
        'confirmed',
        'shipped',
        'delivered',
        'cancelled',
    ];
    const orders: Order[] = [];

    // Generate 3-8 orders per organization
    organizations.forEach((org, orgIndex) => {
        const orderCount = faker.number.int({ min: 3, max: 8 });
        const orgContacts = contacts.filter(c => c.company_id === org.id);

        for (let i = 0; i < orderCount; i++) {
            const orderId = `order_${orgIndex}_${i + 1}`;
            const orderNumber = `ORD-${String(orgIndex + 1).padStart(3, '0')}-${String(i + 1).padStart(4, '0')}`;
            const contact =
                orgContacts.length > 0
                    ? faker.helpers.arrayElement(orgContacts)
                    : undefined;
            const orderDate = faker.date.recent({ days: 365 });
            const status = faker.helpers.weightedArrayElement([
                { weight: 10, value: 'delivered' },
                { weight: 15, value: 'shipped' },
                { weight: 20, value: 'confirmed' },
                { weight: 25, value: 'pending' },
                { weight: 5, value: 'cancelled' },
            ]);

            // Generate order items
            const itemCount = faker.number.int({ min: 1, max: 8 });
            const items: OrderItem[] = [];
            let totalAmount = 0;

            for (let j = 0; j < itemCount; j++) {
                const product =
                    products.length > 0
                        ? faker.helpers.arrayElement(products)
                        : null;
                const quantity = faker.number.int({ min: 1, max: 100 });
                const unitPrice =
                    product?.price ||
                    faker.number.float({ min: 5, max: 500, precision: 0.01 });
                const totalPrice = quantity * unitPrice;

                items.push({
                    id: `${orderId}_item_${j + 1}`,
                    productId:
                        product?.id || faker.number.int({ min: 1, max: 100 }),
                    quantity,
                    unitPrice,
                    totalPrice,
                });

                totalAmount += totalPrice;
            }

            const deliveryDate =
                status === 'delivered' || status === 'shipped'
                    ? faker.date.future({ days: 30 })
                    : undefined;

            orders.push({
                id: orderId,
                organizationId: org.id,
                contactId: contact?.id,
                orderNumber,
                orderDate: orderDate.toISOString(),
                deliveryDate: deliveryDate?.toISOString(),
                status,
                totalAmount,
                currency: 'USD',
                items,
                notes: faker.datatype.boolean(0.3)
                    ? faker.lorem.sentence()
                    : undefined,
                createdAt: orderDate.toISOString(),
                updatedAt: faker.date.recent({ days: 30 }).toISOString(),
            });
        }
    });

    return orders;
};
