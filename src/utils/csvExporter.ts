/**
 * CSV Export Utility Library
 * Provides functionality for generating and downloading CSV files
 */

export interface CSVColumn {
    key: string;
    header: string;
    transform?: (value: any) => string;
}

export interface CSVExportOptions {
    columns: CSVColumn[];
    filename?: string;
    includeHeaders?: boolean;
    delimiter?: string;
    encoding?: string;
}

/**
 * Escapes CSV field values to handle quotes, commas, and newlines
 */
function escapeCSVField(value: any): string {
    if (value === null || value === undefined) {
        return '';
    }

    const stringValue = String(value);

    // If the value contains quotes, commas, or newlines, wrap in quotes and escape existing quotes
    if (
        stringValue.includes('"') ||
        stringValue.includes(',') ||
        stringValue.includes('\n') ||
        stringValue.includes('\r')
    ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
}

/**
 * Converts array of objects to CSV string
 */
export function arrayToCSV<T extends Record<string, any>>(
    data: T[],
    options: CSVExportOptions
): string {
    const { columns, includeHeaders = true, delimiter = ',' } = options;

    const rows: string[] = [];

    // Add headers if requested
    if (includeHeaders) {
        const headers = columns.map(col => escapeCSVField(col.header));
        rows.push(headers.join(delimiter));
    }

    // Add data rows
    data.forEach(item => {
        const rowValues = columns.map(col => {
            const value = item[col.key];
            const transformedValue = col.transform
                ? col.transform(value)
                : value;
            return escapeCSVField(transformedValue);
        });
        rows.push(rowValues.join(delimiter));
    });

    return rows.join('\n');
}

/**
 * Downloads CSV data as a file
 */
export function downloadCSV(
    csvContent: string,
    filename: string = 'export.csv'
): void {
    try {
        // Add BOM for UTF-8 to ensure proper encoding in Excel
        const BOM = '\uFEFF';
        const csvWithBOM = BOM + csvContent;

        // Create blob with CSV data
        const blob = new Blob([csvWithBOM], {
            type: 'text/csv;charset=utf-8;',
        });

        // Create download URL
        const url = window.URL.createObjectURL(blob);

        // Create temporary download link
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);
    } catch (error) {
        console.error('Error downloading CSV:', error);
        throw new Error('Failed to download CSV file');
    }
}

/**
 * Generates a timestamped filename
 */
export function generateCSVFilename(
    baseName: string,
    extension: string = 'csv'
): string {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    return `${baseName}-${timestamp}.${extension}`;
}

/**
 * Predefined column configurations for common export types
 */
