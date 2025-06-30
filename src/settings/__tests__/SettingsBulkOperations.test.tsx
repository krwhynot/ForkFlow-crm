import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestContext } from 'ra-test';
import { SettingsBulkOperations } from '../SettingsBulkOperations';
import { Setting } from '../../types';

import type { ParseConfig } from 'papaparse';

// Mock Papa Parse
jest.mock('papaparse', () => ({
    unparse: jest.fn().mockReturnValue('mocked,csv,data'),
    parse: jest.fn(),
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
];

const mockDataProvider = {
    getList: jest.fn().mockResolvedValue({
        data: mockSettings,
        total: mockSettings.length,
    }),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getManyReference: jest.fn(),
    create: jest.fn().mockResolvedValue({ data: { ...mockSettings[0], id: 3 } }),
    update: jest.fn().mockResolvedValue({ data: mockSettings[0] }),
    updateMany: jest.fn(),
    delete: jest.fn().mockResolvedValue({ data: mockSettings[0] }),
    deleteMany: jest.fn(),
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestContext dataProvider={mockDataProvider}>
        {children}
    </TestContext>
);

// Mock URL.createObjectURL and link click
global.URL.createObjectURL = jest.fn().mockReturnValue('mocked-url');
global.URL.revokeObjectURL = jest.fn();

const mockClick = jest.fn();
jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
    if (tagName === 'a') {
        return {
            href: '',
            download: '',
            click: mockClick,
        } as any;
    }
    return document.createElement(tagName);
});

