import fakeRestDataProvider from 'ra-data-fakerest';
import {
    CreateParams,
    DataProvider,
    Identifier,
    ResourceCallbacks,
    UpdateParams,
    withLifecycleCallbacks,
} from 'react-admin';
import {
    BrokerDashboardStats,
    BrokerFormData,
    Company,
    Contact,
    Deal,
    GPSCoordinates,
    Sale,
    SalesFormData,
    SignUpData,
    Task,
    Visit,
} from '../../types';
import { getActivityLog } from '../commons/activity';
import { getCompanyAvatar } from '../commons/getCompanyAvatar';
import { getContactAvatar } from '../commons/getContactAvatar';
import { CrmDataProvider } from '../types';
import { authProvider, USER_STORAGE_KEY } from './authProvider';
import generateData from './dataGenerator';
import { withSupabaseFilterAdapter } from './internal/supabaseAdapter';

const baseDataProvider = fakeRestDataProvider(generateData(), true, 300);

const TASK_MARKED_AS_DONE = 'TASK_MARKED_AS_DONE';
const TASK_MARKED_AS_UNDONE = 'TASK_MARKED_AS_UNDONE';
const TASK_DONE_NOT_CHANGED = 'TASK_DONE_NOT_CHANGED';
let taskUpdateType = TASK_DONE_NOT_CHANGED;

const processCompanyLogo = async (params: any) => {
    let logo = params.data.logo;

    if (typeof logo !== 'object' || logo === null || !logo.src) {
        logo = await getCompanyAvatar(params.data);
    } else if (logo.rawFile instanceof File) {
        const base64Logo = await convertFileToBase64(logo);
        logo = { src: base64Logo, title: logo.title };
    }

    return {
        ...params,
        data: {
            ...params.data,
            logo,
        },
    };
};

async function processContactAvatar(
    params: UpdateParams<Contact>
): Promise<UpdateParams<Contact>>;

async function processContactAvatar(
    params: CreateParams<Contact>
): Promise<CreateParams<Contact>>;

async function processContactAvatar(
    params: CreateParams<Contact> | UpdateParams<Contact>
): Promise<CreateParams<Contact> | UpdateParams<Contact>> {
    const { data } = params;
    if ((data as any).avatar?.src || !data.email || data.email.trim() === '') {
        return params;
    }
    const avatarUrl = await getContactAvatar(data);

    // Clone the data and modify the clone
    const newData = { ...data, avatar: { src: avatarUrl || undefined } };

    return { ...params, data: newData };
}

async function fetchAndUpdateCompanyData(
    params: UpdateParams<Contact>,
    dataProvider: DataProvider
): Promise<UpdateParams<Contact>>;

async function fetchAndUpdateCompanyData(
    params: CreateParams<Contact>,
    dataProvider: DataProvider
): Promise<CreateParams<Contact>>;

async function fetchAndUpdateCompanyData(
    params: CreateParams<Contact> | UpdateParams<Contact>,
    dataProvider: DataProvider
): Promise<CreateParams<Contact> | UpdateParams<Contact>> {
    const { data } = params;
    const newData = { ...data };

    if (!newData.organizationId) {
        return params;
    }

    const { data: company } = await dataProvider.getOne('companies', {
        id: newData.organizationId,
    });

    if (!company) {
        return params;
    }

    newData.organization = { ...company };
    return { ...params, data: newData };
}

