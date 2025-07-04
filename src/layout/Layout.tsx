import { CheckForApplicationUpdate } from 'react-admin';
import { ReactElement } from 'react';
import Header from './Header';

export const Layout = (props: any): ReactElement => (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
            {props.children}
            <CheckForApplicationUpdate />
        </main>
    </div>
);

export default Layout;
