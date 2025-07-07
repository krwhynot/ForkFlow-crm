import React, { useEffect } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Dialog } from './Dialog';
import { Typography } from './Typography';
import { Button } from './Button';

interface UnsavedChangesDialogProps {
    open: boolean;
    onClose: () => void;
    onDiscard: () => void;
    onSave?: () => void;
    title?: string;
    message?: string;
    discardLabel?: string;
    saveLabel?: string;
    cancelLabel?: string;
    showSaveOption?: boolean;
    enableBeforeUnload?: boolean;
}

/**
 * Reusable dialog for handling unsaved changes warnings
 * Extracted from MultiStepOrganizationEdit for broader use
 */
export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
    open,
    onClose,
    onDiscard,
    onSave,
    title = 'Unsaved Changes',
    message = 'You have unsaved changes. What would you like to do?',
    discardLabel = 'Discard Changes',
    saveLabel = 'Save Changes',
    cancelLabel = 'Continue Editing',
    showSaveOption = false,
    enableBeforeUnload = true,
}) => {
    // Handle browser beforeunload event
    useEffect(() => {
        if (!enableBeforeUnload) return;

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (open) {
                event.preventDefault();
                event.returnValue = ''; // Chrome requires returnValue to be set
                return ''; // Some browsers require a return value
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [open, enableBeforeUnload]);

    const handleDiscard = () => {
        onDiscard();
        onClose();
    };

    const handleSave = () => {
        onSave?.();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            className="z-[60]" // Higher than typical modals
        >
            <div className="p-6">
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                        <Typography variant="h6" className="text-gray-900 mb-2">
                            {title}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600 mb-6">
                            {message}
                        </Typography>
                        
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
                            <Button
                                variant="outlined"
                                onClick={onClose}
                                className="w-full sm:w-auto"
                            >
                                {cancelLabel}
                            </Button>
                            
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleDiscard}
                                className="w-full sm:w-auto"
                            >
                                {discardLabel}
                            </Button>
                            
                            {showSaveOption && onSave && (
                                <Button
                                    variant="contained"
                                    onClick={handleSave}
                                    className="w-full sm:w-auto"
                                >
                                    {saveLabel}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};