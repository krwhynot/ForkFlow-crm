/**
 * Role-Specific Dashboard Components
 * Customized dashboard experience based on user role
 */

import React from 'react';
import {
    AdjustmentsHorizontalIcon,
    UserGroupIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import { useGetIdentity } from 'react-admin';

import { User } from '../types';
import { RoleChip } from '../components/auth/RoleChip';
import { DealsChart } from './DealsChart';
import { HotContacts } from './HotContacts';
import { TasksList } from './TasksList';
import { DashboardActivityLog } from './DashboardActivityLog';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '../components/ui-kit/Card';

/**
 * Admin Dashboard - System overview and management tools
 */
export const AdminDashboard: React.FC = () => {
    return (
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <AdjustmentsHorizontalIcon className="h-6 w-6 text-red-500" />
                            <CardTitle>Administrator Dashboard</CardTitle>
                            <RoleChip role="admin" />
                        </div>
                        <CardDescription>
                            Complete system access and management capabilities
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>

            <div className="col-span-12 md:col-span-6">
                <DealsChart />
            </div>

            <div className="col-span-12 md:col-span-6">
                <HotContacts />
            </div>

            <div className="col-span-12 md:col-span-6">
                <TasksList />
            </div>

            <div className="col-span-12 md:col-span-6">
                <DashboardActivityLog />
            </div>

            <div className="col-span-12">
                <div className="p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700">
                    <p className="font-bold">Admin Features:</p>
                    <p>
                        User management, system settings, global analytics, and
                        full data access across all territories.
                    </p>
                </div>
            </div>
        </div>
    );
};

/**
 * Manager Dashboard - Team management and analytics
 */
export const ManagerDashboard: React.FC = () => {
    return (
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <UserGroupIcon className="h-6 w-6 text-yellow-500" />
                            <CardTitle>Manager Dashboard</CardTitle>
                            <RoleChip role="manager" />
                        </div>
                        <CardDescription>
                            Team performance monitoring and territory management
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>

            <div className="col-span-12 md:col-span-8">
                <DealsChart />
            </div>

            <div className="col-span-12 md:col-span-4">
                <HotContacts />
            </div>

            <div className="col-span-12 md:col-span-6">
                <TasksList />
            </div>

            <div className="col-span-12 md:col-span-6">
                <DashboardActivityLog />
            </div>

            <div className="col-span-12">
                <div className="p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700">
                    <p className="font-bold">Manager Features:</p>
                    <p>
                        Team analytics, territory performance, user creation,
                        and cross-territory visibility.
                    </p>
                </div>
            </div>
        </div>
    );
};

/**
 * Broker Dashboard - Personal metrics and field tools
 */
export const BrokerDashboard: React.FC = () => {
    const { data: identity } = useGetIdentity();

    return (
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <UserIcon className="h-6 w-6 text-blue-500" />
                            <CardTitle>Field Sales Dashboard</CardTitle>
                            <RoleChip role="broker" />
                        </div>
                        <CardDescription>
                            Personal performance and territory management
                        </CardDescription>
                        {identity?.territory &&
                            identity.territory.length > 0 && (
                                <p className="text-sm mt-2">
                                    <strong>Territory:</strong>{' '}
                                    {identity.territory.join(', ')}
                                </p>
                            )}
                    </CardHeader>
                </Card>
            </div>

            <div className="col-span-12 md:col-span-6">
                <HotContacts />
            </div>

            <div className="col-span-12 md:col-span-6">
                <TasksList />
            </div>

            <div className="col-span-12 md:col-span-6">
                <DealsChart />
            </div>

            <div className="col-span-12 md:col-span-6">
                <DashboardActivityLog />
            </div>

            <div className="col-span-12">
                <div className="p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700">
                    <p className="font-bold">Broker Features:</p>
                    <p>
                        Territory-specific contacts and deals, visit tracking,
                        personal task management, and mobile field tools.
                    </p>
                </div>
            </div>
        </div>
    );
};

/**
 * Role-based dashboard wrapper that renders appropriate dashboard
 */
export const RoleDashboard: React.FC = () => {
    const { data: identity, isPending } = useGetIdentity();

    if (isPending) {
        return (
            <Card>
                <CardContent>
                    <p>Loading dashboard...</p>
                </CardContent>
            </Card>
        );
    }

    if (!identity) {
        return (
            <Card>
                <CardContent>
                    <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                        <p>Unable to load user information</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    switch (identity.role) {
        case 'admin':
            return <AdminDashboard />;
        case 'manager':
            return <ManagerDashboard />;
        case 'broker':
            return <BrokerDashboard />;
        default:
            return (
                <Card>
                    <CardContent>
                        <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                            <p>Unknown user role: {identity.role}</p>
                        </div>
                    </CardContent>
                </Card>
            );
    }
};
