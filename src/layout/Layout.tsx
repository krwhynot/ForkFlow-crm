import { ReactElement } from 'react';
import { CheckForApplicationUpdate } from 'react-admin';
import Header from './Header';

export const Layout = (props: any): ReactElement => (
    <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow">
            {props.children}
            <CheckForApplicationUpdate />
        </main>
    </div>
);

export default Layout;
