import { DataProvider } from "react-admin";

export type CrmDataProvider = DataProvider & {
    isInitialized: () => Promise<boolean>;
    signUp: (data: any) => Promise<any>;
};