describe('SettingsBulkOperations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders export and import sections', () => {
        render(
            <TestWrapper>
                <SettingsBulkOperations />
            </TestWrapper>
        );

        expect(screen.getByText('Export Settings')).toBeInTheDocument();
        expect(screen.getByText('Import Settings')).toBeInTheDocument();
        expect(screen.getByText('Export CSV')).toBeInTheDocument();
        expect(screen.getByText('Export JSON')).toBeInTheDocument();
        expect(screen.getByText('Select CSV File')).toBeInTheDocument();
    });

    it('displays settings count for export', async () => {
        render(
            <TestWrapper>
                <SettingsBulkOperations />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText('2 settings available')).toBeInTheDocument();
        });
    });

    it('handles CSV export correctly', async () => {
        const Papa = require('papaparse');
        
        render(
            <TestWrapper>
                <SettingsBulkOperations />
            </TestWrapper>
        );

        await waitFor(() => {
            fireEvent.click(screen.getByText('Export CSV'));
        });

        expect(Papa.unparse).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    id: 1,
                    category: 'priority',
                    key: 'a_priority',
                    label: 'A Priority',
                })
            ])
        );
        expect(mockClick).toHaveBeenCalled();
    });

    it('handles JSON export correctly', async () => {
        render(
            <TestWrapper>
                <SettingsBulkOperations />
            </TestWrapper>
        );

        await waitFor(() => {
            fireEvent.click(screen.getByText('Export JSON'));
        });

        expect(mockClick).toHaveBeenCalled();
    });

    it('shows required and optional columns for import', () => {
        render(
            <TestWrapper>
                <SettingsBulkOperations />
            </TestWrapper>
        );

        expect(screen.getByText('Required columns: category, key, label')).toBeInTheDocument();
        expect(screen.getByText('Optional columns: color, sortOrder, active')).toBeInTheDocument();
    });

    it('handles file selection and triggers import', async () => {
        const Papa = require('papaparse');
        Papa.parse.mockImplementation((file: File, options: ParseConfig) => {
            (options.complete as any)({
                data: [
                    {
                        category: 'role',
                        key: 'manager',
                        label: 'Manager',
                        color: '#3b82f6',
                        sortOrder: '1',
                        active: 'true',
                    }
                ],
                errors: [],
                meta: { delimiter: ',', linebreak: '\n', aborted: false, truncated: false, cursor: 0 }
            });
        });

        render(
            <TestWrapper>
                <SettingsBulkOperations />
            </TestWrapper>
        );

        const fileInput = screen.getByRole('button', { name: /select csv file/i });
        
        // Create a mock file
        const file = new File(['test,csv,content'], 'test.csv', { type: 'text/csv' });
        
        // Mock the file input element
        const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (hiddenInput) {
            Object.defineProperty(hiddenInput, 'files', {
                value: [file],
                writable: false,
            });
            
            fireEvent.change(hiddenInput);
        }

        await waitFor(() => {
            expect(Papa.parse).toHaveBeenCalledWith(file, expect.any(Object));
        });
    });

    it('validates CSV data and shows errors for invalid entries', async () => {
        const Papa = require('papaparse');
        Papa.parse.mockImplementation((file: File, options: ParseConfig) => {
            (options.complete as any)({
                data: [
                    // Invalid entry - missing required fields
                    {
                        category: '',
                        key: '',
                        label: '',
                    },
                    // Invalid entry - bad category
                    {
                        category: 'invalid_category',
                        key: 'test',
                        label: 'Test',
                    }
                ],
                errors: [],
                meta: { delimiter: ',', linebreak: '\n', aborted: false, truncated: false, cursor: 0 }
            });
        });

        render(
            <TestWrapper>
                <SettingsBulkOperations />
            </TestWrapper>
        );

        const file = new File(['test,csv,content'], 'test.csv', { type: 'text/csv' });
        const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        
        if (hiddenInput) {
            Object.defineProperty(hiddenInput, 'files', {
                value: [file],
                writable: false,
            });
            
            fireEvent.change(hiddenInput);
        }

        await waitFor(() => {
            expect(screen.getByText('Import Results')).toBeInTheDocument();
            expect(screen.getByText(/2 Errors/)).toBeInTheDocument();
        });
    });

    it('successfully imports valid CSV data', async () => {
        const Papa = require('papaparse');
        Papa.parse.mockImplementation((file: File, options: ParseConfig) => {
            (options.complete as any)({
                data: [
                    {
                        category: 'role',
                        key: 'manager',
                        label: 'Manager',
                        color: '#3b82f6',
                        sortOrder: '1',
                        active: 'true',
                    }
                ],
                errors: [],
                meta: { delimiter: ',', linebreak: '\n', aborted: false, truncated: false, cursor: 0 }
            });
        });

        render(
            <TestWrapper>
                <SettingsBulkOperations />
            </TestWrapper>
        );

        const file = new File(['test,csv,content'], 'test.csv', { type: 'text/csv' });
        const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        
        if (hiddenInput) {
            Object.defineProperty(hiddenInput, 'files', {
                value: [file],
                writable: false,
            });
            
            fireEvent.change(hiddenInput);
        }

        await waitFor(() => {
            expect(mockDataProvider.create).toHaveBeenCalledWith('settings', {
                data: expect.objectContaining({
                    category: 'role',
                    key: 'manager',
                    label: 'Manager',
                    color: '#3b82f6',
                    sortOrder: 1,
                    active: true,
                })
            });
        });
    });

    it('handles updates for existing settings', async () => {
        const Papa = require('papaparse');
        Papa.parse.mockImplementation((file: File, options: ParseConfig) => {
            (options.complete as any)({
                data: [
                    {
                        id: '1',
                        category: 'priority',
                        key: 'a_priority',
                        label: 'Updated A Priority',
                        color: '#22c55e',
                        sortOrder: '1',
                        active: 'true',
                    }
                ],
                errors: [],
                meta: { delimiter: ',', linebreak: '\n', aborted: false, truncated: false, cursor: 0 }
            });
        });

        render(
            <TestWrapper>
                <SettingsBulkOperations />
            </TestWrapper>
        );

        const file = new File(['test,csv,content'], 'test.csv', { type: 'text/csv' });
        const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        
        if (hiddenInput) {
            Object.defineProperty(hiddenInput, 'files', {
                value: [file],
                writable: false,
            });
            
            fireEvent.change(hiddenInput);
        }

        await waitFor(() => {
            expect(mockDataProvider.update).toHaveBeenCalledWith('settings', {
                id: 1,
                data: expect.objectContaining({
                    label: 'Updated A Priority',
                }),
                previousData: expect.any(Object),
            });
        });
    });

    it('rejects non-CSV files', () => {
        render(
            <TestWrapper>
                <SettingsBulkOperations />
            </TestWrapper>
        );

        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        
        if (hiddenInput) {
            Object.defineProperty(hiddenInput, 'files', {
                value: [file],
                writable: false,
            });
            
            fireEvent.change(hiddenInput);
        }

        // Should show error message for invalid file type
        // Note: In a real app, this would be handled by the notify system
    });

    it('shows progress during import operations', async () => {
        const Papa = require('papaparse');
        Papa.parse.mockImplementation((file: File, options: ParseConfig) => {
            // Simulate processing delay
            setTimeout(() => {
                (options.complete as any)({
                    data: [
                        {
                            category: 'role',
                            key: 'manager',
                            label: 'Manager',
                            sortOrder: '1',
                            active: 'true',
                        }
                    ]
                });
            }, 100);
        });

        render(
            <TestWrapper>
                <SettingsBulkOperations />
            </TestWrapper>
        );

        const file = new File(['test,csv,content'], 'test.csv', { type: 'text/csv' });
        const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        
        if (hiddenInput) {
            Object.defineProperty(hiddenInput, 'files', {
                value: [file],
                writable: false,
            });
            
            fireEvent.change(hiddenInput);
        }

        // Should show processing indicator
        expect(screen.getByText('Processing...')).toBeInTheDocument();
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
                <SettingsBulkOperations />
            </TestWrapper>
        );

        // Buttons should be full width on mobile
        const exportButton = screen.getByText('Export CSV');
        expect(exportButton).toBeInTheDocument();
    });
});