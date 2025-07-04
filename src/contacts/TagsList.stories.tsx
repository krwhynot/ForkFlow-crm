import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { faker } from '@faker-js/faker';
import fakerestDataProvider from 'ra-data-fakerest';
import { DataProviderContext, RecordContextProvider } from 'react-admin';
import { MemoryRouter } from 'react-router-dom';

import { generateCompanies } from '../providers/fakerest/dataGenerator/companies';
import { generateContacts } from '../providers/fakerest/dataGenerator/contacts';
import { generateTags } from '../providers/fakerest/dataGenerator/tags';
import { Db } from '../providers/fakerest/dataGenerator/types';
import { TagsList } from './TagsList';

const db = {} as Db;
db.tags = generateTags(db);
db.companies = generateCompanies(db, 1);
db.contacts = generateContacts(db, 1);
db.contacts[0].tags = faker.helpers
    .arrayElements(db.tags, 3)
    .map((tag: any) => tag.id.toString());
db.contacts[0].firstName = 'John';
db.contacts[0].lastName = 'Doe';

const meta: Meta<typeof TagsList> = {
    component: TagsList,
    decorators: [
        Story => {
            return (
                <MemoryRouter>
                    <QueryClientProvider client={new QueryClient()}>
                        <DataProviderContext.Provider
                            value={fakerestDataProvider(db)}
                        >
                            <RecordContextProvider value={db.contacts[0]}>
                                <Story />
                            </RecordContextProvider>
                        </DataProviderContext.Provider>
                    </QueryClientProvider>
                </MemoryRouter>
            );
        },
    ],
};

export default meta;
type Story = StoryObj<typeof TagsList>;

export const Basic: Story = {
    args: {},
};
