import { supabaseDataProvider } from 'ra-supabase';

import {
    CreateParams,
    DataProvider,
    GetListParams,
    Identifier,
    UpdateParams,
    withLifecycleCallbacks,
} from 'react-admin';
import {
    Broker,
    BrokerDashboardStats,
    BrokerFormData,
    GPSCoordinates,
    RAFile,
    SignUpData,
    Visit,
} from '../../types';
import { getActivityLog } from '../commons/activity';
import { getIsInitialized } from './authProvider';
import { supabase } from './supabase';

if (import.meta.env.VITE_SUPABASE_URL === undefined) {
    throw new Error('Please set the VITE_SUPABASE_URL environment variable');
}
if (import.meta.env.VITE_SUPABASE_ANON_KEY === undefined) {
    throw new Error(
        'Please set the VITE_SUPABASE_ANON_KEY environment variable'
    );
}

const baseDataProvider = supabaseDataProvider({
    instanceUrl: import.meta.env.VITE_SUPABASE_URL,
    apiKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    supabaseClient: supabase,
    sortOrder: 'asc,desc.nullslast' as any,
});

// GPS Utilities for Food Broker CRM
const getCurrentLocation = (): Promise<GPSCoordinates> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date().toISOString(),
                });
            },
            error => {
                reject(new Error(`Geolocation error: ${error.message}`));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000, // Cache for 1 minute
            }
        );
    });
};

// Process visit data to auto-capture GPS if needed
async function processVisitLocation(
    params: CreateParams<Visit>
): Promise<CreateParams<Visit>>;
async function processVisitLocation(
    params: UpdateParams<Visit>
): Promise<UpdateParams<Visit>>;
async function processVisitLocation(
    params: CreateParams<Visit> | UpdateParams<Visit>
): Promise<CreateParams<Visit> | UpdateParams<Visit>> {
    const { data } = params;

    // Auto-capture GPS coordinates if not provided
    if (!data.latitude || !data.longitude) {
        try {
            const location = await getCurrentLocation();
            return {
                ...params,
                data: {
                    ...data,
                    latitude: location.latitude,
                    longitude: location.longitude,
                },
            };
        } catch (error) {
            console.warn('Could not get GPS location:', error);
            // Continue without GPS coordinates
        }
    }

    return params;
}