const dataProviderWithCustomMethod: CrmDataProvider = {
    ...baseDataProvider,
    async getList(resource: string, params: any) {
        if (resource === 'customers') {
            return baseDataProvider.getList('customer_summary', params);
        }
        return baseDataProvider.getList(resource, params);
    },
    async getOne(resource: string, params: any) {
        if (resource === 'customers') {
            return baseDataProvider.getOne('customer_summary', params);
        }
        return baseDataProvider.getOne(resource, params);
    },
    // We simulate a remote endpoint that is in charge of returning activity log
    getActivityLog: async (companyId?: Identifier) => {
        return getActivityLog(dataProvider, companyId);
    },
    async signUp({
        email,
        password,
        first_name,
        last_name,
    }: SignUpData): Promise<{ id: string; email: string; password: string }> {
        const user = await baseDataProvider.create('sales', {
            data: {
                email,
                first_name,
                last_name,
            },
        });

        return {
            ...user.data,
            password,
        };
    },
    async isInitialized(): Promise<boolean> {
        const sales = await dataProvider.getList<Sale>('sales', {
            filter: {},
            pagination: { page: 1, perPage: 1 },
            sort: { field: 'id', order: 'ASC' },
        });
        if (sales.data.length === 0) {
            return false;
        }
        return true;
    },
    updatePassword: async (id: Identifier): Promise<true> => {
        const currentUser = await authProvider.getIdentity?.();
        if (!currentUser) {
            throw new Error('User not found');
        }
        const { data: previousData } = await dataProvider.getOne<Sale>(
            'sales',
            {
                id: currentUser.id,
            }
        );

        if (!previousData) {
            throw new Error('User not found');
        }

        await dataProvider.update('sales', {
            id,
            data: {
                password: 'demo_newPassword',
            },
            previousData,
        });

        return true;
    },
    async brokerCreate(body: BrokerFormData) {
        // Mock implementation for fakerest
        const id = Date.now().toString();
        const newBroker = {
            id,
            user_id: id,
            ...body,
        };
        
        const result = await dataProvider.create('sales', { data: newBroker });
        return result.data;
    },
    async brokerUpdate(id: Identifier, data: Partial<Omit<BrokerFormData, 'password'>>) {
        const { data: previousData } = await dataProvider.getOne<Sale>('sales', { id });
        const result = await dataProvider.update('sales', {
            id,
            data,
            previousData,
        });
        return result.data;
    },
    async getDashboardStats(): Promise<BrokerDashboardStats> {
        // Mock dashboard stats for fakerest
        return {
            total_customers: 150,
            customers_this_month: 12,
            total_visits: 75,
            visits_this_week: 8,
            visits_this_month: 32,
            pending_reminders: 5,
            overdue_reminders: 2,
            customers_needing_attention: 8,
        };
    },
    async findNearbyCustomers(latitude: number, longitude: number, radiusKm: number = 5) {
        // Mock implementation - return some random customers
        const { data: customers } = await dataProvider.getList('customers', {
            filter: {},
            pagination: { page: 1, perPage: 10 },
            sort: { field: 'id', order: 'ASC' },
        });
        return customers.slice(0, 3); // Return first 3 as "nearby"
    },
    async completeReminder(id: Identifier) {
        const { data: previousData } = await dataProvider.getOne('reminders', { id });
        return dataProvider.update('reminders', {
            id,
            data: {
                is_completed: true,
                completed_at: new Date().toISOString(),
            },
            previousData,
        });
    },
    async snoozeReminder(id: Identifier, snoozedUntil: string) {
        const { data: previousData } = await dataProvider.getOne('reminders', { id });
        return dataProvider.update('reminders', {
            id,
            data: {
                snoozed_until: snoozedUntil,
                snooze_count: (previousData.snooze_count || 0) + 1,
            },
            previousData,
        });
    },
};

async function updateCompany(
    companyId: Identifier,
    updateFn: (company: Company) => Partial<Company>
) {
    const { data: company } = await dataProvider.getOne<Company>('companies', {
        id: companyId,
    });

    return await dataProvider.update('companies', {
        id: companyId,
        data: {
            ...updateFn(company),
        },
        previousData: company,
    });
}

// Defensive: Ensure all required resources are initialized
const requiredResources = ['organizations', 'contacts', 'settings', 'companies', 'tasks', 'deals', 'dealNotes', 'contactNotes'];
export const ensureDbResources = (db: any) => {
    requiredResources.forEach((res) => {
        if (!db[res]) {
            db[res] = [];
        }
    });
};

