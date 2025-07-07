import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface DashboardLayoutProps {
    children: React.ReactNode;
    className?: string;
    header?: React.ReactNode;
    sidebar?: React.ReactNode;
    footer?: React.ReactNode;
}

/**
 * Main dashboard layout component
 * Provides consistent layout structure for dashboard pages
 */
export const DashboardLayout = ({
    children,
    className,
    header,
    sidebar,
    footer,
}: DashboardLayoutProps) => {
    return (
        <div className={twMerge(
            'min-h-screen bg-gray-50 flex flex-col',
            className
        )}>
            {header && (
                <header className="bg-white shadow-sm border-b border-gray-200">
                    {header}
                </header>
            )}
            
            <div className="flex flex-1">
                {sidebar && (
                    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
                        {sidebar}
                    </aside>
                )}
                
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
            
            {footer && (
                <footer className="bg-white border-t border-gray-200">
                    {footer}
                </footer>
            )}
        </div>
    );
}; 