import { useState } from 'react';
import { Button } from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
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
            startIcon={<UploadIcon />}
            onClick={handleImport}
            disabled={isImporting}
            sx={{
                minHeight: 44, // Touch-friendly
                mr: 1,
            }}
        >
            Import
        </Button>
    );
};