const dataProviderWithCustomMethods = {
    ...baseDataProvider,
    async getList(resource: string, params: GetListParams) {
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

    async signUp({ email, password, first_name, last_name }: SignUpData) {
        const response = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name,
                    last_name,
                },
            },
        });

        if (!response.data?.user || response.error) {
            console.error('signUp.error', response.error);
            throw new Error('Failed to create account');
        }

        // Update the is initialized cache
        getIsInitialized._is_initialized_cache = true;

        return {
            id: response.data.user.id,
            email,
            password,
        };
    },
    async brokerCreate(body: BrokerFormData) {
        const { data, error } = await supabase.functions.invoke<Broker>(
            'users',
            {
                method: 'POST',
                body,
            }
        );

        if (!data || error) {
            console.error('brokerCreate.error', error);
            throw new Error('Failed to create broker account');
        }

        return data;
    },
    async brokerUpdate(
        id: Identifier,
        data: Partial<Omit<BrokerFormData, 'password'>>
    ) {
        const {
            email,
            first_name,
            last_name,
            administrator,
            avatar,
            disabled,
        } = data;

        const { data: broker, error } = await supabase.functions.invoke<Broker>(
            'users',
            {
                method: 'PATCH',
                body: {
                    broker_id: id,
                    email,
                    first_name,
                    last_name,
                    administrator,
                    disabled,
                    avatar,
                },
            }
        );

        if (!broker || error) {
            console.error('brokerUpdate.error', error);
            throw new Error('Failed to update broker account');
        }

        return data;
    },
    async updatePassword(id: Identifier) {
        const { data: passwordUpdated, error } =
            await supabase.functions.invoke<boolean>('updatePassword', {
                method: 'PATCH',
                body: {
                    broker_id: id,
                },
            });

        if (!passwordUpdated || error) {
            console.error('passwordUpdate.error', error);
            throw new Error('Failed to update password');
        }

        return passwordUpdated;
    },
    async getDashboardStats(): Promise<BrokerDashboardStats> {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user?.id) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase.rpc(
            'get_broker_dashboard_stats',
            {
                broker_uuid: user.user.id,
            }
        );

        if (error) {
            console.error('getDashboardStats.error', error);
            throw new Error('Failed to get dashboard statistics');
        }

        return (
            data[0] || {
                total_customers: 0,
                customers_this_month: 0,
                total_visits: 0,
                visits_this_week: 0,
                visits_this_month: 0,
                pending_reminders: 0,
                overdue_reminders: 0,
                customers_needing_attention: 0,
            }
        );
    },
    async findNearbyCustomers(
        latitude: number,
        longitude: number,
        radiusKm: number = 10
    ) {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user?.id) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase.rpc('customers_near_location', {
            broker_uuid: user.user.id,
            center_lat: latitude,
            center_lon: longitude,
            radius_km: radiusKm,
        });

        if (error) {
            console.error('findNearbyCustomers.error', error);
            throw new Error('Failed to find nearby customers');
        }

        return data || [];
    },
    async completeReminder(reminderId: Identifier) {
        return baseDataProvider.update('reminders', {
            id: reminderId,
            data: { is_completed: true },
            previousData: {} as any,
        });
    },
    async snoozeReminder(reminderId: Identifier, snoozeUntil: string) {
        const { data: reminder } = await baseDataProvider.getOne('reminders', {
            id: reminderId,
        });

        return baseDataProvider.update('reminders', {
            id: reminderId,
            data: {
                snoozed_until: snoozeUntil,
                snooze_count: (reminder.snooze_count || 0) + 1,
            },
            previousData: reminder,
        });
    },
    async isInitialized() {
        return getIsInitialized();
    },
    // We simulate a remote endpoint that is in charge of returning activity log
    getActivityLog: async (companyId?: Identifier) => {
        return getActivityLog(dataProviderWithCustomMethods, companyId);
    },
} satisfies DataProvider;

export type CrmDataProvider = typeof dataProviderWithCustomMethods;

