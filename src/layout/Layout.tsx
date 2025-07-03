import { Layout as RaLayout, CheckForApplicationUpdate } from 'react-admin';
import { ReactElement } from 'react';
import Header from './Header';

export const Layout = (props: any): ReactElement => (
    <RaLayout
        {...props}
        appBar={Header}
    >
        {props.children}
        <CheckForApplicationUpdate />
    </RaLayout>
);

export default Layout;