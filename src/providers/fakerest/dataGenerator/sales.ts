import { faker } from '@faker-js/faker';

import { RAFile, Sale } from '../../../types';
import { Db } from './types';

export const generateSales = (_: Db): Sale[] => {
    const randomSales = Array.from(Array(5).keys()).map(id => {
        const first_name = faker.person.firstName();
        const last_name = faker.person.lastName();
        const email = faker.internet.email({
            firstName: first_name,
            lastName: last_name,
        });

        return {
            id: id + 1,
            user_id: `${id + 1}`,
            first_name,
            last_name,
            email,
            password: 'demo',
            administrator: false,
        };
    });
    return [
        {
            id: 0,
            user_id: '0',
            first_name: 'Jane',
            last_name: 'Doe',
            email: 'janedoe@atomic.dev',
            password: 'demo',
            administrator: true,
            avatar: {
                src: 'data:image/jpeg;base64,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',
            } as RAFile,
        },
        {
            id: 'demo-user',
            user_id: 'demo-user',
            first_name: 'Demo',
            last_name: 'User',
            email: 'demo@forkflow.com',
            password: 'demo',
            administrator: false,
        },
        ...randomSales,
    ];
};