export const dataProvider = withLifecycleCallbacks(
    dataProviderWithCustomMethods,
    [
        {
            resource: 'customers',
            beforeGetList: async params => {
                return applyFullTextSearch([
                    'business_name',
                    'contact_person',
                    'email',
                    'phone',
                    'address',
                    'notes',
                ])(params);
            },
            beforeCreate: async params => {
                const { data: user } = await supabase.auth.getUser();
                return {
                    ...params,
                    data: {
                        ...params.data,
                        broker_id: user?.user?.id,
                        created_at: new Date().toISOString(),
                    },
                };
            },
        },
        {
            resource: 'customer_summary',
            beforeGetList: async params => {
                return applyFullTextSearch(['business_name', 'contact_person'])(
                    params
                );
            },
        },
        {
            resource: 'organizations',
            beforeGetList: async params => {
                return applyFullTextSearch([
                    'name',
                    'accountManager',
                    'address',
                    'city',
                    'state',
                    'phone',
                    'website',
                    'notes',
                ])(params);
            },
            beforeCreate: async params => {
                const { data: user } = await supabase.auth.getUser();
                return {
                    ...params,
                    data: {
                        ...params.data,
                        createdBy: user?.user?.id,
                        createdAt: new Date().toISOString(),
                    },
                };
            },
        },
        {
            resource: 'contacts',
            beforeGetList: async params => {
                return applyFullTextSearch([
                    'firstName',
                    'lastName',
                    'email',
                    'phone',
                    'notes',
                ])(params);
            },
            beforeCreate: async params => {
                const { data: user } = await supabase.auth.getUser();

                // Handle primary contact designation
                if (params.data.isPrimary && params.data.organizationId) {
                    // Unset any existing primary contact for this organization
                    await supabase
                        .from('contacts')
                        .update({ isPrimary: false })
                        .eq('organizationId', params.data.organizationId)
                        .eq('isPrimary', true);
                }

                return {
                    ...params,
                    data: {
                        ...params.data,
                        createdBy: user?.user?.id,
                        createdAt: new Date().toISOString(),
                    },
                };
            },
            beforeUpdate: async params => {
                // Handle primary contact designation
                if (params.data.isPrimary && params.data.organizationId) {
                    // Unset any existing primary contact for this organization (except current record)
                    await supabase
                        .from('contacts')
                        .update({ isPrimary: false })
                        .eq('organizationId', params.data.organizationId)
                        .eq('isPrimary', true)
                        .neq('id', params.id);
                }

                return params;
            },
        },
        {
            resource: 'settings',
            beforeGetList: async params => {
                return applyFullTextSearch(['label', 'key', 'category'])(
                    params
                );
            },
        },
        {
            resource: 'visits',
            beforeCreate: async params => {
                const processedParams = await processVisitLocation(params);
                const { data: user } = await supabase.auth.getUser();

                return {
                    ...processedParams,
                    data: {
                        ...processedParams.data,
                        broker_id: user?.user?.id,
                        visit_date:
                            processedParams.data.visit_date ||
                            new Date().toISOString(),
                    },
                };
            },
            beforeUpdate: async params => {
                return (await processVisitLocation(
                    params
                )) as UpdateParams<Visit>;
            },
            beforeGetList: async params => {
                return applyFullTextSearch(['notes', 'visit_type'])(params);
            },
        },
        {
            resource: 'reminders',
            beforeCreate: async params => {
                const { data: user } = await supabase.auth.getUser();

                return {
                    ...params,
                    data: {
                        ...params.data,
                        broker_id: user?.user?.id,
                    },
                };
            },
            beforeGetList: async params => {
                return applyFullTextSearch(['title', 'notes'])(params);
            },
        },
        {
            resource: 'products',
            beforeGetList: async params => {
                return applyFullTextSearch([
                    'name',
                    'category',
                    'subcategory',
                    'description',
                    'sku',
                ])(params);
            },
        },
        {
            resource: 'orders',
            beforeCreate: async params => {
                const { data: user } = await supabase.auth.getUser();

                return {
                    ...params,
                    data: {
                        ...params.data,
                        broker_id: user?.user?.id,
                        order_date:
                            params.data.order_date || new Date().toISOString(),
                    },
                };
            },
            beforeGetList: async params => {
                return applyFullTextSearch(['notes', 'internal_notes'])(params);
            },
        },
    ]
);

const applyFullTextSearch = (columns: string[]) => (params: GetListParams) => {
    if (!params.filter?.q) {
        return params;
    }
    const { q, ...filter } = params.filter;
    return {
        ...params,
        filter: {
            ...filter,
            '@or': columns.reduce((acc, column) => {
                return {
                    ...acc,
                    [`${column}@ilike`]: `%${q}%`,
                };
            }, {}),
        },
    };
};

const uploadToBucket = async (fi: RAFile) => {
    if (!fi.src.startsWith('blob:') && !fi.src.startsWith('data:')) {
        // Sign URL check if path exists in the bucket
        if (fi.path) {
            const { error } = await supabase.storage
                .from('attachments')
                .createSignedUrl(fi.path, 60);

            if (!error) {
                return;
            }
        }
    }

    const dataContent = fi.src
        ? await fetch(fi.src).then(res => res.blob())
        : fi.rawFile;

    const file = fi.rawFile;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;
    const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, dataContent);

    if (uploadError) {
        console.error('uploadError', uploadError);
        throw new Error('Failed to upload attachment');
    }

    const { data } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);

    fi.path = filePath;
    fi.src = data.publicUrl;

    // save MIME type
    const mimeType = file.type;
    fi.type = mimeType;

    return fi;
};
