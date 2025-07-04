/**
 * Dialog Components
 * Modal dialog system using Headless UI
 */

import React, { Fragment } from 'react';
import { Dialog as HeadlessDialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';

interface DialogProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

interface DialogTitleProps {
    children: React.ReactNode;
    className?: string;
}

interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
}

interface DialogActionsProps {
    children: React.ReactNode;
    className?: string;
}

const MAX_WIDTH_VARIANTS = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
};

/**
 * Dialog component for modal dialogs
 */
export const Dialog: React.FC<DialogProps> = ({
    open,
    onClose,
    children,
    className,
    maxWidth = 'md',
}) => {
    return (
        <Transition appear show={open} as={Fragment}>
            <HeadlessDialog
                as="div"
                className="relative z-50"
                onClose={onClose}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <HeadlessDialog.Panel
                                className={cn(
                                    'w-full transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all',
                                    MAX_WIDTH_VARIANTS[maxWidth],
                                    className
                                )}
                            >
                                {children}
                            </HeadlessDialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </HeadlessDialog>
        </Transition>
    );
};

/**
 * DialogTitle component
 */
export const DialogTitle: React.FC<DialogTitleProps> = ({
    children,
    className,
}) => {
    return (
        <HeadlessDialog.Title
            as="h3"
            className={cn(
                'text-lg font-medium leading-6 text-gray-900 mb-4',
                className
            )}
        >
            {children}
        </HeadlessDialog.Title>
    );
};

/**
 * DialogContent component
 */
export const DialogContent: React.FC<DialogContentProps> = ({
    children,
    className,
}) => {
    return <div className={cn('mt-2', className)}>{children}</div>;
};

/**
 * DialogActions component
 */
export const DialogActions: React.FC<DialogActionsProps> = ({
    children,
    className,
}) => {
    return (
        <div className={cn('mt-6 flex justify-end space-x-3', className)}>
            {children}
        </div>
    );
};

/**
 * DialogCloseButton component
 */
export const DialogCloseButton: React.FC<{
    onClose: () => void;
    className?: string;
}> = ({ onClose, className }) => {
    return (
        <button
            type="button"
            className={cn(
                'absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1',
                className
            )}
            onClick={onClose}
        >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
        </button>
    );
};

export default Dialog;
