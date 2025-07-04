import {
    UserCircleIcon,
    CogIcon,
    ChartBarIcon,
    UsersIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import {
    CanAccess,
    LoadingIndicator,
    useGetIdentity,
    useLogout,
} from 'react-admin';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { useConfigurationContext } from '../root/ConfigurationContext';
import { SecurityStatusBar } from '../components/security/SecurityStatusBar';
import { Dropdown, DropdownItem } from '../components/ui-kit/Dropdown';

const Header = () => {
    const { logo, title } = useConfigurationContext();
    const location = useLocation();
    const { identity } = useGetIdentity();

    const tabs = [
        { label: 'Dashboard', to: '/' },
        { label: 'Contacts', to: '/contacts' },
        { label: 'Organizations', to: '/organizations' },
        { label: 'Interactions', to: '/interactions' },
        { label: 'Opportunities', to: '/opportunities' },
        { label: 'Products', to: '/products' },
    ];

    return (
        <nav className="bg-gray-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Link to="/">
                                <img
                                    className="h-8 w-8"
                                    src={logo}
                                    alt={title}
                                />
                            </Link>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {tabs.map(tab => (
                                    <Link
                                        key={tab.to}
                                        to={tab.to}
                                        className={`rounded-md px-3 py-2 text-sm font-medium ${
                                            matchPath(
                                                `${tab.to}/*`,
                                                location.pathname
                                            )
                                                ? 'bg-gray-900 text-white'
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }`}
                                    >
                                        {tab.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                            <SecurityStatusBar compact />
                            <LoadingIndicator />
                            <Dropdown
                                button={
                                    <button className="p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                                        <span className="sr-only">
                                            Open user menu
                                        </span>
                                        <UserCircleIcon
                                            className="h-6 w-6"
                                            aria-hidden="true"
                                        />
                                    </button>
                                }
                            >
                                <ProfileMenu />
                                <CanAccess resource="analytics" action="list">
                                    <AnalyticsMenu />
                                </CanAccess>
                                <ConfigurationMenu />
                                <CanAccess resource="users" action="list">
                                    <UsersMenu />
                                </CanAccess>
                                <LogoutButton />
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

const ProfileMenu = () => {
    return (
        <DropdownItem onClick={() => {}}>
            <Link to="/profile" className="flex items-center w-full">
                <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400" />
                <span>My Profile</span>
            </Link>
        </DropdownItem>
    );
};

const AnalyticsMenu = () => {
    return (
        <DropdownItem onClick={() => {}}>
            <Link to="/analytics" className="flex items-center w-full">
                <ChartBarIcon className="mr-3 h-5 w-5 text-gray-400" />
                <span>Analytics</span>
            </Link>
        </DropdownItem>
    );
};

const UsersMenu = () => {
    return (
        <DropdownItem onClick={() => {}}>
            <Link to="/sales" className="flex items-center w-full">
                <UsersIcon className="mr-3 h-5 w-5 text-gray-400" />
                <span>Users</span>
            </Link>
        </DropdownItem>
    );
};

const ConfigurationMenu = () => {
    return (
        <DropdownItem onClick={() => {}}>
            <Link to="/settings" className="flex items-center w-full">
                <CogIcon className="mr-3 h-5 w-5 text-gray-400" />
                <span>My info</span>
            </Link>
        </DropdownItem>
    );
};

const LogoutButton = () => {
    const logout = useLogout();
    const handleClick = () => logout();
    return (
        <DropdownItem onClick={handleClick}>
            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" />
            <span>Logout</span>
        </DropdownItem>
    );
};

export default Header;
