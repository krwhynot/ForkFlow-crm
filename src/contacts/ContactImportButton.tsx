import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Button } from 'react-admin';
import { ContactImportDialog } from './ContactImportDialog';

export const ContactImportButton = () => {
    const [modalOpen, setModalOpen] = useState(false);

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    return (
        <>
            <Button
                startIcon={<ArrowUpTrayIcon className="h-4 w-4" />}
                label="Import"
                onClick={handleOpenModal}
            />
            <ContactImportDialog open={modalOpen} onClose={handleCloseModal} />
        </>
    );
};
