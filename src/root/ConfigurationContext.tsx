import { createContext, useContext } from 'react';

export type ConfigurationContextValue = {
    logo: string;
    title: string;
    contactGender: any[];
    companySectors: string[];
    dealCategories: string[];
    dealPipelineStatuses: any[];
    dealStages: any[];
    noteStatuses: any[];
    taskTypes: string[];
};

export const ConfigurationContext = createContext<ConfigurationContextValue>({
    logo: '',
    title: '',
    contactGender: [],
    companySectors: [],
    dealCategories: [],
    dealPipelineStatuses: [],
    dealStages: [],
    noteStatuses: [],
    taskTypes: [],
});

export const ConfigurationProvider = ConfigurationContext.Provider;

export const useConfigurationContext = () => {
    const context = useContext(ConfigurationContext);
    if (!context) {
        throw new Error(
            'useConfigurationContext must be used within a ConfigurationProvider'
        );
    }
    return context;
};