export const CSV_COLUMN_CONFIGS = {
    organizations: [
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Organization Name' },
        {
            key: 'priority',
            header: 'Priority',
            transform: (p: any) => p?.label || '',
        },
        {
            key: 'segment',
            header: 'Segment',
            transform: (s: any) => s?.label || '',
        },
        {
            key: 'distributor',
            header: 'Distributor',
            transform: (d: any) => d?.label || '',
        },
        { key: 'accountManager', header: 'Account Manager' },
        { key: 'address', header: 'Address' },
        { key: 'city', header: 'City' },
        { key: 'state', header: 'State' },
        { key: 'zipCode', header: 'Zip Code' },
        { key: 'phone', header: 'Phone' },
        { key: 'website', header: 'Website' },
        { key: 'notes', header: 'Notes' },
        { key: 'latitude', header: 'Latitude' },
        { key: 'longitude', header: 'Longitude' },
        { key: 'contactCount', header: 'Contact Count' },
        {
            key: 'lastContactDate',
            header: 'Last Contact Date',
            transform: (date: string) =>
                date ? new Date(date).toLocaleDateString() : '',
        },
        {
            key: 'createdAt',
            header: 'Created At',
            transform: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            key: 'updatedAt',
            header: 'Updated At',
            transform: (date: string) => new Date(date).toLocaleDateString(),
        },
    ] as CSVColumn[],

    contacts: [
        { key: 'id', header: 'ID' },
        { key: 'firstName', header: 'First Name' },
        { key: 'lastName', header: 'Last Name' },
        { key: 'email', header: 'Email' },
        { key: 'phone', header: 'Phone' },
        {
            key: 'organization',
            header: 'Organization',
            transform: (org: any) => org?.name || '',
        },
        {
            key: 'role',
            header: 'Role',
            transform: (role: any) => role?.label || '',
        },
        {
            key: 'influenceLevel',
            header: 'Influence Level',
            transform: (level: any) => level?.label || '',
        },
        {
            key: 'decisionRole',
            header: 'Decision Role',
            transform: (role: any) => role?.label || '',
        },
        { key: 'linkedInUrl', header: 'LinkedIn URL' },
        {
            key: 'isPrimary',
            header: 'Primary Contact',
            transform: (isPrimary: boolean) => (isPrimary ? 'Yes' : 'No'),
        },
        { key: 'notes', header: 'Notes' },
        {
            key: 'lastInteractionDate',
            header: 'Last Interaction',
            transform: (date: string) =>
                date ? new Date(date).toLocaleDateString() : '',
        },
        { key: 'interactionCount', header: 'Interaction Count' },
        {
            key: 'createdAt',
            header: 'Created At',
            transform: (date: string) => new Date(date).toLocaleDateString(),
        },
    ] as CSVColumn[],

    interactions: [
        { key: 'id', header: 'ID' },
        {
            key: 'organization',
            header: 'Organization',
            transform: (org: any) => org?.name || '',
        },
        {
            key: 'contact',
            header: 'Contact',
            transform: (contact: any) =>
                contact ? `${contact.firstName} ${contact.lastName}` : '',
        },
        {
            key: 'type',
            header: 'Type',
            transform: (type: any) => type?.label || '',
        },
        { key: 'subject', header: 'Subject' },
        { key: 'description', header: 'Description' },
        {
            key: 'scheduledDate',
            header: 'Scheduled Date',
            transform: (date: string) =>
                date ? new Date(date).toLocaleDateString() : '',
        },
        {
            key: 'completedDate',
            header: 'Completed Date',
            transform: (date: string) =>
                date ? new Date(date).toLocaleDateString() : '',
        },
        {
            key: 'isCompleted',
            header: 'Completed',
            transform: (completed: boolean) => (completed ? 'Yes' : 'No'),
        },
        { key: 'duration', header: 'Duration (minutes)' },
        { key: 'outcome', header: 'Outcome' },
        {
            key: 'followUpRequired',
            header: 'Follow-up Required',
            transform: (required: boolean) => (required ? 'Yes' : 'No'),
        },
        {
            key: 'followUpDate',
            header: 'Follow-up Date',
            transform: (date: string) =>
                date ? new Date(date).toLocaleDateString() : '',
        },
        { key: 'latitude', header: 'Latitude' },
        { key: 'longitude', header: 'Longitude' },
        { key: 'locationNotes', header: 'Location Notes' },
        {
            key: 'createdAt',
            header: 'Created At',
            transform: (date: string) => new Date(date).toLocaleDateString(),
        },
    ] as CSVColumn[],

    products: [
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Product Name' },
        {
            key: 'principal',
            header: 'Principal',
            transform: (principal: any) => principal?.label || '',
        },
        { key: 'category', header: 'Category' },
        { key: 'description', header: 'Description' },
        { key: 'sku', header: 'SKU' },
        { key: 'unitOfMeasure', header: 'Unit of Measure' },
        { key: 'packageSize', header: 'Package Size' },
        {
            key: 'price',
            header: 'Price',
            transform: (price: number) => (price ? `$${price.toFixed(2)}` : ''),
        },
        {
            key: 'active',
            header: 'Active',
            transform: (active: boolean) => (active ? 'Yes' : 'No'),
        },
        {
            key: 'createdAt',
            header: 'Created At',
            transform: (date: string) => new Date(date).toLocaleDateString(),
        },
    ] as CSVColumn[],

    opportunities: [
        { key: 'id', header: 'ID' },
        {
            key: 'organization',
            header: 'Organization',
            transform: (org: any) => org?.name || '',
        },
        {
            key: 'contact',
            header: 'Contact',
            transform: (contact: any) =>
                contact ? `${contact.firstName} ${contact.lastName}` : '',
        },
        {
            key: 'product',
            header: 'Product',
            transform: (product: any) => product?.name || '',
        },
        {
            key: 'stage',
            header: 'Stage',
            transform: (stage: any) => stage?.label || '',
        },
        {
            key: 'amount',
            header: 'Amount',
            transform: (amount: number) =>
                amount ? `$${amount.toLocaleString()}` : '',
        },
        { key: 'probability', header: 'Probability %' },
        {
            key: 'expectedCloseDate',
            header: 'Expected Close Date',
            transform: (date: string) =>
                date ? new Date(date).toLocaleDateString() : '',
        },
        { key: 'description', header: 'Description' },
        {
            key: 'createdAt',
            header: 'Created At',
            transform: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            key: 'updatedAt',
            header: 'Updated At',
            transform: (date: string) => new Date(date).toLocaleDateString(),
        },
    ] as CSVColumn[],
};

