declare module 'ra-test' {
    import * as React from 'react';
    import { DataProvider } from 'react-admin';

    export interface TestContextProps {
        children: React.ReactNode;
        enableReducers?: boolean;
        initialState?: any;
        dataProvider?: DataProvider;
    }

    export const TestContext: React.FC<TestContextProps>;
}
