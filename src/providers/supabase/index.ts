import { DataProvider } from 'react-admin';
import { supabaseDataProvider } from 'ra-supabase';
import { supabase } from './supabase';
import { CrmDataProvider } from '../types';
import { getIsInitialized } from './authProvider';

const baseDataProvider = supabaseDataProvider({
    instanceUrl: import.meta.env.VITE_SUPABASE_URL,
    apiKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    supabaseClient: supabase,
});

export const dataProvider: CrmDataProvider = {
    ...baseDataProvider,
    isInitialized: async () => {
        return getIsInitialized();
    },
    signUp: async (data: any) => {
        // This is a placeholder. A real implementation would call supabase.auth.signUp
        console.log('signUp', data);
        return data;
    },
};

export * from './authProvider';