/**
 * Convenience function to export organizations with predefined columns
 */
export function exportOrganizationsCSV(
    organizations: any[],
    filename?: string
): void {
    const csvContent = arrayToCSV(organizations, {
        columns: CSV_COLUMN_CONFIGS.organizations,
        filename: filename || generateCSVFilename('organizations-export'),
    });

    downloadCSV(
        csvContent,
        filename || generateCSVFilename('organizations-export')
    );
}

/**
 * Convenience function to export contacts with predefined columns
 */
export function exportContactsCSV(contacts: any[], filename?: string): void {
    const csvContent = arrayToCSV(contacts, {
        columns: CSV_COLUMN_CONFIGS.contacts,
        filename: filename || generateCSVFilename('contacts-export'),
    });

    downloadCSV(csvContent, filename || generateCSVFilename('contacts-export'));
}

/**
 * Convenience function to export interactions with predefined columns
 */
export function exportInteractionsCSV(
    interactions: any[],
    filename?: string
): void {
    const csvContent = arrayToCSV(interactions, {
        columns: CSV_COLUMN_CONFIGS.interactions,
        filename: filename || generateCSVFilename('interactions-export'),
    });

    downloadCSV(
        csvContent,
        filename || generateCSVFilename('interactions-export')
    );
}

/**
 * Convenience function to export products with predefined columns
 */
export function exportProductsCSV(products: any[], filename?: string): void {
    const csvContent = arrayToCSV(products, {
        columns: CSV_COLUMN_CONFIGS.products,
        filename: filename || generateCSVFilename('products-export'),
    });

    downloadCSV(csvContent, filename || generateCSVFilename('products-export'));
}

/**
 * Convenience function to export opportunities with predefined columns
 */
export function exportOpportunitiesCSV(
    opportunities: any[],
    filename?: string
): void {
    const csvContent = arrayToCSV(opportunities, {
        columns: CSV_COLUMN_CONFIGS.opportunities,
        filename: filename || generateCSVFilename('opportunities-export'),
    });

    downloadCSV(
        csvContent,
        filename || generateCSVFilename('opportunities-export')
    );
}

/**
 * Progress callback for large CSV exports
 */
export type ExportProgressCallback = (progress: number, total: number) => void;

/**
 * Exports large datasets with progress tracking
 */
export async function exportLargeDatasetCSV<T extends Record<string, any>>(
    data: T[],
    options: CSVExportOptions,
    onProgress?: ExportProgressCallback
): Promise<void> {
    const { columns, includeHeaders = true, delimiter = ',' } = options;
    const chunkSize = 1000; // Process in chunks of 1000 records

    let csvContent = '';

    // Add headers if requested
    if (includeHeaders) {
        const headers = columns.map(col => escapeCSVField(col.header));
        csvContent += headers.join(delimiter) + '\n';
    }

    // Process data in chunks
    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);

        const chunkRows = chunk.map(item => {
            const rowValues = columns.map(col => {
                const value = item[col.key];
                const transformedValue = col.transform
                    ? col.transform(value)
                    : value;
                return escapeCSVField(transformedValue);
            });
            return rowValues.join(delimiter);
        });

        csvContent += chunkRows.join('\n') + '\n';

        // Report progress
        if (onProgress) {
            onProgress(Math.min(i + chunkSize, data.length), data.length);
        }

        // Allow UI to update
        await new Promise(resolve => setTimeout(resolve, 0));
    }

    // Download the complete CSV
    const filename = options.filename || generateCSVFilename('large-export');
    downloadCSV(csvContent, filename);
}
