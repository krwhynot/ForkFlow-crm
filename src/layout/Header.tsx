import {
    ArrowRightOnRectangleIcon,
    ChartBarIcon,
    CogIcon,
    UserCircleIcon,
    UsersIcon,
    MagnifyingGlassIcon,
    BellIcon,
} from '@heroicons/react/24/outline';
import {
    CanAccess,
    LoadingIndicator,
    useGetIdentity,
    useLogout,
} from 'react-admin';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { SecurityStatusBar } from '../components/features/security/SecurityStatusBar';
import { Dropdown, DropdownItem } from '../components/core/navigation/Dropdown';
import { useConfigurationContext } from '../root/ConfigurationContext';

const Header = () => {
    const { logo, title } = useConfigurationContext();
    const location = useLocation();
    const { identity } = useGetIdentity();

    const navigationItems = [
        'Organizations',
        'Contacts',
        'Opportunities',
        'Interactions',
        'Products',
        'Kogans',
        'Reports'
    ];

    return (
        <header className="bg-forkflow-green text-white">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="bg-white text-forkflow-green px-3 py-1 rounded font-bold text-xl">
                                MFB
                            </div>
                        </div>
                        
                        {/* Navigation */}
                        <nav className="hidden md:ml-10 md:flex md:space-x-8">
                            {navigationItems.map((item) => (
                                <a
                                    key={item}
                                    href="#"
                                    className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium transition-colors"
                                >
                                    {item}
                                </a>
                            ))}
                        </nav>
                    </div>

                    {/* Right side icons */}
                    <div className="flex items-center space-x-4">
                        <button className="p-2 hover:bg-forkflow-light-green rounded-full transition-colors">
                            <MagnifyingGlassIcon className="h-5 w-5" />
                        </button>
                        <button className="p-2 hover:bg-forkflow-light-green rounded-full transition-colors">
                            <BellIcon className="h-5 w-5" />
                        </button>
                        <SecurityStatusBar compact />
                        <LoadingIndicator />
                        <div className="text-white text-sm">
                            Welcome, {identity?.fullName || 'User'}
                        </div>
                        <Dropdown
                            button={
                                <button className="p-1 rounded-full text-white hover:text-gray-200 hover:bg-forkflow-light-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-forkflow-green focus:ring-white transition-colors">
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
        </header>
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
