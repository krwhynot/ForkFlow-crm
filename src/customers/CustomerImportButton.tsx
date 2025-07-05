import { useState } from 'react';
import { Button } from '@/components/ui-kit';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { useNotify } from 'react-admin';

export const CustomerImportButton = () => {
    const [isImporting, setIsImporting] = useState(false);
    const notify = useNotify();

    const handleImport = () => {
        // Placeholder for future CSV import functionality
        notify('Customer import feature coming soon!', { type: 'info' });
    };

    return (
        <Button
            variant="outlined"
            startIcon={<ArrowUpTrayIcon className="w-5 h-5" />}
            onClick={handleImport}
            disabled={isImporting}
            className="min-h-[44px] mr-1"
        >
            Import
        </Button>
    );
};