export const dataProvider = withLifecycleCallbacks(
    withSupabaseFilterAdapter(dataProviderWithCustomMethod),
    [
        {
            resource: 'sales',
            beforeCreate: async params => {
                const { data } = params;
                // If administrator role is not set, we simply set it to false
                if (data.administrator == null) {
                    data.administrator = false;
                }
                return params;
            },
            afterSave: async data => {
                // Since the current user is stored in localStorage in fakerest authProvider
                // we need to update it to keep information up to date in the UI
                const currentUser = await authProvider.getIdentity?.();
                if (currentUser?.id === data.id) {
                    localStorage.setItem(
                        USER_STORAGE_KEY,
                        JSON.stringify(data)
                    );
                }
                return data;
            },
            beforeDelete: async params => {
                if (params.meta?.identity?.id == null) {
                    throw new Error('Identity MUST be set in meta');
                }

                const newSaleId = params.meta.identity.id as Identifier;

                const [companies, contacts, contactNotes, deals] =
                    await Promise.all([
                        dataProvider.getList('companies', {
                            filter: { salesId: params.id },
                            pagination: {
                                page: 1,
                                perPage: 10_000,
                            },
                            sort: { field: 'id', order: 'ASC' },
                        }),
                        dataProvider.getList('contacts', {
                            filter: { salesId: params.id },
                            pagination: {
                                page: 1,
                                perPage: 10_000,
                            },
                            sort: { field: 'id', order: 'ASC' },
                        }),
                        dataProvider.getList('contactNotes', {
                            filter: { salesId: params.id },
                            pagination: {
                                page: 1,
                                perPage: 10_000,
                            },
                            sort: { field: 'id', order: 'ASC' },
                        }),
                        dataProvider.getList('deals', {
                            filter: { salesId: params.id },
                            pagination: {
                                page: 1,
                                perPage: 10_000,
                            },
                            sort: { field: 'id', order: 'ASC' },
                        }),
                    ]);

                await Promise.all([
                    dataProvider.updateMany('companies', {
                        ids: companies.data.map(company => company.id),
                        data: {
                            salesId: newSaleId,
                        },
                    }),
                    dataProvider.updateMany('contacts', {
                        ids: contacts.data.map(company => company.id),
                        data: {
                            salesId: newSaleId,
                        },
                    }),
                    dataProvider.updateMany('contactNotes', {
                        ids: contactNotes.data.map(company => company.id),
                        data: {
                            salesId: newSaleId,
                        },
                    }),
                    dataProvider.updateMany('deals', {
                        ids: deals.data.map(company => company.id),
                        data: {
                            salesId: newSaleId,
                        },
                    }),
                ]);

                return params;
            },
        } satisfies ResourceCallbacks<Sale>,
        {
            resource: 'contacts',
            beforeCreate: async (params, dataProvider) => {
                const newParams = await processContactAvatar(params);
                return fetchAndUpdateCompanyData(newParams, dataProvider);
            },
            afterCreate: async result => {
                if (result.data.organizationId != null) {
                    await updateCompany(result.data.organizationId, company => ({
                        nb_contacts: (company.nb_contacts ?? 0) + 1,
                    }));
                }

                return result;
            },
            beforeUpdate: async params => {
                const newParams = await processContactAvatar(params);
                return fetchAndUpdateCompanyData(newParams, dataProvider);
            },
            afterDelete: async result => {
                if (result.data.organizationId != null) {
                    await updateCompany(result.data.organizationId, company => ({
                        nb_contacts: (company.nb_contacts ?? 1) - 1,
                    }));
                }

                return result;
            },
        } satisfies ResourceCallbacks<Contact>,
        {
            resource: 'tasks',
            afterCreate: async (result, dataProvider) => {
                // update the task count in the related contact
                const { contact_id } = result.data;
                const { data: contact } = await dataProvider.getOne(
                    'contacts',
                    { id: contact_id }
                );
                await dataProvider.update('contacts', {
                    id: contact_id,
                    data: {
                        nb_tasks: (contact.nb_tasks ?? 0) + 1,
                    },
                    previousData: contact,
                });
                return result;
            },
            beforeUpdate: async params => {
                const { data, previousData } = params;
                if (previousData.completed_at !== data.completed_at) {
                    taskUpdateType = data.completed_at
                        ? TASK_MARKED_AS_DONE
                        : TASK_MARKED_AS_UNDONE;
                } else {
                    taskUpdateType = TASK_DONE_NOT_CHANGED;
                }
                return params;
            },
            afterUpdate: async (result, dataProvider) => {
                // update the contact: if the task is done, decrement the nb tasks, otherwise increment it
                const { contact_id } = result.data;
                const { data: contact } = await dataProvider.getOne(
                    'contacts',
                    { id: contact_id }
                );
                if (taskUpdateType !== TASK_DONE_NOT_CHANGED) {
                    await dataProvider.update('contacts', {
                        id: contact_id,
                        data: {
                            nb_tasks:
                                taskUpdateType === TASK_MARKED_AS_DONE
                                    ? (contact.nb_tasks ?? 0) - 1
                                    : (contact.nb_tasks ?? 0) + 1,
                        },
                        previousData: contact,
                    });
                }
                return result;
            },
            afterDelete: async (result, dataProvider) => {
                // update the task count in the related contact
                const { contact_id } = result.data;
                const { data: contact } = await dataProvider.getOne(
                    'contacts',
                    { id: contact_id }
                );
                await dataProvider.update('contacts', {
                    id: contact_id,
                    data: {
                        nb_tasks: (contact.nb_tasks ?? 0) - 1,
                    },
                    previousData: contact,
                });
                return result;
            },
        } satisfies ResourceCallbacks<Task>,
        {
            resource: 'companies',
            beforeCreate: async params => {
                const createParams = await processCompanyLogo(params);

                return {
                    ...createParams,
                    data: {
                        ...createParams.data,
                        created_at: new Date().toISOString(),
                    },
                };
            },
            beforeUpdate: async params => {
                return await processCompanyLogo(params);
            },
            afterUpdate: async (result, dataProvider) => {
                // get all contacts of the company and for each contact, update the company_name
                const { id, name } = result.data;
                const { data: contacts } = await dataProvider.getList(
                    'contacts',
                    {
                        filter: { organizationId: id },
                        pagination: { page: 1, perPage: 1000 },
                        sort: { field: 'id', order: 'ASC' },
                    }
                );

                const contactIds = contacts.map(contact => contact.id);
                await dataProvider.updateMany('contacts', {
                    ids: contactIds,
                    data: { organization: { name } },
                });
                return result;
            },
        } satisfies ResourceCallbacks<Company>,
        {
            resource: 'deals',
            beforeCreate: async params => {
                return {
                    ...params,
                    data: {
                        ...params.data,
                        created_at: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                };
            },
            afterCreate: async result => {
                await updateCompany(result.data.organizationId, company => ({
                    nb_deals: (company.nb_deals ?? 0) + 1,
                }));

                return result;
            },
            beforeUpdate: async params => {
                return {
                    ...params,
                    data: {
                        ...params.data,
                        updatedAt: new Date().toISOString(),
                    },
                };
            },
            afterDelete: async result => {
                await updateCompany(result.data.organizationId, company => ({
                    nb_deals: (company.nb_deals ?? 1) - 1,
                }));

                return result;
            },
        } satisfies ResourceCallbacks<Deal>,
    ]
);

/**
 * Convert a `File` object returned by the upload input into a base 64 string.
 * That's not the most optimized way to store images in production, but it's
 * enough to illustrate the idea of dataprovider decoration.
 */
const convertFileToBase64 = (file: { rawFile: Blob }) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file.rawFile);
    });
