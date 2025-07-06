'use client';

import { useState } from 'react';
import { DashboardHeader } from '../dashboard/DashboardHeader';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white">
            <DashboardSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="md:pl-64">
                <DashboardHeader onMenuToggle={() => setSidebarOpen(true)} />

                <main className="py-6">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
