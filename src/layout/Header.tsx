import {
    ArrowRightOnRectangleIcon,
    ChartBarIcon,
    CogIcon,
    UserCircleIcon,
    UsersIcon,
} from '@heroicons/react/24/outline';
import {
    CanAccess,
    LoadingIndicator,
    useGetIdentity,
    useLogout,
} from 'react-admin';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { SecurityStatusBar } from '../components/security/SecurityStatusBar';
import { Dropdown, DropdownItem } from '../components/ui-kit/Dropdown';
import { useConfigurationContext } from '../root/ConfigurationContext';

const Header = () => {
    const { logo, title } = useConfigurationContext();
    const location = useLocation();
    const { identity } = useGetIdentity();

    const tabs = [
        { label: 'Dashboard', to: '/' },
        { label: 'Contacts', to: '/contacts' },
        { label: 'Organizations', to: '/organizations' },
        { label: 'Deals', to: '/opportunities' },
        { label: 'Products', to: '/products' },
    ];

    return (
        <nav className="bg-blue-600 shadow-lg">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Link to="/" className="flex items-center space-x-3">
                                <img
                                    className="h-8 w-8"
                                    src={logo}
                                    alt={title}
                                />
                                <span className="text-white font-bold text-xl">
                                    {title}
                                </span>
                            </Link>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-1">
                                {tabs.map(tab => (
                                    <Link
                                        key={tab.to}
                                        to={tab.to}
                                        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${matchPath(
                                            `${tab.to}/*`,
                                            location.pathname
                                        ) || (tab.to === '/' && location.pathname === '/')
                                            ? 'bg-blue-700 text-white'
                                            : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                                            }`}
                                    >
                                        {tab.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6 space-x-4">
                            <SecurityStatusBar compact />
                            <LoadingIndicator />
                            <div className="text-blue-100 text-sm">
                                Welcome, {identity?.fullName || 'User'}
                            </div>
                            <Dropdown
                                button={
                                    <button className="p-1 rounded-full text-blue-100 hover:text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white transition-colors">
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
        <DropdownItem onClick={() => { }}>
            <Link to="/profile" className="flex items-center w-full">
                <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400" />
                <span>My Profile</span>
            </Link>
        </DropdownItem>
    );
};

const AnalyticsMenu = () => {
    return (
        <DropdownItem onClick={() => { }}>
            <Link to="/analytics" className="flex items-center w-full">
                <ChartBarIcon className="mr-3 h-5 w-5 text-gray-400" />
                <span>Analytics</span>
            </Link>
        </DropdownItem>
    );
};

const UsersMenu = () => {
    return (
        <DropdownItem onClick={() => { }}>
            <Link to="/sales" className="flex items-center w-full">
                <UsersIcon className="mr-3 h-5 w-5 text-gray-400" />
                <span>Users</span>
            </Link>
        </DropdownItem>
    );
};

const ConfigurationMenu = () => {
    return (
        <DropdownItem onClick={() => { }}>
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
