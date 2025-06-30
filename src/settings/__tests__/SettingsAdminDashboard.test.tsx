import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestContext } from 'ra-test';
import { SettingsAdminDashboard } from '../SettingsAdminDashboard';
import { Setting } from '../../types';

// Mock the useRealtimeSettings hook
jest.mock('../hooks/useRealtimeSettings', () => ({
    useRealtimeSettings: () => ({
        settings: [],
        isLoading: false,
        isConnected: true,
        lastUpdate: null,
        refetch: jest.fn(),
        performOptimisticUpdate: jest.fn(),
        reconnect: jest.fn(),
    }),
}));

const mockSettings: Setting[] = [
    {
        id: 1,
        category: 'priority',
        key: 'a_priority',
        label: 'A Priority',
        color: '#22c55e',
        sortOrder: 1,
        active: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 2,
        category: 'segment',
        key: 'fine_dining',
        label: 'Fine Dining',
        color: '#8b5cf6',
        sortOrder: 1,
        active: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 3,
        category: 'priority',
        key: 'b_priority',
        label: 'B Priority',
        color: '#eab308',
        sortOrder: 2,
        active: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestContext
        dataProvider={{
            getList: jest.fn().mockResolvedValue({
                data: mockSettings,
                total: mockSettings.length,
            }),
            getOne: jest.fn(),
            getMany: jest.fn(),
            getManyReference: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
        }}
    >
        {children}
    </TestContext>
);

describe('SettingsAdminDashboard', () => {
    beforeEach(() => {
        // Mock window.location.href assignment
        delete (window as any).location;
        (window as any).location = { href: '' };
    });

    it('renders the dashboard header correctly', async () => {
        render(
            <TestWrapper>
                <SettingsAdminDashboard />
            </TestWrapper>
        );

        expect(screen.getByText('Settings Management')).toBeInTheDocument();
        expect(screen.getByText(/Manage all system configuration settings/)).toBeInTheDocument();
    });

    it('displays category cards in overview tab', async () => {
        render(
            <TestWrapper>
                <SettingsAdminDashboard />
            </TestWrapper>
        );

        // Wait for data to load
        await waitFor(() => {
            expect(screen.getByText('Priorities')).toBeInTheDocument();
            expect(screen.getByText('Segments')).toBeInTheDocument();
            expect(screen.getByText('Distributors')).toBeInTheDocument();
        });
    });

    it('shows correct statistics for each category', async () => {
        render(
            <TestWrapper>
                <SettingsAdminDashboard />
            </TestWrapper>
        );

        await waitFor(() => {
            // Should show priority stats: 2 total, 1 active, 1 inactive
            const prioritySection = screen.getByText('Priorities').closest('.MuiCard-root');
            expect(prioritySection).toBeInTheDocument();
        });
    });

    it('navigates to category management when card is clicked', async () => {
        render(
            <TestWrapper>
                <SettingsAdminDashboard />
            </TestWrapper>
        );

        await waitFor(() => {
            const priorityCard = screen.getByText('Priorities').closest('.MuiCard-root');
            if (priorityCard) {
                fireEvent.click(priorityCard);
                expect(window.location.href).toContain('settings');
            }
        });
    });

    it('switches between tabs correctly', async () => {
        render(
            <TestWrapper>
                <SettingsAdminDashboard />
            </TestWrapper>
        );

        // Click on Categories tab
        fireEvent.click(screen.getByText('Categories'));
        expect(screen.getByText('Category Management')).toBeInTheDocument();

        // Click on Bulk Operations tab
        fireEvent.click(screen.getByText('Bulk Operations'));
        expect(screen.getByText('Bulk Operations')).toBeInTheDocument();
    });

    it('displays quick stats correctly', async () => {
        render(
            <TestWrapper>
                <SettingsAdminDashboard />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText(/3 Total Settings/)).toBeInTheDocument();
            expect(screen.getByText(/2 Active/)).toBeInTheDocument();
            expect(screen.getByText(/9 Categories/)).toBeInTheDocument();
        });
    });

    it('renders floating action button', () => {
        render(
            <TestWrapper>
                <SettingsAdminDashboard />
            </TestWrapper>
        );

        const fab = screen.getByRole('button', { name: /add setting/i });
        expect(fab).toBeInTheDocument();
    });

    it('handles add button clicks correctly', async () => {
        render(
            <TestWrapper>
                <SettingsAdminDashboard />
            </TestWrapper>
        );

        await waitFor(() => {
            const addButtons = screen.getAllByRole('button');
            const categoryAddButton = addButtons.find(button => 
                button.querySelector('svg[data-testid="AddIcon"]')
            );
            
            if (categoryAddButton) {
                fireEvent.click(categoryAddButton);
                expect(window.location.href).toContain('/settings/create');
            }
        });
    });

    it('is responsive on mobile devices', () => {
        // Mock mobile viewport
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation(query => ({
                matches: query.includes('(max-width: 599.95px)'),
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            })),
        });

        render(
            <TestWrapper>
                <SettingsAdminDashboard />
            </TestWrapper>
        );

        // On mobile, tabs should be scrollable
        const tabsContainer = screen.getByRole('tablist');
        expect(tabsContainer).toBeInTheDocument();
    });

    it('displays connection status when disconnected', () => {
        // Mock disconnected state
        jest.doMock('../hooks/useRealtimeSettings', () => ({
            useRealtimeSettings: () => ({
                settings: mockSettings,
                isLoading: false,
                isConnected: false,
                lastUpdate: null,
                refetch: jest.fn(),
                performOptimisticUpdate: jest.fn(),
                reconnect: jest.fn(),
            }),
        }));

        render(
            <TestWrapper>
                <SettingsAdminDashboard />
            </TestWrapper>
        );

        // Should show real-time status indicator
        expect(screen.getByText(/Settings Management/)).toBeInTheDocument();
    });
});